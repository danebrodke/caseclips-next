import Mux from "@mux/mux-node";
import { readFileSync, existsSync, statSync, createReadStream } from "fs";
import { writeFile } from "fs/promises";
import { Readable, Transform } from "stream";
import path from "path";
import { videos } from "../src/lib/data";

const ENV_FILE = "mux-access-token-Caseclips main token.env";
const STATE_FILE = path.join("downloads", "mux-upload-state.json");
const DOWNLOADS_DIR = "downloads";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    console.error(`Env file not found: ${filePath}`);
    process.exit(1);
  }
  for (const line of readFileSync(filePath, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

loadEnvFile(ENV_FILE);

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  console.error("MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set");
  process.exit(1);
}

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

interface UploadRecord {
  slug: string;
  uploadId: string;
  assetId?: string;
  playbackId?: string;
  status: "uploading" | "processing" | "ready" | "errored";
  error?: string;
  startedAt: string;
  completedAt?: string;
}

type State = Record<string, UploadRecord>;

function loadState(): State {
  if (!existsSync(STATE_FILE)) return {};
  return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
}

async function saveState(state: State) {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

async function uploadFile(url: string, filePath: string, size: number) {
  const source = createReadStream(filePath);
  const started = Date.now();
  let uploaded = 0;

  const counter = new Transform({
    transform(chunk, _enc, cb) {
      uploaded += chunk.length;
      cb(null, chunk);
    },
  });

  source.on("error", (err) => counter.destroy(err));
  source.pipe(counter);

  const reporter = setInterval(() => {
    const pct = ((uploaded / size) * 100).toFixed(1);
    const elapsed = Math.max(1, Date.now() - started) / 1000;
    const mbps = ((uploaded * 8) / elapsed / 1_000_000).toFixed(1);
    process.stdout.write(
      `\r    uploading: ${pct}% (${formatBytes(uploaded)}/${formatBytes(size)}) @ ${mbps} Mbps        `
    );
  }, 2000);

  try {
    const webBody = Readable.toWeb(counter) as unknown as ReadableStream<Uint8Array>;
    const res = await fetch(url, {
      method: "PUT",
      body: webBody,
      // @ts-expect-error duplex required by Node fetch for streaming bodies
      duplex: "half",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(size),
      },
    });
    if (!res.ok) {
      throw new Error(`PUT failed: ${res.status} ${res.statusText}`);
    }
  } finally {
    clearInterval(reporter);
    process.stdout.write(
      `\r                                                                              \r`
    );
  }

  const elapsed = (Date.now() - started) / 1000;
  const mbps = ((size * 8) / elapsed / 1_000_000).toFixed(1);
  console.log(`    uploaded ${formatBytes(size)} in ${elapsed.toFixed(1)}s @ ${mbps} Mbps`);
}

async function pollUpload(uploadId: string, timeoutMs = 10 * 60 * 1000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const u = await mux.video.uploads.retrieve(uploadId);
    if (u.status === "errored") {
      throw new Error(`Upload errored: ${JSON.stringify(u.error ?? u)}`);
    }
    if (u.asset_id) return u.asset_id;
    await sleep(2000);
  }
  throw new Error("Timed out waiting for upload → asset_id");
}

async function pollAsset(assetId: string, timeoutMs = 30 * 60 * 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const a = await mux.video.assets.retrieve(assetId);
    if (a.status === "ready") return a;
    if (a.status === "errored") {
      throw new Error(`Asset errored: ${JSON.stringify(a.errors ?? a)}`);
    }
    await sleep(3000);
  }
  throw new Error("Timed out waiting for asset to be ready");
}

async function processVideo(slug: string, state: State): Promise<UploadRecord> {
  const existing = state[slug];
  if (existing?.status === "ready" && existing.playbackId) {
    console.log(`[skip] ${slug} — already ready (playback ${existing.playbackId})`);
    return existing;
  }

  const filePath = path.join(DOWNLOADS_DIR, `${slug}.mp4`);
  if (!existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  const size = statSync(filePath).size;

  let uploadId = existing?.uploadId;
  let assetId = existing?.assetId;

  // Step 1: create direct upload (only if we don't have one yet)
  if (!uploadId) {
    console.log(`[create] ${slug} (${formatBytes(size)})`);
    const upload = await mux.video.uploads.create({
      cors_origin: "*",
      new_asset_settings: {
        playback_policy: ["public"],
        mp4_support: "none",
        max_resolution_tier: "1080p",
        video_quality: "basic",
      },
    });
    uploadId = upload.id;
    state[slug] = {
      slug,
      uploadId,
      status: "uploading",
      startedAt: new Date().toISOString(),
    };
    await saveState(state);

    if (!upload.url) throw new Error("Mux did not return an upload URL");
    // Step 2: PUT the file
    await uploadFile(upload.url, filePath, size);
  } else if (!assetId) {
    console.log(`[resume] ${slug} — upload ${uploadId} exists, checking status`);
  }

  if (!uploadId) {
    throw new Error(`Invalid state: no uploadId for ${slug}`);
  }

  // Step 3: wait for upload → asset_id
  if (!assetId) {
    assetId = await pollUpload(uploadId);
    state[slug] = { ...state[slug], assetId, status: "processing" };
    await saveState(state);
    console.log(`  asset: ${assetId}`);
  }

  // Step 4: wait for asset → ready
  const asset = await pollAsset(assetId);
  const playbackId = asset.playback_ids?.[0]?.id;
  if (!playbackId) throw new Error(`No playback id on asset ${assetId}`);

  state[slug] = {
    ...state[slug],
    playbackId,
    status: "ready",
    completedAt: new Date().toISOString(),
  };
  await saveState(state);
  console.log(`  ready: playback ${playbackId}`);
  return state[slug];
}

async function main() {
  const state = loadState();
  const total = videos.length;
  let done = 0;
  let failed = 0;

  console.log(`Uploading ${total} videos to Mux...\n`);

  for (const [i, video] of videos.entries()) {
    console.log(`\n[${i + 1}/${total}] ${video.slug}`);
    try {
      await processVideo(video.slug, state);
      done++;
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ERROR: ${msg}`);
      state[video.slug] = {
        ...(state[video.slug] ?? {
          slug: video.slug,
          uploadId: "",
          status: "errored",
          startedAt: new Date().toISOString(),
        }),
        status: "errored",
        error: msg,
      };
      await saveState(state);
    }
  }

  console.log(`\n\nDone. ${done}/${total} ready, ${failed} errored.`);
  console.log(`State saved to ${STATE_FILE}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

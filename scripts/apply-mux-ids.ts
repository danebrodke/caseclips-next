import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const STATE_FILE = path.join("downloads", "mux-upload-state.json");
const DATA_FILE = path.join("src", "lib", "data.ts");

interface UploadRecord {
  slug: string;
  playbackId?: string;
  status: string;
}

function main() {
  if (!existsSync(STATE_FILE)) {
    console.error(`Missing ${STATE_FILE}`);
    process.exit(1);
  }

  const state = JSON.parse(readFileSync(STATE_FILE, "utf-8")) as Record<string, UploadRecord>;
  const ready = Object.values(state).filter(
    (r) => r.status === "ready" && r.playbackId
  );

  console.log(`Found ${ready.length} ready videos in state`);

  let data = readFileSync(DATA_FILE, "utf-8");
  let patched = 0;
  let alreadyPresent = 0;
  const missing: string[] = [];

  for (const record of ready) {
    const { slug, playbackId } = record;
    if (!playbackId) continue;

    // Regex matches: `  slug: "the-slug",\n  vimeoId: "..."` (with optional muxPlaybackId already between)
    const slugPattern = new RegExp(
      `(    slug:\\s*"${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}",\\n)((?:\\s+muxPlaybackId:.*\\n)?)(\\s+vimeoId:)`
    );
    const match = data.match(slugPattern);
    if (!match) {
      missing.push(slug);
      continue;
    }

    if (match[2]) {
      // muxPlaybackId already present — check if it matches
      if (match[2].includes(playbackId)) {
        alreadyPresent++;
        continue;
      }
      // Replace the existing muxPlaybackId line
      data = data.replace(
        slugPattern,
        `$1    muxPlaybackId: "${playbackId}",\n$3`
      );
      patched++;
    } else {
      // Insert new muxPlaybackId line right after slug, before vimeoId
      data = data.replace(
        slugPattern,
        `$1    muxPlaybackId: "${playbackId}",\n$3`
      );
      patched++;
    }
  }

  writeFileSync(DATA_FILE, data);

  console.log(`Patched: ${patched}`);
  console.log(`Already present: ${alreadyPresent}`);
  if (missing.length) {
    console.log(`Missing video entries in data.ts (${missing.length}):`);
    for (const s of missing) console.log(`  - ${s}`);
  }
}

main();

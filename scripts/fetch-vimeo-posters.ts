import { videos } from "../src/lib/data";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const OUT_DIR = path.join("public", "posters");
const TARGET_SIZE = "1920x1080";

async function getThumbnailUrl(vimeoId: string): Promise<string | null> {
  const oembedUrl = `https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/${vimeoId}`;
  const res = await fetch(oembedUrl);
  if (!res.ok) {
    throw new Error(`oembed error: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { thumbnail_url?: string };
  if (!data.thumbnail_url) return null;
  // Vimeo thumbs come back at e.g. _295x166; rewrite to higher res
  return data.thumbnail_url.replace(/_\d+x\d+/, `_${TARGET_SIZE}`);
}

async function downloadImage(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buffer);
  return buffer.length;
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (const video of videos) {
    const destJpg = path.join(OUT_DIR, `${video.slug}.jpg`);
    if (existsSync(destJpg)) {
      console.log(`[skip] ${video.slug}`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`[fetch] ${video.slug}...`);
      const thumbUrl = await getThumbnailUrl(video.vimeoId);
      if (!thumbUrl) {
        console.log(" no thumbnail");
        failed++;
        continue;
      }
      const bytes = await downloadImage(thumbUrl, destJpg);
      console.log(` ${(bytes / 1024).toFixed(0)} KB`);
      done++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(` ERROR: ${msg}`);
      failed++;
    }
  }

  console.log(`\nDone: ${done} fetched, ${skipped} skipped, ${failed} failed`);
  console.log(`Posters saved to ${OUT_DIR}/`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

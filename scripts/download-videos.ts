import { videos } from "../src/lib/data";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const TOKEN = process.env.VIMEO_TOKEN;
if (!TOKEN) {
  console.error("Set VIMEO_TOKEN environment variable first");
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), "downloads");

async function getDownloadLinks(vimeoId: string) {
  const res = await fetch(`https://api.vimeo.com/videos/${vimeoId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`API error for ${vimeoId}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return { title: data.name as string, downloads: data.download as { quality: string; width: number; height: number; link: string }[] };
}

async function downloadVideo(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buffer);
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  console.log(`Downloading ${videos.length} videos to ${OUT_DIR}\n`);

  for (const video of videos) {
    const slug = video.slug;
    const destPath = path.join(OUT_DIR, `${slug}.mp4`);

    if (existsSync(destPath)) {
      console.log(`[skip] ${slug} — already exists`);
      continue;
    }

    try {
      console.log(`[fetch] ${slug} (vimeo ${video.vimeoId})...`);
      const { downloads } = await getDownloadLinks(video.vimeoId);

      if (!downloads || downloads.length === 0) {
        console.log(`[warn] ${slug} — no download links available`);
        continue;
      }

      // Pick the highest quality version
      const best = downloads.reduce((a, b) => (b.height > a.height ? b : a));
      console.log(`[download] ${slug} — ${best.quality} (${best.width}x${best.height})`);

      await downloadVideo(best.link, destPath);
      console.log(`[done] ${slug}`);
    } catch (err) {
      console.error(`[error] ${slug}: ${err}`);
    }
  }

  console.log("\nAll done!");
}

main();

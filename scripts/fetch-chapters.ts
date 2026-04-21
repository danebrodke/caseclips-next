import { videos } from "../src/lib/data";
import { writeFile } from "fs/promises";
import path from "path";

const TOKEN = process.env.VIMEO_TOKEN;
if (!TOKEN) {
  console.error("Set VIMEO_TOKEN environment variable first");
  process.exit(1);
}

interface Chapter {
  title: string;
  startTime: number;
  endTime: number;
}

interface VideoChapters {
  slug: string;
  title: string;
  vimeoId: string;
  chapters: Chapter[];
}

async function getChapters(vimeoId: string): Promise<Chapter[]> {
  const res = await fetch(`https://api.vimeo.com/videos/${vimeoId}/chapters`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`API error for ${vimeoId}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return (data.data || []).map((ch: { title: string; timecode: number; duration: number }) => ({
    title: ch.title,
    startTime: ch.timecode,
    endTime: ch.timecode + ch.duration,
  }));
}

async function main() {
  const results: VideoChapters[] = [];

  console.log(`Fetching chapters for ${videos.length} videos...\n`);

  for (const video of videos) {
    try {
      process.stdout.write(`[fetch] ${video.slug}...`);
      const chapters = await getChapters(video.vimeoId);
      results.push({
        slug: video.slug,
        title: video.title,
        vimeoId: video.vimeoId,
        chapters,
      });
      console.log(` ${chapters.length} chapters`);
    } catch (err) {
      console.error(` error: ${err}`);
      results.push({
        slug: video.slug,
        title: video.title,
        vimeoId: video.vimeoId,
        chapters: [],
      });
    }
  }

  const outPath = path.join(process.cwd(), "downloads", "chapters.json");
  await writeFile(outPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved to ${outPath}`);

  const total = results.reduce((sum, v) => sum + v.chapters.length, 0);
  console.log(`${total} total chapters across ${results.length} videos`);
}

main();

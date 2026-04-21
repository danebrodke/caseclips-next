import sharp from "sharp";
import { readdirSync } from "fs";
import path from "path";

const POSTERS_DIR = path.join("public", "posters");
const SHIFT_RATIO = 0.28;

async function shiftPoster(filePath: string) {
  const img = sharp(filePath);
  const { width, height } = await img.metadata();
  if (!width || !height) throw new Error(`missing dims for ${filePath}`);

  const shift = Math.round(height * SHIFT_RATIO);
  const buffer = await sharp(filePath)
    .extract({ left: 0, top: shift, width, height: height - shift })
    .extend({ bottom: shift, background: "#000" })
    .jpeg({ quality: 88 })
    .toBuffer();

  await sharp(buffer).toFile(filePath);
  return { width, height, shift };
}

async function main() {
  const files = readdirSync(POSTERS_DIR).filter((f) => f.endsWith(".jpg"));
  console.log(`Shifting ${files.length} posters up by ${SHIFT_RATIO * 100}%...\n`);

  let done = 0;
  let failed = 0;

  for (const f of files) {
    const filePath = path.join(POSTERS_DIR, f);
    try {
      const { width, height, shift } = await shiftPoster(filePath);
      console.log(`  ${f} (${width}x${height}, shifted ${shift}px)`);
      done++;
    } catch (err) {
      console.error(`  ${f} FAILED: ${err}`);
      failed++;
    }
  }

  console.log(`\nDone: ${done} shifted, ${failed} failed`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

/**
 * Seed script: populates Redis with initial like counts (random 1-9).
 *
 * Usage:
 *   npx tsx scripts/seed-likes.ts
 *
 * Requires KV_REST_API_URL and KV_REST_API_TOKEN env vars
 * (set them in .env.local or pass inline).
 */

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const VIDEO_IDS = [
  "693e36152c94f10001c3c7d3",
  "643cb5120e9cc5003da0f7a9",
  "642b822c88d503003d6d0a4b",
  "641cb9f2374d1c003d2086e9",
  "63e98a46879664003d2ccc5b",
  "63e6ec21879664003d2ccbe8",
  "63aba82f4a306b003dee3990",
  "63980ba83b6a66003d6acb69",
  "637311d6a41e91003d300b8d",
  "631a40051793c8003d9b14bb",
  "630fe3261e9cb3003dd44307",
  "62781220f6c2dc004d5f8a41",
  "625b4db56dbef5003d4715b4",
  "622f999855cccb003dbcc90d",
  "620aef053bcbb5003b7a4485",
  "620aef053bcbb5003b7a4484",
  "620aef053bcbb5003b7a4483",
  "620aef053bcbb5003b7a4482",
  "620aef053bcbb5003b7a4481",
  "620aef053bcbb5003b7a4480",
  "620aef053bcbb5003b7a447f",
  "620aef053bcbb5003b7a447e",
  "620aef053bcbb5003b7a447d",
  "620aef053bcbb5003b7a447c",
  "620aef053bcbb5003b7a447a",
  "620aef053bcbb5003b7a4479",
  "620aef053bcbb5003b7a4477",
  "620aef053bcbb5003b7a4476",
  "620aef053bcbb5003b7a4475",
  "620aef053bcbb5003b7a4474",
  "620aef053bcbb5003b7a4473",
  "620aef053bcbb5003b7a4472",
  "620aef053bcbb5003b7a4471",
  "620aef053bcbb5003b7a4470",
  "620aef053bcbb5003b7a446f",
  "620aef053bcbb5003b7a446e",
  "620aef053bcbb5003b7a446d",
  "620aef053bcbb5003b7a446c",
  "620aef053bcbb5003b7a446b",
  "620aef053bcbb5003b7a446a",
  "620aef053bcbb5003b7a4468",
  "620aef053bcbb5003b7a4467",
  "620aef053bcbb5003b7a4466",
  "620aef053bcbb5003b7a4464",
  "620aef053bcbb5003b7a4469",
  "620aef053bcbb5003b7a4460",
  "620aef053bcbb5003b7a445f",
  "620aef053bcbb5003b7a445d",
  "620aef053bcbb5003b7a445e",
  "620aef053bcbb5003b7a4461",
  "620aef053bcbb5003b7a4462",
];

async function seed() {
  const pipeline = redis.pipeline();

  for (const id of VIDEO_IDS) {
    const count = Math.floor(Math.random() * 9) + 1; // 1-9
    pipeline.hset("likes:counts", { [id]: count });
  }

  await pipeline.exec();
  console.log(`Seeded ${VIDEO_IDS.length} videos with random like counts (1-9)`);
}

seed().catch(console.error);

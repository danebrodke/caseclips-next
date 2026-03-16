import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { videos } from "@/lib/data";

const VIDEO_IDS = new Set(videos.map((v) => v.id));

function getOrCreateUserId(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const existing = cookieStore.get("caseclips-uid")?.value;
  if (existing) return existing;
  return crypto.randomUUID();
}

// GET /api/likes — returns { counts: Record<videoId, number>, liked: string[] }
export async function GET() {
  const cookieStore = await cookies();
  const uid = getOrCreateUserId(cookieStore);

  const [counts, liked] = await Promise.all([
    redis.hgetall<Record<string, number>>("likes:counts"),
    redis.smembers(`likes:user:${uid}`),
  ]);

  const response = NextResponse.json({
    counts: counts || {},
    liked: liked || [],
  });

  // Set uid cookie if new
  if (!cookieStore.get("caseclips-uid")) {
    response.cookies.set("caseclips-uid", uid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
    });
  }

  return response;
}

// POST /api/likes — body: { videoId: string }
// Returns { count: number, liked: boolean }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const videoId = body.videoId;

  if (!videoId || !VIDEO_IDS.has(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const uid = getOrCreateUserId(cookieStore);
  const userKey = `likes:user:${uid}`;

  const alreadyLiked = await redis.sismember(userKey, videoId);

  let newCount: number;
  let nowLiked: boolean;

  if (alreadyLiked) {
    // Unlike
    const [count] = await Promise.all([
      redis.hincrby("likes:counts", videoId, -1),
      redis.srem(userKey, videoId),
    ]);
    newCount = count;
    nowLiked = false;
  } else {
    // Like
    const [count] = await Promise.all([
      redis.hincrby("likes:counts", videoId, 1),
      redis.sadd(userKey, videoId),
    ]);
    newCount = count;
    nowLiked = true;
  }

  const response = NextResponse.json({ count: newCount, liked: nowLiked });

  if (!cookieStore.get("caseclips-uid")) {
    response.cookies.set("caseclips-uid", uid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  }

  return response;
}

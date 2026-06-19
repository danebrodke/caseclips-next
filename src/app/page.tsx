import { Suspense } from "react";
import VideoGrid from "@/components/VideoGrid";

// Render per request so each visit gets a fresh shuffle seed (and thus a new
// order for older videos). The seed is generated here on the server and passed
// to the client so both render the same order — preventing a hydration flash.
// Edge runtime keeps cold starts near-zero and runs close to the user, so the
// per-request render stays fast (close to static-like response times).
export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function Home() {
  const shuffleSeed = Math.floor(Math.random() * 2 ** 31);
  return (
    <Suspense>
      <VideoGrid shuffleSeed={shuffleSeed} />
    </Suspense>
  );
}

import { Suspense } from "react";
import VideoGrid from "@/components/VideoGrid";

export default function Home() {
  return (
    <Suspense>
      <VideoGrid />
    </Suspense>
  );
}

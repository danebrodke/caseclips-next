"use client";

import { useState, useEffect } from "react";

function HeartIcon({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function LikeButton({
  videoId,
  initialCount,
}: {
  videoId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    try {
      const counts = JSON.parse(
        localStorage.getItem("caseclips-likes") || "{}"
      );
      if (counts[videoId] !== undefined) setCount(counts[videoId]);

      const likedIds = new Set(
        JSON.parse(localStorage.getItem("caseclips-liked-ids") || "[]")
      );
      setLiked(likedIds.has(videoId));
    } catch {
      // ignore
    }
  }, [videoId]);

  function handleLike() {
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : count - 1;

    setLiked(newLiked);
    setCount(newCount);

    try {
      const counts = JSON.parse(
        localStorage.getItem("caseclips-likes") || "{}"
      );
      counts[videoId] = newCount;
      localStorage.setItem("caseclips-likes", JSON.stringify(counts));

      const likedIds: string[] = JSON.parse(
        localStorage.getItem("caseclips-liked-ids") || "[]"
      );
      const set = new Set(likedIds);
      if (newLiked) set.add(videoId);
      else set.delete(videoId);
      localStorage.setItem("caseclips-liked-ids", JSON.stringify([...set]));
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
        liked
          ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
          : "border-card-border bg-card-bg text-muted hover:border-rose-500/30 hover:text-rose-400"
      }`}
    >
      <HeartIcon className="w-5 h-5" filled={liked} />
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}

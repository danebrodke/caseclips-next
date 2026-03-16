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

export default function LikeButton({ videoId }: { videoId: string }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  // Fetch real data from API on mount
  useEffect(() => {
    fetch("/api/likes")
      .then((res) => res.json())
      .then((data: { counts: Record<string, number>; liked: string[] }) => {
        setCount(data.counts[videoId] ?? 0);
        setLiked(data.liked.includes(videoId));
      })
      .catch(() => {});
  }, [videoId]);

  async function handleLike() {
    if (pending) return;
    setPending(true);

    // Optimistic update
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : count - 1;
    setLiked(newLiked);
    setCount(newCount);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setLiked(data.liked);
      }
    } catch {
      // Revert on failure
      setLiked(!newLiked);
      setCount(newLiked ? newCount - 1 : newCount + 1);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={pending}
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

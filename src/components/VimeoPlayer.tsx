"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Player from "@vimeo/player";

interface Chapter {
  title: string;
  startTime: number;
  index: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VimeoPlayer({ vimeoId }: { vimeoId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const destroyedRef = useRef(false);
  const chapterListRef = useRef<HTMLDivElement>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<number>(-1);
  const [isReady, setIsReady] = useState(false);
  const [videoHeight, setVideoHeight] = useState<number | null>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  // Measure video container height for chapter panel matching
  useEffect(() => {
    if (!videoWrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setVideoHeight(entry.contentRect.height);
      }
    });
    observer.observe(videoWrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !vimeoId) return;
    destroyedRef.current = false;

    const player = new Player(containerRef.current, {
      id: parseInt(vimeoId),
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
    });

    playerRef.current = player;

    player
      .ready()
      .then(() => {
        if (destroyedRef.current) return;
        setIsReady(true);

        return player.getChapters();
      })
      .then((chs) => {
        if (destroyedRef.current || !chs) return;
        if (chs.length > 0) {
          setChapters(
            chs.map((ch, i) => ({
              title: ch.title,
              startTime: ch.startTime,
              index: i,
            }))
          );
        }
      })
      .catch(() => {
        // No chapters or player destroyed
      });

    return () => {
      destroyedRef.current = true;
      playerRef.current = null;
      player.destroy().catch(() => {});
    };
  }, [vimeoId]);

  // Poll for chapter changes
  useEffect(() => {
    if (!isReady || chapters.length === 0) return;

    const interval = setInterval(async () => {
      if (destroyedRef.current || !playerRef.current) {
        clearInterval(interval);
        return;
      }
      try {
        const time = await playerRef.current.getCurrentTime();
        let current = -1;
        for (let i = chapters.length - 1; i >= 0; i--) {
          if (time >= chapters[i].startTime) {
            current = i;
            break;
          }
        }
        setActiveChapter(current);
      } catch {
        // player destroyed
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isReady, chapters]);

  // Auto-scroll chapter list to active chapter
  useEffect(() => {
    if (activeChapter < 0 || !chapterListRef.current) return;
    const container = chapterListRef.current;
    const activeEl = container.children[activeChapter] as HTMLElement;
    if (!activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    // Check if element is out of view (vertically for desktop, horizontally for mobile)
    const isVertical = window.innerWidth >= 1024;
    if (isVertical) {
      if (
        activeRect.top < containerRect.top ||
        activeRect.bottom > containerRect.bottom
      ) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } else {
      if (
        activeRect.left < containerRect.left ||
        activeRect.right > containerRect.right
      ) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [activeChapter]);

  const seekToChapter = useCallback((startTime: number) => {
    if (playerRef.current && !destroyedRef.current) {
      playerRef.current.setCurrentTime(startTime);
      playerRef.current.play();
    }
  }, []);

  // Loading skeleton for chapters
  const chapterSkeleton = (
    <div className="max-lg:hidden lg:w-72 shrink-0">
      <div className="skeleton h-4 w-20 rounded mb-3" />
      <div className="flex flex-row lg:flex-col gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-10 rounded-lg shrink-0 lg:w-full"
            style={{ width: "160px" }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Video */}
      <div
        ref={videoWrapperRef}
        className={`${
          isReady && chapters.length > 0
            ? "lg:flex-1 lg:min-w-0"
            : !isReady
            ? "lg:flex-1 lg:min-w-0"
            : "w-full"
        }`}
      >
        {/* Loading skeleton behind the player */}
        {!isReady && (
          <div className="skeleton aspect-video rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="w-12 h-12 text-muted/30 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-xs text-muted/50">Loading video...</span>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className={`rounded-lg overflow-hidden bg-black ${
            !isReady ? "hidden" : ""
          }`}
        />
      </div>

      {/* Chapter markers sidebar */}
      {!isReady && chapterSkeleton}
      {isReady && chapters.length > 0 && (
        <div className="max-lg:hidden lg:w-72 shrink-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 px-1">
            Chapters
          </h3>
          <div
            ref={chapterListRef}
            className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto pb-2 lg:pb-0"
            style={
              videoHeight
                ? { maxHeight: `${videoHeight - 24}px` }
                : { maxHeight: "60vh" }
            }
          >
            {chapters.map((chapter, i) => (
              <button
                key={i}
                onClick={() => seekToChapter(chapter.startTime)}
                className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all shrink-0 lg:shrink lg:w-full ${
                  activeChapter === i
                    ? "bg-accent/15 border border-accent/30 text-accent"
                    : "bg-card-bg border border-card-border hover:border-accent/30 text-foreground"
                }`}
              >
                <span
                  className={`text-[10px] font-mono mt-0.5 shrink-0 ${
                    activeChapter === i ? "text-accent" : "text-muted"
                  }`}
                >
                  {formatTime(chapter.startTime)}
                </span>
                <span className="text-sm leading-snug line-clamp-2">
                  {chapter.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

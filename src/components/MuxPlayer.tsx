"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import MuxPlayerReact from "@mux/mux-player-react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { getChapters } from "@/lib/chapters";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  slug: string;
  playbackId: string;
  title?: string;
}

export default function MuxPlayer({ slug, playbackId, title }: Props) {
  const chapters = useMemo(() => getChapters(slug), [slug]);

  const playerRef = useRef<MuxPlayerRefAttributes | null>(null);
  const chapterListRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState<number>(-1);
  const [isReady, setIsReady] = useState(false);
  const [videoHeight, setVideoHeight] = useState<number | null>(null);

  // Match chapter-panel height to video container on desktop
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

  // Update active chapter on timeupdate
  const handleTimeUpdate = useCallback(() => {
    const el = playerRef.current;
    if (!el || chapters.length === 0) return;
    const time = el.currentTime;
    let current = -1;
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (time >= chapters[i].startTime) {
        current = i;
        break;
      }
    }
    setActiveChapter(current);
  }, [chapters]);

  const handleLoadedMetadata = useCallback(() => {
    setIsReady(true);
  }, []);

  // Auto-scroll chapter list to active chapter
  useEffect(() => {
    if (activeChapter < 0 || !chapterListRef.current) return;
    const container = chapterListRef.current;
    const activeEl = container.children[activeChapter] as HTMLElement;
    if (!activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

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
    const el = playerRef.current;
    if (!el) return;
    el.currentTime = startTime;
    void el.play();
  }, []);

  const chapterSkeleton = (
    <div className="max-lg:hidden lg:w-72 shrink-0">
      <div className="skeleton h-3 w-16 rounded mb-3 ml-3" />
      <div className="flex flex-col gap-0.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 pl-4 pr-3 py-2.5 rounded-lg"
          >
            <div className="skeleton h-3.5 w-8 rounded mt-[3px] shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div
                className="skeleton h-3.5 rounded"
                style={{ width: `${65 + ((i * 17) % 30)}%` }}
              />
              {i % 3 !== 2 && (
                <div
                  className="skeleton h-3.5 rounded"
                  style={{ width: `${40 + ((i * 13) % 25)}%` }}
                />
              )}
            </div>
          </div>
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
        {!isReady && (
          <div className="skeleton aspect-video rounded-xl flex items-center justify-center">
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
        <div className={`video-frame ${!isReady ? "hidden" : ""}`}>
          <MuxPlayerReact
            ref={playerRef}
            playbackId={playbackId}
            metadataVideoTitle={title}
            streamType="on-demand"
            accentColor="#be123c"
            poster={`/posters/${slug}.jpg`}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            style={{ backgroundColor: "#000" }}
          />
        </div>
      </div>

      {/* Chapter markers sidebar */}
      {!isReady && chapterSkeleton}
      {isReady && chapters.length > 0 && (
        <div className="max-lg:hidden lg:w-72 shrink-0">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/50 mb-3 px-3">
            Chapters
          </h3>
          <div
            ref={chapterListRef}
            className="flex flex-row lg:flex-col gap-0.5 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto pb-2 lg:pb-0"
            style={
              videoHeight
                ? { maxHeight: `${videoHeight - 32}px` }
                : { maxHeight: "60vh" }
            }
          >
            {chapters.map((chapter, i) => (
              <button
                key={i}
                onClick={() => seekToChapter(chapter.startTime)}
                className={`relative flex items-start gap-3 pl-4 pr-3 py-2.5 rounded-lg text-left transition-all duration-200 shrink-0 lg:shrink lg:w-full ${
                  activeChapter === i
                    ? "bg-accent/8 text-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/[0.03]"
                }`}
              >
                {activeChapter === i && (
                  <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-accent" />
                )}
                <span
                  className={`text-[10px] font-mono mt-[3px] shrink-0 tabular-nums ${
                    activeChapter === i ? "text-accent" : "text-muted/50"
                  }`}
                >
                  {formatTime(chapter.startTime)}
                </span>
                <span className="text-[13px] leading-snug line-clamp-2">
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

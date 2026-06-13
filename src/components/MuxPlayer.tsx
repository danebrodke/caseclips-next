"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import MuxPlayerReact from "@mux/mux-player-react";
import type {
  MuxPlayerRefAttributes,
  MuxCSSProperties,
} from "@mux/mux-player-react";
import { getChapters } from "@/lib/chapters";
import MobileChapterMenu from "./MobileChapterMenu";

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
  const [hasStarted, setHasStarted] = useState(false);
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

  const hasChapters = chapters.length > 0;

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-4 animate-fade-in-up">
      {/* Video */}
      <div
        ref={videoWrapperRef}
        className={`max-lg:relative max-lg:z-[22] ${
          hasChapters ? "lg:flex-1 lg:min-w-0" : "w-full"
        }`}
      >
        <div className="video-frame group">
          {/* Static poster paints instantly while the Mux web component
              upgrades and cues playback metadata in the background. */}
          <Image
            src={`/posters/${slug}.jpg`}
            alt={title ?? ""}
            fill
            priority
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover"
          />
          <MuxPlayerReact
            ref={playerRef}
            playbackId={playbackId}
            metadataVideoTitle={title}
            streamType="on-demand"
            preload="metadata"
            accentColor="#6366f1"
            poster={`/posters/${slug}.jpg`}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setHasStarted(true)}
            style={
              {
                backgroundColor: "#000",
                "--center-play-button": "none",
                "--airplay-button": "none",
                "--pip-button": "none",
                "--playback-rate-button": "inline-flex",
                "--bottom-playback-rate-button": "inline-flex",
                "--time-display": "inline-flex",
                "--bottom-time-display": "inline-flex",
              } as MuxCSSProperties
            }
          />
          {/* Our own play affordance — renders with the poster (no flicker),
              pointer-events-none so the click falls through to the player,
              and fades out once playback begins. */}
          <div
            className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 ${
              hasStarted ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.06] backdrop-blur-md ring-1 ring-white/20 shadow-[0_2px_16px_rgba(0,0,0,0.35)] transition-all duration-500 ease-out group-hover:scale-105 group-hover:bg-white/[0.1] group-hover:ring-accent/50 group-hover:shadow-[0_0_32px_-6px_rgba(99,102,241,0.4)]">
              {/* Centroid-centered triangle: vertices (9,6)(9,18)(18,12) put
                  the centroid at (12,12) so it reads as optically centered. */}
              <svg
                className="w-[1.6rem] h-[1.6rem] text-white/95"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 6v12l9-6z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter markers sidebar */}
      {hasChapters && (
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
    {hasChapters && (
      <MobileChapterMenu
        chapters={chapters}
        activeChapter={activeChapter}
        hasStarted={hasStarted}
        onSeek={seekToChapter}
      />
    )}
    </>
  );
}

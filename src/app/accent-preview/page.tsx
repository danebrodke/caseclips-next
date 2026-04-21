"use client";

import Link from "next/link";
import { useState } from "react";

interface Swatch {
  name: string;
  accent: string;
  hover: string;
  light: string;
  note?: string;
}

const swatches: Swatch[] = [
  {
    name: "Indigo",
    accent: "#6366f1",
    hover: "#818cf8",
    light: "rgba(99, 102, 241, 0.15)",
    note: "current",
  },
  {
    name: "Blue",
    accent: "#3b82f6",
    hover: "#60a5fa",
    light: "rgba(59, 130, 246, 0.15)",
  },
  {
    name: "Sky",
    accent: "#0ea5e9",
    hover: "#38bdf8",
    light: "rgba(14, 165, 233, 0.15)",
  },
  {
    name: "Cyan",
    accent: "#06b6d4",
    hover: "#22d3ee",
    light: "rgba(6, 182, 212, 0.15)",
  },
  {
    name: "Teal",
    accent: "#14b8a6",
    hover: "#2dd4bf",
    light: "rgba(20, 184, 166, 0.15)",
  },
  {
    name: "Emerald",
    accent: "#10b981",
    hover: "#34d399",
    light: "rgba(16, 185, 129, 0.15)",
  },
  {
    name: "Amber",
    accent: "#f59e0b",
    hover: "#fbbf24",
    light: "rgba(245, 158, 11, 0.15)",
  },
  {
    name: "Orange",
    accent: "#f97316",
    hover: "#fb923c",
    light: "rgba(249, 115, 22, 0.15)",
  },
  {
    name: "Rose",
    accent: "#f43f5e",
    hover: "#fb7185",
    light: "rgba(244, 63, 94, 0.15)",
  },
  {
    name: "Violet",
    accent: "#8b5cf6",
    hover: "#a78bfa",
    light: "rgba(139, 92, 246, 0.15)",
  },
  {
    name: "Slate",
    accent: "#94a3b8",
    hover: "#cbd5e1",
    light: "rgba(148, 163, 184, 0.15)",
    note: "neutral",
  },
  {
    name: "Clinical blue",
    accent: "#4f86c6",
    hover: "#75a3d6",
    light: "rgba(79, 134, 198, 0.15)",
    note: "muted",
  },
];

function SamplePanel({ liked, onToggleLike }: { liked: boolean; onToggleLike: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Specialty pills row */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[11px] px-2.5 py-[3px] bg-accent/8 text-accent/80 rounded-full font-medium border border-accent/10">
          Trauma
        </span>
        <span className="text-[11px] px-2.5 py-[3px] bg-accent/8 text-accent/80 rounded-full font-medium border border-accent/10">
          Arthroplasty
        </span>
        <span className="text-[11px] px-2.5 py-[3px] bg-accent/8 text-accent/80 rounded-full font-medium border border-accent/10">
          Spine
        </span>
      </div>

      {/* Chapter list */}
      <div className="flex flex-col gap-0.5">
        <div className="relative flex items-start gap-3 pl-4 pr-3 py-2.5 rounded-lg bg-accent/8 text-foreground">
          <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-accent" />
          <span className="text-[10px] font-mono mt-[3px] shrink-0 tabular-nums text-accent">
            0:00
          </span>
          <span className="text-[13px] leading-snug">Patient positioning</span>
        </div>
        <div className="flex items-start gap-3 pl-4 pr-3 py-2.5 rounded-lg text-foreground/70">
          <span className="text-[10px] font-mono mt-[3px] shrink-0 tabular-nums text-muted/50">
            1:24
          </span>
          <span className="text-[13px] leading-snug">Incision and exposure</span>
        </div>
        <div className="flex items-start gap-3 pl-4 pr-3 py-2.5 rounded-lg text-foreground/70">
          <span className="text-[10px] font-mono mt-[3px] shrink-0 tabular-nums text-muted/50">
            4:12
          </span>
          <span className="text-[13px] leading-snug">Fracture reduction</span>
        </div>
      </div>

      {/* Link row */}
      <div className="text-sm flex items-center gap-3">
        <Link href="#" className="text-foreground hover:text-accent transition-colors">
          Dr. Sarah Chen
        </Link>
        <span className="text-muted/30">·</span>
        <span className="text-muted">UCLA</span>
      </div>

      {/* Like button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLike}
          className={`inline-flex items-center gap-1.5 text-[13px] px-2.5 py-1 rounded-full border transition-all ${
            liked
              ? "bg-accent/15 text-accent border-accent/30"
              : "text-muted/70 border-card-border hover:text-accent hover:border-accent/30"
          }`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {liked ? "128" : "127"}
        </button>
        <button className="text-[13px] px-4 py-1.5 rounded-lg bg-accent text-white font-medium hover:brightness-110 transition-all">
          Watch now
        </button>
      </div>
    </div>
  );
}

export default function AccentPreview() {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-normal tracking-tight mb-2">
          Accent color options
        </h1>
        <p className="text-muted text-sm">
          Each card uses the same UI elements from the site — pills, active chapter row,
          like state, author link hover, primary button — scoped to a different accent so
          you can judge how the color lives across real interactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {swatches.map((sw) => (
          <div
            key={sw.accent}
            className="rounded-2xl bg-card-bg/40 border border-card-border p-6"
            style={
              {
                "--accent": sw.accent,
                "--accent-hover": sw.hover,
                "--accent-light": sw.light,
              } as React.CSSProperties
            }
          >
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-card-border">
              <div
                className="w-10 h-10 rounded-lg shrink-0 ring-1 ring-white/10"
                style={{ background: sw.accent }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{sw.name}</span>
                  {sw.note && (
                    <span className="text-[10px] uppercase tracking-wider text-muted/60 px-1.5 py-0.5 rounded bg-white/5">
                      {sw.note}
                    </span>
                  )}
                </div>
                <code className="text-[11px] text-muted/70 font-mono">{sw.accent}</code>
              </div>
            </div>

            <SamplePanel
              liked={!!liked[sw.accent]}
              onToggleLike={() =>
                setLiked((prev) => ({ ...prev, [sw.accent]: !prev[sw.accent] }))
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-card-bg/40 border border-card-border">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted/70 mb-3">
          How to apply
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Pick a winner, then edit three CSS variables in{" "}
          <code className="font-mono text-foreground">src/app/globals.css</code>:{" "}
          <code className="font-mono text-foreground">--accent</code>,{" "}
          <code className="font-mono text-foreground">--accent-hover</code>, and{" "}
          <code className="font-mono text-foreground">--accent-light</code>. That swap
          propagates everywhere the accent is used.
        </p>
      </div>
    </div>
  );
}

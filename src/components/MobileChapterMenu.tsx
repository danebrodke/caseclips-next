"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Chapter } from "@/lib/chapters";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MAX_PANEL_HEIGHT = 380;
const MIN_PANEL_HEIGHT = 180;
const VIEWPORT_BOTTOM_GAP = 12;

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  chapters: Chapter[];
  activeChapter: number;
  onSeek: (seconds: number) => void;
}

export default function MobileChapterMenu({
  chapters,
  activeChapter,
  onSeek,
}: Props) {
  const [open, setOpen] = useState(false);
  const [panelMaxHeight, setPanelMaxHeight] = useState(MAX_PANEL_HEIGHT);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const active = Math.max(0, activeChapter);
  const current = chapters[active];

  // Fit the panel within available viewport space below the pill so the
  // sheet never extends off-screen — the user scrolls inside the list only.
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const bottom = wrapper.getBoundingClientRect().bottom;
      const available = window.innerHeight - bottom - VIEWPORT_BOTTOM_GAP;
      setPanelMaxHeight(
        Math.min(MAX_PANEL_HEIGHT, Math.max(MIN_PANEL_HEIGHT, available))
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  // Scroll the active row into view inside the list WITHOUT scrolling the
  // page — scrollIntoView propagates to ancestors, so we set scrollTop
  // directly on the list container instead.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const row = list.querySelector(
      `[data-chap="${active}"]`
    ) as HTMLElement | null;
    if (!row) return;
    const listRect = list.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const rowOffsetInList =
      list.scrollTop + (rowRect.top - listRect.top);
    const target =
      rowOffsetInList - (list.clientHeight - row.clientHeight) / 2;
    list.scrollTo({
      top: Math.max(0, target),
      behavior: "smooth",
    });
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  if (chapters.length === 0 || !current) return null;

  return (
    <>
      <div
        ref={wrapperRef}
        className="lg:hidden relative mt-[10px]"
        style={{ zIndex: open ? 22 : 1 }}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-chapter-menu"
          onClick={() => setOpen((o) => !o)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: open ? "10px 10px 0 0" : 10,
            background: "#18181b",
            border: "1px solid",
            borderColor: open
              ? "rgba(154,147,255,0.3)"
              : "rgba(255,255,255,0.06)",
            borderBottom: open
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(255,255,255,0.06)",
            color: "#fff",
            font: "inherit",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.2s",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1,
              color: "rgba(235,235,245,0.5)",
              background: "rgba(255,255,255,0.05)",
              padding: "3px 7px",
              borderRadius: 4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(active + 1).padStart(2, "0")} / {chapters.length}
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 14,
            }}
          >
            {current.title}
          </div>
          <span
            style={{
              fontSize: 12,
              color: "rgba(235,235,245,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Chapters
            <span
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.25s",
                display: "inline-flex",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 4l3 3 3-3" />
              </svg>
            </span>
          </span>
        </button>

        <div
          id="mobile-chapter-menu"
          role="listbox"
          aria-label="Chapters"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            marginTop: -1,
            transformOrigin: "top",
            transform:
              open || reducedMotion ? "scaleY(1)" : "scaleY(0.4)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: reducedMotion
              ? "opacity 0.2s"
              : "transform 0.25s cubic-bezier(.2,.8,.2,1), opacity 0.2s",
            background: "#141418",
            border: "1px solid rgba(154,147,255,0.25)",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            zIndex: 23,
            maxHeight: panelMaxHeight,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            ref={listRef}
            className="mobile-chapter-scroll"
            style={{ overflow: "auto", padding: "4px 6px 8px" }}
          >
            {chapters.map((ch, i) => {
              const isActive = i === active;
              const played = i < active;
              const delay =
                open && !reducedMotion ? Math.min(i * 0.018, 0.3) : 0;
              return (
                <button
                  key={i}
                  data-chap={i}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => onSeek(ch.startTime)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "9px 10px",
                    border: "none",
                    background: isActive
                      ? "rgba(120,110,255,0.08)"
                      : "transparent",
                    borderRadius: 6,
                    color: "#fff",
                    font: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                    opacity: open ? 1 : 0,
                    transform:
                      open || reducedMotion
                        ? "translateY(0)"
                        : "translateY(-6px)",
                    transition: reducedMotion
                      ? "opacity 0.2s"
                      : `opacity 0.25s ${delay}s, transform 0.25s ${delay}s`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontVariantNumeric: "tabular-nums",
                      color: isActive
                        ? "#9a93ff"
                        : played
                        ? "rgba(235,235,245,0.35)"
                        : "rgba(235,235,245,0.6)",
                      minWidth: 34,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {formatTime(ch.startTime)}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontSize: 14,
                      lineHeight: 1.3,
                      color: isActive
                        ? "#fff"
                        : played
                        ? "rgba(235,235,245,0.5)"
                        : "#fff",
                      fontWeight: isActive ? 500 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ch.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className="lg:hidden"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.15)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s",
          zIndex: 21,
        }}
      />
    </>
  );
}

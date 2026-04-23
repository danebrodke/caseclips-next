"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MiniSearch from "minisearch";
import {
  videos,
  authors,
  institutions,
  specialties,
  getAuthors,
  getSpecialties,
  getAuthorInstitution,
} from "@/lib/data";
import type { Video } from "@/lib/types";

// Build searchable index
const searchableVideos = videos.map((video) => {
  const videoAuthors = getAuthors(video.authorIds);
  const specs = getSpecialties(video.specialtyIds);
  const instNames = videoAuthors
    .map((a) => getAuthorInstitution(a)?.name)
    .filter(Boolean)
    .join(" ");
  return {
    ...video,
    authorName: videoAuthors.map((a) => a.name).join(" "),
    specialtyNames: specs.map((s) => s.name).join(" "),
    institutionName: instNames,
  };
});

const miniSearch = new MiniSearch({
  fields: ["title", "authorName", "specialtyNames", "institutionName"],
  storeFields: ["id"],
  searchOptions: {
    boost: { title: 2, authorName: 1, specialtyNames: 0.8, institutionName: 0.5 },
    prefix: true,
    fuzzy: 0.2,
  },
});
miniSearch.addAll(searchableVideos);


function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return { open, setOpen, ref };
}

function TypeaheadFilter({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: { id: string; name: string }[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const { open, setOpen, ref } = useDropdown();

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      ),
    [items, query]
  );

  const selectedNames = items
    .filter((i) => selected.has(i.id))
    .map((i) => i.name);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
          selected.size > 0
            ? "border-accent/50 bg-accent-light text-accent"
            : "border-card-border bg-card-bg text-muted hover:border-accent/40"
        }`}
      >
        <span>{label}:</span>
        <span className="font-medium truncate max-w-[160px]">
          {selectedNames.length > 0 ? selectedNames.join(", ") : "All"}
        </span>
        <svg
          className="w-3.5 h-3.5 shrink-0 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-64 bg-card-bg border border-card-border rounded-lg shadow-xl shadow-black/30">
          <div className="p-2">
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-base sm:text-sm border border-card-border rounded-md bg-surface text-foreground focus:outline-none focus:border-accent placeholder:text-muted"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto px-1 pb-1">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={`w-full text-left px-3 py-1.5 text-sm rounded-md flex items-center gap-2 hover:bg-accent-light transition-colors ${
                  selected.has(item.id) ? "text-accent font-medium" : "text-foreground"
                }`}
              >
                <span
                  className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center ${
                    selected.has(item.id)
                      ? "bg-accent border-accent text-white"
                      : "border-card-border"
                  }`}
                >
                  {selected.has(item.id) && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                {item.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  const videoAuthors = getAuthors(video.authorIds);
  const videoSpecialties = getSpecialties(video.specialtyIds);

  return (
    <div className="group">
      <Link href={`/video/${video.slug}`}>
        <div className="relative aspect-video bg-card-bg rounded-lg overflow-hidden mb-3">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-card-border to-card-bg flex items-center justify-center">
              <svg
                className="w-10 h-10 text-muted/40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
      </Link>
      <div className="min-w-0">
        {videoSpecialties.length > 0 && (
          <div className="text-[10px] uppercase tracking-[0.12em] font-medium text-accent/80 mb-1.5">
            {videoSpecialties.map((s) => s.name).join(" / ")}
          </div>
        )}
        <Link href={`/video/${video.slug}`}>
          <h3 className="font-serif text-[17px] leading-[1.2] tracking-[-0.01em] text-foreground group-hover:text-accent transition-colors line-clamp-2">
            {video.title}
          </h3>
        </Link>
        <div className="mt-1.5 text-[12px] text-muted">
          {videoAuthors.map((author, i) => (
            <span key={author.id}>
              {i > 0 && ", "}
              <Link
                href={`/author/${author.slug}`}
                className="hover:text-accent transition-colors"
              >
                {author.name}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VideoGrid() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(
    () => {
      const initialSpecialty = searchParams.get("specialty");
      if (!initialSpecialty) return new Set();
      const spec = specialties.find((s) => s.slug === initialSpecialty);
      return spec ? new Set([spec.id]) : new Set();
    }
  );
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string>>(
    new Set()
  );
  const [selectedInstitutions, setSelectedInstitutions] = useState<Set<string>>(
    new Set()
  );

  // Listen for logo-click reset
  useEffect(() => {
    function handleReset() {
      setSearchQuery("");
      setSelectedSpecialties(new Set());
      setSelectedAuthors(new Set());
      setSelectedInstitutions(new Set());
    }
    window.addEventListener("caseclips:reset-filters", handleReset);
    return () => window.removeEventListener("caseclips:reset-filters", handleReset);
  }, []);

  function toggleInSet(set: Set<string>, id: string): Set<string> {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  const filteredVideos = useMemo(() => {
    let pool: Video[];
    if (searchQuery.trim()) {
      const results = miniSearch.search(searchQuery);
      const videoMap = new Map(videos.map((v) => [v.id, v]));
      pool = results.map((r) => videoMap.get(r.id)).filter(Boolean) as Video[];
    } else {
      pool = videos;
    }

    return pool.filter((video) => {
      if (
        selectedSpecialties.size > 0 &&
        !video.specialtyIds.some((sid) => selectedSpecialties.has(sid))
      )
        return false;

      if (
        selectedAuthors.size > 0 &&
        !video.authorIds.some((aid) => selectedAuthors.has(aid))
      )
        return false;

      if (selectedInstitutions.size > 0) {
        const videoAuthors = getAuthors(video.authorIds);
        if (
          !videoAuthors.some((a) =>
            selectedInstitutions.has(a.institutionId)
          )
        )
          return false;
      }

      return true;
    });
  }, [searchQuery, selectedSpecialties, selectedAuthors, selectedInstitutions]);

  // Lazy loading: show 16 initially, load 16 more each time sentinel is visible
  const PAGE_SIZE = 16;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedSpecialties, selectedAuthors, selectedInstitutions]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredVideos]);

  const visibleVideos = filteredVideos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVideos.length;

  const hasFilters =
    searchQuery.trim().length > 0 ||
    selectedSpecialties.size > 0 ||
    selectedAuthors.size > 0 ||
    selectedInstitutions.size > 0;

  return (
    <div>
      {/* Search + Filters row */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search videos, authors, specialties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-base sm:text-sm border border-card-border rounded-lg bg-card-bg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors placeholder:text-muted"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Specialty pills */}
          <button
            onClick={() => setSelectedSpecialties(new Set())}
            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
              selectedSpecialties.size === 0
                ? "bg-accent border-accent text-white"
                : "bg-card-bg border-card-border text-muted hover:border-accent/40"
            }`}
          >
            All
          </button>
          {specialties.map((spec) => (
            <button
              key={spec.id}
              onClick={() =>
                setSelectedSpecialties((prev) => toggleInSet(prev, spec.id))
              }
              className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                selectedSpecialties.has(spec.id)
                  ? "bg-accent border-accent text-white"
                  : "bg-card-bg border-card-border text-muted hover:border-accent/40"
              }`}
            >
              {spec.name}
            </button>
          ))}

          <div className="w-px h-5 bg-card-border mx-1 hidden sm:block" />

          {/* Typeahead filters */}
          <TypeaheadFilter
            label="Author"
            items={authors}
            selected={selectedAuthors}
            onToggle={(id) =>
              setSelectedAuthors((prev) => toggleInSet(prev, id))
            }
          />
          <TypeaheadFilter
            label="Institution"
            items={institutions}
            selected={selectedInstitutions}
            onToggle={(id) =>
              setSelectedInstitutions((prev) => toggleInSet(prev, id))
            }
          />

          {hasFilters && (
            <>
              <div className="w-px h-5 bg-card-border mx-1 hidden sm:block" />
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSpecialties(new Set());
                  setSelectedAuthors(new Set());
                  setSelectedInstitutions(new Set());
                }}
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                Clear all
              </button>
            </>
          )}

          <span className="text-xs text-muted ml-auto">
            {filteredVideos.length} video
            {filteredVideos.length !== 1 && "s"}
          </span>
        </div>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-7">
        {visibleVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {/* Lazy load sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-px" />}

      {filteredVideos.length === 0 && (
        <div className="text-center py-20 text-muted">
          <p className="text-base">No videos match your filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSpecialties(new Set());
              setSelectedAuthors(new Set());
              setSelectedInstitutions(new Set());
            }}
            className="mt-2 text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

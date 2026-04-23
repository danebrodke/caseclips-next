"use client";

import Link from "next/link";
import Image from "next/image";
import {
  videos,
  getAuthors,
  getSpecialties,
  getAuthorInstitution,
} from "@/lib/data";
import type { Video } from "@/lib/types";

const sample = videos.slice(0, 8);

type CardProps = { video: Video };

/* ---------- A. Current (baseline, likes removed) ---------- */
function CardCurrent({ video }: CardProps) {
  const videoAuthors = getAuthors(video.authorIds);
  const videoSpecialties = getSpecialties(video.specialtyIds);

  return (
    <div className="group">
      <Link href={`/video/${video.slug}`}>
        <div className="relative aspect-video bg-card-bg rounded-lg overflow-hidden mb-2">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>
      </Link>
      <Link href={`/video/${video.slug}`}>
        <h3 className="font-semibold text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2 text-foreground">
          {video.title}
        </h3>
      </Link>
      <div className="text-xs text-muted">
        {videoAuthors.map((a, i) => (
          <span key={a.id}>
            {i > 0 && ", "}
            {a.name}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {videoSpecialties.map((spec) => (
          <span
            key={spec.id}
            className="text-[10px] px-1.5 py-0.5 bg-accent-light text-accent rounded-full font-medium"
          >
            {spec.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- B. Quiet — muted specialty text, no pills ---------- */
function CardQuiet({ video }: CardProps) {
  const videoAuthors = getAuthors(video.authorIds);
  const videoSpecialties = getSpecialties(video.specialtyIds);
  const primaryInstitution =
    videoAuthors.length > 0 ? getAuthorInstitution(videoAuthors[0]) : undefined;

  return (
    <div className="group">
      <Link href={`/video/${video.slug}`}>
        <div className="relative aspect-video bg-card-bg rounded-lg overflow-hidden mb-3 ring-1 ring-white/[0.04]">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          )}
        </div>
      </Link>
      <Link href={`/video/${video.slug}`}>
        <h3 className="font-medium text-[14px] leading-snug tracking-[-0.005em] text-foreground group-hover:text-accent transition-colors line-clamp-2">
          {video.title}
        </h3>
      </Link>
      <div className="mt-1.5 text-[12px] text-muted/70 truncate">
        {videoAuthors.map((a) => a.name).join(", ")}
        {primaryInstitution && (
          <>
            <span className="mx-1.5 text-muted/30">·</span>
            {primaryInstitution.name}
          </>
        )}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted/40">
        {videoSpecialties.map((s) => s.name).join(" · ")}
      </div>
    </div>
  );
}

/* ---------- C. Editorial — serif title, kicker specialty ---------- */
function CardEditorial({ video }: CardProps) {
  const videoAuthors = getAuthors(video.authorIds);
  const videoSpecialties = getSpecialties(video.specialtyIds);

  return (
    <div className="group">
      <Link href={`/video/${video.slug}`}>
        <div className="relative aspect-video bg-card-bg rounded-lg overflow-hidden mb-3">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          )}
        </div>
      </Link>
      <div className="text-[10px] uppercase tracking-[0.12em] font-medium text-accent/80 mb-1.5">
        {videoSpecialties.map((s) => s.name).join(" / ")}
      </div>
      <Link href={`/video/${video.slug}`}>
        <h3 className="font-serif text-[17px] leading-[1.2] tracking-[-0.01em] text-foreground group-hover:text-accent transition-colors line-clamp-2">
          {video.title}
        </h3>
      </Link>
      <div className="mt-1.5 text-[12px] text-muted">
        {videoAuthors.map((a) => a.name).join(", ")}
      </div>
    </div>
  );
}

/* ---------- D. Overlay chip — specialty on thumbnail ---------- */
function CardOverlay({ video }: CardProps) {
  const videoAuthors = getAuthors(video.authorIds);
  const videoSpecialties = getSpecialties(video.specialtyIds);

  return (
    <div className="group">
      <Link href={`/video/${video.slug}`}>
        <div className="relative aspect-video bg-card-bg rounded-lg overflow-hidden mb-2">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {videoSpecialties.map((spec) => (
              <span
                key={spec.id}
                className="text-[10px] px-2 py-0.5 bg-black/55 backdrop-blur-[4px] text-white/90 rounded-full font-medium ring-1 ring-white/10"
              >
                {spec.name}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <Link href={`/video/${video.slug}`}>
        <h3 className="font-medium text-[14px] leading-snug text-foreground group-hover:text-accent transition-colors line-clamp-2">
          {video.title}
        </h3>
      </Link>
      <div className="mt-1 text-[12px] text-muted/70">
        {videoAuthors.map((a) => a.name).join(", ")}
      </div>
    </div>
  );
}

/* ---------- E. Contained — bordered card surface ---------- */
function CardContained({ video }: CardProps) {
  const videoAuthors = getAuthors(video.authorIds);
  const videoSpecialties = getSpecialties(video.specialtyIds);

  return (
    <Link href={`/video/${video.slug}`} className="group block">
      <div className="rounded-xl bg-surface-elevated ring-1 ring-white/[0.06] p-2 transition-all duration-200 hover:ring-white/[0.12] hover:-translate-y-0.5">
        <div className="relative aspect-video bg-card-bg rounded-lg overflow-hidden">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          )}
        </div>
        <div className="px-1 pt-3 pb-1.5">
          <h3 className="font-medium text-[14px] leading-snug text-foreground group-hover:text-accent transition-colors line-clamp-2">
            {video.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-[12px] text-muted/70">
            <span className="truncate">
              {videoAuthors.map((a) => a.name).join(", ")}
            </span>
            {videoSpecialties[0] && (
              <>
                <span className="text-muted/30">·</span>
                <span className="text-muted/60 shrink-0">
                  {videoSpecialties[0].name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ---------- F. Hover reveal — minimal at rest ---------- */
function CardHoverReveal({ video }: CardProps) {
  const videoAuthors = getAuthors(video.authorIds);
  const videoSpecialties = getSpecialties(video.specialtyIds);
  const primaryInstitution =
    videoAuthors.length > 0 ? getAuthorInstitution(videoAuthors[0]) : undefined;

  return (
    <div className="group">
      <Link href={`/video/${video.slug}`}>
        <div className="relative aspect-video bg-card-bg rounded-lg overflow-hidden mb-2.5">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 p-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {videoSpecialties.map((spec) => (
              <span
                key={spec.id}
                className="text-[10px] px-2 py-0.5 bg-black/60 backdrop-blur-[4px] text-white/95 rounded-full font-medium"
              >
                {spec.name}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <Link href={`/video/${video.slug}`}>
        <h3 className="font-medium text-[14px] leading-snug text-foreground group-hover:text-accent transition-colors line-clamp-2">
          {video.title}
        </h3>
      </Link>
      <div className="mt-1 text-[12px] text-muted/70 truncate">
        {videoAuthors.map((a) => a.name).join(", ")}
        {primaryInstitution && (
          <span className="text-muted/40">
            <span className="mx-1.5 text-muted/25">·</span>
            {primaryInstitution.name}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- G. Borderless — typography-first ---------- */
function CardBorderless({ video }: CardProps) {
  const videoAuthors = getAuthors(video.authorIds);
  const videoSpecialties = getSpecialties(video.specialtyIds);

  return (
    <div className="group">
      <Link href={`/video/${video.slug}`}>
        <div className="relative aspect-video bg-card-bg rounded-md overflow-hidden mb-3.5">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          )}
        </div>
      </Link>
      <Link href={`/video/${video.slug}`}>
        <h3 className="font-semibold text-[15px] leading-[1.25] tracking-[-0.01em] text-foreground group-hover:text-accent transition-colors line-clamp-2">
          {video.title}
        </h3>
      </Link>
      <div className="mt-2 flex items-center gap-2 text-[11.5px]">
        <span className="text-foreground/75 truncate">
          {videoAuthors.map((a) => a.name).join(", ")}
        </span>
        <span className="w-1 h-1 rounded-full bg-muted/30 shrink-0" />
        <span className="text-muted/60 truncate">
          {videoSpecialties.map((s) => s.name).join(", ")}
        </span>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

const variants: {
  id: string;
  name: string;
  description: string;
  Component: (p: CardProps) => React.ReactElement;
}[] = [
  {
    id: "current",
    name: "A · Current (likes removed)",
    description:
      "Baseline — today's card with the heart stripped. Accent-tinted specialty pills, sans title.",
    Component: CardCurrent,
  },
  {
    id: "quiet",
    name: "B · Quiet",
    description:
      "Same layout, but specialty drops the colored pills for a muted uppercase line. Adds institution beside author. Least visual noise on the grid.",
    Component: CardQuiet,
  },
  {
    id: "editorial",
    name: "C · Editorial",
    description:
      "Serif title (Newsreader, matches the video page). Specialty becomes a small accent kicker above the title. Reads like a publication.",
    Component: CardEditorial,
  },
  {
    id: "overlay",
    name: "D · Overlay chip",
    description:
      "Specialty pushed onto the thumbnail as a translucent chip. Below the thumb: just title + author — the cleanest footer.",
    Component: CardOverlay,
  },
  {
    id: "contained",
    name: "E · Contained",
    description:
      "Everything wrapped in a subtle elevated tile with a 1px ring. Lifts on hover. Feels most like a clickable 'object'.",
    Component: CardContained,
  },
  {
    id: "hover-reveal",
    name: "F · Hover reveal",
    description:
      "Nothing on the thumbnail at rest — specialty chips fade in from the bottom on hover. Footer stays minimal.",
    Component: CardHoverReveal,
  },
  {
    id: "borderless",
    name: "G · Borderless",
    description:
      "Typography-first. Slightly larger title, single-line meta with a bullet separator. No pills anywhere.",
    Component: CardBorderless,
  },
];

export default function CardPreviewPage() {
  return (
    <div className="pb-20">
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted/50 mb-2">
          Internal · Design preview
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-[-0.015em] text-foreground">
          Homepage card explorations
        </h1>
        <p className="mt-3 text-sm text-muted max-w-2xl leading-relaxed">
          Seven directions for the video card, shown in the live 4-column grid
          (and 2 columns on mobile). Same eight videos in every section so the
          differences are layout, typography and chrome — not content.
        </p>
      </div>

      <div className="flex flex-col gap-16">
        {variants.map((v) => (
          <section key={v.id}>
            <div className="flex items-baseline justify-between gap-4 mb-5 pb-3 border-b border-card-border/60">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground">
                  {v.name}
                </h2>
                <p className="mt-1 text-[13px] text-muted/80 leading-relaxed max-w-2xl">
                  {v.description}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-7">
              {sample.map((video) => (
                <v.Component key={video.id} video={video} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

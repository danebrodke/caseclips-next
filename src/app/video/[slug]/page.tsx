import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  videos,
  getAuthors,
  getSpecialties,
  getAuthorInstitution,
} from "@/lib/data";
import type { Video } from "@/lib/types";
import VimeoPlayer from "@/components/VimeoPlayer";
import LikeButton from "@/components/LikeButton";
import FilmGallery from "@/components/FilmGallery";

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getRelatedVideos(video: Video, limit: number): Video[] {
  const scored = videos
    .filter((v) => v.id !== video.id)
    .map((v) => {
      let score = 0;
      score +=
        v.authorIds.filter((id) => video.authorIds.includes(id)).length * 3;
      score +=
        v.specialtyIds.filter((id) => video.specialtyIds.includes(id)).length *
        2;
      return { video: v, score };
    })
    .sort((a, b) => b.score - a.score);

  const result: Video[] = [];
  const usedIds = new Set<string>([video.id]);

  for (const s of scored) {
    if (result.length >= limit) break;
    if (!usedIds.has(s.video.id)) {
      result.push(s.video);
      usedIds.add(s.video.id);
    }
  }

  return result;
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = videos.find((v) => v.slug === slug);
  if (!video) notFound();

  const videoAuthors = getAuthors(video.authorIds);
  const videoSpecialties = getSpecialties(video.specialtyIds);
  const primaryInstitution =
    videoAuthors.length > 0
      ? getAuthorInstitution(videoAuthors[0])
      : undefined;
  const hasFilms =
    video.preopImages.length > 0 || video.postopImages.length > 0;

  const imageCount = video.preopImages.length + video.postopImages.length;
  const imageRows = Math.ceil(imageCount / 2);
  const leftHeightEstimate = 130 + imageRows * 230;
  const relatedCount = Math.max(
    3,
    Math.min(8, Math.round(leftHeightEstimate / 82))
  );
  const related = getRelatedVideos(video, relatedCount);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Video + Chapters */}
      {video.vimeoId && <VimeoPlayer vimeoId={video.vimeoId} />}

      {/* Title */}
      <div className="mt-8 animate-fade-in-up">
        <div className="flex items-start justify-between gap-6">
          <h1 className="font-serif text-[1.7rem] sm:text-[2.25rem] font-normal tracking-[-0.015em] leading-[1.2] text-white">
            {video.title}
          </h1>
          <div className="shrink-0 pt-1.5">
            <LikeButton videoId={video.id} />
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-1.5">
              {videoAuthors.map((author) => (
                <div
                  key={author.id}
                  className="w-7 h-7 rounded-full bg-surface ring-2 ring-background overflow-hidden"
                >
                  {author.photoUrl ? (
                    <Image
                      src={author.photoUrl}
                      alt={author.name}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] font-semibold text-muted">
                      {author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-sm">
              {videoAuthors.map((author, i) => (
                <span key={author.id}>
                  {i > 0 && ", "}
                  <Link
                    href={`/author/${author.slug}`}
                    className="text-foreground hover:text-accent transition-colors duration-200"
                  >
                    {author.name}
                  </Link>
                </span>
              ))}
            </span>
          </div>
          {primaryInstitution && (
            <>
              <span className="text-muted/30 select-none">&middot;</span>
              <span className="text-sm text-muted">
                {primaryInstitution.name}
              </span>
            </>
          )}
          <span className="text-muted/30 select-none">&middot;</span>
          <span className="text-sm text-muted">
            {formatDate(video.publishedAt)}
          </span>
          {videoSpecialties.length > 0 && (
            <div className="flex items-center gap-1.5 sm:ml-auto">
              {videoSpecialties.map((spec) => (
                <Link
                  key={spec.id}
                  href={`/?specialty=${spec.slug}`}
                  className="text-[11px] px-2.5 py-[3px] bg-accent/8 text-accent/80 rounded-full font-medium border border-accent/10 hover:bg-accent/15 hover:text-accent transition-all duration-200"
                >
                  {spec.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-card-border via-card-border/40 to-transparent mt-6 mb-6" />

      {/* Imaging + Related */}
      <div
        className="flex flex-col lg:flex-row gap-8 animate-fade-in-up"
        style={{ animationDelay: "0.12s" }}
      >
        {/* Imaging */}
        <div className="flex-1 min-w-0">
          {hasFilms && (
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/50 mb-4">
                Imaging
              </h2>
              <FilmGallery
                preopImages={video.preopImages}
                postopImages={video.postopImages}
                title={video.title}
              />
            </div>
          )}
        </div>

        {/* Related */}
        <div className="lg:w-72 shrink-0">
          {related.length > 0 && (
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/50 mb-4">
                Related
              </h2>
              <div className="flex flex-col gap-0.5">
                {related.map((rv) => {
                  const rvAuthors = getAuthors(rv.authorIds);
                  return (
                    <Link
                      key={rv.id}
                      href={`/video/${rv.slug}`}
                      className="group flex gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-white/[0.03] transition-all duration-200"
                    >
                      <div className="relative w-[6.5rem] shrink-0 aspect-video bg-card-bg rounded-lg overflow-hidden ring-1 ring-white/[0.05]">
                        {rv.thumbnailUrl ? (
                          <Image
                            src={rv.thumbnailUrl}
                            alt={rv.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            sizes="104px"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-card-border to-card-bg" />
                        )}
                      </div>
                      <div className="min-w-0 py-0.5">
                        <h3 className="text-[13px] font-medium leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
                          {rv.title}
                        </h3>
                        <p className="text-[11px] text-muted/50 mt-1.5 truncate">
                          {rvAuthors.map((a) => a.name).join(", ")}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

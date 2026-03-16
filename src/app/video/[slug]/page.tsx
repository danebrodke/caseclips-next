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

  // Take top scored, then fill remaining slots with recent videos
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

  // Scale related count to roughly match left column height.
  // Left col: ~100px title/meta + ~30px imaging header + image rows.
  // w-72 tiles (288px) fit 2 per row in ~750px left col. Each row ~220px.
  // Each related card ~70px tall + 12px gap ≈ 82px.
  const imageCount = video.preopImages.length + video.postopImages.length;
  const imageRows = Math.ceil(imageCount / 2);
  const leftHeightEstimate = 130 + imageRows * 230;
  const relatedCount = Math.max(3, Math.min(8, Math.round(leftHeightEstimate / 82)));
  const related = getRelatedVideos(video, relatedCount);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Video + Chapters */}
      {video.vimeoId && <VimeoPlayer vimeoId={video.vimeoId} />}

      {/* Below video — same flex layout as VimeoPlayer */}
      <div className="mt-4 flex flex-col lg:flex-row lg:items-stretch gap-4">
        {/* Left column — matches video width */}
        <div className="flex-1 min-w-0">
          {/* Title + like */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">
              {video.title}
            </h1>
            <LikeButton videoId={video.id} initialCount={video.likesCount} />
          </div>

          {/* Author byline: photos + names + institution */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex -space-x-1.5">
              {videoAuthors.map((author) => (
                <div
                  key={author.id}
                  className="w-6 h-6 rounded-full bg-surface border-2 border-card-bg overflow-hidden"
                >
                  {author.photoUrl ? (
                    <Image
                      src={author.photoUrl}
                      alt={author.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted">
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
                    className="text-foreground hover:text-accent transition-colors"
                  >
                    {author.name}
                  </Link>
                </span>
              ))}
              {primaryInstitution && (
                <span className="text-muted">
                  {" "}&middot; {primaryInstitution.name}
                </span>
              )}
            </span>
          </div>

          {/* Date + tags on one line */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-sm text-muted">
              {formatDate(video.publishedAt)}
            </span>
            {videoSpecialties.map((spec) => (
              <Link
                key={spec.id}
                href={`/?specialty=${spec.slug}`}
                className="text-xs px-2.5 py-0.5 bg-accent-light text-accent rounded-full font-medium hover:bg-accent hover:text-white transition-colors"
              >
                {spec.name}
              </Link>
            ))}
          </div>

          {/* Imaging — side by side */}
          {hasFilms && (
            <div className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
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

        {/* Right column — matches chapter column width */}
        <div className="lg:w-72 shrink-0">
          {related.length > 0 && (
            <div className="bg-[#181818] rounded-xl p-4 h-full">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Related
              </h2>
              <div className="flex flex-col gap-3">
                {related.map((rv) => {
                  const rvAuthors = getAuthors(rv.authorIds);
                  return (
                    <Link
                      key={rv.id}
                      href={`/video/${rv.slug}`}
                      className="group flex gap-3"
                    >
                      <div className="relative w-24 shrink-0 aspect-video bg-card-bg rounded-md overflow-hidden">
                        {rv.thumbnailUrl ? (
                          <Image
                            src={rv.thumbnailUrl}
                            alt={rv.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            sizes="96px"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-card-border to-card-bg" />
                        )}
                      </div>
                      <div className="min-w-0 py-0.5">
                        <h3 className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                          {rv.title}
                        </h3>
                        <p className="text-[11px] text-muted mt-1 truncate">
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

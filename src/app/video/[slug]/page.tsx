import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  videos,
  getAuthor,
  getSpecialties,
  getAuthorInstitution,
} from "@/lib/data";
import VimeoPlayer from "@/components/VimeoPlayer";
import LikeButton from "@/components/LikeButton";
import FilmGallery from "@/components/FilmGallery";

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = videos.find((v) => v.slug === slug);
  if (!video) notFound();

  const author = getAuthor(video.authorId);
  const institution = author ? getAuthorInstitution(author) : undefined;
  const videoSpecialties = getSpecialties(video.specialtyIds);
  const hasFilms =
    video.preopImages.length > 0 || video.postopImages.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Video + Chapters */}
      {video.vimeoId && <VimeoPlayer vimeoId={video.vimeoId} />}

      {/* Info + Imaging — two equal columns */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column: title, tags, likes, author */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{video.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex flex-wrap gap-1.5">
                {videoSpecialties.map((spec) => (
                  <span
                    key={spec.id}
                    className="text-xs px-2 py-0.5 bg-accent-light text-accent rounded-full font-medium"
                  >
                    {spec.name}
                  </span>
                ))}
              </div>
              <LikeButton
                videoId={video.id}
                initialCount={video.likesCount}
              />
            </div>
          </div>

          {/* Author card */}
          {author && (
            <Link
              href={`/author/${author.slug}`}
              className="flex items-center gap-3.5 p-4 bg-card-bg border border-card-border rounded-lg hover:border-accent/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-surface shrink-0 overflow-hidden">
                {author.photoUrl ? (
                  <Image
                    src={author.photoUrl}
                    alt={author.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted">
                    {author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{author.name}</p>
                {institution && (
                  <p className="text-sm text-muted truncate">
                    {institution.name}
                  </p>
                )}
                <p className="text-xs text-accent mt-0.5">
                  View all videos &rarr;
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Right column: imaging */}
        {hasFilms && (
          <div>
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
    </div>
  );
}

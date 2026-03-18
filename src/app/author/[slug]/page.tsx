import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  authors,
  getVideosByAuthor,
  getAuthorInstitution,
  getSpecialties,
} from "@/lib/data";

export function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }));
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = authors.find((a) => a.slug === slug);
  if (!author) notFound();

  const institution = getAuthorInstitution(author);
  const authorVideos = getVideosByAuthor(author.id);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Author header — compact, horizontal */}
      <div className="flex items-center gap-5 mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-card-bg border border-card-border shrink-0 overflow-hidden ring-1 ring-accent/15 ring-offset-2 ring-offset-background">
          {author.photoUrl ? (
            <Image
              src={author.photoUrl}
              alt={author.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted">
              {author.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold font-serif tracking-tight">
            {author.name}
          </h1>
          {institution && (
            <p className="text-[11px] tracking-wide uppercase text-muted font-medium mt-0.5">
              {institution.name}
            </p>
          )}
          {author.bio && (
            <p className="mt-2 text-sm leading-relaxed text-foreground/70 max-w-xl">
              {author.bio}
            </p>
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-card-border my-6" />

      {/* Videos */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
        Videos ({authorVideos.length})
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {authorVideos.map((video) => {
          const videoSpecialties = getSpecialties(video.specialtyIds);
          return (
            <Link
              key={video.id}
              href={`/video/${video.slug}`}
              className="group"
            >
              <div className="relative aspect-video bg-card-bg rounded-lg overflow-hidden mb-2">
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(min-width: 1024px) 33vw, 50vw"
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              <h3 className="font-semibold text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {video.title}
              </h3>
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
            </Link>
          );
        })}
      </div>

      {authorVideos.length === 0 && (
        <div className="text-center py-16">
          <svg
            className="w-12 h-12 text-muted/30 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-muted text-sm">No videos yet from this author.</p>
        </div>
      )}
    </div>
  );
}

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
    <div className="max-w-4xl mx-auto">
      {/* Author header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-card-bg border border-card-border shrink-0 overflow-hidden">
          {author.photoUrl ? (
            <Image
              src={author.photoUrl}
              alt={author.name}
              width={112}
              height={112}
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
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{author.name}</h1>
          {institution && (
            <p className="text-muted text-sm mt-0.5">{institution.name}</p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-foreground/80 max-w-xl">
            {author.bio}
          </p>
        </div>
      </div>

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
        <p className="text-muted text-center py-12">
          No videos yet from this author.
        </p>
      )}
    </div>
  );
}

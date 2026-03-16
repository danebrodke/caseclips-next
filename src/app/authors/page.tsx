import Link from "next/link";
import Image from "next/image";
import {
  authors,
  getVideosByAuthor,
  getAuthorInstitution,
} from "@/lib/data";

export const metadata = {
  title: "Authors — Caseclips",
  description: "Browse all contributing surgeons on Caseclips.",
};

export default function AuthorsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Authors</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {authors.map((author) => {
          const institution = getAuthorInstitution(author);
          const authorVideos = getVideosByAuthor(author.id);
          const recentVideos = authorVideos.slice(0, 2);

          return (
            <Link
              key={author.id}
              href={`/author/${author.slug}`}
              className="group block rounded-xl bg-card-bg border border-card-border hover:border-accent/30 transition-colors"
            >
              {/* Thumbnail banner */}
              <div className="relative">
                {recentVideos.length > 0 ? (
                  <div className="flex h-24 sm:h-28 rounded-t-xl overflow-hidden">
                    {recentVideos.map((video) => (
                      <div
                        key={video.id}
                        className="relative flex-1 bg-surface"
                      >
                        {video.thumbnailUrl ? (
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 15vw, 25vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-card-border to-card-bg" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-24 sm:h-28 bg-surface rounded-t-xl" />
                )}

                {/* Avatar overlapping banner bottom edge */}
                <div className="absolute -bottom-5 left-4 w-10 h-10 rounded-full bg-surface border-2 border-card-bg shrink-0 overflow-hidden z-10">
                  {author.photoUrl ? (
                    <Image
                      src={author.photoUrl}
                      alt={author.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted">
                      {author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>
              </div>

              {/* Author info — with left padding to clear the avatar */}
              <div className="pt-7 pb-3.5 px-4">
                <h2 className="text-sm font-semibold leading-tight group-hover:text-accent transition-colors truncate">
                  {author.name}
                </h2>
                <p className="text-xs text-muted truncate mt-0.5">
                  {institution?.name}
                  {institution && " · "}
                  {authorVideos.length} video
                  {authorVideos.length !== 1 && "s"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

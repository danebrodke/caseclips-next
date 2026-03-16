import Link from "next/link";
import Image from "next/image";
import { authors, getAuthorInstitution, getVideosByAuthor } from "@/lib/data";

export default function AboutPage() {
  // Filter to authors who have at least one video
  const activeAuthors = authors.filter(
    (a) => getVideosByAuthor(a.id).length > 0
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">About Caseclips</h1>

      <div className="prose prose-sm prose-invert max-w-none text-foreground/85 leading-relaxed space-y-4 mb-10">
        <p>
          Caseclips is a surgical education project started by{" "}
          <Link href="/author/dane" className="text-accent hover:text-accent-hover">
            Dr. Dane Brodke
          </Link>{" "}
          and{" "}
          <Link
            href="/author/christopherlee"
            className="text-accent hover:text-accent-hover"
          >
            Dr. Christopher Lee
          </Link>
          . Our mission is to facilitate the exchange of high quality technique
          videos to enhance surgeon education and improve patient care.
        </p>
        <p>
          For contributors, we have a streamlined process through which we
          assist with recording and editing. For learners, we have an
          open-access searchable website that works on any device.
        </p>
        <p>
          All videos are case-based, under 10 minutes, and include chapter
          markers for each step of the operation.
        </p>
        <p>
          Videos have been generously contributed by surgeons at UCLA, the
          University of Utah, Kaiser Permanente, Southern Illinois University,
          and Oregon Health &amp; Science University. For feedback, questions, or
          if you would like to contribute, please contact us at{" "}
          <span className="text-accent">editor@caseclips.com</span>.
        </p>
      </div>

      <div className="border-t border-card-border pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-5">
          Contributors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeAuthors.map((author) => {
            const institution = getAuthorInstitution(author);
            const videoCount = getVideosByAuthor(author.id).length;
            return (
              <Link
                key={author.id}
                href={`/author/${author.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-card-bg border border-card-border hover:border-accent/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-surface shrink-0 overflow-hidden">
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
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {author.name}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {institution?.name}
                    {" · "}
                    {videoCount} video{videoCount !== 1 && "s"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-card-border mt-8 pt-6">
        <p className="text-xs text-muted leading-relaxed italic">
          Disclaimer: This website is for medical professionals for educational
          purposes. It is not intended to present the only, or necessarily best,
          methods for the medical situations discussed.
        </p>
      </div>
    </div>
  );
}

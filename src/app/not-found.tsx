import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center animate-fade-in-up">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted/50">
        404
      </p>
      <h1 className="mt-3 font-serif text-3xl text-foreground">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-7 inline-block px-4 py-2 text-sm font-medium rounded-full border border-card-border text-foreground hover:border-accent/50 hover:text-accent transition-colors"
      >
        Browse videos
      </Link>
    </div>
  );
}

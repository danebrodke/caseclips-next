"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LogoLink() {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      onClick={() => {
        if (pathname === "/") {
          window.dispatchEvent(new CustomEvent("caseclips:reset-filters"));
        }
      }}
      className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.svg" alt="Caseclips" className="h-6 sm:h-7" />
      <span className="text-xs text-muted hidden sm:inline border-l border-card-border pl-3">
        Step-by-step technique videos in orthopaedic surgery
      </span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Videos" },
  { href: "/authors", label: "Authors" },
  { href: "/about", label: "About" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/" || pathname.startsWith("/video/");
  if (href === "/authors") return pathname.startsWith("/author");
  return pathname.startsWith(href);
}

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1 text-[13px] sm:text-sm font-medium">
      {links.map(({ href, label }) => {
        const active = isActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full transition-colors ${
              active
                ? "text-foreground bg-white/[0.06]"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

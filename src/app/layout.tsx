import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import LogoLink from "@/components/LogoLink";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caseclips",
  description: "Step-by-step technique videos in orthopaedic surgery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <header className="border-b border-card-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <LogoLink />
              <nav className="flex items-center gap-5 text-sm font-medium text-muted">
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Videos
                </Link>
                <Link
                  href="/authors"
                  className="hover:text-foreground transition-colors"
                >
                  Authors
                </Link>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}

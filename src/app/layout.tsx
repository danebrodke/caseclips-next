import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import LogoLink from "@/components/LogoLink";
import NavLinks from "@/components/NavLinks";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
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
      <body
        className={`${inter.variable} ${newsreader.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="border-b border-card-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <LogoLink />
              <NavLinks />
            </div>
          </div>
        </header>
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
          {children}
        </main>
        <footer className="border-t border-card-border mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <p className="text-xs text-muted/60 leading-relaxed max-w-2xl">
              For medical professionals, for educational purposes. Content is
              not intended to present the only, or necessarily best, methods for
              the medical situations discussed.
            </p>
            <p className="text-xs text-muted/60 whitespace-nowrap">
              &copy; {new Date().getFullYear()} Caseclips
            </p>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

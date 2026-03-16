# Caseclips

Surgical case video platform for orthopaedic surgery. Migrated from Ghost CMS to Next.js.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4, dark mode
- **Search**: Fuse.js for client-side fuzzy search
- **Video**: Vimeo embeds via @vimeo/player SDK (with chapter markers)
- **Likes**: localStorage-based (will move to Supabase)
- **Deployment target**: Vercel (frontend), Supabase (backend - not yet integrated)
- **Package manager**: npm

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with logo header/nav
│   ├── page.tsx                # Home - video grid with filters
│   ├── globals.css             # Tailwind + dark mode CSS variables + lightbox + skeleton
│   ├── about/page.tsx          # About page with contributor grid
│   ├── video/[slug]/page.tsx   # Video detail (Vimeo + chapters + films + author)
│   └── author/[slug]/page.tsx  # Author profile + video grid
├── components/
│   ├── VideoGrid.tsx           # Search, specialty pills, author/institution typeahead, grid
│   ├── VimeoPlayer.tsx         # Vimeo SDK player with chapter sidebar, loading skeleton, auto-scroll
│   ├── LikeButton.tsx          # Like toggle with localStorage persistence
│   ├── Lightbox.tsx            # Fullscreen image lightbox overlay (Escape to close)
│   └── FilmGallery.tsx         # Pre/post-op film grid with lightbox integration
└── lib/
    ├── types.ts                # TypeScript interfaces
    └── data.ts                 # Real content (51 videos, 17 authors, 6 institutions, 8 specialties)
```

## Commands

- `npm run dev` — Start dev server (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Data

Real content extracted from Ghost export. 51 surgical case videos, 17 authors across 6 institutions, 8 specialty tags. Images served from `public/images/` (authors/ and cases/ subdirectories).

## Ghost Migration Source

The Ghost export is at repo root: `caseclips.ghost.2026-03-16-02-49-07.json` (has `structu` prefix before JSON — skip to first `{`). Guide in `ghost-export-guide.md`. Original images in `content/images/`.

## Design

- Dark mode (#0f0f0f bg, indigo accent #6366f1, muted #9ca3af)
- Logo SVG in header with tagline
- Specialty filters: clickable pills. Author/Institution: typeahead dropdowns
- Video grid: 4 cols desktop, 2 cols mobile
- Likes: localStorage with seeded random initial counts (12-89), like button inline with video title
- Chapters: sidebar on desktop (height matched to video via ResizeObserver), horizontal scroll on mobile, auto-scrolls to active chapter
- Loading: shimmer skeleton for video and chapters while Vimeo loads
- Lightbox: pre/post-op films open in fullscreen overlay on click
- Scrollbar: `overflow-y: scroll` on html to prevent layout shift during filtering
- Video page layout: author card + radiographs side by side on desktop to minimize scrolling
- Vimeo player: uses destroyedRef guard to prevent "Unknown player" errors on cleanup

## Future (Not Yet Built)

- Supabase backend (auth, likes persistence, admin panel)
- Admin dashboard for content management
- Custom domain on Vercel

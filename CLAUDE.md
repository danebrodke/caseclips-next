# Caseclips

Surgical case video platform for orthopaedic surgery. Migrated from Ghost CMS to Next.js.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4, dark mode
- **Search**: MiniSearch for client-side BM25-ranked search with prefix and fuzzy matching
- **Video**: Mux (via @mux/mux-player-react) — 51 assets migrated from Vimeo. Vimeo fallback still wired in video page as a safety net for any entry missing `muxPlaybackId`.
- **Chapters**: Bundled in `src/lib/chapters.json` (slug-keyed), read via `src/lib/chapters.ts`. Originally exported from Vimeo's chapters API.
- **Likes**: Upstash Redis backend with anonymous cookie-based user tracking
- **Deployment**: Vercel (hosting + serverless API routes), Upstash Redis (likes storage), Mux (video ingest + delivery)
- **Package manager**: npm

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                   # Root layout with logo header/nav
│   ├── page.tsx                     # Home - video grid with filters
│   ├── globals.css                  # Tailwind + dark mode CSS variables + lightbox + skeleton + .video-frame + .mobile-chapter-scroll
│   ├── about/page.tsx               # About page with contributor grid
│   ├── video/[slug]/page.tsx        # Video detail (MuxPlayer, fallback VimeoPlayer, chapters, films, author)
│   ├── author/[slug]/page.tsx       # Author profile + video grid
│   └── accent-preview/page.tsx      # Internal page to preview candidate accent colors in context
├── components/
│   ├── VideoGrid.tsx                # Search, specialty pills, author/institution typeahead, grid
│   ├── MuxPlayer.tsx                # Mux player + desktop chapter sidebar; owns hasStarted/activeChapter state
│   ├── MobileChapterMenu.tsx        # Mobile-only chapter dropdown (pill → floating panel), lg:hidden
│   ├── VimeoPlayer.tsx              # Legacy fallback player (kept until production verified)
│   ├── LikeButton.tsx               # Like toggle with Redis-backed persistence
│   ├── Lightbox.tsx                 # Fullscreen image lightbox overlay (Escape to close)
│   └── FilmGallery.tsx              # Pre/post-op film grid with lightbox integration
├── lib/
│   ├── types.ts                     # TypeScript interfaces (Video has vimeoId + optional muxPlaybackId)
│   ├── data.ts                      # Real content (51 videos, 17 authors, 6 institutions, 8 specialties)
│   ├── chapters.ts                  # getChapters(slug) reader for chapters.json
│   └── chapters.json                # 982 chapters across 51 videos, keyed by slug
scripts/
├── upload-to-mux.ts                 # Resumable bulk upload; state in downloads/mux-upload-state.json
├── apply-mux-ids.ts                 # Patches muxPlaybackId into data.ts from upload state
├── fetch-vimeo-posters.ts           # Downloads custom Vimeo thumbnails (no auth; via public oembed)
├── fetch-chapters.ts                # One-off export of Vimeo chapters (already run; output committed)
└── download-videos.ts               # One-off download of Vimeo source MP4s (already run)
public/
├── images/                          # Author photos and case images
└── posters/                         # 51 video posters with patient one-liners (from Vimeo custom thumbs)
```

## Commands

- `npm run dev` — Start dev server (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Data

51 surgical case videos, 17 authors across 6 institutions, 8 specialty tags. All content lives in `src/lib/data.ts`. Images served from `public/images/` (authors/ and cases/). Posters in `public/posters/` are the patient one-liner thumbnails (e.g. "21F s/p Snowboarding Accident") carried over from Vimeo.

## Credentials

- `MUX_TOKEN_ID` + `MUX_TOKEN_SECRET` — stored in `mux-access-token-Caseclips main token.env` (gitignored via `.env*`). Used only by upload scripts; player is public playback.
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` — in `.env.local`, used by LikeButton's Redis backend.

## Design

- Dark mode (#0f0f0f bg, indigo accent #6366f1, muted #9ca3af)
- Logo SVG in header with tagline
- Specialty filters: clickable pills. Author/Institution: typeahead dropdowns
- Video grid: 4 cols desktop, 2 cols mobile
- Likes: Upstash Redis with anonymous cookie-based tracking, like button inline with video title
- Chapters (desktop, `lg+`): sidebar beside the video, height matched via ResizeObserver, auto-scrolls to active chapter
- Chapters (mobile, `< lg`): `MobileChapterMenu` pill under the video expands into a floating dropdown (`#141418` panel, `#9a93ff` active accent). Pre-play pill shows a neutral "Chapters · N" label with no active row; first play flips it to `NN / TOT  Current chapter title`. Video wrapper is raised to `z-22` on mobile so the open-state scrim dims title/imaging/related but never the video. Panel auto-sizes to remaining viewport height; active chapter auto-centers on open or when the user seeks
- Loading: shimmer skeleton for video and chapters while the player loads
- Lightbox: pre/post-op films open in fullscreen overlay on click
- Scrollbar: `overflow-y: scroll` on html to prevent layout shift during filtering
- Video page layout: author card + radiographs side by side on desktop to minimize scrolling
- Video frame: `.video-frame` owns aspect-ratio 16/9 + rounded-xl + overflow-hidden; mux-player is absolutely positioned inset:0 to prevent sub-pixel gaps at the rounded corners
- Mux Player hides its big center play button via `--center-play-button: none`; users click the poster or the bottom bar to play

## Future (Not Yet Built)

- User authentication
- Admin dashboard for content management
- Custom domain on Vercel
- Remove Vimeo fallback once Mux is production-verified (drop `@vimeo/player` dep, `vimeoId` field, VimeoPlayer component)

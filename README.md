# Caseclips

A video library platform for surgical case presentations in orthopaedic surgery.

## Features

- **Video library** with Vimeo-hosted case presentations and chapter navigation
- **Search** with ranked results, prefix matching, and fuzzy search ([MiniSearch](https://github.com/lucaong/minisearch))
- **Filtering** by specialty, author, and institution
- **Likes** with shared counts across users
- **Pre/post-op imaging** with fullscreen lightbox viewer
- **Author profiles** with bios and video listings
- **Responsive** layout, dark mode
- **Statically generated** pages for fast load times

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- [MiniSearch](https://github.com/lucaong/minisearch) (client-side BM25 search)
- Vimeo Player SDK
- Upstash Redis (likes backend)
- Vercel (hosting)

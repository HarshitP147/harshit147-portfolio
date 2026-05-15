# ARCHITECTURE.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`

## Overview
- Project: `harshit-portfolio`.
- Framework: Next.js 16 (App Router) with React 19 and TypeScript.
- Styling: Tailwind CSS v4 + ShadCN/UI customized properties in `src/app/globals.css`.
- UI primitives: Base UI wrappers in `src/components/ui/*`.
- 3D: Three.js via React Three Fiber (`@react-three/fiber`) and Drei (`@react-three/drei`).
- Homepage sections use shared class helpers from `src/components/sectionStyles.ts` for consistent alignment.
- Homepage is expected to avoid horizontal scrolling unless explicitly requested.

## Core App Structure
- `src/app/layout.tsx`: Global font setup (`Outfit`, `Geist`, `Geist Mono`) and Vercel telemetry components.
- `src/app/page.tsx`: Homepage composition (`NameGradient`, `ModelCanvas`, `TechMarquee`, `HomeLatestBlogs`, `HomeFeaturedProjects`).
- `src/app/globals.css`: Theme tokens, animations, marquee styles, and global Tailwind layers.
- `src/app/blog/[slug]/page.tsx`: Individual blog post route wrapper.
- `src/app/api/likes/[postId]/route.ts`: Likes API (`GET` read, `POST` like, `DELETE` unlike) backed by Cloudflare D1.
- `src/components/ModelCanvas.tsx`: 3D scene setup, GLB loading, lighting, floor, shadows, controls, intro spin behavior.
- `src/components/NameGradient.tsx`: Alternating gradient hero name text animation.
- `src/components/TechMarquee.tsx`: Scrolling technology icon rows.
- `src/components/HomeFeaturedProjects.tsx`: Homepage featured projects section with editorial rows, left-aligned mobile layout, and GitHub icon+link actions.
- `src/components/BlogPostCard.tsx`: Shared blog card + skeleton for home and blog index.
- `src/components/BlogPostDetailApolloLogger.tsx`: Blog detail renderer (markdown + embeds + metadata).
- `src/components/LikeButton.tsx`: Blog like/unlike control with optimistic updates and animated SVG heart.
- `src/components/sectionStyles.ts`: Shared section container/title class helpers for consistent homepage spacing/alignment.
- `src/lib/featuredProjects.ts`: Typed data source for featured projects. Schema: `title`, `domain` (category), `description` (single line), `stack` (tech array), `links` (GitHub etc), optional `isCurrent: true` flag for actively-developed projects. Rendered on homepage via `HomeFeaturedProjects`.
- `src/lib/blog.ts`: Blog data layer — reads post metadata from Cloudflare D1 (`posts` table) and markdown/images from Cloudflare R2.
- `src/components/ui/*`: Reusable form/menu/dialog/card primitives built on Base UI.
- `src/lib/utils.ts`: `cn()` utility (`clsx` + `tailwind-merge`).
- `public/scene.glb`: Main 3D model asset loaded by the homepage scene.
- `public/*.svg`: Logo/icon assets used by marquee and UI.

## External Services
- Vercel Analytics + Speed Insights are mounted in the root layout.
- Cloudflare D1 (post metadata + likes) accessed via the `cloudflare` TypeScript SDK.
- Cloudflare R2 (blog `index.md` + images) served from a public bucket URL.

## Blog Integration (Cloudflare D1 + R2)
- `src/lib/blog.ts` exposes `fetchBlogPosts()` and `fetchBlogPostBySlug({ slug })`; blog pages/components are server-rendered and call these directly (no client data fetching).
- Post metadata lives in the D1 `posts` table (`id`, `slug`, `title`, `brief`, `published_at`, `date_modified`, `read_time_minutes`, `cover_image_key`, `content_key`).
- Markdown body + images live in R2 under `<slug>/index.md` and `<slug>/images/*`; image URLs in markdown are absolute R2 URLs.
- Blog content renders Markdown via `react-markdown` + `remark-gfm` + `rehype-raw`.
- `transformBlogMarkdown` normalizes `align="..."` image syntax and converts `%[url]` embeds into iframes (e.g. CodeSandbox).
- Callouts render via `[data-node-type="callout"]` and are styled in `globals.css`.
- Blog images use `next/image` (cards, cover, and markdown content).
- `next.config.ts` allows the R2 public host derived from `R2_PUBLIC_BASE_URL`.

Env vars (blog): `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_D1_DATABASE_ID`, `R2_PUBLIC_BASE_URL`.
## Publishing Blogs
Canonical blog content lives only in Cloudflare R2/D1 (nothing in the repo).

Workflow:
1. Draft + publish on Hashnode (free editor).
2. Stage the export at `tmp/<slug>/` (gitignored, transient):
   - `index.md` — Hashnode markdown export
   - `meta.json` — `{ "title": "...", "brief": "", "publishedAt": "<ISO>" }` (optional `dateModified`, `readTimeInMinutes`)
   - `cover.<ext>` — optional; otherwise the single numbered image is the cover
   - `one.<ext>`, `two.<ext>`, … — inline images in order of appearance
3. `npm run publish:blog -- <slug>`

`scripts/publish-blog.mjs` uploads images + `index.md` to R2, rewrites
`cdn.hashnode.com` image URLs to R2 URLs, auto-computes `read_time_minutes`
(words/200), and upserts the D1 `posts` row keyed by `slug` (the post `id` is
reused on re-publish so likes stay linked). It additionally needs `R2_BUCKET`,
`R2_S3_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.

## Likes Service (Cloudflare D1)
- API route `src/app/api/likes/[postId]/route.ts` queries D1 via the `cloudflare` SDK.
- Likes are rows in the D1 `post_likes` table, primary key `(post_id, visitor_id)`; each row carries geo/device metadata and `liked_at`.
- In Next.js 16 dynamic route handlers, `params` is async: type as `params: Promise<{ postId: string }>` and `await params` before property access.
- Likes API uses `cookies()` + `headers()` from `next/headers` to assign a persistent visitor ID cookie and capture IP-derived geo metadata (`x-vercel-ip-country`, `x-vercel-ip-city`, `x-vercel-ip-latitude`, `x-vercel-ip-longitude`, `x-vercel-ip-postal-code`, `x-vercel-ip-timezone`), inferred OS/device type from `user-agent`, and a server timestamp inside each entry in the `likes` array.
- Geo values are only as good as the incoming Vercel headers. On local development, VPN/proxy traffic, or requests where Vercel cannot resolve IP geo, fields fall back to `"unknown"`.
- Exact device location is not available through this path. It would require browser geolocation permission and is intentionally not part of the likes flow.
- `LikeButton` is rendered on blog detail at the bottom separator, centered between two horizontal lines.
- `LikeButton` uses an inline SVG heart (not lucide) animated with `framer-motion`.
- Like/unlike UI is optimistic with rollback on request failure/timeout (8s).
- Duplicate-like prevention is server-enforced per visitor cookie; the client no longer stores like state in `localStorage`.

# ARCHITECTURE.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`
- `apollo-client`
- `hashnode-api`

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
- `src/app/blog/[slug]/page.tsx`: Individual blog post route wrapper (Hashnode).
- `src/app/api/likes/[postId]/route.ts`: Likes API (`GET` read, `POST` like, `DELETE` unlike) backed by Upstash Redis.
- `src/components/ModelCanvas.tsx`: 3D scene setup, GLB loading, lighting, floor, shadows, controls, intro spin behavior.
- `src/components/NameGradient.tsx`: Alternating gradient hero name text animation.
- `src/components/TechMarquee.tsx`: Scrolling technology icon rows.
- `src/components/HomeFeaturedProjects.tsx`: Homepage featured projects section with editorial rows, left-aligned mobile layout, and GitHub icon+link actions.
- `src/components/BlogPostCard.tsx`: Shared blog card + skeleton for home and blog index.
- `src/components/BlogPostDetailApolloLogger.tsx`: Blog detail renderer (Hashnode markdown + embeds + metadata).
- `src/components/LikeButton.tsx`: Blog like/unlike control with optimistic updates and animated SVG heart.
- `src/components/sectionStyles.ts`: Shared section container/title class helpers for consistent homepage spacing/alignment.
- `src/lib/featuredProjects.ts`: Typed data source for featured projects. Schema: `title`, `domain` (category), `description` (single line), `stack` (tech array), `links` (GitHub etc), optional `isCurrent: true` flag for actively-developed projects. Rendered on homepage via `HomeFeaturedProjects`.
- `src/lib/graphql/generated.ts`: GraphQL Codegen output (types + typed documents).
- `src/components/ui/*`: Reusable form/menu/dialog/card primitives built on Base UI.
- `src/lib/utils.ts`: `cn()` utility (`clsx` + `tailwind-merge`).
- `public/scene.glb`: Main 3D model asset loaded by the homepage scene.
- `public/*.svg`: Logo/icon assets used by marquee and UI.

## External Services
- Vercel Analytics + Speed Insights are mounted in the root layout.
- Hashnode GraphQL API at `https://gql.hashnode.com` (blog data) via Apollo Client in the App Router.
- Upstash Redis (Vercel KV-compatible) via `@upstash/redis` for blog likes.

## Hashnode Integration
- `ApolloNextAppProvider` in `src/app/ApolloWrapper.tsx` is required; plain `ApolloProvider` breaks streaming hooks.
- Apollo hooks should be imported from `@apollo/client/react`.
- `ApolloClient` and `InMemoryCache` come from `@apollo/client-integration-nextjs`, but `HttpLink` comes from `@apollo/client`.
- `ApolloClient` from `@apollo/client-integration-nextjs` is not generic; do not use `ApolloClient<NormalizedCacheObject>`.
- Hashnode `posts(pageSize: ...)` cap is 20; requests above 20 return `BAD_USER_INPUT`.
- Blog queries should include `publication { id }` and `post { id }` for cache normalization.
- Blog list cards and detail view use `slug`, `publishedAt`, and `readTimeInMinutes`.
- GraphQL operations are defined in TSX files via `gql`, and Codegen extracts types from them.

Env vars:
- `HASHNODE_USERNAME` (server) and `NEXT_PUBLIC_HASHNODE_USERNAME` (client) must be set.
- `HASHNODE_PUBLICATION_HOST` / `NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST` override the default `${username}.hashnode.dev`.
- Apollo cache is persisted to `localStorage` under `apollo-cache-v1` for local-first behavior.
- The cache persist link uses an `Observable` wrapper; do not call `.map()` on `forward(...)`.
- Blog detail uses `publication(host).post(slug)` to resolve post ID, then `post(id)` for full content.
- `BlogPostDetailApolloLogger` gates Apollo queries behind hydration to avoid SSR/client mismatches.
- Blog content renders Markdown via `react-markdown` + `remark-gfm` + `rehype-raw`.
- Hashnode embeds use `%[url]` syntax and are transformed into iframes (e.g. CodeSandbox).
- Hashnode callouts render via `[data-node-type="callout"]` and are styled in `globals.css`.
- Blog images use `next/image` (cards, cover, and markdown content).
- `next.config.ts` must allow Hashnode image domains (`cdn.hashnode.com`, `*.hashnode.com`).

## Likes Service (Upstash)
- API routes are in `src/app/api/likes/[postId]/route.ts` and use `@upstash/redis` `Redis.fromEnv()`.
- Each post is stored under a single Redis key `likes:post:${postId}` whose value is a JSON document with `slug` and a `likes` array.

Required env vars for likes: `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or Upstash equivalents `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`).
- In Next.js 16 dynamic route handlers, `params` is async: type as `params: Promise<{ postId: string }>` and `await params` before property access.
- Likes API uses `cookies()` + `headers()` from `next/headers` to assign a persistent visitor ID cookie and capture IP-derived geo metadata (`x-vercel-ip-country`, `x-vercel-ip-city`, `x-vercel-ip-latitude`, `x-vercel-ip-longitude`, `x-vercel-ip-postal-code`, `x-vercel-ip-timezone`), inferred OS/device type from `user-agent`, and a server timestamp inside each entry in the `likes` array.
- Geo values are only as good as the incoming Vercel headers. On local development, VPN/proxy traffic, or requests where Vercel cannot resolve IP geo, fields fall back to `"unknown"`.
- Exact device location is not available through this path. It would require browser geolocation permission and is intentionally not part of the likes flow.
- `LikeButton` is rendered on blog detail at the bottom separator, centered between two horizontal lines.
- `LikeButton` uses an inline SVG heart (not lucide) animated with `framer-motion`.
- Like/unlike UI is optimistic with rollback on request failure/timeout (8s).
- Duplicate-like prevention is server-enforced per visitor cookie; the client no longer stores like state in `localStorage`.

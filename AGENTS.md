# AGENTS.md

## Project Overview
- Project: `harshit-portfolio`
- Framework: Next.js 16 (App Router) with React 19 and TypeScript.
- Styling: Tailwind CSS v4 + ShadCN/UI customized properties in `src/app/globals.css`.
- UI primitives: Base UI wrappers in `src/components/ui/*`.
- 3D: Three.js via React Three Fiber (`@react-three/fiber`) and Drei (`@react-three/drei`).
- Analytics: Vercel Analytics + Speed Insights are mounted in the root layout.
- Blog likes: Upstash Redis (Vercel KV-compatible) via `@upstash/redis` with optimistic client UI.
- Homepage sections use shared class helpers from `src/components/sectionStyles.ts` for consistent alignment.
- Homepage is expected to avoid horizontal scrolling unless explicitly requested.

## Runtime and Tooling
- Package manager: `npm`.
- Dev server: `npm run dev`.
- Build: `npm run build`.
- Production run: `npm run start`.
- Lint: `npm run lint`.
- GraphQL Codegen: `npm run codegen` (config in `codegen.ts`, output `src/lib/graphql/generated.ts`).

## Repository Structure
- `src/app/layout.tsx`: Global font setup (`Outfit`, `Geist`, `Geist Mono`) and Vercel telemetry components.
- `src/app/page.tsx`: Homepage composition (`NameGradient`, `ModelCanvas`, `TechMarquee`).
- `src/app/globals.css`: Theme tokens, animations, marquee styles, and global Tailwind layers.
- `src/app/blog/[slug]/page.tsx`: Individual blog post route wrapper (Hashnode).
- `src/app/api/likes/[postId]/route.ts`: Likes API (`GET` read, `POST` like, `DELETE` unlike) backed by Upstash Redis.
- `src/components/ModelCanvas.tsx`: 3D scene setup, GLB loading, lighting, floor, shadows, controls, intro spin behavior.
- `src/components/NameGradient.tsx`: Alternating gradient hero name text animation.
- `src/components/TechMarquee.tsx`: Scrolling technology icon rows.
- `src/components/BlogPostCard.tsx`: Shared blog card + skeleton for home and blog index.
- `src/components/BlogPostDetailApolloLogger.tsx`: Blog detail renderer (Hashnode markdown + embeds + metadata).
- `src/components/LikeButton.tsx`: Blog like/unlike control with optimistic updates and animated SVG heart.
- `src/components/sectionStyles.ts`: Shared section container/title class helpers for consistent homepage spacing/alignment.
- `src/lib/graphql/generated.ts`: GraphQL Codegen output (types + typed documents).
- `src/components/ui/*`: Reusable form/menu/dialog/card primitives built on Base UI.
- `src/lib/utils.ts`: `cn()` utility (`clsx` + `tailwind-merge`).
- `public/scene.glb`: Main 3D model asset loaded by the homepage scene.
- `public/*.svg`: Logo/icon assets used by marquee and UI.

## Aliases and Imports
- TS path alias is configured as `@/* -> ./src/*` in `tsconfig.json`.
- Preferred imports in project code:
- `@/components/...`
- `@/components/ui/...`
- `@/lib/utils`

## Homepage Behavior
- Primary route is a split hero layout with text content and a square 3D canvas.
- `NameGradient` toggles between blue and red gradient themes every 12 seconds.
- `NameGradient` keeps wrapping on smaller screens and switches to no-wrap at `xl`.
- `TechMarquee` renders two opposing-direction marquee rows and pauses animation on hover/focus.
- `HomeLatestBlogs` uses `BlogPostCard` (compact) and links to `/blog/[slug]`.
- A single page-level container shell (`sectionShellClassName`) is used to keep section headings aligned to identical left/right bounds.
- The shared shell uses `max-w-5xl` and `px-4`.
- Homepage section titles (`Hi, I&apos;m`, `Languages and Tools`, `My Blogs`) use shared title styling.
- Title alignment is responsive: centered on mobile/tablet, left-aligned from `xl` and above.
- Hero switches to two-column layout at `xl` to prevent medium-breakpoint horizontal overflow.

## 3D Scene Notes (`src/components/ModelCanvas.tsx`)
- GLB source path is hardcoded to `/scene.glb`.
- Meshes in the loaded scene are traversed and set to cast/receive shadows.
- Idle motion rotates the camera via `OrbitControls` auto-rotation; the model itself remains static.
- Camera auto-rotation starts fast on load and eases to a slower speed within about one second.
- Auto-rotation stops permanently once user interaction begins (`OrbitControls` `onStart`).
- Floor plane is auto-positioned from model bounding box min Y and receives shadows.
- `OrbitControls` constraints:
- Pan disabled.
- Max polar angle below floor view (`Math.PI / 2 - 0.05`).
- Zoom clamped with `minDistance` and `maxDistance`.

## Styling and Theme System
- Theme tokens are CSS variables (`--background`, `--foreground`, etc.) in `globals.css`.
- Tailwind theme is wired through `@theme inline` for utility token usage.
- Dark values are defined both in `.dark` and `prefers-color-scheme: dark` blocks.
- Custom animation and visual classes include:
- `.gradient-layer`, `.gradient-blue`, `.gradient-red`
- `.marquee`, `.marquee-track`, `.marquee-right`
- Keyframes for marquee, blink, spin, and pulse.
- Utility class `.line-clamp-3` is defined in `globals.css`.

## UI Component Conventions
- UI primitives are authored as composable wrappers around `@base-ui/react`.
- `data-slot` attributes are used consistently for styling and composition hooks.
- Class composition uses `cn()` and `class-variance-authority` variants.
- Most interactive primitives are client components (`"use client"`).

## Editing Guidelines for Agents
- Preserve App Router structure and keep route-level files in `src/app`.
- Use existing design tokens from `globals.css` before introducing new colors.
- Prefer extending `src/components/ui/*` patterns rather than creating one-off form controls.
- Default to existing project libraries/frameworks/components before adding new ones or implementing custom versions.
- On homepage, keep horizontal spacing ownership at page level (`sectionShellClassName`) instead of nested per-section shells.
- For homepage headings, use `sectionTitleClassName` to preserve consistent typography and responsive alignment.
- Keep homepage breakpoint behavior consistent:
- headings and hero text align center below `xl`, left at `xl+`.
- hero two-column split starts at `xl`.
- Avoid introducing horizontal overflow in medium breakpoints.
- Keep `ModelCanvas` interactions constrained for UX consistency.
- Keep blog navigation affordances consistent: the `/blog` page uses a muted "Back to Home" link at the top-left within page padding; `/blog/[slug]` should mirror placement and styling for its "Go back" link (top-left, muted, underline offset).
- Store new static assets in `public/` and reference them by absolute web path (`/asset.ext`).
- Keep imports alias-first (`@/...`) instead of long relative paths.
- Maintain TypeScript strict compatibility.

## Common Tasks
- Replace 3D model:
- Overwrite `public/scene.glb` or update the path in `ModelCanvas.tsx`.
- Add a new marquee icon:
- Add asset in `public/`.
- Add metadata entry to `icons` array in `src/components/TechMarquee.tsx`.
- Tune scene lighting/shadows:
- Update light/floor/contact shadow settings in `src/components/ModelCanvas.tsx`.
- Reset likes for a post in Upstash:
- Delete key `likes:post:<postId>` (or set to `0`) in the Redis console.

## Recent Additions and Pitfalls
- Hashnode blog data uses Apollo Client with Next.js App Router streaming:
- `ApolloNextAppProvider` in `src/app/ApolloWrapper.tsx` is required; plain `ApolloProvider` breaks streaming hooks.
- Apollo hooks should be imported from `@apollo/client/react`.
- `ApolloClient` and `InMemoryCache` come from `@apollo/client-integration-nextjs`, but `HttpLink` comes from `@apollo/client`.
- `ApolloClient` from `@apollo/client-integration-nextjs` is not generic; do not use `ApolloClient<NormalizedCacheObject>`.
- Hashnode GraphQL endpoint is `https://gql.hashnode.com`.
- Hashnode `posts(pageSize: ...)` cap is 20; requests above 20 return `BAD_USER_INPUT`.
- Blog queries should include `publication { id }` and `post { id }` for cache normalization.
- Blog list cards and detail view use `slug`, `publishedAt`, and `readTimeInMinutes`.
- GraphQL operations are defined in TSX files via `gql` and Codegen extracts types from them.
- Env vars:
- `HASHNODE_USERNAME` (server) and `NEXT_PUBLIC_HASHNODE_USERNAME` (client) must be set.
- `HASHNODE_PUBLICATION_HOST` / `NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST` override the default `${username}.hashnode.dev`.
- Apollo cache is persisted to `localStorage` under `apollo-cache-v1` for local-first behavior.
- The cache persist link uses an `Observable` wrapper; do not call `.map()` on `forward(...)`.
- Theme toggle must initialize from stored preference and cookie to avoid theme flipping on navigation.
- `framer-motion` must only be used in client components; use a wrapper like `src/components/BackToHomeLink.tsx`.
- Scroll-to-top button is fixed bottom-center; pages with footer text may need extra bottom padding to avoid overlap.
- Global smooth scrolling is set in `src/app/globals.css` with reduced-motion fallback.
- Homepage "My Blogs" uses `HomeLatestBlogs` and shows "Read more" only when `pageInfo.hasNextPage`.
- Blog detail uses `publication(host).post(slug)` to resolve post ID, then `post(id)` for full content.
- `BlogPostDetailApolloLogger` gates Apollo queries behind hydration to avoid SSR/client mismatches.
- Blog content renders Markdown via `react-markdown` + `remark-gfm` + `rehype-raw`.
- Hashnode embeds use `%[url]` syntax and are transformed into iframes (e.g. CodeSandbox).
- Hashnode callouts render via `[data-node-type="callout"]` and are styled in `globals.css`.
- Blog images use `next/image` (cards, cover, and markdown content).
- `next.config.ts` must allow Hashnode image domains (`cdn.hashnode.com`, `*.hashnode.com`).
- Likes implementation details:
- API routes are in `src/app/api/likes/[postId]/route.ts` and use `@upstash/redis` `Redis.fromEnv()`.
- Likes key format is `likes:post:${postId}`.
- Required env vars for likes: `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or Upstash equivalents `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`).
- In Next.js 16 dynamic route handlers, `params` is async: type as `params: Promise<{ postId: string }>` and `await params` before property access.
- `DELETE` (unlike) clamps likes to `>= 0` and normalizes zero values.
- `LikeButton` is rendered on blog detail at the bottom separator, centered between two horizontal lines.
- `LikeButton` uses an inline SVG heart (not lucide) animated with `framer-motion`.
- Like/unlike UI is optimistic with rollback on request failure/timeout (8s).
- Duplicate-like prevention is client-side only via `localStorage` key `liked:post:${postId}` (not server-enforced identity).

## Validation Checklist
- Run `npm run lint` after significant UI or TS changes.
- For 3D changes, verify:
- Model loads without runtime errors.
- Controls cannot orbit below floor.
- Shadows remain visible and performant.
- For style changes, verify both desktop and mobile layout behavior.
- For homepage layout changes, verify:
- `Hi, I&apos;m`, `Languages and Tools`, and `My Blogs` share the same horizontal container edges on large screens.
- The same titles are centered on mobile/tablet and switch to left-aligned from `xl`.
- No horizontal scrolling appears across breakpoints unless intentionally introduced.
- For likes changes, verify:
- First render shows stable count and correct singular/plural label (`Like` vs `Likes`).
- Slow network still feels responsive (optimistic update), and UI rolls back on failed requests.
- Like/unlike works across multiple browsers without hydration or route-param warnings.

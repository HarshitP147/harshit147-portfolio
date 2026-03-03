# AGENTS.md

## Project Overview
- Project: `harshit-portfolio`
- Framework: Next.js 16 (App Router) with React 19 and TypeScript.
- Styling: Tailwind CSS v4 + ShadCN/UI customized properties in `src/app/globals.css`.
- UI primitives: Base UI wrappers in `src/components/ui/*`.
- 3D: Three.js via React Three Fiber (`@react-three/fiber`) and Drei (`@react-three/drei`).
- Analytics: Vercel Analytics + Speed Insights are mounted in the root layout.

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
- `src/components/ModelCanvas.tsx`: 3D scene setup, GLB loading, lighting, floor, shadows, controls, intro spin behavior.
- `src/components/NameGradient.tsx`: Alternating gradient hero name text animation.
- `src/components/TechMarquee.tsx`: Scrolling technology icon rows.
- `src/components/BlogPostCard.tsx`: Shared blog card + skeleton for home and blog index.
- `src/components/BlogPostDetailApolloLogger.tsx`: Blog detail renderer (Hashnode content.html + metadata).
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
- `TechMarquee` renders two opposing-direction marquee rows and pauses animation on hover/focus.
- `HomeLatestBlogs` uses `BlogPostCard` (compact) and links to `/blog/[slug]`.

## 3D Scene Notes (`src/components/ModelCanvas.tsx`)
- GLB source path is hardcoded to `/scene.glb`.
- Meshes in the loaded scene are traversed and set to cast/receive shadows.
- The model starts with a fast rotation burst and eases to a slow display rotation.
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
- Apollo cache is persisted to `localStorage` under `apollo-cache-v1` for local-first behavior.
- The cache persist link uses an `Observable` wrapper; do not call `.map()` on `forward(...)`.
- Theme toggle must initialize from stored preference to avoid theme flipping on navigation.
- `framer-motion` must only be used in client components; use a wrapper like `src/components/BackToHomeLink.tsx`.
- Scroll-to-top button is fixed bottom-center; pages with footer text may need extra bottom padding to avoid overlap.
- Global smooth scrolling is set in `src/app/globals.css` with reduced-motion fallback.
- Homepage "My Blogs" uses `HomeLatestBlogs` and shows "Read more" only when `pageInfo.hasNextPage`.

## Validation Checklist
- Run `npm run lint` after significant UI or TS changes.
- For 3D changes, verify:
- Model loads without runtime errors.
- Controls cannot orbit below floor.
- Shadows remain visible and performant.
- For style changes, verify both desktop and mobile layout behavior.

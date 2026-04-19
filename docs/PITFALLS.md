# PITFALLS.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`
- `frontend-design`

## Recent Additions and Pitfalls

### Lazy Loading 3D Model (March 2026)
- **`ModelCanvasLazy`** wraps `ModelCanvas` for lazy loading on the homepage.
- Loading is deferred until `window.load` event and component enters viewport (200px margin).
- Uses conditional rendering: poster completely replaced by canvas (no absolute positioning overlays).
- Canvas uses `frameloop="demand"` for performance; auto-rotation works via `useFrame` updating `OrbitControls.autoRotateSpeed` directly.
- **Critical**: `SLOW_SPEED` must be computed synchronously in `Scene` component via `getSLOW_SPEED()`, not as module-level variable in useEffect.

### Linting and Code Quality
- **setState in useEffect**: Avoid calling `setState` synchronously within effects. Use `setTimeout(() => setState(...), 0)` for initialization that must happen after mount.
- **JSX in try/catch**: Don't construct JSX directly inside try/catch blocks. Instead, assign to a variable and return outside, or use helper functions.
- **Unescaped entities**: Use template syntax like `I{`'`}m` instead of `I'm` or `I&apos;m` to avoid ESLint `react/no-unescaped-entities` errors.
- **Generated GraphQL types**: `src/lib/graphql/generated.ts` is auto-generated and ignored by ESLint. Custom scalars (`DateTime`, `ObjectId`, `TimeZone`, `URL`) use `any` types by design.
- **Image optimization**: Use `next/image` instead of `<img>` for better LCP and bandwidth. SVGs in TechMarquee now use `<Image>` with explicit dimensions.

### Social Links and Layout
- Added homepage "My Socials" section (`src/components/HomePersonalLinks.tsx`) with a left portrait and right-side link stack on `md+`, icon-only row under the image on small screens.
- Social links are split into `src/components/SocialLinksStack.tsx` (desktop) and `src/components/SocialLinksDock.tsx` (mobile), with shared icon logic in `src/components/SocialLinksShared.tsx`.
- Social link data is centralized in `src/lib/personalLinks.ts` (LinkedIn, GitHub, X, Instagram, Email).

### Performance Optimizations
- `ModelCanvasLazy` defers Three.js until `window.load` and the canvas is near viewport, showing a poster + spinner first.
- `ModelCanvas` uses a capped `dpr` range (`[1, 1.5]`) to reduce GPU load.
- Prefer lazy-loading below-the-fold media with explicit `loading="lazy"`, `decoding="async"`, and correct `sizes` so images render at their intended width.
- TechMarquee icons use `next/image` with `width={64}`, `height={64}`, and `fetchPriority="low"`.

### Blog and Content
- Blog list: `/blog` page size is set to `3` for now; pagination can be layered later.
- Social dock: mobile icon buttons do not use circular borders (dock is borderless).
- Pitfall: incorrect `sizes` values can force low-res images; keep the fallback width aligned with the actual container width.
- Pitfall: `IntersectionObserver` `rootMargin` only accepts `px` or `%` (not `rem`).
- Likes metadata is IP-derived, not GPS-derived. If Vercel does not provide geo headers for a request, store `"unknown"` and do not expect exact user location.
- Local `next dev` traffic will not mirror deployed Vercel geo behavior; test likes metadata on a real Vercel deployment before assuming the headers are broken.

### Asset Organization
- Public assets reorganized into `public/marquee/top`, `public/marquee/bottom`, and `public/misc`; update paths in `TechMarquee` and `ModelCanvas` accordingly.
- Custom icon components live in `src/components/icons/*` and import SVG/PNG assets from `public/misc` (LinkedIn, GitHub, X, Instagram).

### Build and Configuration
- Pitfall: using `webpack()` for SVGR breaks Turbopack builds. Use `turbopack.rules` in `next.config.ts` instead.
- Pitfall: importing large SVGs (e.g. `Instagram_Glyph_Gradient.svg`, ~10MB) via SVGR triggers Babel "deoptimised" warnings. Use `next/image` with the SVG path (no SVGR import) or a smaller PNG asset.
- Pitfall: several installed SVGs lack `viewBox`, causing zoom/crop. Work around by passing `viewBox`/`preserveAspectRatio` or switching to `next/image`.
- Pitfall: CSS mask icons failed to render reliably; replaced with React icon components importing assets directly.

### CSS and Layout
- Pitfall: avoid using `transform` scaling (e.g., `scale-*`) to size layout columns. Transforms do not affect layout and can collapse or misalign sibling columns; size via widths/heights or grid columns instead.
- Pitfall: for hover-only borders, use `border-transparent` with explicit `transition-[border-color]` and `hover:border-*`. If theme alpha makes the border hard to see, add a subtle hover `box-shadow` outline.
- Theme toggle must initialize from stored preference and cookie to avoid theme flipping on navigation.
- `framer-motion` has been removed; keep animations CSS-only unless there is a strong need for a library.
- Scroll-to-top button is fixed bottom-center; pages with footer text may need extra bottom padding to avoid overlap.
- Global smooth scrolling is set in `src/app/globals.css` with reduced-motion fallback.

### Blog Integration
- Homepage "My Blogs" uses `HomeLatestBlogs` (server-rendered) and shows "Read more" only when `hasNextPage` from `fetchHashnodePosts`.
- Blog list and post detail (`/blog`, `/blog/[slug]`) are server-rendered via `fetchHashnodePosts`/`fetchHashnodePostBySlug`; set `HASHNODE_USERNAME` (and optionally `HASHNODE_PUBLICATION_HOST`) in env.
- Homepage "Projects" uses `HomeFeaturedProjects` with local typed data from `src/lib/featuredProjects.ts`.
- Projects stack presentation is inline metadata separated by dots (`•`) instead of pill badges.
- Projects GitHub actions use `lucide-react` `Github` icon and shared blue hover/focus color with text.
- The portfolio project can be marked with `isCurrent` in data to show the `Current` badge.

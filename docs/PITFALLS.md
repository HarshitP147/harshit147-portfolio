# PITFALLS.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`
- `frontend-design`

## Recent Additions and Pitfalls
- Added homepage "My Socials" section (`src/components/HomePersonalLinks.tsx`) with a left portrait and right-side link stack on `md+`, icon-only row under the image on small screens.
- Social links are split into `src/components/SocialLinksStack.tsx` (desktop) and `src/components/SocialLinksDock.tsx` (mobile), with shared icon logic in `src/components/SocialLinksShared.tsx`.
- Social link data is centralized in `src/lib/personalLinks.ts` (LinkedIn, GitHub, X, Instagram, Email).
- Performance: `ModelCanvasLazy` defers Three.js until `window.load` and the canvas is near viewport, showing a poster + spinner first; `ModelCanvas` uses a `Suspense` loader inside the canvas.
- Performance: `useGLTF.preload` is disabled for the hero model; `Canvas` uses a capped `dpr` range (`[1, 1.5]`) to reduce GPU load.
- Performance: prefer lazy-loading below-the-fold media with explicit `loading="lazy"`, `decoding="async"`, and correct `sizes` so images render at their intended width.
- Blog list: `/blog` page size is set to `3` for now; pagination can be layered later.
- Social dock: mobile icon buttons do not use circular borders (dock is borderless).
- Pitfall: incorrect `sizes` values can force low-res images; keep the fallback width aligned with the actual container width.
- Pitfall: `IntersectionObserver` `rootMargin` only accepts `px` or `%` (not `rem`).
- Public assets reorganized into `public/marquee/top`, `public/marquee/bottom`, and `public/misc`; update paths in `TechMarquee` and `ModelCanvas` accordingly.
- Custom icon components live in `src/components/icons/*` and import SVG/PNG assets from `public/misc` (LinkedIn, GitHub, X, Instagram).
- Pitfall: using `webpack()` for SVGR breaks Turbopack builds. Use `turbopack.rules` in `next.config.ts` instead.
- Pitfall: importing large SVGs (e.g. `Instagram_Glyph_Gradient.svg`, ~10MB) via SVGR triggers Babel "deoptimised" warnings. Use `next/image` with the SVG path (no SVGR import) or a smaller PNG asset.
- Pitfall: several installed SVGs lack `viewBox`, causing zoom/crop. Work around by passing `viewBox`/`preserveAspectRatio` or switching to `next/image`.
- Pitfall: CSS mask icons failed to render reliably; replaced with React icon components importing assets directly.
- Pitfall: avoid using `transform` scaling (e.g., `scale-*`) to size layout columns. Transforms do not affect layout and can collapse or misalign sibling columns; size via widths/heights or grid columns instead.
- Pitfall: for hover-only borders, use `border-transparent` with explicit `transition-[border-color]` and `hover:border-*`. If theme alpha makes the border hard to see, add a subtle hover `box-shadow` outline.
- Theme toggle must initialize from stored preference and cookie to avoid theme flipping on navigation.
- `framer-motion` must only be used in client components; use a wrapper like `src/components/BackToHomeLink.tsx`.
- Scroll-to-top button is fixed bottom-center; pages with footer text may need extra bottom padding to avoid overlap.
- Global smooth scrolling is set in `src/app/globals.css` with reduced-motion fallback.
- Homepage "My Blogs" uses `HomeLatestBlogs` and shows "Read more" only when `pageInfo.hasNextPage`.
- Homepage "Projects" uses `HomeFeaturedProjects` with local typed data from `src/lib/featuredProjects.ts`.
- Projects stack presentation is inline metadata separated by dots (`•`) instead of pill badges.
- Projects GitHub actions use `lucide-react` `Github` icon and shared blue hover/focus color with text.
- The portfolio project can be marked with `isCurrent` in data to show the `Current` badge.

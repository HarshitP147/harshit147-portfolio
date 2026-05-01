# COMPONENTS.md

## Relevant Skills
- `shadcn`
- `tailwind-design-system`

## UI Component Conventions
- UI primitives are authored as composable wrappers around `@base-ui/react`.
- `data-slot` attributes are used consistently for styling and composition hooks.
- Class composition uses `cn()` and `class-variance-authority` variants.
- Most interactive primitives are client components (`"use client"`).

## 3D Components
- **`ModelCanvas`** (`src/components/ModelCanvas.tsx`):
  - Core 3D canvas using `@react-three/fiber` and `@react-three/drei`.
  - Uses `frameloop="demand"` for performance.
  - Accepts optional `onLoaded` callback (currently unused).
  - Device-aware: adjusts pixel ratio, shadows, and rotation speed for mobile.

- **`ModelCanvasLazy`** (`src/components/ModelCanvasLazy.tsx`):
  - Lazy-loading wrapper for `ModelCanvas`.
  - Uses `next/dynamic` with `ssr: false`.
  - Defers loading until page is loaded AND component is in viewport.
  - Shows `ModelCanvasPoster` placeholder while loading.
  - Uses conditional rendering (poster OR canvas), not overlays.

## Image Components
- Use `next/image` for all static images (not `<img>` tags).
- Specify explicit `width` and `height` props.
- Use `loading="lazy"` and `fetchPriority="low"` for below-fold images.
- SVGs are supported and recommended for icons.

- **`ZoomableImage`** (`src/components/ZoomableImage.tsx`):
  - Client wrapper around `next/image` (`fill` mode) that adds tap-to-expand.
  - iOS App Store-style FLIP: source rect → centered hero rect with `transform: translate + scale`, easing `cubic-bezier(0.32, 0.72, 0, 1)` over 360ms.
  - Phase machine: `idle → opening → open → closing`. Source button gets `visibility: hidden` while not idle so the portaled clone visually replaces it.
  - Dismiss triggers (only attached during `open`): tap on backdrop or expanded image, `Escape`, `scroll` (passive, capture), `resize` (recomputes target).
  - No body scroll lock; scroll is a dismiss trigger by design.
  - Aspect ratio is derived from the loaded image's `naturalWidth / naturalHeight` via `onLoad` — wrapper uses `style={{ aspectRatio }}` to avoid stretching with `<Image fill>`.
  - `prefers-reduced-motion` honored via `useSyncExternalStore`; transitions disabled when reduced.
  - Props: `src, alt, width, height, sizes?, className?, imageClassName?, priority?`. `width`/`height` seed the initial aspect before load.

## Marquee Components
- **`TechMarquee`** (`src/components/TechMarquee.tsx`):
  - Two-row marquee with opposite directions.
  - Uses `next/image` for tech stack icons.
  - Icons defined in `icons` array with metadata (label, slug, accent, src).
  - CSS-based animation (no framer-motion).

## Blog Components
- **`BlogPostsApolloLogger`** (`src/components/BlogPostsApolloLogger.tsx`):
  - Server component that fetches Hashnode posts.
  - Uses helper functions to avoid JSX in try/catch.
  - Renders `BlogPostCard` components for each post.

- **`BlogPostDetailApolloLogger`** (`src/components/BlogPostDetailApolloLogger.tsx`):
  - Server component that renders a single Hashnode post.
  - Cover image and inline markdown images both render through `ZoomableImage`.
  - The `markdownComponents.img` override returns a `ZoomableImage` instead of a plain `<Image>`.

## Theme Components
- **`ThemeToggle`** (`src/components/ThemeToggle.tsx`):
  - Switches between light and dark themes.
  - Initializes from localStorage, cookie, and system preference.
  - Uses `setTimeout` to avoid setState in effect lint error.

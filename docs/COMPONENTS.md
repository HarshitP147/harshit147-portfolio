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

## Theme Components
- **`ThemeToggle`** (`src/components/ThemeToggle.tsx`):
  - Switches between light and dark themes.
  - Initializes from localStorage, cookie, and system preference.
  - Uses `setTimeout` to avoid setState in effect lint error.

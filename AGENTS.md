# AGENTS.md

This file is a lookup map. The detailed, authoritative documentation lives under `docs/`.

## Start Here
- `docs/index.md`: Documentation map and entry point.
- `ARCHITECTURE.md`: Site architecture and external services.

## Key Docs
- Design system and responsive rules: `docs/DESIGN.md`.
- Homepage behavior and layout: `docs/HOMEPAGE.md`.
- 3D scene behavior: `docs/THREE_D.md`.
- UI component conventions: `docs/COMPONENTS.md`.
- Aliases and import conventions: `docs/CONVENTIONS.md`.
- Runtime and tooling: `docs/TOOLING.md`.
- Editing guidelines for agents: `docs/AGENT_GUIDE.md`.
- Common tasks: `docs/TASKS.md`.
- Recent additions and pitfalls: `docs/PITFALLS.md`.
- Validation checklist: `docs/VALIDATION.md`.

## Quick Reference

### 3D Model Lazy Loading
- Use `ModelCanvasLazy` on the homepage, not `ModelCanvas` directly.
- Location: `src/components/ModelCanvasLazy.tsx`
- Shows poster placeholder until loaded; uses IntersectionObserver with 200px margin.

### Blog Image Tap-to-Expand
- All blog images (cover + inline markdown) wrap in `ZoomableImage` (`src/components/ZoomableImage.tsx`).
- iOS App Store-style FLIP transition: tap → grow to centered hero; tap, scroll, or Escape → collapse to slot.
- Pure CSS (`transform` + `transition`); no animation library.
- Aspect ratio derived from `naturalWidth/naturalHeight` via `onLoad` to avoid distortion.

### Linting
- Run: `npm run lint`
- Auto-generated file: `src/lib/graphql/generated.ts` (ignored by ESLint)
- Common fixes:
  - `react-hooks/set-state-in-effect` (React 19) → don't call `setState` in effect body. For matchMedia/storage subscriptions use `useSyncExternalStore`. Defer with `setTimeout(..., 0)` or `requestAnimationFrame` only as a last resort.
  - `react-hooks/refs` → don't read `ref.current` during render. Use state for values needed in JSX.
  - JSX in try/catch → use helper functions
  - Unescaped entities → use `I{`'`}m` syntax
  - `<img>` tags → use `next/image`

### Tech Stack
- Next.js App Router with TypeScript
- Tailwind CSS for styling
- @react-three/fiber for 3D
- Server-side Hashnode integration (no Apollo client on blog pages)
- CSS-only animations (no framer-motion)

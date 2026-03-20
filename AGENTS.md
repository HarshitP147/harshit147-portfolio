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

### Linting
- Run: `npm run lint`
- Auto-generated file: `src/lib/graphql/generated.ts` (ignored by ESLint)
- Common fixes:
  - setState in useEffect → wrap in `setTimeout(() => ..., 0)`
  - JSX in try/catch → use helper functions
  - Unescaped entities → use `I{`'`}m` syntax
  - `<img>` tags → use `next/image`

### Tech Stack
- Next.js App Router with TypeScript
- Tailwind CSS for styling
- @react-three/fiber for 3D
- Server-side Hashnode integration (no Apollo client on blog pages)
- CSS-only animations (no framer-motion)

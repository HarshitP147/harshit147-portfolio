# TOOLING.md

## Relevant Skills
- `next-best-practices`

## Runtime and Tooling
- **Package manager**: `npm`.
- **Dev server**: `npm run dev`.
- **Build**: `npm run build`.
- **Production run**: `npm run start`.
- **Lint**: `npm run lint`.
- **GraphQL Codegen**: `npm run codegen` (config in `codegen.ts`, output `src/lib/graphql/generated.ts`).
- **Postinstall**: `npm run postinstall` (runs GraphQL codegen automatically after install).

## Animation
- `framer-motion` has been removed from the project.
- Prefer CSS transitions and animations for micro-interactions.
- Button pulse animations use CSS keyframes.
- TechMarquee uses CSS-based marquee animations.

## ESLint Configuration
- Configured in `eslint.config.mjs`.
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Auto-generated GraphQL types (`src/lib/graphql/generated.ts`) are ignored by ESLint.

## Code Quality Rules
- **`react-hooks/set-state-in-effect`**: synchronous `setState` in an effect body is an error in this project (React 19). Resolution order:
  1. Subscribe to external state (matchMedia, storage, etc.) with `useSyncExternalStore`.
  2. Restructure to avoid the flag entirely — initial state usually solves "is this mounted?" gating.
  3. Defer with `setTimeout(() => setState(...), 0)` or schedule inside `requestAnimationFrame`. State updates inside those callbacks don't trip the rule.
- **`react-hooks/refs`**: don't access `ref.current` during render. Promote render-relevant values to `useState`. Refs remain fine for DOM nodes used only in event handlers/effects.
- **JSX in try/catch**: Don't construct JSX directly inside try/catch. Use helper functions or assign to variables outside the block.
- **Unescaped entities**: Use template syntax like `I{`'`}m` instead of HTML entities.
- **Image optimization**: Use `next/image` instead of `<img>` for better performance.

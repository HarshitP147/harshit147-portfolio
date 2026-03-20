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
- **setState in useEffect**: Avoid synchronous `setState` calls in effect bodies. Use `setTimeout(() => setState(...), 0)` for post-mount initialization.
- **JSX in try/catch**: Don't construct JSX directly inside try/catch. Use helper functions or assign to variables outside the block.
- **Unescaped entities**: Use template syntax like `I{`'`}m` instead of HTML entities.
- **Image optimization**: Use `next/image` instead of `<img>` for better performance.

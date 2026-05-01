# AGENT_GUIDE.md

## Relevant Skills
- `find-skills`
- `skill-installer`
- `skill-creator`

## Editing Guidelines for Agents

### App Router and File Organization
- Preserve App Router structure and keep route-level files in `src/app`.
- Use existing design tokens from `globals.css` before introducing new colors.
- Prefer extending `src/components/ui/*` patterns rather than creating one-off form controls.
- Default to existing project libraries/frameworks/components before adding new ones or implementing custom versions.

### Homepage Conventions
- Keep horizontal spacing ownership at page level (`sectionShellClassName`) instead of nested per-section shells.
- For homepage headings, use `sectionTitleClassName` to preserve consistent typography and responsive alignment.
- Keep homepage projects in `src/lib/featuredProjects.ts` instead of hardcoding content in component markup.
- Keep projects presentation editorial and minimal: no image placeholders, no decorative numbering, and no top accent rule unless explicitly requested.
- On small screens, keep project title left and place GitHub icon+link in the same row aligned right.
- Keep homepage breakpoint behavior consistent:
  - Headings and hero text align center below `xl`, left at `xl+`.
  - Hero two-column split starts at `xl`.
  - Avoid introducing horizontal overflow in medium breakpoints.
- **3D Canvas**: Use `ModelCanvasLazy` (not `ModelCanvas` directly) for lazy loading.

### Code Quality
- Maintain TypeScript strict compatibility.
- Keep imports alias-first (`@/...`) instead of long relative paths.
- Avoid `framer-motion`; prefer CSS transitions/animations.
- Use `next/image` for all static images (not `<img>` tags).
- Don't call `setState` synchronously in `useEffect` bodies (`react-hooks/set-state-in-effect`). For external stores/media queries use `useSyncExternalStore`; otherwise defer with `setTimeout` or `requestAnimationFrame`.
- Don't access `ref.current` during render (`react-hooks/refs`); promote render-relevant values to `useState`.
- Avoid JSX in try/catch blocks (use helper functions).
- Escape entities properly (use `I{`'`}m` syntax).

### 3D Model Guidelines
- Keep `ModelCanvas` interactions constrained for UX consistency.
- Don't modify `frameloop="demand"` unless absolutely necessary.
- Keep device detection logic (`isMobileDevice()`, `getDevicePixelRatio()`).
- Preserve the two-phase auto-rotation speed transition.

### Blog Guidelines
- Keep blog navigation affordances consistent: the `/blog` page uses a muted "Back to Home" link at the top-left within page padding; `/blog/[slug]` should mirror placement and styling for its "Go back" link (top-left, muted, underline offset).
- Blog list/detail are server-rendered via `fetchHashnodePosts`/`fetchHashnodePostBySlug`; do not reintroduce client Apollo fetching on these routes.
- Render blog images through `ZoomableImage`, not raw `<Image>`. This applies to both the cover image and the markdown `img` override in `BlogPostDetailApolloLogger.tsx`. Don't bypass the FLIP wrapper for one-off cases without good reason.

### Assets
- Store new static assets in `public/` and reference them by absolute web path (`/asset.ext`).
- Organize assets: `public/marquee/top`, `public/marquee/bottom`, `public/misc`.
- Pixel units are allowed for sizing; keep values aligned with existing layout scales and tokens.

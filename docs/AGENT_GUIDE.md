# AGENT_GUIDE.md

## Relevant Skills
- `find-skills`
- `skill-installer`
- `skill-creator`

## Editing Guidelines for Agents
- Preserve App Router structure and keep route-level files in `src/app`.
- Use existing design tokens from `globals.css` before introducing new colors.
- Prefer extending `src/components/ui/*` patterns rather than creating one-off form controls.
- Default to existing project libraries/frameworks/components before adding new ones or implementing custom versions.
- On homepage, keep horizontal spacing ownership at page level (`sectionShellClassName`) instead of nested per-section shells.
- For homepage headings, use `sectionTitleClassName` to preserve consistent typography and responsive alignment.
- Keep homepage projects in `src/lib/featuredProjects.ts` instead of hardcoding content in component markup.
- Keep projects presentation editorial and minimal: no image placeholders, no decorative numbering, and no top accent rule unless explicitly requested.
- On small screens, keep project title left and place GitHub icon+link in the same row aligned right.
- Keep homepage breakpoint behavior consistent:
- headings and hero text align center below `xl`, left at `xl+`.
- hero two-column split starts at `xl`.
- Avoid introducing horizontal overflow in medium breakpoints.
- Keep `ModelCanvas` interactions constrained for UX consistency.
- Keep blog navigation affordances consistent: the `/blog` page uses a muted "Back to Home" link at the top-left within page padding; `/blog/[slug]` should mirror placement and styling for its "Go back" link (top-left, muted, underline offset).
- Blog list/detail are server-rendered via `fetchHashnodePosts`/`fetchHashnodePostBySlug`; do not reintroduce client Apollo fetching on these routes.
- Avoid adding `framer-motion`; prefer CSS transitions/animations (like button uses CSS pulse and explicit pink fill).
- Store new static assets in `public/` and reference them by absolute web path (`/asset.ext`).
- Pixel units are allowed for sizing; keep values aligned with existing layout scales and tokens.
- Keep imports alias-first (`@/...`) instead of long relative paths.
- Maintain TypeScript strict compatibility.

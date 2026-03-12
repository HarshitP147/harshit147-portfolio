# DESIGN.md

## Relevant Skills
- `tailwind-design-system`
- `shadcn`
- `ui-ux-pro-max`
- `frontend-design`

## Styling and Theme System
- Theme tokens are CSS variables (`--background`, `--foreground`, etc.) in `globals.css`.
- Tailwind theme is wired through `@theme inline` for utility token usage.
- Dark values are defined both in `.dark` and `prefers-color-scheme: dark` blocks.
- Custom animation and visual classes include:
- `.gradient-layer`, `.gradient-blue`, `.gradient-red`
- `.marquee`, `.marquee-track`, `.marquee-right`
- Keyframes for marquee, blink, spin, and pulse.
- Utility class `.line-clamp-3` is defined in `globals.css`.

## Responsive Guidelines
- Section titles are centered below `xl` and left-aligned from `xl` and above.
- Hero switches to a two-column layout at `xl`.
- Avoid introducing horizontal overflow at medium breakpoints.

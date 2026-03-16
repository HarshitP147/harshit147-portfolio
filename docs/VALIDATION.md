# VALIDATION.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`

## Validation Checklist
- Run `npm run lint` after significant UI or TS changes.
- For 3D changes, verify:
- Model loads without runtime errors.
- Controls cannot orbit below floor.
- Shadows remain visible and performant.
- For style changes, verify both desktop and mobile layout behavior.
- For homepage layout changes, verify:
- `Hi, I&apos;m`, `Languages and Tools`, `My Blogs`, and `Projects` share the same horizontal container edges on large screens.
- The same titles are centered on mobile/tablet and switch to left-aligned from `xl`.
- No horizontal scrolling appears across breakpoints unless intentionally introduced.
- For homepage projects changes, verify:
- Project titles are left-aligned on mobile and desktop.
- GitHub icon and label are aligned together and both change to blue on hover/focus.
- Inline stack metadata wraps cleanly on small screens without overlap.
- `Current` badge appears only for items with `isCurrent: true`.
- For likes changes, verify:
- First render shows stable count and correct singular/plural label (`Like` vs `Likes`).
- Slow network still feels responsive (optimistic update), and UI rolls back on failed requests.
- Like/unlike works across multiple browsers without hydration or route-param warnings.
- Heart icon fills pink in both light and dark themes when liked; remains outlined muted when not.
- Like button pulse animation triggers once per tap/click without jitter.
- No `framer-motion` import appears in the bundle (animation is CSS-only).

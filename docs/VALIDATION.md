# VALIDATION.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`

## Validation Checklist

### General
- Run `npm run lint` after significant UI or TS changes.
- Verify TypeScript compilation with `npm run build`.
- Check both light and dark theme appearance.

### 3D Model Changes
- Model loads without runtime errors.
- Controls cannot orbit below floor.
- Shadows remain visible and performant.
- Auto-rotation works (fast initial spin, then slows down).
- Auto-rotation stops on user interaction.
- **Lazy loading**: Verify `ModelCanvasLazy` shows poster initially, then loads model when in viewport.
- **Mobile**: Confirm model renders correctly on mobile devices (not just poster background).
- **Performance**: Check GPU usage is reasonable, especially on mobile.

### Style and Layout Changes
- Verify both desktop and mobile layout behavior.
- Check for horizontal overflow issues across breakpoints.
- Confirm theme colors work in both light and dark modes.

### Homepage Layout Changes
- `Hi, I'm`, `Languages and Tools`, `My Blogs`, and `Projects` share the same horizontal container edges on large screens.
- The same titles are centered on mobile/tablet and switch to left-aligned from `xl`.
- No horizontal scrolling appears across breakpoints unless intentionally introduced.
- **3D Canvas**: Verify the model appears and rotates (not frozen or blocked by poster).
- **3D Canvas on mobile**: Confirm it's visible and interactive, not just showing poster background.

### Homepage Projects Changes
- Project titles are left-aligned on mobile and desktop.
- GitHub icon and label are aligned together and both change to blue on hover/focus.
- Inline stack metadata wraps cleanly on small screens without overlap.
- `Current` badge appears only for items with `isCurrent: true`.

### Blog Changes
- First render shows stable count and correct singular/plural label (`Like` vs `Likes`).
- Slow network still feels responsive (optimistic update), and UI rolls back on failed requests.
- Like/unlike works across multiple browsers without hydration or route-param warnings.
- Refreshing a post keeps the current visitor's liked state without using `localStorage`.
- Heart icon fills pink in both light and dark themes when liked; remains outlined muted when not.
- Like button pulse animation triggers once per tap/click without jitter.
- No `framer-motion` import appears in the bundle (animation is CSS-only).
- Repeated likes from the same visitor do not increase the count more than once, and the stored post JSON keeps the post slug plus one metadata entry per active liker, including any available Vercel geo headers and inferred OS/device type.
- On deployed Vercel traffic, confirm geo fields populate when Vercel provides them; on local development or privacy-masked IPs, confirm the stored fallback is `"unknown"` instead of an empty string.
- Do not expect exact location from the likes flow; verify that no browser geolocation prompt is introduced.

### TechMarquee Changes
- Icons render at correct size on all screen sizes.
- No blurry or pixelated images (check `next/image` props).
- Marquee animation pauses on hover/focus.
- Both rows animate in opposite directions.

### Linting
- No ESLint errors in application code.
- `src/lib/graphql/generated.ts` is auto-generated and can be ignored.
- Common lint rules to watch:
  - No synchronous `setState` in useEffect (use `setTimeout` wrapper).
  - No JSX in try/catch blocks (use helper functions).
  - Escape entities properly (use `I{`'`}m` syntax).
  - Use `next/image` instead of `<img>`.

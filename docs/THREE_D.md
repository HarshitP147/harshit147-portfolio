# THREE_D.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`

## 3D Scene Files
- **`src/components/ModelCanvas.tsx`**: Core 3D canvas component using `@react-three/fiber` and `@react-three/drei`.
- **`src/components/ModelCanvasLazy.tsx`**: Lazy-loading wrapper that defers loading until the component is in viewport and page is fully loaded.

## 3D Scene Notes (`src/components/ModelCanvas.tsx`)
- GLB source path is hardcoded to `/misc/scene.glb`.
- Meshes in the loaded scene are traversed and set to cast/receive shadows.
- Idle motion rotates the camera via `OrbitControls` auto-rotation; the model itself remains static.
- Camera auto-rotation uses a two-phase speed transition:
  - **Fast phase**: `FAST_SPEED = 350.0` for the first `FAST_DURATION = 0.7` seconds.
  - **Slow phase**: `SLOW_SPEED` (mobile: `3.0`, desktop: `7.0`) after the fast phase.
  - Speed transitions smoothly using linear interpolation with exponential damping.
- Auto-rotation stops permanently once user interaction begins (`OrbitControls` `onStart`).
- Floor plane is auto-positioned from model bounding box min Y and receives shadows.
- `OrbitControls` constraints:
  - Pan disabled.
  - Max polar angle below floor view (`Math.PI / 2 - 0.05`).
  - Zoom clamped with `minDistance` (1.4) and `maxDistance` (5).

## Performance Optimizations
- **Lazy loading**: `ModelCanvasLazy` uses `next/dynamic` with `ssr: false` and IntersectionObserver.
  - Loading is deferred until `window.load` event fires.
  - Loading is deferred until the component enters the viewport (with `200px` root margin).
  - Shows a poster placeholder with gradient background and spinner while loading.
- **Canvas configuration**:
  - `frameloop="demand"` to only render when scene changes.
  - `powerPreference="low-power"` for energy efficiency.
  - Antialias disabled on mobile devices.
  - Device pixel ratio capped: mobile max `1.5`, desktop max `2.0`.
- **Mobile optimizations**:
  - Reduced shadow scale, blur, and distance.
  - Lower light intensities.
  - Reduced shadow radius.

## Device Detection
- `isMobileDevice()`: Checks user agent for mobile devices.
- `getDevicePixelRatio()`: Returns capped pixel ratio based on device type.
- `getSLOW_SPEED()`: Returns rotation speed based on device type (mobile: `3.0`, desktop: `7.0`).

## Theme Support
- Scene visuals (sky color, shadow opacity, shadow color) sync with light/dark theme.
- Uses MutationObserver to detect theme class changes on document root.
- Listens to `prefers-color-scheme: dark` media query for system theme changes.

## Pitfalls
- **setState in useEffect**: Avoid calling `setState` synchronously within effects. Use `setTimeout(() => setState(...), 0)` if initialization must happen after mount.
- **SLOW_SPEED variable**: Must be computed synchronously within the `Scene` component using `getSLOW_SPEED()`, not as a module-level variable assigned in useEffect.
- **Canvas frameloop**: Keep `frameloop="demand"` for performance. The auto-rotation works because `useFrame` updates `OrbitControls.autoRotateSpeed` directly without requiring React state updates.
- **Poster overlay**: `ModelCanvasLazy` uses conditional rendering (poster OR canvas), not absolute positioning overlays, to avoid z-index conflicts that can block the canvas.

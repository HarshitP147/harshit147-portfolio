# THREE_D.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`

## 3D Scene Notes (`src/components/ModelCanvas.tsx`)
- GLB source path is hardcoded to `/scene.glb`.
- Meshes in the loaded scene are traversed and set to cast/receive shadows.
- Idle motion rotates the camera via `OrbitControls` auto-rotation; the model itself remains static.
- Camera auto-rotation starts fast on load and eases to a slower speed within about one second.
- Auto-rotation stops permanently once user interaction begins (`OrbitControls` `onStart`).
- Floor plane is auto-positioned from model bounding box min Y and receives shadows.
- `OrbitControls` constraints:
- Pan disabled.
- Max polar angle below floor view (`Math.PI / 2 - 0.05`).
- Zoom clamped with `minDistance` and `maxDistance`.

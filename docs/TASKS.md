# TASKS.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`
- `apollo-client`
- `hashnode-api`

## Common Tasks

### 3D Model and Scene
- **Replace 3D model**:
  - Overwrite `public/misc/scene.glb` or update the path in `ModelCanvas.tsx`.
- **Add a new marquee icon**:
  - Add asset in `public/marquee/top` or `public/marquee/bottom`.
  - Add metadata entry to `icons` array in `src/components/TechMarquee.tsx`.
  - Use `next/image` compatible format (SVG, PNG).
- **Tune scene lighting/shadows**:
  - Update light/floor/contact shadow settings in `src/components/ModelCanvas.tsx`.
  - Mobile-specific settings use `mobileShadowProps` for reduced GPU load.
- **Adjust auto-rotation speed**:
  - Modify `FAST_SPEED`, `FAST_DURATION`, or `getSLOW_SPEED()` in `ModelCanvas.tsx`.
  - Keep speed transitions smooth using the existing lerp pattern.
- **Configure lazy loading behavior**:
  - Adjust IntersectionObserver `rootMargin` in `ModelCanvasLazy.tsx` (default: `200px`).
  - Modify poster appearance in `ModelCanvasPoster` component.

### Hashnode Blog Integration
- **Hashnode blog fetch (server-side)**:
  - Use `fetchHashnodePosts` in `src/lib/hashnode.ts` for lists and `fetchHashnodePostBySlug` for details.
  - Ensure `HASHNODE_USERNAME` (and optionally `HASHNODE_PUBLICATION_HOST`) env vars are set; no Apollo client needed.
- **Change blog page size**:
  - Update `pageSize` in `BlogPostsApolloLogger.tsx` and `HomeLatestBlogs.tsx`.

### Upstash Redis (Likes)
- **Reset likes for a post in Upstash**:
  - Delete key `likes:post:<postId>` in the Redis console.

### Theme and Styling
- **Update theme colors**:
  - Modify CSS variables in `src/app/globals.css`.
  - Scene visuals sync automatically via `getSceneVisuals()` in `ModelCanvas.tsx`.
- **Add new social link**:
  - Add to `src/lib/personalLinks.ts`.
  - Ensure icon asset exists in `public/misc`.

### Performance
- **Optimize images**:
  - Use `next/image` with explicit `width`, `height`, and `sizes` props.
  - Set `fetchPriority="low"` for below-fold images.
  - Set `loading="lazy"` for lazy-loading.
- **Reduce GPU load**:
  - Adjust `getDevicePixelRatio()` caps in `ModelCanvas.tsx`.
  - Modify `mobileShadowProps` for simpler shadows.

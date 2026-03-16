# TASKS.md

## Relevant Skills
- `next-best-practices`
- `vercel-react-best-practices`
- `apollo-client`
- `hashnode-api`

## Common Tasks
- Replace 3D model:
- Overwrite `public/scene.glb` or update the path in `ModelCanvas.tsx`.
- Add a new marquee icon:
- Add asset in `public/`.
- Add metadata entry to `icons` array in `src/components/TechMarquee.tsx`.
- Tune scene lighting/shadows:
- Update light/floor/contact shadow settings in `src/components/ModelCanvas.tsx`.
- Hashnode blog fetch (server-side):
- Use `fetchHashnodePosts` in `src/lib/hashnode.ts` for lists and `fetchHashnodePostBySlug` for details.
- Ensure `HASHNODE_USERNAME` (and optionally `HASHNODE_PUBLICATION_HOST`) env vars are set; no Apollo client needed.
- Reset likes for a post in Upstash:
- Delete key `likes:post:<postId>` (or set to `0`) in the Redis console.

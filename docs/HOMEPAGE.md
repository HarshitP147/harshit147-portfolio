# HOMEPAGE.md

## Relevant Skills
- `frontend-design`
- `next-best-practices`
- `vercel-react-best-practices`

## Homepage Behavior
- Primary route is a split hero layout with text content and a square 3D canvas.
- **`NameGradient`** toggles between blue and red gradient themes every 12 seconds.
- **`NameGradient`** keeps wrapping on smaller screens and switches to no-wrap at `xl`.
- **`TechMarquee`** renders two opposing-direction marquee rows and pauses animation on hover/focus.
- **`HomeLatestBlogs`** uses `BlogPostCard` (compact) and links to `/blog/[slug]`.
- **`HomeFeaturedProjects`** renders below `My Blogs` using an editorial row layout (no thumbnails/cards).
- A single page-level container shell (`sectionShellClassName`) is used to keep section headings aligned to identical left/right bounds.
- The shared shell uses `max-w-5xl` and `px-4`.
- Homepage section titles (`Hi, I'm`, `Languages and Tools`, `My Blogs`, `Projects`) use shared title styling.
- Title alignment is responsive: centered on mobile/tablet, left-aligned from `xl` and above.
- Hero switches to two-column layout at `xl` to prevent medium-breakpoint horizontal overflow.
- Project rows are left-aligned on mobile and desktop, with title/domain/description/stack content in one column.
- Project action links use a stacked icon+label and must keep icon and text color transitions in sync.
- GitHub link hover/focus color for projects should match existing link affordances (`Read more`/`Go back` blue).

## 3D Model Lazy Loading
- **`ModelCanvasLazy`** is used instead of `ModelCanvas` directly on the homepage.
- Loading is deferred until:
  1. The page's `window.load` event has fired.
  2. The component enters the viewport (with `200px` root margin).
- Shows a poster placeholder with gradient background and spinner while loading.
- Uses `next/dynamic` with `ssr: false` for code splitting.
- Conditional rendering: poster is completely replaced by canvas once loading begins.

## Pitfalls
- **Unescaped entities**: Use `I{`'`}m` instead of `I'm` or `I&apos;m` to avoid ESLint errors.
- **Layout structure**: The 3D canvas container must be properly placed in the flex layout. Use the `xl:w-auto xl:justify-end` wrapper pattern for correct desktop alignment.

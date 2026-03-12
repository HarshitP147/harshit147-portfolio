import Link from "next/link";

import { BlogPostCard, BlogPostCardSkeleton } from "@/components/BlogPostCard";
import { sectionTitleClassName } from "@/components/sectionStyles";
import { fetchHashnodePosts } from "@/lib/hashnode";

type HomeLatestBlogsProps = {
  username: string;
};

export function HomeLatestBlogsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center xl:justify-between">
        <h2 className={sectionTitleClassName()}>My Blogs</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <BlogPostCardSkeleton key={`home-skeleton-${index}`} size="compact" />
        ))}
      </div>
    </div>
  );
}

export default async function HomeLatestBlogs({ username }: HomeLatestBlogsProps) {
  let posts: Awaited<ReturnType<typeof fetchHashnodePosts>>["posts"] = [];
  let hasMore = false;

  try {
    const result = await fetchHashnodePosts({ first: 3, username });
    posts = result.posts.filter((post) => Boolean(post.id && post.slug));
    hasMore = result.hasNextPage;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load posts.";
    return <p className="text-sm text-muted-foreground">{message}</p>;
  }

  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">No posts yet.</p>;
  }

  const linkClassName =
    "text-sm text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-sky-300 hover:underline";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center xl:flex-row xl:items-center xl:justify-between xl:text-left">
        <h2 className={sectionTitleClassName()}>My Blogs</h2>
        {hasMore ? (
          <Link href="/blog" className={`hidden xl:inline-flex ${linkClassName}`}>
            Read more
          </Link>
        ) : null}
      </div>
      <div
        className={
          posts.length < 3
            ? "flex flex-wrap justify-center gap-6"
            : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {posts.map((post) => (
          <BlogPostCard
            key={post.id}
            id={post.id}
            title={post.title}
            slug={post.slug}
            brief={post.brief}
            coverImageUrl={post.coverImage?.url ?? null}
            publishedAt={post.publishedAt ?? null}
            readTimeInMinutes={post.readTimeInMinutes ?? null}
            size="compact"
            className={posts.length < 3 ? "w-full max-w-[360px] flex-none" : undefined}
          />
        ))}
      </div>
      {hasMore ? (
        <div className="flex justify-center xl:hidden">
          <Link href="/blog" className={linkClassName}>
            Read more
          </Link>
        </div>
      ) : null}
    </div>
  );
}

import { BlogPostCard } from "@/components/BlogPostCard";
import { fetchHashnodePosts } from "@/lib/hashnode";

type BlogPostsApolloLoggerProps = {
  username: string;
};

export default async function BlogPostsApolloLogger({
  username,
}: BlogPostsApolloLoggerProps) {
  const pageSize = 3;

  try {
    const { posts } = await fetchHashnodePosts({ first: pageSize, username });
    const filteredPosts = posts.filter((post) => Boolean(post.id && post.slug));

    if (filteredPosts.length === 0) {
      return <p className="text-sm text-muted-foreground">No posts found yet.</p>;
    }

    return (
      <div className="grid gap-y-6 gap-x-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <BlogPostCard
            key={post.id}
            id={post.id}
            title={post.title}
            slug={post.slug}
            brief={post.brief}
            coverImageUrl={post.coverImage?.url ?? null}
            publishedAt={post.publishedAt ?? null}
            readTimeInMinutes={post.readTimeInMinutes ?? null}
          />
        ))}
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load posts.";
    return <p className="text-sm text-muted-foreground">{message}</p>;
  }
}

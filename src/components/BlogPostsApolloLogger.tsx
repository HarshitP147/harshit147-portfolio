import { BlogPostCard } from "@/components/BlogPostCard";
import { fetchHashnodePosts } from "@/lib/hashnode";

type BlogPostsApolloLoggerProps = {
  username: string;
};

async function loadPosts(username: string, pageSize: number) {
  const { posts } = await fetchHashnodePosts({ first: pageSize, username });
  return posts.filter((post) => Boolean(post.id && post.slug));
}

function renderPosts(posts: ReturnType<typeof loadPosts> extends Promise<infer T> ? T : never) {
  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">No posts found yet.</p>;
  }

  return (
    <div className="grid gap-y-6 gap-x-8 md:grid-cols-2 xl:grid-cols-3">
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
        />
      ))}
    </div>
  );
}

function renderError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to load posts.";
  return <p className="text-sm text-muted-foreground">{message}</p>;
}

export default async function BlogPostsApolloLogger({
  username,
}: BlogPostsApolloLoggerProps) {
  const pageSize = 3;

  let posts: Awaited<ReturnType<typeof loadPosts>> | null = null;
  let error: unknown = null;

  try {
    posts = await loadPosts(username, pageSize);
  } catch (e) {
    error = e;
  }

  if (error) {
    return renderError(error);
  }

  if (!posts) {
    return renderError(new Error("Unable to load posts."));
  }

  return renderPosts(posts);
}

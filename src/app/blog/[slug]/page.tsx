import BlogPostDetailApolloLogger from "@/components/BlogPostDetailApolloLogger";
import { fetchBlogPosts } from "@/lib/blog";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { posts } = await fetchBlogPosts({ first: 50 });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-28 pt-20 text-foreground">
      <BlogPostDetailApolloLogger slug={slug} />
    </section>
  );
}

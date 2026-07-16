import type { Metadata } from "next";
import BlogPostDetail from "@/components/BlogPostDetail";
import { fetchBlogPosts, fetchBlogPostBySlug } from "@/lib/blog";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug({ slug });

  return {
    title: post?.title ?? "Blog Post",
    description: post?.title ?? "Read my latest blog post",
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-28 pt-20 text-foreground">
      <BlogPostDetail slug={slug} />
    </section>
  );
}

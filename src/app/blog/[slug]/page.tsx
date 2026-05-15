import BlogPostDetailApolloLogger from "@/components/BlogPostDetailApolloLogger";

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

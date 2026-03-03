import BlogPostDetailApolloLogger from "@/components/BlogPostDetailApolloLogger";

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const publicationHost =
    process.env.HASHNODE_PUBLICATION_HOST ??
    process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST ??
    null;

  if (!publicationHost) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-16 pt-20 text-foreground">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="text-sm text-muted-foreground">
          Set `HASHNODE_PUBLICATION_HOST` in your environment to render posts.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-28 pt-20">
      <BlogPostDetailApolloLogger
        publicationHost={publicationHost}
        slug={params.slug}
      />
    </section>
  );
}

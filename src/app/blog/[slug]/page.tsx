import BlogPostDetailApolloLogger from "@/components/BlogPostDetailApolloLogger";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const username =
    process.env.HASHNODE_USERNAME ??
    process.env.NEXT_PUBLIC_HASHNODE_USERNAME ??
    null;
  const publicationHost =
    process.env.HASHNODE_PUBLICATION_HOST ??
    process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST ??
    (username ? `${username}.hashnode.dev` : null);

  if (!username || !publicationHost) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-16 pt-20 text-foreground">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="text-sm text-muted-foreground">
          Set `HASHNODE_USERNAME` in your environment to render posts.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-28 pt-20 text-foreground">
      <BlogPostDetailApolloLogger
        publicationHost={publicationHost}
        slug={slug}
      />
    </section>
  );
}

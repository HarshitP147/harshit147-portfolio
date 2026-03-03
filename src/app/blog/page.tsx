import BackToHomeLink from "@/components/BackToHomeLink";

import BlogPostsApolloLogger from "@/components/BlogPostsApolloLogger";

export default async function BlogPage() {
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
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-28 pt-20 text-foreground">
      <header className="space-y-3">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center justify-start">
            <BackToHomeLink />
          </div>
          <h1 className="text-center text-3xl font-semibold">Blog</h1>
          <div />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Notes, experiments, and build logs from Hashnode.
        </p>
      </header>
      <BlogPostsApolloLogger publicationHost={publicationHost} />
      <div className="flex items-center gap-4 pt-6 text-muted-foreground">
        <span className="h-px flex-1 bg-border/70" />
        <span className="text-xs uppercase tracking-[0.25em]">
          You&apos;ve reached the end.
        </span>
        <span className="h-px flex-1 bg-border/70" />
      </div>
    </section>
  );
}

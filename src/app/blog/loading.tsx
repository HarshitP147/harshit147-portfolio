import BackToHomeLink from "@/components/BackToHomeLink";

function BlogCardShimmer() {
  return (
    <div className="overflow-hidden rounded-3xl border border-foreground/5 bg-foreground/5">
      <div className="skeleton-shimmer aspect-[16/9] w-full bg-foreground/10" />
      <div className="space-y-2 px-4 py-4">
        <div className="skeleton-shimmer h-4 w-3/4 rounded-full bg-foreground/10" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded-full bg-foreground/10" />
        <div className="flex items-center justify-between pt-3">
          <div className="skeleton-shimmer h-3 w-20 rounded-full bg-foreground/10" />
          <div className="skeleton-shimmer h-3 w-16 rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
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
          Notes, experiments, thoughts and opinions.
        </p>
      </header>
      <div className="grid gap-y-6 gap-x-8 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <BlogCardShimmer key={i} />
        ))}
      </div>
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

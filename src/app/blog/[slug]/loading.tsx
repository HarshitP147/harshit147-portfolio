export default function Loading() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-28 pt-20 text-foreground">
      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-sm text-muted-foreground">Go back</span>
        <article className="mx-auto flex w-full max-w-3xl flex-col gap-10">
          <header className="space-y-6">
            <div className="space-y-4">
              <div className="skeleton-shimmer h-9 w-3/4 rounded-md bg-foreground/10 md:h-10" />
              <div className="skeleton-shimmer h-9 w-1/2 rounded-md bg-foreground/10 md:h-10" />
              <div className="flex w-full items-center justify-between">
                <div className="skeleton-shimmer h-3 w-24 rounded bg-foreground/10" />
                <div className="skeleton-shimmer h-3 w-20 rounded bg-foreground/10" />
              </div>
            </div>
            <div className="skeleton-shimmer aspect-[16/9] w-full rounded-3xl bg-foreground/5" />
          </header>
          <div className="flex flex-col gap-3">
            <div className="skeleton-shimmer h-4 w-full rounded bg-foreground/10" />
            <div className="skeleton-shimmer h-4 w-[95%] rounded bg-foreground/10" />
            <div className="skeleton-shimmer h-4 w-[88%] rounded bg-foreground/10" />
            <div className="skeleton-shimmer h-4 w-[92%] rounded bg-foreground/10" />
            <div className="skeleton-shimmer h-4 w-3/4 rounded bg-foreground/10" />
          </div>
        </article>
      </div>
    </section>
  );
}

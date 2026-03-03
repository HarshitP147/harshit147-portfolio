import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

type BlogPostCardProps = {
  title: string;
  slug: string;
  brief?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
  readTimeInMinutes?: number | null;
  size?: "default" | "compact";
  className?: string;
};

export function BlogPostCard({
  title,
  slug,
  brief,
  coverImageUrl,
  publishedAt,
  readTimeInMinutes,
  size = "default",
  className,
}: BlogPostCardProps) {
  const formattedDate = publishedAt
    ? dateFormatter.format(new Date(publishedAt))
    : null;

  return (
    <Link href={`/blog/${slug}`} className="block">
      <Card
        className={cn(
          "group/card relative h-full gap-3 overflow-hidden border border-foreground/5 bg-card/80 py-0 shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/10",
          size === "compact" ? "rounded-2xl" : "rounded-3xl",
          className,
        )}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden bg-foreground/5",
            size === "compact" ? "aspect-[16/10]" : "aspect-[16/9]",
          )}
        >
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-foreground/10 via-transparent to-foreground/5 text-xs text-muted-foreground">
              No cover image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        </div>
        <CardHeader
          className={cn(
            "space-y-2 -mt-2",
            size === "compact" ? "px-3 pb-3 pt-1" : "px-4 pb-4 pt-2",
          )}
        >
          <h3
            className={cn(
              "font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover/card:text-foreground line-clamp-2 min-h-[2.75rem]",
              size === "compact" ? "text-sm" : "text-base",
            )}
          >
            {title}
          </h3>
          <div className="flex w-full items-center justify-between gap-2 text-xs text-muted-foreground">
            {formattedDate ? <span>{formattedDate}</span> : <span />}
            {readTimeInMinutes ? (
              <span>{readTimeInMinutes} min read</span>
            ) : (
              <span />
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

type BlogPostCardSkeletonProps = {
  size?: "default" | "compact";
};

export function BlogPostCardSkeleton({ size = "default" }: BlogPostCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border border-foreground/5 bg-foreground/5 py-0",
        size === "compact" ? "rounded-2xl" : "rounded-3xl",
      )}
    >
      <div
        className={cn(
          "w-full animate-pulse bg-foreground/10",
          size === "compact" ? "aspect-[16/10]" : "aspect-[16/9]",
        )}
      />
      <CardContent
        className={cn(
          "space-y-2",
          size === "compact" ? "px-3 py-3" : "px-4 py-4",
        )}
      >
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-foreground/10" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-foreground/10" />
      </CardContent>
    </Card>
  );
}

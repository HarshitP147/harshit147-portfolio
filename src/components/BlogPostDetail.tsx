import { Clock3 } from "lucide-react";
import Link from "next/link";
import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import LikeButton from "@/components/LikeButton";
import TableOfContents, { type TocHeading } from "@/components/TableOfContents";
import ZoomableImage from "@/components/ZoomableImage";
import { fetchBlogPostBySlug } from "@/lib/blog";
import { remarkCallout } from "@/lib/remark-callout";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const EMBED_PATTERN = /^\s*%\[(https?:\/\/[^\]\s]+)\]\s*$/gm;
const IMAGE_WITH_ALIGN_PATTERN =
  /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\s+align=(?:"[^"]*"|'[^']*')\)/gm;
const IMAGE_SPLIT_LINE_PATTERN =
  /!\[([^\]]*)\]\s*\n+\s*\((https?:\/\/[^\s)]+)(?:\s+align=(?:"[^"]*"|'[^']*'))?\)/gm;

type BlogPostDetailApolloLoggerProps = {
  slug: string;
};

function getEmbedMarkup(rawUrl: string): string {
  try {
    const parsedUrl = new URL(rawUrl);

    if (
      parsedUrl.hostname === "codesandbox.io" &&
      parsedUrl.pathname.startsWith("/embed/")
    ) {
      const src = parsedUrl.toString();
      return `<div class="blog-embed" data-embed-source="codesandbox"><iframe src="${src}" loading="lazy" title="Embedded sandbox" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe></div>`;
    }

    const href = parsedUrl.toString();
    return `<p><a href="${href}" target="_blank" rel="noreferrer">${href}</a></p>`;
  } catch {
    return rawUrl;
  }
}

function transformBlogMarkdown(markdown: string): string {
  const normalizedImages = markdown
    .replace(
      IMAGE_WITH_ALIGN_PATTERN,
      (_match, alt: string, url: string) => `![${alt}](${url})`,
    )
    .replace(
      IMAGE_SPLIT_LINE_PATTERN,
      (_match, alt: string, url: string) => `![${alt}](${url})`,
    );

  return normalizedImages.replace(EMBED_PATTERN, (_, url: string) =>
    getEmbedMarkup(url),
  );
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function hastToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: string; value?: string; children?: unknown[] };
  if (n.type === "text" && typeof n.value === "string") return n.value;
  if (Array.isArray(n.children)) return n.children.map(hastToText).join("");
  return "";
}

function parseHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  let inCodeBlock = false;
  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`~[\]]/g, "").trim();
      headings.push({ level, text, id: slugifyHeading(text) });
    }
  }
  return headings;
}

function makeHeading(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  return function HeadingComponent({
    node,
    children,
  }: {
    node?: unknown;
    children?: React.ReactNode;
  }) {
    const id = slugifyHeading(hastToText(node));
    return <Tag id={id}>{children}</Tag>;
  };
}

function normalizeImageSource(src: unknown): string | null {
  if (typeof src !== "string" || !src) {
    return null;
  }

  if (src.startsWith("/")) {
    return src;
  }

  try {
    const parsed = new URL(src);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

const markdownComponents: Components = {
  h1: makeHeading("h1"),
  h2: makeHeading("h2"),
  h3: makeHeading("h3"),
  h4: makeHeading("h4"),
  h5: makeHeading("h5"),
  h6: makeHeading("h6"),
  img: ({ src, alt }) => {
    const imageSource = normalizeImageSource(src);
    if (!imageSource) {
      return null;
    }

    return (
      <ZoomableImage
        src={imageSource}
        alt={alt ?? ""}
        width={1600}
        height={900}
        sizes="(max-width: 768px) 100vw, 768px"
        className="my-6 border border-border/70"
      />
    );
  },
};

function GoBackLink() {
  return (
    <Link
      href="/blog"
      className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-sky-300 hover:underline"
    >
      Go back
    </Link>
  );
}

export default async function BlogPostDetailApolloLogger({
  slug,
}: BlogPostDetailApolloLoggerProps) {
  let post = null;

  try {
    post = await fetchBlogPostBySlug({ slug });
  } catch (error) {
    console.error(`[blog] Failed to load post "${slug}":`, error);
    return (
      <p className="text-sm text-muted-foreground">Unable to load the post.</p>
    );
  }

  if (!post || post.slug !== slug) {
    return (
      <div className="flex w-full flex-col items-start gap-6 text-muted-foreground">
        <GoBackLink />
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <p className="text-sm">We couldn&apos;t find this post.</p>
        </div>
      </div>
    );
  }

  const formattedDate = post.publishedAt
    ? dateFormatter.format(new Date(post.publishedAt))
    : null;
  const markdownContent = post.content?.markdown
    ? transformBlogMarkdown(post.content.markdown)
    : null;
  const tocHeadings = markdownContent ? parseHeadings(markdownContent) : [];

  return (
    <div className="flex w-full flex-col items-start gap-6 text-foreground">
      <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
        <GoBackLink />
      </div>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              {post.title}
            </h1>
            <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
              {formattedDate ? <span>{formattedDate}</span> : <span />}
              {post.readTimeInMinutes ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  {post.readTimeInMinutes} min read
                </span>
              ) : (
                <span />
              )}
            </div>
          </div>
          {post.coverImage?.url ? (
            <ZoomableImage
              src={post.coverImage.url}
              alt={post.title}
              width={1600}
              height={900}
              sizes="(max-width: 1024px) 100vw, 960px"
              className="rounded-3xl border border-foreground/10 bg-foreground/5"
              imageClassName="object-cover"
              priority
            />
          ) : null}
        </header>
        <TableOfContents headings={tocHeadings} />
        <div className="blog-markdown prose prose-neutral max-w-none dark:prose-invert prose-a:font-medium prose-a:text-foreground prose-a:underline-offset-4">
          {markdownContent ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkCallout]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {markdownContent}
            </ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">No content available.</p>
          )}
        </div>
        <div className="my-6 flex w-full items-center gap-4 text-muted-foreground">
          <span className="h-px flex-1 bg-border/70" />
          <LikeButton postId={post.id ?? post.slug} slug={post.slug} />
          <span className="h-px flex-1 bg-border/70" />
        </div>
      </article>
    </div>
  );
}

import "katex/dist/katex.min.css";

import katex from "katex";
import { Clock3 } from "lucide-react";
import Link from "next/link";
import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

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

type BlogPostDetailProps = {
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

// ── Math preprocessing (mirrors the local preview page) ───────────────────────
// remark-math v6 requires $$ to be on its own line for multiline blocks.
// Obsidian often writes $$\begin{env} or \end{env}$$ on the same line; the
// opening and closing $$ must also share identical leading indentation or the
// block never closes and swallows the rest of the document.
function normalizeMathDelimiters(markdown: string): string {
  return markdown
    .replace(
      /^(\s*)\$\$(\\[a-zA-Z])/gm,
      (_, indent: string, cap: string) => `${indent}$$\n${indent}${cap}`,
    )
    .replace(
      /^(\s*)(\\end\{[^}]+\})\s*\$\$/gm,
      (_, indent: string, end: string) => `${indent}${end}\n${indent}$$`,
    );
}

// Inside each $$ ... $$ block: unstarred gather/align/equation/multline get
// starred variants (no equation numbers), \displaylines{...} (closing } alone
// on its line) becomes \begin{gathered}...\end{gathered}, and \gt/\lt (MathJax,
// not KaTeX) become >/<.
function preprocessMathBlocks(markdown: string): string {
  return markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math: string) => {
    const m = math
      .replace(/\\begin\{(gather|align|equation|multline)\}/g, "\\begin{$1*}")
      .replace(/\\end\{(gather|align|equation|multline)\}/g, "\\end{$1*}")
      .replace(
        /\\displaylines\s*\{\s*\n([\s\S]*?)\n\s*\}/g,
        "\\begin{gathered}\n$1\n\\end{gathered}",
      )
      .replace(/\\gt\b/g, ">")
      .replace(/\\lt\b/g, "<");
    return `$$${m}$$`;
  });
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

  const withEmbeds = normalizedImages.replace(EMBED_PATTERN, (_, url: string) =>
    getEmbedMarkup(url),
  );

  return preprocessMathBlocks(normalizeMathDelimiters(withEmbeds));
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Splits a heading line on inline $math$ spans, rendering math through KaTeX
// and stripping markdown decoration from the surrounding plain text. Keeps the
// raw expression (underscores intact) in `plain` so slugs stay stable/unique;
// renders proper glyphs into `html`.
const INLINE_MATH_RE = /\$([^$\n]+)\$/g;

function parseHeadingText(raw: string): { plain: string; html: string } {
  let plain = "";
  let html = "";
  let lastIndex = 0;

  for (const m of raw.matchAll(INLINE_MATH_RE)) {
    const before = raw.slice(lastIndex, m.index).replace(/[*_`~[\]]/g, "");
    plain += before;
    html += escapeHtml(before);

    const expr = m[1];
    plain += expr;
    try {
      html += katex.renderToString(expr, { throwOnError: false });
    } catch {
      html += escapeHtml(`$${expr}$`);
    }

    lastIndex = (m.index ?? 0) + m[0].length;
  }

  const rest = raw.slice(lastIndex).replace(/[*_`~[\]]/g, "");
  plain += rest;
  html += escapeHtml(rest);

  return { plain: plain.trim(), html: html.trim() };
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
      const { plain, html } = parseHeadingText(match[2]);
      headings.push({ level, text: plain, html, id: slugifyHeading(plain) });
    }
  }
  return headings;
}

// Assigns heading DOM ids by document-order index into `headings` rather than
// re-deriving the slug from the rendered hast tree, so TOC links and heading
// ids can never drift out of sync with each other.
function makeHeading(
  Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
  headings: TocHeading[],
  counter: { current: number },
) {
  return function HeadingComponent({ children }: { children?: React.ReactNode }) {
    const id = headings[counter.current]?.id;
    counter.current += 1;
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

function createMarkdownComponents(headings: TocHeading[]): Components {
  const counter = { current: 0 };
  return {
    h1: makeHeading("h1", headings, counter),
    h2: makeHeading("h2", headings, counter),
    h3: makeHeading("h3", headings, counter),
    h4: makeHeading("h4", headings, counter),
    h5: makeHeading("h5", headings, counter),
    h6: makeHeading("h6", headings, counter),
    table: ({ children }) => (
      <div className="blog-table-wrap">
        <table>{children}</table>
      </div>
    ),
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
}

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

export default async function BlogPostDetail({
  slug,
}: BlogPostDetailProps) {
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
  const markdownComponents = createMarkdownComponents(tocHeadings);

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
              remarkPlugins={[remarkMath, remarkGfm, remarkCallout]}
              rehypePlugins={[
                rehypeRaw,
                [
                  rehypeKatex,
                  {
                    throwOnError: false,
                    strict: false,
                    // Obsidian/MathJax supports \displaylines; KaTeX doesn't.
                    // Fallback: treat it as \begin{gathered}...\end{gathered}.
                    macros: {
                      "\\displaylines": "\\begin{gathered}#1\\end{gathered}",
                    },
                  },
                ],
              ]}
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

import "katex/dist/katex.min.css";

import fs from "fs";
import path from "path";

import katex from "katex";
import { Clock3 } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import TableOfContents, { TocRail, type TocHeading } from "@/components/TableOfContents";
import ZoomableImage from "@/components/ZoomableImage";
import { remarkCallout } from "@/lib/remark-callout";

// ── Local image rewrite patterns ─────────────────────────────────────────────
// Standard markdown with relative path: ![alt](./one.png) or ![alt](one.png)
const LOCAL_IMAGE_RE =
  /!\[([^\]]*)\]\((?:\.\/)?([a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp|gif|svg))\)/gi;

// Obsidian wiki-link embeds: ![[one.png]] or ![[slug/one.png]]
const WIKI_IMAGE_RE = /!\[\[([^\]]+\.(?:png|jpg|jpeg|webp|gif|svg))\]\]/gi;

function rewriteLocalImages(markdown: string, slug: string): string {
  return markdown
    // ![[slug/file.png]] or ![[file.png]] → standard markdown pointing at preview API
    .replace(WIKI_IMAGE_RE, (_match, wikiPath: string) => {
      const parts = wikiPath.split("/");
      const filename = parts[parts.length - 1];
      const imageSlug = parts.length > 1 ? parts[0] : slug;
      return `![${filename}](/api/blog/preview/${imageSlug}/${filename})`;
    })
    // ![alt](./one.png) or ![alt](one.png)
    .replace(
      LOCAL_IMAGE_RE,
      (_match, alt: string, filename: string) =>
        `![${alt}](/api/blog/preview/${slug}/${filename})`,
    );
}

// ── Same transforms as BlogPostDetail ────────────────────────────────────────
const EMBED_PATTERN = /^\s*%\[(https?:\/\/[^\]\s]+)\]\s*$/gm;
const IMAGE_WITH_ALIGN_PATTERN =
  /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\s+align=(?:"[^"]*"|'[^']*')\)/gm;
const IMAGE_SPLIT_LINE_PATTERN =
  /!\[([^\]]*)\]\s*\n+\s*\((https?:\/\/[^\s)]+)(?:\s+align=(?:"[^"]*"|'[^']*'))?\)/gm;

function getEmbedMarkup(rawUrl: string): string {
  try {
    const parsedUrl = new URL(rawUrl);
    if (
      parsedUrl.hostname === "codesandbox.io" &&
      parsedUrl.pathname.startsWith("/embed/")
    ) {
      return `<div class="blog-embed" data-embed-source="codesandbox"><iframe src="${parsedUrl}" loading="lazy" title="Embedded sandbox" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe></div>`;
    }
    return `<p><a href="${parsedUrl}" target="_blank" rel="noreferrer">${parsedUrl}</a></p>`;
  } catch {
    return rawUrl;
  }
}

// ── Math preprocessing ────────────────────────────────────────────────────────

// remark-math v6 requires $$ to be on its own line for multiline blocks.
// Obsidian often writes $$\begin{env} or \end{env}$$ on the same line.
// This normalises them so remark-math parses the blocks correctly.
function normalizeMathDelimiters(markdown: string): string {
  return (
    markdown
      // (indent)$$\begin{env} → (indent)$$\n(indent)\begin{env}
      // m flag + ^(\s*) captures leading indent so the split lines stay aligned
      .replace(
        /^(\s*)\$\$(\\[a-zA-Z])/gm,
        (_, indent: string, cap: string) => `${indent}$$\n${indent}${cap}`,
      )
      // (indent)\end{env}$$ → (indent)\end{env}\n(indent)$$
      .replace(
        /^(\s*)(\\end\{[^}]+\})\s*\$\$/gm,
        (_, indent: string, end: string) => `${indent}${end}\n${indent}$$`,
      )
  );
}

// Inside each $$ ... $$ block:
//   gather/align/equation/multline → starred variants (no equation numbers)
//   \displaylines{ ... } (closing } on its own line) → \begin{gathered}...\end{gathered}
//   \gt → >   \lt → <   (not KaTeX commands; JS/HTML comparison operators)
function preprocessMathBlocks(markdown: string): string {
  return markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math: string) => {
    const m = math
      .replace(/\\begin\{(gather|align|equation|multline)\}/g, "\\begin{$1*}")
      .replace(/\\end\{(gather|align|equation|multline)\}/g, "\\end{$1*}")
      // \displaylines{\n...\n} where the closing } is alone on its line
      .replace(
        /\\displaylines\s*\{\s*\n([\s\S]*?)\n\s*\}/g,
        "\\begin{gathered}\n$1\n\\end{gathered}",
      )
      // HTML/JS comparison operators used in LaTeX — not valid KaTeX
      .replace(/\\gt\b/g, ">")
      .replace(/\\lt\b/g, "<");
    return `$$${m}$$`;
  });
}

function transformMarkdown(markdown: string, slug: string): string {
  return rewriteLocalImages(
    preprocessMathBlocks(
      normalizeMathDelimiters(
        markdown
          .replace(
            IMAGE_WITH_ALIGN_PATTERN,
            (_m, alt: string, url: string) => `![${alt}](${url})`,
          )
          .replace(
            IMAGE_SPLIT_LINE_PATTERN,
            (_m, alt: string, url: string) => `![${alt}](${url})`,
          )
          .replace(EMBED_PATTERN, (_, url: string) => getEmbedMarkup(url)),
      ),
    ),
    slug,
  );
}

// ── Heading utilities ─────────────────────────────────────────────────────────
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
// and stripping markdown decoration (*_`~[]) from the surrounding plain text.
// Keeps the raw math expression (underscores intact) in `plain` so slugs stay
// unique and stable; renders proper glyphs (e.g. subscripts) into `html`.
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
  let inCode = false;
  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (m) {
      const level = m[1].length;
      const { plain, html } = parseHeadingText(m[2]);
      headings.push({ level, text: plain, html, id: slugifyHeading(plain) });
    }
  }
  return headings;
}

// Assigns heading DOM ids by document-order index into `headings` rather than
// re-deriving the slug from the rendered (post-KaTeX) hast tree — the KaTeX
// output text doesn't reliably round-trip through the same slugify logic, so
// index-based lookup is what keeps these ids in sync with the TOC's ids.
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

function normalizeImageSrc(src: unknown): string | null {
  if (typeof src !== "string" || !src) return null;
  if (src.startsWith("/")) return src;
  try {
    const p = new URL(src);
    if (p.protocol !== "http:" && p.protocol !== "https:") return null;
    return p.toString();
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
      const imageSource = normalizeImageSrc(src);
      if (!imageSource) return null;
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

// ── Data loading ──────────────────────────────────────────────────────────────
type LocalMeta = {
  title?: string;
  publishedAt?: string;
  readTimeInMinutes?: number;
};

const IMAGE_EXT_RE = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

function loadLocalPost(slug: string): {
  title: string;
  publishedAt: string | null;
  readTimeInMinutes: number | null;
  markdown: string;
  coverImage: string | null;
} | null {
  const base = path.join(process.cwd(), "tmp", slug);
  const mdPath = path.join(base, "index.md");

  if (!fs.existsSync(mdPath)) return null;

  const markdown = fs.readFileSync(mdPath, "utf-8");

  let meta: LocalMeta = {};
  const metaPath = path.join(base, "meta.json");
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as LocalMeta;
    } catch {
      // ignore malformed meta
    }
  }

  const files = fs.existsSync(base) ? fs.readdirSync(base) : [];
  const coverImage = files.find((f) => f.startsWith("cover.") && IMAGE_EXT_RE.test(f)) ?? null;

  return {
    title: meta.title ?? slug,
    publishedAt: meta.publishedAt ?? null,
    readTimeInMinutes: meta.readTimeInMinutes ?? null,
    markdown,
    coverImage,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default async function BlogPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { slug } = await params;
  const post = loadLocalPost(slug);

  if (!post) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-28 pt-20 text-foreground">
        <p className="text-sm text-muted-foreground">
          No local post found at <code>tmp/{slug}/index.md</code>.
        </p>
      </section>
    );
  }

  const markdown = transformMarkdown(post.markdown, slug);
  const tocHeadings = parseHeadings(markdown);
  const markdownComponents = createMarkdownComponents(tocHeadings);

  const formattedDate = post.publishedAt
    ? (() => {
        try {
          return dateFormatter.format(new Date(post.publishedAt));
        } catch {
          return post.publishedAt;
        }
      })()
    : null;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-28 pt-20 text-foreground">
      {/* Preview banner */}
      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
        <span className="font-semibold">LOCAL PREVIEW</span>
        <span className="text-amber-400/60">·</span>
        <span className="font-mono text-amber-400/80">tmp/{slug}/index.md</span>
        <span className="text-amber-400/60">·</span>
        <span className="text-amber-400/60">not published</span>
      </div>

      <div className="flex w-full flex-col items-start gap-10">
        {post.coverImage ? (
          // Full-bleed hero with the title overlaid; article content follows below.
          <section className="relative left-1/2 min-h-[560px] w-screen -translate-x-1/2 md:h-[100svh]">
            <Image
              src={`/api/blog/preview/${slug}/${post.coverImage}`}
              alt={post.title}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/5" />
            <div className="absolute inset-x-0 bottom-0 z-10 pb-14">
              <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6">
                <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
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
            </div>
          </section>
        ) : (
          <header className="mx-auto w-full max-w-3xl space-y-4">
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
          </header>
        )}
        <div className="relative mx-auto w-full max-w-3xl">
          <div className="absolute left-full top-0 hidden h-full pl-6 xl:block">
            <div className="sticky top-24">
              <TocRail headings={tocHeadings} />
            </div>
          </div>
          <article className="flex w-full flex-col gap-10">
          <TableOfContents headings={tocHeadings} />
          <div className="blog-markdown prose prose-neutral max-w-none dark:prose-invert prose-a:font-medium prose-a:text-foreground prose-a:underline-offset-4">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm, remarkCallout]}
              rehypePlugins={[
                rehypeRaw,
                [
                  rehypeKatex,
                  {
                    throwOnError: false,
                    strict: false,
                    // Obsidian uses MathJax which supports \displaylines; KaTeX doesn't.
                    // Fallback: treat it as \begin{gathered}...\end{gathered}.
                    macros: {
                      "\\displaylines":
                        "\\begin{gathered}#1\\end{gathered}",
                    },
                  },
                ],
              ]}
              components={markdownComponents}
            >
              {markdown}
            </ReactMarkdown>
          </div>
          </article>
        </div>
      </div>
    </section>
  );
}

import "katex/dist/katex.min.css";

import fs from "fs";
import path from "path";

import { Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import TableOfContents, { type TocHeading } from "@/components/TableOfContents";
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
    let m = math
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

function hastToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: string; value?: string; children?: unknown[] };
  if (n.type === "text" && typeof n.value === "string") return n.value;
  if (Array.isArray(n.children)) return n.children.map(hastToText).join("");
  return "";
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
      const text = m[2].replace(/[*_`~[\]]/g, "").trim();
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
    return <Tag id={slugifyHeading(hastToText(node))}>{children}</Tag>;
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

const markdownComponents: Components = {
  h1: makeHeading("h1"),
  h2: makeHeading("h2"),
  h3: makeHeading("h3"),
  h4: makeHeading("h4"),
  h5: makeHeading("h5"),
  h6: makeHeading("h6"),
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

// ── Data loading ──────────────────────────────────────────────────────────────
type LocalMeta = {
  title?: string;
  publishedAt?: string;
  readTimeInMinutes?: number;
};

function loadLocalPost(slug: string): {
  title: string;
  publishedAt: string | null;
  readTimeInMinutes: number | null;
  markdown: string;
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

  return {
    title: meta.title ?? slug,
    publishedAt: meta.publishedAt ?? null,
    readTimeInMinutes: meta.readTimeInMinutes ?? null,
    markdown,
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

      <div className="flex w-full flex-col items-start gap-6">
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
          </header>
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
    </section>
  );
}

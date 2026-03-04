"use client";

import { gql } from "@apollo/client";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import LikeButton from "@/components/LikeButton";
import type {
  PostIdBySlugQuery,
  PostIdBySlugQueryVariables,
  PostByIdQuery,
  PostByIdQueryVariables,
} from "@/lib/graphql/generated";

const POST_ID_BY_SLUG_QUERY = gql`
  query PostIdBySlug($host: String!, $slug: String!) {
    publication(host: $host) {
      id
      post(slug: $slug) {
        id
        slug
      }
    }
  }
`;

const POST_BY_ID_QUERY = gql`
  query PostById($id: ID!) {
    post(id: $id) {
      id
      title
      brief
      slug
      url
      publishedAt
      readTimeInMinutes
      coverImage {
        url
      }
      content {
        markdown
      }
    }
  }
`;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

const HASHNODE_EMBED_PATTERN = /^\s*%\[(https?:\/\/[^\]\s]+)\]\s*$/gm;

type BlogPostDetailApolloLoggerProps = {
  publicationHost: string;
  slug: string;
};

type PostCacheEntity = {
  __typename?: string;
  id?: unknown;
  slug?: unknown;
};

function resolvePostIdBySlug(cache: unknown, slug: string): string | null {
  if (!cache || typeof cache !== "object") {
    return null;
  }

  for (const entity of Object.values(cache as Record<string, unknown>)) {
    if (!entity || typeof entity !== "object") {
      continue;
    }

    const post = entity as PostCacheEntity;
    if (post.__typename !== "Post" || post.slug !== slug) {
      continue;
    }

    return typeof post.id === "string" ? post.id : null;
  }

  return null;
}

function getEmbedMarkup(rawUrl: string): string {
  try {
    const parsedUrl = new URL(rawUrl);

    if (
      parsedUrl.hostname === "codesandbox.io" &&
      parsedUrl.pathname.startsWith("/embed/")
    ) {
      const src = parsedUrl.toString();
      return `<div class="hashnode-embed" data-embed-source="codesandbox"><iframe src="${src}" loading="lazy" title="Embedded sandbox" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe></div>`;
    }

    const href = parsedUrl.toString();
    return `<p><a href="${href}" target="_blank" rel="noreferrer">${href}</a></p>`;
  } catch {
    return rawUrl;
  }
}

function transformHashnodeMarkdown(markdown: string): string {
  return markdown.replace(HASHNODE_EMBED_PATTERN, (_, url: string) =>
    getEmbedMarkup(url),
  );
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
  img: ({ src, alt }) => {
    const imageSource = normalizeImageSource(src);
    if (!imageSource) {
      return null;
    }

    return (
      <span className="not-prose my-6 block overflow-hidden rounded-2xl border border-border/70 bg-card">
        <Image
          src={imageSource}
          alt={alt ?? ""}
          width={1600}
          height={900}
          sizes="(max-width: 768px) 100vw, 768px"
          className="h-auto w-full"
        />
      </span>
    );
  },
};

function GoBackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="self-start text-sm text-muted-foreground"
      style={{ textUnderlineOffset: "4px" }}
      whileHover={{ color: "rgb(147, 197, 253)", textDecoration: "underline" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      Go back
    </motion.button>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="h-6 w-40 animate-pulse rounded-full bg-foreground/10" />
      <div className="h-10 w-3/4 animate-pulse rounded-full bg-foreground/10" />
      <div className="h-5 w-full animate-pulse rounded-full bg-foreground/10" />
      <div className="aspect-[16/9] w-full animate-pulse rounded-3xl bg-foreground/10" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`post-skeleton-${index}`}
            className="h-4 w-full animate-pulse rounded-full bg-foreground/10"
          />
        ))}
      </div>
    </div>
  );
}

export default function BlogPostDetailApolloLogger({
  publicationHost,
  slug,
}: BlogPostDetailApolloLoggerProps) {
  const router = useRouter();
  const client = useApolloClient();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);
  const cachedPostId = hasHydrated
    ? resolvePostIdBySlug(client.cache.extract(), slug)
    : null;

  const {
    data: postIdBySlugData,
    loading: postIdBySlugLoading,
    error: postIdBySlugError,
  } = useQuery<PostIdBySlugQuery, PostIdBySlugQueryVariables>(POST_ID_BY_SLUG_QUERY, {
    variables: { host: publicationHost, slug },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    skip: !hasHydrated || Boolean(cachedPostId),
  });

  const postIdFromList = postIdBySlugData?.publication?.post?.id ?? null;

  const postId = cachedPostId ?? postIdFromList;

  const { data, loading, error } = useQuery<
    PostByIdQuery,
    PostByIdQueryVariables
  >(POST_BY_ID_QUERY, {
    variables: { id: postId ?? "" },
    skip: !hasHydrated || !postId,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  if (!hasHydrated) {
    return <PostDetailSkeleton />;
  }

  if (postIdBySlugLoading && !postId) {
    return <PostDetailSkeleton />;
  }

  if (postIdBySlugError) {
    return <p className="text-sm text-muted-foreground">{postIdBySlugError.message}</p>;
  }

  if (!postId) {
    return (
      <div className="flex w-full flex-col items-start gap-6 text-muted-foreground">
        <GoBackButton onClick={() => router.back()} />
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <p className="text-sm">We couldn&apos;t find this post.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error.message}</p>;
  }

  const post = data?.post ?? null;

  if (!post || post.slug !== slug) {
    return (
      <div className="flex w-full flex-col items-start gap-6 text-muted-foreground">
        <GoBackButton onClick={() => router.back()} />
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
    ? transformHashnodeMarkdown(post.content.markdown)
    : null;

  return (
    <div className="flex w-full flex-col items-start gap-6 text-foreground">
      <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
        <GoBackButton onClick={() => router.back()} />
        {post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
          >
            View on Hashnode
            <ArrowUpRight className="size-3.5" />
          </a>
        ) : null}
      </div>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Blog Post
            </p>
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
            <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5">
              <Image
                src={post.coverImage.url}
                alt={post.title}
                width={1600}
                height={900}
                sizes="(max-width: 1024px) 100vw, 960px"
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}
        </header>
        <div className="blog-markdown prose prose-neutral max-w-none dark:prose-invert prose-a:font-medium prose-a:text-foreground prose-a:underline-offset-4">
          {markdownContent ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
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
          <LikeButton postId={post.id ?? post.slug} />
          <span className="h-px flex-1 bg-border/70" />
        </div>
      </article>
    </div>
  );
}

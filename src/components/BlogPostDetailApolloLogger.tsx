"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

import type {
  UserPostBySlugQuery,
  UserPostBySlugQueryVariables,
} from "@/lib/graphql/generated";
const POST_QUERY = gql`
  query UserPostBySlug($username: String!, $page: Int!, $pageSize: Int!) {
    user(username: $username) {
      id
      posts(page: $page, pageSize: $pageSize) {
        edges {
          node {
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
              html
            }
          }
        }
      }
    }
  }
`;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

type BlogPostDetailApolloLoggerProps = {
  username: string;
  slug: string;
};

export default function BlogPostDetailApolloLogger({
  username,
  slug,
}: BlogPostDetailApolloLoggerProps) {
  const router = useRouter();
  const { data, loading, error } = useQuery<
    UserPostBySlugQuery,
    UserPostBySlugQueryVariables
  >(POST_QUERY, {
    variables: { username, page: 1, pageSize: 20 },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  if (loading) {
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

  if (error) {
    return <p className="text-sm text-muted-foreground">{error.message}</p>;
  }

  const post =
    data?.user?.posts?.edges?.map((edge) => edge.node).find((node) => node?.slug === slug) ??
    null;

  if (!post) {
    return (
      <div className="flex w-full flex-col items-start gap-6 text-muted-foreground">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:underline self-start"
          style={{ textUnderlineOffset: "4px" }}
        >
          Go back
        </button>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <p className="text-sm">We couldn&apos;t find this post.</p>
        </div>
      </div>
    );
  }

  const formattedDate = post.publishedAt
    ? dateFormatter.format(new Date(post.publishedAt))
    : null;

  return (
    <div className="flex w-full flex-col items-start gap-6 text-foreground">
      <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:underline self-start"
          style={{ textUnderlineOffset: "4px" }}
        >
          Go back
        </button>
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
            {post.brief ? (
              <p className="text-base text-muted-foreground md:text-lg">
                {post.brief}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {formattedDate ? <span>{formattedDate}</span> : null}
              {formattedDate && post.readTimeInMinutes ? (
                <span aria-hidden="true">•</span>
              ) : null}
              {post.readTimeInMinutes ? (
                <span>{post.readTimeInMinutes} min read</span>
              ) : null}
            </div>
          </div>
          {post.coverImage?.url ? (
            <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5">
              <img
                src={post.coverImage.url}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </header>
        <div className="prose prose-neutral max-w-none dark:prose-invert prose-a:font-medium prose-a:text-foreground prose-a:underline-offset-4 prose-pre:bg-foreground/5">
          {post.content?.html ? (
            <div dangerouslySetInnerHTML={{ __html: post.content.html }} />
          ) : (
            <p className="text-sm text-muted-foreground">No content available.</p>
          )}
        </div>
      </article>
    </div>
  );
}

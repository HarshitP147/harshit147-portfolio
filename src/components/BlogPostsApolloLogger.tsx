"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { BlogPostCard, BlogPostCardSkeleton } from "@/components/BlogPostCard";

type BlogPostsApolloLoggerProps = {
  publicationHost: string;
};

const PUBLICATION_POSTS_QUERY = gql`
  query PublicationPosts($host: String!, $first: Int!) {
    publication(host: $host) {
      id
      title
      posts(first: $first) {
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
          }
        }
      }
    }
  }
`;

export default function BlogPostsApolloLogger({ publicationHost }: BlogPostsApolloLoggerProps) {
  const { data, error, refetch } = useQuery(PUBLICATION_POSTS_QUERY, {
    variables: { host: publicationHost, first: 50 },
    fetchPolicy: "cache-only",
  });
  const [isFetching, setIsFetching] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const cachedPosts = data?.publication?.posts?.edges ?? [];
  const hasCachedPosts = cachedPosts.length > 0;

  useEffect(() => {
    console.log("[Hashnode] Apollo response:", { error, data });
  }, [error, data]);

  useEffect(() => {
    if (hasCachedPosts || hasAttemptedFetch || error) {
      return;
    }

    setHasAttemptedFetch(true);
    setIsFetching(true);

    refetch({ host: publicationHost, first: 50 })
      .catch(() => undefined)
      .finally(() => setIsFetching(false));
  }, [error, hasAttemptedFetch, hasCachedPosts, publicationHost, refetch]);

  if (isFetching && !hasCachedPosts) {
    return (
      <div className="grid gap-y-6 gap-x-8 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <BlogPostCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error.message}</p>;
  }

  const posts =
    cachedPosts
      ?.map(
        (edge: {
          node?: {
            id: string;
            title: string;
            brief?: string | null;
            slug?: string | null;
            publishedAt?: string | null;
            readTimeInMinutes?: number | null;
            coverImage?: { url?: string | null } | null;
          } | null;
        }) => edge?.node,
      )
      .filter(
        (node: { id?: string; slug?: string | null } | null | undefined): node is {
          id: string;
          title: string;
          brief?: string | null;
          slug: string;
          publishedAt?: string | null;
          readTimeInMinutes?: number | null;
          coverImage?: { url?: string | null } | null;
        } => Boolean(node?.id && node?.slug),
      ) ?? [];

  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">No posts found yet.</p>;
  }

  return (
    <div className="grid gap-y-6 gap-x-8 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <BlogPostCard
          key={post.id}
          title={post.title}
          slug={post.slug}
          brief={post.brief}
          coverImageUrl={post.coverImage?.url ?? null}
          publishedAt={post.publishedAt ?? null}
          readTimeInMinutes={post.readTimeInMinutes ?? null}
        />
      ))}
    </div>
  );
}

"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
            url
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
          <Card
            key={`skeleton-${index}`}
            className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5"
          >
            <div className="h-32 w-full animate-pulse bg-foreground/10" />
            <CardContent className="space-y-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-foreground/10" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-foreground/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error.message}</p>;
  }

  const posts =
    cachedPosts
      ?.map((edge: { node?: { id: string; title: string; coverImage?: { url?: string | null } | null } | null }) => edge?.node)
      .filter((node: { id?: string } | null | undefined): node is { id: string; title: string; coverImage?: { url?: string | null } | null } => Boolean(node?.id)) ?? [];

  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">No posts found yet.</p>;
  }

  return (
    <div className="grid gap-y-6 gap-x-8 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5"
        >
          <div className="h-32 w-full bg-foreground/10">
            {post.coverImage?.url ? (
              <img
                src={post.coverImage.url}
                alt={post.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <CardHeader className="p-3">
            <h2 className="text-sm font-semibold">{post.title}</h2>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

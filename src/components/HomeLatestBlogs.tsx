"use client";

import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client/react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

type HomeLatestBlogsProps = {
  publicationHost: string;
};

const LATEST_POSTS_QUERY = gql`
  query LatestPosts($host: String!, $first: Int!) {
    publication(host: $host) {
      id
      posts(first: $first) {
        edges {
          node {
            id
            title
            coverImage {
              url
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export default function HomeLatestBlogs({ publicationHost }: HomeLatestBlogsProps) {
  const { data, loading, error } = useQuery(LATEST_POSTS_QUERY, {
    variables: { host: publicationHost, first: 3 },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Blogs</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`home-skeleton-${index}`}
              className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5"
            >
              <div className="h-28 w-full animate-pulse bg-foreground/10" />
              <CardContent className="space-y-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-foreground/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error.message}</p>;
  }

  const posts =
    data?.publication?.posts?.edges
      ?.map((edge: { node?: { id: string; title: string; coverImage?: { url?: string | null } | null } | null }) => edge?.node)
      .filter((node: { id?: string } | null | undefined): node is { id: string; title: string; coverImage?: { url?: string | null } | null } => Boolean(node?.id)) ?? [];

  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">No posts yet.</p>;
  }

  const hasMore = Boolean(data?.publication?.posts?.pageInfo?.hasNextPage);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <h2 className="text-lg font-semibold">My Blogs</h2>
        {hasMore ? (
          <motion.a
            href="/blog"
            className="hidden text-sm text-muted-foreground md:inline-flex"
            whileHover={{ color: "rgb(147, 197, 253)", textDecoration: "underline" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ textUnderlineOffset: "4px" }}
          >
            Read more
          </motion.a>
        ) : null}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5"
          >
            <div className="h-28 w-full bg-foreground/10">
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
              <h3 className="text-sm font-semibold">{post.title}</h3>
            </CardHeader>
          </Card>
        ))}
      </div>
      {hasMore ? (
        <div className="flex justify-center md:hidden">
          <motion.a
            href="/blog"
            className="text-sm text-muted-foreground"
            whileHover={{ color: "rgb(147, 197, 253)", textDecoration: "underline" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ textUnderlineOffset: "4px" }}
          >
            Read more
          </motion.a>
        </div>
      ) : null}
    </div>
  );
}

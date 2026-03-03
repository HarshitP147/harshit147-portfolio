"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { motion } from "framer-motion";

import { BlogPostCard, BlogPostCardSkeleton } from "@/components/BlogPostCard";
import type {
  UserLatestPostsQuery,
  UserLatestPostsQueryVariables,
} from "@/lib/graphql/generated";

type HomeLatestBlogsProps = {
  username: string;
};

const LATEST_POSTS_QUERY = gql`
  query UserLatestPosts($username: String!, $page: Int!, $pageSize: Int!) {
    user(username: $username) {
      id
      posts(page: $page, pageSize: $pageSize) {
        edges {
          node {
            id
            title
            brief
            slug
            publishedAt
            readTimeInMinutes
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

export default function HomeLatestBlogs({ username }: HomeLatestBlogsProps) {
  const { data, loading, error } = useQuery<
    UserLatestPostsQuery,
    UserLatestPostsQueryVariables
  >(LATEST_POSTS_QUERY, {
    variables: { username, page: 1, pageSize: 3 },
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
            <BlogPostCardSkeleton key={`home-skeleton-${index}`} size="compact" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error.message}</p>;
  }

  const posts =
    data?.user?.posts?.edges
      ?.map((edge) => edge.node)
      .filter((node) => Boolean(node?.id && node?.slug)) ?? [];

  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">No posts yet.</p>;
  }

  const hasMore = Boolean(data?.user?.posts?.pageInfo?.hasNextPage);

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
      <div
        className={
          posts.length < 3
            ? "flex flex-wrap justify-center gap-6"
            : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {posts.map((post) => (
          <BlogPostCard
            key={post.id}
            title={post.title}
            slug={post.slug}
            brief={post.brief}
            coverImageUrl={post.coverImage?.url ?? null}
            publishedAt={post.publishedAt ?? null}
            readTimeInMinutes={post.readTimeInMinutes ?? null}
            size="compact"
            className={posts.length < 3 ? "w-full max-w-[360px]" : undefined}
          />
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

"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { BlogPostCard, BlogPostCardSkeleton } from "@/components/BlogPostCard";
import type {
  UserPostsQuery,
  UserPostsQueryVariables,
} from "@/lib/graphql/generated";

type BlogPostsApolloLoggerProps = {
  username: string;
};

const PUBLICATION_POSTS_QUERY = gql`
  query UserPosts($username: String!, $page: Int!, $pageSize: Int!) {
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
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export default function BlogPostsApolloLogger({ username }: BlogPostsApolloLoggerProps) {
  const { data, error, refetch } = useQuery<
    UserPostsQuery,
    UserPostsQueryVariables
  >(PUBLICATION_POSTS_QUERY, {
    variables: { username, page: 1, pageSize: 50 },
    fetchPolicy: "cache-only",
  });
  const [isFetching, setIsFetching] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const cachedPosts = data?.user?.posts?.edges ?? [];
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

    refetch({ username, page: 1, pageSize: 50 })
      .catch(() => undefined)
      .finally(() => setIsFetching(false));
  }, [error, hasAttemptedFetch, hasCachedPosts, username, refetch]);

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
      ?.map((edge) => edge.node)
      .filter((node) => Boolean(node?.id && node?.slug)) ?? [];

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

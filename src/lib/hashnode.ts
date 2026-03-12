type HashnodePost = {
  id: string;
  title: string;
  brief: string;
  url: string;
  slug: string;
  publishedAt: string;
  readTimeInMinutes: number;
  coverImage?: {
    url: string;
  } | null;
};

type HashnodePostDetail = HashnodePost & {
  content?: {
    markdown?: string | null;
  } | null;
};

type HashnodeUserResponse = {
  data?: {
    user?: {
      name?: string;
      posts?: {
        edges?: Array<{
          node?: HashnodePost;
        }>;
        pageInfo?: {
          hasNextPage?: boolean | null;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
};

type HashnodePostDetailResponse = {
  data?: {
    publication?: {
      post?: HashnodePostDetail | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const HASHNODE_GQL_ENDPOINT = process.env.HASHNODE_GQL_ENDPOINT ?? "https://gql.hashnode.com";
const HASHNODE_USERNAME = process.env.HASHNODE_USERNAME ?? process.env.NEXT_PUBLIC_HASHNODE_USERNAME;
const HASHNODE_PUBLICATION_HOST =
  process.env.HASHNODE_PUBLICATION_HOST ??
  process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;

export type HashnodePostSummary = HashnodePost;

export async function fetchHashnodePosts({
  first = 20,
  username,
}: {
  first?: number;
  username?: string | null;
} = {}): Promise<{
  authorName: string | null;
  posts: HashnodePostSummary[];
  hasNextPage: boolean;
}> {
  const resolvedUsername = username ?? HASHNODE_USERNAME ?? null;

  if (!resolvedUsername) {
    return { authorName: null, posts: [], hasNextPage: false };
  }

  const query = `
    query UserPosts($username: String!, $page: Int!, $pageSize: Int!) {
      user(username: $username) {
        name
        posts(page: $page, pageSize: $pageSize) {
          edges {
            node {
              id
              title
              brief
              url
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

  const response = await fetch(HASHNODE_GQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { username: resolvedUsername, page: 1, pageSize: first },
    }),
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    throw new Error(`Hashnode API error: ${response.status}`);
  }

  const payload = (await response.json()) as HashnodeUserResponse;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  const authorName = payload.data?.user?.name ?? null;
  const posts =
    payload.data?.user?.posts?.edges
      ?.map((edge) => edge.node)
      .filter((node): node is HashnodePost => Boolean(node)) ?? [];
  const hasNextPage = Boolean(payload.data?.user?.posts?.pageInfo?.hasNextPage);

  return { authorName, posts, hasNextPage };
}

export async function fetchHashnodePostBySlug({
  slug,
  host,
}: {
  slug: string;
  host?: string | null;
}): Promise<HashnodePostDetail | null> {
  const resolvedHost = host ?? HASHNODE_PUBLICATION_HOST ?? null;

  if (!resolvedHost) {
    return null;
  }

  const query = `
    query PostBySlug($host: String!, $slug: String!) {
      publication(host: $host) {
        post(slug: $slug) {
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
    }
  `;

  const response = await fetch(HASHNODE_GQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { host: resolvedHost, slug },
    }),
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    throw new Error(`Hashnode API error: ${response.status}`);
  }

  const payload = (await response.json()) as HashnodePostDetailResponse;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  return payload.data?.publication?.post ?? null;
}

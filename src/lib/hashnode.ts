type HashnodePost = {
  id: string;
  title: string;
  brief: string;
  url: string;
  slug: string;
  publishedAt: string;
  readTimeInMinutes: number;
};

type HashnodeUserResponse = {
  data?: {
    user?: {
      name?: string;
      posts?: {
        edges?: Array<{
          node?: HashnodePost;
        }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

const HASHNODE_GQL_ENDPOINT = process.env.HASHNODE_GQL_ENDPOINT ?? "https://gql.hashnode.com";
const HASHNODE_USERNAME = process.env.HASHNODE_USERNAME;

export type HashnodePostSummary = HashnodePost;

export async function fetchHashnodePosts(first = 20): Promise<{
  authorName: string | null;
  posts: HashnodePostSummary[];
}> {
  if (!HASHNODE_USERNAME) {
    return { authorName: null, posts: [] };
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
            }
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
      variables: { username: HASHNODE_USERNAME, page: 1, pageSize: first },
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

  return { authorName, posts };
}

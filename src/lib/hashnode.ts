type HashnodePost = {
  id: string;
  title: string;
  brief: string;
  url: string;
};

type HashnodePublicationResponse = {
  data?: {
    publication?: {
      title?: string;
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
const HASHNODE_PUBLICATION_HOST = process.env.HASHNODE_PUBLICATION_HOST;

export type HashnodePostSummary = HashnodePost;

export async function fetchHashnodePosts(first = 50): Promise<{
  publicationTitle: string | null;
  posts: HashnodePostSummary[];
}> {
  if (!HASHNODE_PUBLICATION_HOST) {
    return { publicationTitle: null, posts: [] };
  }

  const query = `
    query PublicationPosts($host: String!, $first: Int!) {
      publication(host: $host) {
        title
        posts(first: $first) {
          edges {
            node {
              id
              title
              brief
              url
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
      variables: { host: HASHNODE_PUBLICATION_HOST, first },
    }),
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    throw new Error(`Hashnode API error: ${response.status}`);
  }

  const payload = (await response.json()) as HashnodePublicationResponse;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  const publicationTitle = payload.data?.publication?.title ?? null;
  const posts =
    payload.data?.publication?.posts?.edges
      ?.map((edge) => edge.node)
      .filter((node): node is HashnodePost => Boolean(node)) ?? [];

  return { publicationTitle, posts };
}

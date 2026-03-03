import { ApolloLink, HttpLink, Observable, from } from "@apollo/client";
import type { NormalizedCacheObject } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";

const HASHNODE_GQL_ENDPOINT =
  process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT ?? "https://gql.hashnode.com";
const CACHE_KEY = "apollo-cache-v1";

let browserClient: ApolloClient<NormalizedCacheObject> | null = null;

function createCache() {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          publication: {
            keyArgs: ["host"],
          },
        },
      },
      Publication: {
        keyFields: ["id"],
        fields: {
          posts: {
            keyArgs: ["first"],
            merge: false,
          },
        },
      },
      Post: {
        keyFields: ["id"],
      },
    },
  });
}

export function createApolloClient() {
  if (typeof window !== "undefined" && browserClient) {
    return browserClient;
  }

  const cache = createCache();

  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(CACHE_KEY);
      if (stored) {
        cache.restore(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Apollo cache restore failed", error);
    }
  }

  const httpLink = new HttpLink({
    uri: HASHNODE_GQL_ENDPOINT,
  });

  const persistLink =
    typeof window !== "undefined"
      ? new ApolloLink((operation, forward) => {
          if (!forward) {
            return null;
          }
          return new Observable((observer) => {
            const subscription = forward(operation).subscribe({
              next: (result) => {
                try {
                  window.localStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify(cache.extract()),
                  );
                } catch (error) {
                  console.warn("Apollo cache persist failed", error);
                }
                observer.next(result);
              },
              error: (error) => observer.error(error),
              complete: () => observer.complete(),
            });

            return () => subscription.unsubscribe();
          });
        })
      : null;

  const link = persistLink ? from([persistLink, httpLink]) : httpLink;

  const client = new ApolloClient({
    cache,
    link,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-first",
      },
    },
  });

  if (typeof window !== "undefined") {
    browserClient = client;
  }

  return client;
}

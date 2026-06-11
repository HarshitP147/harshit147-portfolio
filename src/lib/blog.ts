import { unstable_cache } from "next/cache";
import Cloudflare from "cloudflare";

// Blog data layer — reads metadata from Cloudflare D1 and markdown/images
// from Cloudflare R2.

export const BLOG_LIST_TAG = "blog:list";
export const blogPostTag = (slug: string) => `blog:post:${slug}`;

type BlogPost = {
  id: string;
  title: string;
  url: string;
  slug: string;
  publishedAt: string;
  readTimeInMinutes: number;
  coverImage?: {
    url: string;
  } | null;
};

type BlogPostDetail = BlogPost & {
  content?: {
    markdown?: string | null;
  } | null;
};

export type BlogPostSummary = BlogPost;

type PostRow = {
  id: string;
  slug: string;
  title: string;
  published_at: string;
  date_modified: string;
  read_time_minutes: number;
  cover_image_key: string;
  content_key: string;
};

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID;
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL;

const REVALIDATE_SECONDS = 600;
const LIST_REVALIDATE_SECONDS = 3600;
const POST_REVALIDATE_SECONDS = 3600;

let cachedClient: Cloudflare | null = null;
function getClient(): Cloudflare {
  if (!CLOUDFLARE_API_TOKEN) {
    throw new Error("Missing CLOUDFLARE_API_TOKEN");
  }
  cachedClient ??= new Cloudflare({ apiToken: CLOUDFLARE_API_TOKEN });
  return cachedClient;
}

function r2Url(key: string): string {
  if (!R2_PUBLIC_BASE_URL) {
    throw new Error("Missing R2_PUBLIC_BASE_URL");
  }
  return `${R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}

async function queryD1<T>(sql: string, params: string[] = []): Promise<T[]> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_D1_DATABASE_ID) {
    throw new Error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_D1_DATABASE_ID",
    );
  }

  const client = getClient();
  // query() returns a paginated page of per-statement QueryResult objects; we
  // only ever send a single statement.
  const page = await client.d1.database.query(CLOUDFLARE_D1_DATABASE_ID, {
    account_id: CLOUDFLARE_ACCOUNT_ID,
    sql,
    params,
  });

  for await (const statement of page) {
    return ((statement?.results ?? []) as T[]) ?? [];
  }
  return [];
}

function rowToSummary(row: PostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    url: `/blog/${row.slug}`,
    slug: row.slug,
    publishedAt: row.published_at,
    readTimeInMinutes: row.read_time_minutes,
    coverImage: row.cover_image_key
      ? { url: r2Url(row.cover_image_key) }
      : null,
  };
}

async function fetchBlogPostsUncached({
  first = 20,
}: {
  first?: number;
} = {}): Promise<{
  authorName: string | null;
  posts: BlogPostSummary[];
  hasNextPage: boolean;
}> {
  const rows = await queryD1<PostRow>(
    "SELECT id, slug, title, published_at, date_modified, read_time_minutes, cover_image_key, content_key FROM posts ORDER BY published_at DESC LIMIT ?",
    [String(first + 1)],
  );

  const hasNextPage = rows.length > first;
  const posts = rows.slice(0, first).map(rowToSummary);

  return { authorName: null, posts, hasNextPage };
}

export const fetchBlogPosts = unstable_cache(
  fetchBlogPostsUncached,
  ["blog:list"],
  { revalidate: LIST_REVALIDATE_SECONDS, tags: [BLOG_LIST_TAG] },
);

async function fetchBlogPostBySlugUncached({
  slug,
}: {
  slug: string;
}): Promise<BlogPostDetail | null> {
  const rows = await queryD1<PostRow>(
    "SELECT id, slug, title, published_at, date_modified, read_time_minutes, cover_image_key, content_key FROM posts WHERE slug = ? LIMIT 1",
    [slug],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const markdownResponse = await fetch(r2Url(row.content_key), {
    next: {
      revalidate: REVALIDATE_SECONDS,
      tags: [blogPostTag(slug)],
    },
  });

  if (!markdownResponse.ok) {
    throw new Error(
      `Failed to load post content (${markdownResponse.status})`,
    );
  }

  const markdown = await markdownResponse.text();

  return {
    ...rowToSummary(row),
    content: { markdown },
  };
}

export async function fetchBlogPostBySlug({
  slug,
}: {
  slug: string;
}): Promise<BlogPostDetail | null> {
  const cached = unstable_cache(
    () => fetchBlogPostBySlugUncached({ slug }),
    ["blog:post", slug],
    {
      revalidate: POST_REVALIDATE_SECONDS,
      tags: [blogPostTag(slug), BLOG_LIST_TAG],
    },
  );
  return cached();
}

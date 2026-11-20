import type { MetadataRoute } from "next";

import { fetchBlogPosts } from "@/lib/blog";

const SITE_URL = "https://harshit147.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Don't fail the whole sitemap (or the build) if D1 is unreachable.
  try {
    const { posts } = await fetchBlogPosts({ first: 50 });
    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
      changeFrequency: "yearly",
      priority: 0.6,
    }));
    return [...staticEntries, ...postEntries];
  } catch (error) {
    console.error("[sitemap] Failed to load blog posts:", error);
    return staticEntries;
  }
}

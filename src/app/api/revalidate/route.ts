import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { BLOG_LIST_TAG, blogPostTag } from "@/lib/blog";

export const runtime = "nodejs";

function secretsMatch(provided: string, secret: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const secretBuffer = Buffer.from(secret);
  if (providedBuffer.length !== secretBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, secretBuffer);
}

export async function POST(request: Request) {
  const secret = process.env.BLOG_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Revalidation not configured" },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-revalidate-secret");
  if (!provided || !secretsMatch(provided, secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let slug: string | undefined;
  try {
    const body = (await request.json()) as { slug?: string } | null;
    slug = body?.slug;
  } catch {
    // empty body is fine — list-only revalidation
  }

  const purge = { expire: 0 } as const;
  revalidateTag(BLOG_LIST_TAG, purge);
  if (slug) {
    revalidateTag(blogPostTag(slug), purge);
  }

  return NextResponse.json({ ok: true, slug: slug ?? null });
}

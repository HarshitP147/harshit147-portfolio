import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { BLOG_LIST_TAG, blogPostTag } from "@/lib/blog";
import { logger } from "@/lib/logger";

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
    logger.error("Blog revalidation is not configured", undefined, {
      missing_env: "BLOG_REVALIDATE_SECRET",
    });
    return NextResponse.json(
      { ok: false, error: "Revalidation not configured" },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-revalidate-secret");
  if (!provided || !secretsMatch(provided, secret)) {
    logger.warn("Rejected blog revalidation request", {
      reason: provided ? "secret_mismatch" : "secret_missing",
    });
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

  logger.info("Blog cache revalidated", { slug: slug ?? null });
  return NextResponse.json({ ok: true, slug: slug ?? null });
}

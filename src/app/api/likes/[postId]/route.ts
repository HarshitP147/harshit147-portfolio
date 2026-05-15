import Cloudflare from "cloudflare";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  type DeviceType,
  LIKE_VISITOR_COOKIE,
  LIKE_VISITOR_COOKIE_MAX_AGE,
  type LikeEntry,
  type LikeMutationRequest,
  type LikeResponse,
} from "@/lib/likes";

type RouteParams = {
  params: Promise<{
    postId: string;
  }>;
};

type ErrorPayload = {
  postId: string;
  likes: number;
  liked: boolean;
  error: string;
};

type VisitorContext = {
  visitorId: string;
  isNewVisitor: boolean;
};

const UNKNOWN_GEO_VALUE = "unknown";
const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|slurp|bingpreview|headless/i;

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID;

let cachedClient: Cloudflare | null = null;
function getClient(): Cloudflare {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    throw new Error("Missing CLOUDFLARE_API_TOKEN");
  }
  cachedClient ??= new Cloudflare({
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  });
  return cachedClient;
}

async function d1<T = Record<string, unknown>>(
  sql: string,
  params: string[] = [],
): Promise<T[]> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_D1_DATABASE_ID) {
    throw new Error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_D1_DATABASE_ID",
    );
  }
  const page = await getClient().d1.database.query(CLOUDFLARE_D1_DATABASE_ID, {
    account_id: CLOUDFLARE_ACCOUNT_ID,
    sql,
    params,
  });
  for await (const statement of page) {
    return (statement?.results ?? []) as T[];
  }
  return [];
}

function parseOperatingSystem(userAgent: string) {
  const normalizedUserAgent = userAgent.toLowerCase();

  if (normalizedUserAgent.includes("ipad")) {
    return "iPadOS";
  }

  if (
    normalizedUserAgent.includes("iphone") ||
    normalizedUserAgent.includes("ipod")
  ) {
    return "iOS";
  }

  if (normalizedUserAgent.includes("android")) {
    return "Android";
  }

  if (
    normalizedUserAgent.includes("macintosh") ||
    normalizedUserAgent.includes("mac os x")
  ) {
    return "macOS";
  }

  if (normalizedUserAgent.includes("windows nt")) {
    return "Windows";
  }

  if (normalizedUserAgent.includes("cros")) {
    return "ChromeOS";
  }

  if (normalizedUserAgent.includes("linux")) {
    return "Linux";
  }

  return UNKNOWN_GEO_VALUE;
}

function parseDeviceType(userAgent: string): DeviceType {
  if (!userAgent || userAgent === UNKNOWN_GEO_VALUE) {
    return "unknown";
  }

  if (BOT_USER_AGENT_PATTERN.test(userAgent)) {
    return "bot";
  }

  const normalizedUserAgent = userAgent.toLowerCase();

  if (
    normalizedUserAgent.includes("ipad") ||
    normalizedUserAgent.includes("tablet") ||
    normalizedUserAgent.includes("kindle") ||
    normalizedUserAgent.includes("silk")
  ) {
    return "tablet";
  }

  if (
    normalizedUserAgent.includes("iphone") ||
    normalizedUserAgent.includes("ipod") ||
    normalizedUserAgent.includes("android") ||
    normalizedUserAgent.includes("mobile") ||
    normalizedUserAgent.includes("windows phone")
  ) {
    return "mobile";
  }

  if (
    normalizedUserAgent.includes("macintosh") ||
    normalizedUserAgent.includes("windows nt") ||
    normalizedUserAgent.includes("linux") ||
    normalizedUserAgent.includes("cros")
  ) {
    return "desktop";
  }

  return "unknown";
}

async function getVisitorContext(): Promise<VisitorContext> {
  const cookieStore = await cookies();
  const existingVisitorId = cookieStore.get(LIKE_VISITOR_COOKIE)?.value;

  if (existingVisitorId) {
    return {
      visitorId: existingVisitorId,
      isNewVisitor: false,
    };
  }

  return {
    visitorId: crypto.randomUUID(),
    isNewVisitor: true,
  };
}

function applyVisitorCookie(
  response: NextResponse<LikeResponse | ErrorPayload>,
  visitorContext: VisitorContext,
) {
  if (!visitorContext.isNewVisitor) {
    return response;
  }

  response.cookies.set({
    name: LIKE_VISITOR_COOKIE,
    value: visitorContext.visitorId,
    httpOnly: true,
    maxAge: LIKE_VISITOR_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function createJsonResponse(
  payload: LikeResponse,
  visitorContext: VisitorContext,
) {
  return applyVisitorCookie(NextResponse.json(payload), visitorContext);
}

function createErrorResponse(
  payload: ErrorPayload,
  visitorContext: VisitorContext,
) {
  return applyVisitorCookie(
    NextResponse.json(payload, { status: 500 }),
    visitorContext,
  );
}

async function getLikeEntry(): Promise<Omit<LikeEntry, "visitorId">> {
  const headersList = await headers();

  return {
    country: headersList.get("x-vercel-ip-country") || UNKNOWN_GEO_VALUE,
    city: headersList.get("x-vercel-ip-city") || UNKNOWN_GEO_VALUE,
    latitude: headersList.get("x-vercel-ip-latitude") || UNKNOWN_GEO_VALUE,
    longitude: headersList.get("x-vercel-ip-longitude") || UNKNOWN_GEO_VALUE,
    postalCode:
      headersList.get("x-vercel-ip-postal-code") || UNKNOWN_GEO_VALUE,
    timezone: headersList.get("x-vercel-ip-timezone") || UNKNOWN_GEO_VALUE,
    userAgent: headersList.get("user-agent") || UNKNOWN_GEO_VALUE,
    os: parseOperatingSystem(headersList.get("user-agent") || UNKNOWN_GEO_VALUE),
    deviceType: parseDeviceType(
      headersList.get("user-agent") || UNKNOWN_GEO_VALUE,
    ),
    likedAt: new Date().toISOString(),
  };
}

async function getMutationPayload(request: Request) {
  try {
    return (await request.json()) as LikeMutationRequest;
  } catch {
    return { slug: "" } satisfies LikeMutationRequest;
  }
}

async function readLikeState(
  postId: string,
  visitorId: string,
): Promise<LikeResponse> {
  const rows = await d1<{ likes: number; liked: number }>(
    `SELECT
       COUNT(*) AS likes,
       COALESCE(SUM(CASE WHEN visitor_id = ? THEN 1 ELSE 0 END), 0) AS liked
     FROM post_likes WHERE post_id = ?`,
    [visitorId, postId],
  );

  const row = rows[0];
  return {
    postId,
    likes: Number(row?.likes ?? 0),
    liked: Number(row?.liked ?? 0) > 0,
  };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
  const visitorContext = await getVisitorContext();

  try {
    return createJsonResponse(
      await readLikeState(postId, visitorContext.visitorId),
      visitorContext,
    );
  } catch (error) {
    return createErrorResponse(
      {
        postId,
        likes: 0,
        liked: false,
        error: (error as Error).message,
      },
      visitorContext,
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
  const visitorContext = await getVisitorContext();

  try {
    const payload = await getMutationPayload(request);
    const entry = await getLikeEntry();

    await d1(
      `INSERT INTO post_likes
         (post_id, slug, visitor_id, country, city, latitude, longitude,
          postal_code, timezone, user_agent, os, device_type, liked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(post_id, visitor_id) DO UPDATE SET
         slug = excluded.slug,
         country = CASE WHEN post_likes.country = 'unknown'
           THEN excluded.country ELSE post_likes.country END,
         city = CASE WHEN post_likes.city = 'unknown'
           THEN excluded.city ELSE post_likes.city END,
         latitude = CASE WHEN post_likes.latitude = 'unknown'
           THEN excluded.latitude ELSE post_likes.latitude END,
         longitude = CASE WHEN post_likes.longitude = 'unknown'
           THEN excluded.longitude ELSE post_likes.longitude END,
         postal_code = CASE WHEN post_likes.postal_code = 'unknown'
           THEN excluded.postal_code ELSE post_likes.postal_code END,
         timezone = CASE WHEN post_likes.timezone = 'unknown'
           THEN excluded.timezone ELSE post_likes.timezone END,
         user_agent = CASE WHEN post_likes.user_agent = 'unknown'
           THEN excluded.user_agent ELSE post_likes.user_agent END,
         os = CASE WHEN post_likes.os = 'unknown'
           THEN excluded.os ELSE post_likes.os END,
         device_type = CASE WHEN post_likes.device_type = 'unknown'
           THEN excluded.device_type ELSE post_likes.device_type END`,
      [
        postId,
        payload.slug || "",
        visitorContext.visitorId,
        entry.country,
        entry.city,
        entry.latitude,
        entry.longitude,
        entry.postalCode,
        entry.timezone,
        entry.userAgent,
        entry.os,
        entry.deviceType,
        entry.likedAt,
      ],
    );

    return createJsonResponse(
      await readLikeState(postId, visitorContext.visitorId),
      visitorContext,
    );
  } catch (error) {
    return createErrorResponse(
      {
        postId,
        likes: 0,
        liked: false,
        error: (error as Error).message,
      },
      visitorContext,
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
  const visitorContext = await getVisitorContext();

  try {
    await d1(
      "DELETE FROM post_likes WHERE post_id = ? AND visitor_id = ?",
      [postId, visitorContext.visitorId],
    );

    return createJsonResponse(
      await readLikeState(postId, visitorContext.visitorId),
      visitorContext,
    );
  } catch (error) {
    return createErrorResponse(
      {
        postId,
        likes: 0,
        liked: false,
        error: (error as Error).message,
      },
      visitorContext,
    );
  }
}

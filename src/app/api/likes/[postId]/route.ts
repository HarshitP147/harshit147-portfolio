import { Redis } from "@upstash/redis";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  type DeviceType,
  getPostLikesKey,
  LIKE_VISITOR_COOKIE,
  LIKE_VISITOR_COOKIE_MAX_AGE,
  type LikeEntry,
  type LikeMutationRequest,
  type LikeResponse,
  type PostLikesDocument,
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

const redis = Redis.fromEnv();
const UNKNOWN_GEO_VALUE = "unknown";
const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|slurp|bingpreview|headless/i;

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

function normalizeLikeEntry(value: unknown): LikeEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.visitorId !== "string" || !candidate.visitorId) {
    return null;
  }

  return {
    visitorId: candidate.visitorId,
    country:
      typeof candidate.country === "string" && candidate.country
        ? candidate.country
        : UNKNOWN_GEO_VALUE,
    city:
      typeof candidate.city === "string" && candidate.city
        ? candidate.city
        : UNKNOWN_GEO_VALUE,
    latitude:
      typeof candidate.latitude === "string" && candidate.latitude
        ? candidate.latitude
        : UNKNOWN_GEO_VALUE,
    longitude:
      typeof candidate.longitude === "string" && candidate.longitude
        ? candidate.longitude
        : UNKNOWN_GEO_VALUE,
    postalCode:
      typeof candidate.postalCode === "string" && candidate.postalCode
        ? candidate.postalCode
        : UNKNOWN_GEO_VALUE,
    timezone:
      typeof candidate.timezone === "string" && candidate.timezone
        ? candidate.timezone
        : UNKNOWN_GEO_VALUE,
    userAgent:
      typeof candidate.userAgent === "string" && candidate.userAgent
        ? candidate.userAgent
        : UNKNOWN_GEO_VALUE,
    os:
      typeof candidate.os === "string" && candidate.os
        ? candidate.os
        : parseOperatingSystem(
            typeof candidate.userAgent === "string" ? candidate.userAgent : "",
          ),
    deviceType:
      candidate.deviceType === "bot" ||
      candidate.deviceType === "desktop" ||
      candidate.deviceType === "mobile" ||
      candidate.deviceType === "tablet" ||
      candidate.deviceType === "unknown"
        ? candidate.deviceType
        : parseDeviceType(
            typeof candidate.userAgent === "string" ? candidate.userAgent : "",
          ),
    likedAt:
      typeof candidate.likedAt === "string" && candidate.likedAt
        ? candidate.likedAt
        : new Date(0).toISOString(),
  };
}

function normalizePostLikesDocument(
  value: unknown,
  fallbackSlug = "",
): PostLikesDocument {
  if (!value || typeof value !== "object") {
    return {
      slug: fallbackSlug,
      likes: [],
    };
  }

  const candidate = value as Record<string, unknown>;
  const likes = Array.isArray(candidate.likes)
    ? candidate.likes
        .map((entry) => normalizeLikeEntry(entry))
        .filter((entry): entry is LikeEntry => entry !== null)
    : [];

  return {
    slug: typeof candidate.slug === "string" ? candidate.slug : fallbackSlug,
    likes,
  };
}

async function getStoredPostLikesDocument(
  postId: string,
  fallbackSlug = "",
): Promise<PostLikesDocument> {
  const document = await redis.get<PostLikesDocument | null>(getPostLikesKey(postId));
  return normalizePostLikesDocument(document, fallbackSlug);
}

async function savePostLikesDocument(
  postId: string,
  document: PostLikesDocument,
) {
  await redis.set(getPostLikesKey(postId), document);
}

async function getLikeEntry(): Promise<LikeEntry> {
  const headersList = await headers();

  return {
    visitorId: "",
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

function buildLikeResponse(
  postId: string,
  likesDocument: PostLikesDocument,
  visitorId: string,
): LikeResponse {
  return {
    postId,
    likes: likesDocument.likes.length,
    liked: likesDocument.likes.some((entry) => entry.visitorId === visitorId),
  };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
  const visitorContext = await getVisitorContext();

  try {
    const likesDocument = await getStoredPostLikesDocument(postId);
    return createJsonResponse(
      buildLikeResponse(postId, likesDocument, visitorContext.visitorId),
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
    const likesDocument = await getStoredPostLikesDocument(postId, payload.slug);

    const existingEntryIndex = likesDocument.likes.findIndex(
      (entry) => entry.visitorId === visitorContext.visitorId,
    );
    const likeEntry = await getLikeEntry();

    if (existingEntryIndex === -1) {
      likesDocument.likes.push({
        ...likeEntry,
        visitorId: visitorContext.visitorId,
      });
    } else {
      const existingEntry = likesDocument.likes[existingEntryIndex];
      likesDocument.likes[existingEntryIndex] = {
        ...existingEntry,
        country:
          existingEntry.country && existingEntry.country !== UNKNOWN_GEO_VALUE
            ? existingEntry.country
            : likeEntry.country,
        city:
          existingEntry.city && existingEntry.city !== UNKNOWN_GEO_VALUE
            ? existingEntry.city
            : likeEntry.city,
        latitude:
          existingEntry.latitude &&
          existingEntry.latitude !== UNKNOWN_GEO_VALUE
            ? existingEntry.latitude
            : likeEntry.latitude,
        longitude:
          existingEntry.longitude &&
          existingEntry.longitude !== UNKNOWN_GEO_VALUE
            ? existingEntry.longitude
            : likeEntry.longitude,
        postalCode:
          existingEntry.postalCode &&
          existingEntry.postalCode !== UNKNOWN_GEO_VALUE
            ? existingEntry.postalCode
            : likeEntry.postalCode,
        timezone:
          existingEntry.timezone &&
          existingEntry.timezone !== UNKNOWN_GEO_VALUE
            ? existingEntry.timezone
            : likeEntry.timezone,
        userAgent:
          existingEntry.userAgent &&
          existingEntry.userAgent !== UNKNOWN_GEO_VALUE
            ? existingEntry.userAgent
            : likeEntry.userAgent,
        os:
          existingEntry.os && existingEntry.os !== UNKNOWN_GEO_VALUE
            ? existingEntry.os
            : likeEntry.os,
        deviceType:
          existingEntry.deviceType !== "unknown"
            ? existingEntry.deviceType
            : likeEntry.deviceType,
      };
    }

    if (!likesDocument.slug && payload.slug) {
      likesDocument.slug = payload.slug;
    }

    await savePostLikesDocument(postId, likesDocument);

    return createJsonResponse(
      buildLikeResponse(postId, likesDocument, visitorContext.visitorId),
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
    const payload = await getMutationPayload(request);
    const likesDocument = await getStoredPostLikesDocument(postId, payload.slug);

    likesDocument.likes = likesDocument.likes.filter(
      (entry) => entry.visitorId !== visitorContext.visitorId,
    );

    if (!likesDocument.slug && payload.slug) {
      likesDocument.slug = payload.slug;
    }

    await savePostLikesDocument(postId, likesDocument);

    return createJsonResponse(
      buildLikeResponse(postId, likesDocument, visitorContext.visitorId),
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

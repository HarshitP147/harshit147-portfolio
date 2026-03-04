import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    postId: string;
  }>;
};

const redis = Redis.fromEnv();

function getKey(postId: string) {
  return `likes:post:${postId}`;
}

export async function GET(_: Request, { params }: RouteParams) {
  const { postId } = await params;
  try {
    const key = getKey(postId);
    const result = await redis.get<number>(key);
    const likes = Number.isFinite(result) ? result : 0;
    return NextResponse.json({ postId, likes });
  } catch (error) {
    return NextResponse.json(
      { postId, likes: 0, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(_: Request, { params }: RouteParams) {
  const { postId } = await params;
  try {
    const key = getKey(postId);
    const result = await redis.incr(key);
    const likes = Number.isFinite(result) ? result : 0;
    return NextResponse.json({ postId, likes });
  } catch (error) {
    return NextResponse.json(
      { postId, likes: 0, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const { postId } = await params;
  try {
    const key = getKey(postId);
    const result = await redis.decr(key);
    const likes = Number.isFinite(result) ? Math.max(result, 0) : 0;
    if (likes === 0) {
      await redis.set(key, 0);
    }
    return NextResponse.json({ postId, likes });
  } catch (error) {
    return NextResponse.json(
      { postId, likes: 0, error: (error as Error).message },
      { status: 500 },
    );
  }
}

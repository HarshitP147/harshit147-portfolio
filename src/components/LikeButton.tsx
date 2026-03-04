"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

type LikeButtonProps = {
  postId: string;
  className?: string;
};

type LikeResponse = {
  postId: string;
  likes: number;
};

const REQUEST_TIMEOUT_MS = 8000;

const heartVariants: Variants = {
  idle: { scale: 1, rotate: 0, y: 0 },
  liked: {
    scale: [1, 1.35, 1],
    rotate: [0, -12, 0],
    y: [0, -2, 0],
    transition: { duration: 0.35, ease: "easeOut" },
  },
  unliked: {
    scale: [1, 0.82, 1],
    rotate: [0, 10, 0],
    y: [0, 1, 0],
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

export default function LikeButton({ postId, className }: LikeButtonProps) {
  const storageKey = useMemo(() => `liked:post:${postId}`, [postId]);
  const hasUserInteracted = useRef(false);
  const [likes, setLikes] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [iconAnimation, setIconAnimation] = useState<"idle" | "liked" | "unliked">(
    "idle",
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    hasUserInteracted.current = false;
    setIsLiked(window.localStorage.getItem(storageKey) === "1");

    const controller = new AbortController();

    fetch(`/api/likes/${encodeURIComponent(postId)}`, {
      method: "GET",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load likes");
        }
        return (await response.json()) as LikeResponse;
      })
      .then((payload) => {
        if (hasUserInteracted.current) {
          return;
        }
        setLikes(Number.isFinite(payload.likes) ? payload.likes : 0);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [postId, storageKey]);

  const handleLike = async () => {
    if (isLoading) {
      return;
    }

    hasUserInteracted.current = true;
    const previousIsLiked = isLiked;
    const previousLikes = likes ?? 0;
    const nextIsLiked = !previousIsLiked;
    const nextLikes = Math.max(previousLikes + (nextIsLiked ? 1 : -1), 0);

    setIsLiked(nextIsLiked);
    setLikes(nextLikes);
    setIconAnimation(nextIsLiked ? "liked" : "unliked");
    if (nextIsLiked) {
      window.localStorage.setItem(storageKey, "1");
    } else {
      window.localStorage.removeItem(storageKey);
    }

    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`/api/likes/${encodeURIComponent(postId)}`, {
        method: nextIsLiked ? "POST" : "DELETE",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error("Failed to update likes");
      }
      const payload = (await response.json()) as LikeResponse;
      setLikes(Number.isFinite(payload.likes) ? payload.likes : 0);
    } catch {
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
      setIconAnimation(previousIsLiked ? "liked" : "unliked");
      if (previousIsLiked) {
        window.localStorage.setItem(storageKey, "1");
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <button
        type="button"
        onClick={handleLike}
        disabled={isLoading}
        aria-pressed={isLiked}
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 text-foreground transition hover:bg-card disabled:cursor-wait disabled:opacity-75",
          isLiked ? "text-primary" : "cursor-pointer",
        )}
      >
        <motion.span
          className="inline-flex"
          variants={heartVariants}
          initial={false}
          animate={iconAnimation}
          onAnimationComplete={() => setIconAnimation("idle")}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4"
            initial={false}
            animate={{
              fill: isLiked ? "#ec4899" : "transparent",
              stroke: isLiked ? "#ec4899" : "currentColor",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <motion.path
              d="M12 21s-6.716-4.56-9.193-8.182C.73 9.782 1.077 5.64 4.25 3.74c2.27-1.36 5.12-.9 7.03 1.06L12 5.57l.72-.77c1.91-1.96 4.76-2.42 7.03-1.06 3.173 1.9 3.52 6.042 1.443 9.078C18.716 16.44 12 21 12 21Z"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.span>
        <span className="text-sm">{likes ?? 0}</span>
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {likes === 1 ? "Like" : "Likes"}
        </span>
      </button>
    </div>
  );
}

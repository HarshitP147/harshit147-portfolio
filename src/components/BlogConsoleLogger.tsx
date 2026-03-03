"use client";

import { useEffect } from "react";

import type { HashnodePostSummary } from "@/lib/hashnode";

type BlogConsoleLoggerProps = {
  publicationTitle: string | null;
  posts: HashnodePostSummary[];
};

export default function BlogConsoleLogger({ publicationTitle, posts }: BlogConsoleLoggerProps) {
  useEffect(() => {
    console.log("[Hashnode] Publication:", publicationTitle);
    console.log("[Hashnode] Posts:", posts);
  }, [publicationTitle, posts]);

  return null;
}

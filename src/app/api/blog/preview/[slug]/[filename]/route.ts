import fs from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; filename: string }> },
) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const { slug, filename } = await params;

  // Reject path traversal
  const safeSlug = path.basename(slug);
  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), "tmp", safeSlug, safeFilename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(safeFilename).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  return new NextResponse(buffer, {
    headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
  });
}

import fs from "fs";
import path from "path";
import { Readable } from "stream";

import { NextRequest, NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
};

export async function GET(
  req: NextRequest,
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

  const ext = path.extname(safeFilename).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const { size } = fs.statSync(filePath);

  // Video (Safari in particular) requires 206 Range support — without it the
  // <video> element refuses to play a progressively-downloaded file at all.
  const range = req.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      return new NextResponse("Invalid Range", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : size - 1;
    if (start > end || end >= size) {
      return new NextResponse("Invalid Range", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    const stream = Readable.toWeb(
      fs.createReadStream(filePath, { start, end }),
    ) as ReadableStream;
    return new NextResponse(stream, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        "Cache-Control": "no-store",
      },
    });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Content-Length": String(size),
      "Cache-Control": "no-store",
    },
  });
}

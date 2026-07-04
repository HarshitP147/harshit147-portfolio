// Publish one blog from local staging -> Cloudflare R2 + D1.
//
// Workflow (write locally in Obsidian):
//   1. Write tmp/<slug>/index.md, embedding images either as Obsidian
//      wiki-embeds ![[file.png]] / ![[slug/file.png]], or as plain markdown
//      ![alt](./file.png) / ![alt](file.png).
//   2. Put the referenced image files + meta.json alongside it:
//        index.md
//        meta.json           ({ "title": "..." })
//        cover.<ext>          (optional; else the first embedded image is cover)
//        <whatever>.<ext>     any files referenced via ![[...]] or ![]()
//   3. npm run publish:blog -- <slug>
//
// Legacy workflow (Hashnode export, still supported):
//   1. Draft + publish on Hashnode (free editor).
//   2. Put the export at tmp/<slug>/ with numbered inline images
//      (one.<ext>, two.<ext>, ...) matching cdn.hashnode.com urls in the
//      markdown, in order of appearance.
//   3. npm run publish:blog -- <slug>
//
// Idempotent: upserts by slug. read_time_minutes is auto-computed.
// publishedAt is optional in meta.json: if omitted, first publish stamps the
// current time and later republishes keep that original date. Set
// meta.publishedAt explicitly (ISO or Hashnode's human format) to override.
// Canonical content lives in R2/D1; tmp/ is transient (gitignored).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";

// Native fetch instead of the SDK's bundled node-fetch@2 (avoids DEP0169
// url.parse() deprecation warnings). Must be imported before "cloudflare".
import "cloudflare/shims/web";

import Cloudflare from "cloudflare";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) {
    process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: npm run publish:blog -- <slug>");
  process.exit(1);
}

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_D1_DATABASE_ID,
  R2_PUBLIC_BASE_URL,
  R2_BUCKET,
  R2_S3_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
} = process.env;

for (const [k, v] of Object.entries({
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_D1_DATABASE_ID,
  R2_PUBLIC_BASE_URL,
  R2_BUCKET,
  R2_S3_ENDPOINT,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
})) {
  if (!v) {
    console.error(`Missing required env: ${k}`);
    process.exit(1);
  }
}

const cf = new Cloudflare({ apiToken: CLOUDFLARE_API_TOKEN });
const s3 = new S3Client({
  region: "auto",
  endpoint: R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".md": "text/markdown; charset=utf-8",
};
const contentType = (name) =>
  CONTENT_TYPES[extname(name).toLowerCase()] ?? "application/octet-stream";

// numbered-image order, in English words (matches Hashnode export naming)
const WORDS = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen", "twenty",
];

// Hashnode markdown image: ![alt](https://cdn.hashnode.com/... [align="x"])
const IMG_URL = /(!\[[^\]]*\]\()(https:\/\/cdn\.hashnode\.com[^\s)]+)/g;

// Obsidian wiki-embed image: ![[file.png]] or ![[slug/file.png]]
const WIKI_IMG = /!\[\[([^\]]+\.(?:png|jpg|jpeg|webp|gif|svg))\]\]/gi;

// Plain markdown pointing at a local file: ![alt](./file.png) or ![alt](file.png)
const LOCAL_IMG = /!\[([^\]]*)\]\((?:\.\/)?([a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|webp|gif|svg))\)/gi;

async function putR2(key, body, name) {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType(name ?? key),
    }),
  );
  console.log(`  R2  ${key}`);
}

async function d1(sql, params = []) {
  const page = await cf.d1.database.query(CLOUDFLARE_D1_DATABASE_ID, {
    account_id: CLOUDFLARE_ACCOUNT_ID,
    sql,
    params,
  });
  for await (const s of page) return s.results ?? [];
  return [];
}

function computeReadTime(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Accepts either an ISO string or Hashnode's human format
//   "Monday, June 8, 2026 at 01:57 AM"
// Returns an ISO string (parsed in the host's local timezone).
function toIsoDate(input) {
  const s = String(input).trim();
  if (!Number.isNaN(Date.parse(s))) return new Date(s).toISOString();
  const cleaned = s.replace(/\s+at\s+/i, " ");
  const d = new Date(cleaned);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Cannot parse date: ${input}`);
  }
  return d.toISOString();
}

async function main() {
  const dir = join("tmp", slug);
  if (!existsSync(join(dir, "index.md"))) {
    console.error(`Missing ${dir}/index.md`);
    process.exit(1);
  }
  if (!existsSync(join(dir, "meta.json"))) {
    console.error(`Missing ${dir}/meta.json  -> { "title": "..." }`);
    process.exit(1);
  }

  const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
  if (!meta.title) {
    console.error("meta.json needs at least: title");
    process.exit(1);
  }

  const files = readdirSync(dir);
  let markdown = readFileSync(join(dir, "index.md"), "utf8");

  // Locally-authored posts: Obsidian wiki-embeds ![[file.png]], resolved by
  // filename rather than position. Verify each referenced file exists before
  // uploading anything.
  const wikiFilenames = [...new Set(
    [...markdown.matchAll(WIKI_IMG)].map((m) => m[1].split("/").pop()),
  )];
  for (const filename of wikiFilenames) {
    if (!existsSync(join(dir, filename))) {
      console.error(`![[${filename}]] in index.md has no matching file at ${dir}/${filename}`);
      process.exit(1);
    }
  }

  // Locally-authored posts: plain markdown pointing at a local file,
  // ![alt](./file.png) or ![alt](file.png) — resolved by filename, same as
  // wiki-embeds above.
  const localFilenames = [...new Set(
    [...markdown.matchAll(LOCAL_IMG)].map((m) => m[2]),
  )];
  for (const filename of localFilenames) {
    if (!existsSync(join(dir, filename))) {
      console.error(`![...](${filename}) in index.md has no matching file at ${dir}/${filename}`);
      process.exit(1);
    }
  }

  // Legacy Hashnode export: numbered files (one.png, two.png, ...) rewritten
  // positionally against cdn.hashnode.com urls in order of appearance.
  const cdnUrls = [...markdown.matchAll(IMG_URL)];
  const inlineImages = cdnUrls.length
    ? WORDS.map((w) => files.find((f) => f === `${w}${extname(f)}` || f.startsWith(`${w}.`))).filter(Boolean)
    : [];
  if (cdnUrls.length !== inlineImages.length) {
    console.error(
      `Image mismatch: ${cdnUrls.length} CDN urls in markdown but ${inlineImages.length} numbered files in ${dir}`,
    );
    process.exit(1);
  }

  await d1(
    `CREATE TABLE IF NOT EXISTS posts (
       id TEXT PRIMARY KEY,
       slug TEXT UNIQUE NOT NULL,
       title TEXT NOT NULL,
       published_at TEXT NOT NULL,
       date_modified TEXT NOT NULL,
       read_time_minutes INTEGER NOT NULL,
       cover_image_key TEXT NOT NULL,
       content_key TEXT NOT NULL
     )`,
  );

  // stable id: reuse existing row's id, else new uuid
  const existing = await d1(
    "SELECT id, published_at FROM posts WHERE slug = ?",
    [slug],
  );
  const id = existing[0]?.id ?? randomUUID();

  // upload wiki-embed images, rewrite ![[file.png]] -> standard markdown + R2 url
  for (const filename of wikiFilenames) {
    await putR2(`${slug}/images/${filename}`, readFileSync(join(dir, filename)), filename);
  }
  markdown = markdown.replace(WIKI_IMG, (_m, wikiPath) => {
    const filename = wikiPath.split("/").pop();
    const alt = filename.replace(extname(filename), "");
    return `![${alt}](${R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${slug}/images/${filename})`;
  });

  // upload local-file images, rewrite ![alt](./file.png) -> ![alt](R2 url)
  for (const filename of localFilenames) {
    await putR2(`${slug}/images/${filename}`, readFileSync(join(dir, filename)), filename);
  }
  markdown = markdown.replace(LOCAL_IMG, (_m, alt, filename) =>
    `![${alt}](${R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${slug}/images/${filename})`,
  );

  // upload inline images, rewrite nth CDN url -> nth R2 url
  for (const local of inlineImages) {
    await putR2(`${slug}/images/${local}`, readFileSync(join(dir, local)), local);
  }
  let n = 0;
  markdown = markdown.replace(IMG_URL, (_m, prefix) => {
    const local = inlineImages[n++];
    return `${prefix}${R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${slug}/images/${local}`;
  });
  markdown = markdown.replace(
    /(\]\([^\s)]+)\s+align=(?:"[^"]*"|'[^']*')\)/g,
    "$1)",
  );

  // cover: explicit cover.* else the first embedded image (wiki, then local, then numbered)
  const cover =
    files.find((f) => f.startsWith("cover.")) ??
    wikiFilenames[0] ??
    localFilenames[0] ??
    inlineImages[0];
  if (!cover) {
    console.error("No cover image found (need cover.* or a numbered image)");
    process.exit(1);
  }
  const coverKey = `${slug}/images/${cover}`;
  await putR2(coverKey, readFileSync(join(dir, cover)), cover);

  const contentKey = `${slug}/index.md`;
  await putR2(contentKey, markdown, "index.md");

  const readTime = meta.readTimeInMinutes || computeReadTime(markdown);
  // First publish with no meta.publishedAt: stamp now. Later republishes
  // without meta.publishedAt: keep the original date instead of bumping it.
  const publishedAt = meta.publishedAt
    ? toIsoDate(meta.publishedAt)
    : (existing[0]?.published_at ?? new Date().toISOString());
  const dateModified = meta.dateModified
    ? toIsoDate(meta.dateModified)
    : publishedAt;

  await d1(
    `INSERT INTO posts
       (id, slug, title, published_at, date_modified, read_time_minutes, cover_image_key, content_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       title=excluded.title,
       published_at=excluded.published_at, date_modified=excluded.date_modified,
       read_time_minutes=excluded.read_time_minutes,
       cover_image_key=excluded.cover_image_key, content_key=excluded.content_key`,
    [
      id,
      slug,
      meta.title,
      publishedAt,
      dateModified,
      readTime,
      coverKey,
      contentKey,
    ],
  );

  console.log(
    `\nPublished "${slug}" (id ${id}, ${readTime} min read, ${inlineImages.length} inline images).`,
  );

  await revalidateBlogCache(slug);
}

async function revalidateBlogCache(postSlug) {
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.BLOG_REVALIDATE_SECRET;

  if (!siteUrl || !secret) {
    console.log(
      "Skipping cache revalidation (set SITE_URL and BLOG_REVALIDATE_SECRET to enable).",
    );
    return;
  }

  const endpoint = `${siteUrl.replace(/\/+$/, "")}/api/revalidate`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ slug: postSlug }),
    });
    if (!res.ok) {
      console.warn(
        `Revalidation request returned ${res.status}: ${await res.text()}`,
      );
      return;
    }
    console.log(`Revalidated cache for /blog and /blog/${postSlug}.`);
  } catch (err) {
    console.warn(`Revalidation request failed: ${err?.message ?? err}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Publish one blog from local staging -> Cloudflare R2 + D1.
//
// Workflow:
//   1. Draft + publish on Hashnode (free editor).
//   2. Put the export at  tmp/<slug>/
//        index.md            (Hashnode markdown export)
//        meta.json           ({ "title": "...", "brief": "", "publishedAt": "ISO" })
//        cover.<ext>          (optional; else the single numbered image is cover)
//        one.<ext>, two.<ext> ... numbered inline images, in order of appearance
//   3. npm run publish:blog -- <slug>
//
// Idempotent: upserts by slug. read_time_minutes is auto-computed.
// Canonical content lives in R2/D1; tmp/ is transient (gitignored).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";

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

async function main() {
  const dir = join("tmp", slug);
  if (!existsSync(join(dir, "index.md"))) {
    console.error(`Missing ${dir}/index.md`);
    process.exit(1);
  }
  if (!existsSync(join(dir, "meta.json"))) {
    console.error(
      `Missing ${dir}/meta.json  -> { "title": "...", "brief": "", "publishedAt": "ISO" }`,
    );
    process.exit(1);
  }

  const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
  if (!meta.title || !meta.publishedAt) {
    console.error("meta.json needs at least: title, publishedAt");
    process.exit(1);
  }

  const files = readdirSync(dir);
  let markdown = readFileSync(join(dir, "index.md"), "utf8");

  // numbered inline images present, in word order
  const inlineImages = WORDS.map((w) => files.find((f) => f === `${w}${extname(f)}` || f.startsWith(`${w}.`)))
    .filter(Boolean);

  const cdnUrls = [...markdown.matchAll(IMG_URL)];
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
       brief TEXT NOT NULL,
       published_at TEXT NOT NULL,
       date_modified TEXT NOT NULL,
       read_time_minutes INTEGER NOT NULL,
       cover_image_key TEXT NOT NULL,
       content_key TEXT NOT NULL
     )`,
  );

  // stable id: reuse existing row's id, else new uuid
  const existing = await d1("SELECT id FROM posts WHERE slug = ?", [slug]);
  const id = existing[0]?.id ?? randomUUID();

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

  // cover: explicit cover.* else the single numbered image
  const cover =
    files.find((f) => f.startsWith("cover.")) ?? inlineImages[0];
  if (!cover) {
    console.error("No cover image found (need cover.* or a numbered image)");
    process.exit(1);
  }
  const coverKey = `${slug}/images/${cover}`;
  await putR2(coverKey, readFileSync(join(dir, cover)), cover);

  const contentKey = `${slug}/index.md`;
  await putR2(contentKey, markdown, "index.md");

  const readTime = meta.readTimeInMinutes || computeReadTime(markdown);

  await d1(
    `INSERT INTO posts
       (id, slug, title, brief, published_at, date_modified, read_time_minutes, cover_image_key, content_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       title=excluded.title, brief=excluded.brief,
       published_at=excluded.published_at, date_modified=excluded.date_modified,
       read_time_minutes=excluded.read_time_minutes,
       cover_image_key=excluded.cover_image_key, content_key=excluded.content_key`,
    [
      id,
      slug,
      meta.title,
      meta.brief ?? "",
      meta.publishedAt,
      meta.dateModified ?? meta.publishedAt,
      readTime,
      coverKey,
      contentKey,
    ],
  );

  console.log(
    `\nPublished "${slug}" (id ${id}, ${readTime} min read, ${inlineImages.length} inline images).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

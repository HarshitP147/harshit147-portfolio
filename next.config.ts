import type { NextConfig } from "next";

const r2Host = (() => {
  try {
    return process.env.R2_PUBLIC_BASE_URL
      ? new URL(process.env.R2_PUBLIC_BASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

// Fail loud: a production build without R2_PUBLIC_BASE_URL would ship an empty
// remotePatterns list and break every blog image at runtime.
if (!r2Host && process.env.NODE_ENV === "production") {
  throw new Error(
    "R2_PUBLIC_BASE_URL must be set (and a valid URL) for production builds",
  );
}

// Dev only: React dev builds use eval() to rebuild callstacks (never in
// production).
const devScriptSrc =
  process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inline runtime scripts + theme-init inline script.
  // 'wasm-unsafe-eval' is required by the Draco WASM decoder for scene.gltf.
  // PostHog scripts load same-origin via the /ingest proxy.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${devScriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  // next/image serves from same origin; blog content may reference https images.
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  // Blog videos (<video src>) are served straight from the public R2 bucket.
  `media-src 'self'${r2Host ? ` https://${r2Host}` : ""}`,
  // www.gstatic.com hosts the Draco decoder files fetched by drei's useGLTF.
  // PostHog events post same-origin to /ingest (src/proxy.ts).
  "connect-src 'self' https://www.gstatic.com",
  // DRACOLoader runs its decoder inside a Worker created from a blob: URL.
  "worker-src 'self' blob:",
  // Blog embeds are restricted to CodeSandbox in getEmbedMarkup().
  "frame-src https://codesandbox.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 blocks query strings on local image sources by default. The
    // local preview route needs one (?v=<mtime>) to bust the image
    // optimizer's own cache when a re-exported file keeps its filename.
    localPatterns: [
      { pathname: "/misc/**" },
      { pathname: "/marquee/**" },
      { pathname: "/api/blog/preview/**" },
    ],
    remotePatterns: r2Host
      ? [{ protocol: "https", hostname: r2Host }]
      : [],
  },
  // PostHog API paths end in a slash (/ingest/e/, /ingest/flags/); without
  // this Next 308-redirects each one before src/proxy.ts forwards it, adding
  // a round trip.
  skipTrailingSlashRedirect: true,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  headers: async () => [
    {
      // Security headers on every response (pages and assets).
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
      ],
    },
    {
      // Long-lived caching for static assets in /public.
      source: "/misc/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],
};

export default nextConfig;

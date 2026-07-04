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

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inline runtime scripts + theme-init inline script.
  // 'wasm-unsafe-eval' is required by the Draco WASM decoder for scene.gltf.
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  // next/image serves from same origin; blog content may reference https images.
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  // Vercel Analytics / Speed Insights post to same-origin /_vercel/* in prod.
  // www.gstatic.com hosts the Draco decoder files fetched by drei's useGLTF.
  "connect-src 'self' https://vitals.vercel-insights.com https://www.gstatic.com",
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
    remotePatterns: r2Host
      ? [{ protocol: "https", hostname: r2Host }]
      : [],
  },
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

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
};

export default nextConfig;

// Add security and caching headers for static assets
export const headers = async () => [{
  source: '/:all*(js|css|svg|png|jpg|jpeg|webp|ico|json)',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ],
}];

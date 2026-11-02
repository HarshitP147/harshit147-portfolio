import { NextResponse, type NextRequest } from "next/server";

// PostHog reverse proxy. The browser only talks to same-origin /ingest, so ad
// blockers that block *.posthog.com don't drop events; this forwards to
// PostHog. Done here instead of next.config rewrites because rewrites forward
// every request header, including the visitor's cookies for this site.

const PROXY_PREFIX = "/ingest";

const posthogHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_POSTHOG_HOST
      ? new URL(process.env.NEXT_PUBLIC_POSTHOG_HOST).hostname
      : null;
  } catch {
    return null;
  }
})();

// Cloud ingestion hosts (eu.i.posthog.com) serve the SDK's lazy-loaded scripts
// and remote config from a sibling assets host (eu-assets.i.posthog.com).
const posthogAssetsHost = posthogHost?.replace(
  /^([a-z]+)\.i\.posthog\.com$/,
  "$1-assets.i.posthog.com",
);

export function proxy(request: NextRequest) {
  if (!posthogHost || !posthogAssetsHost) {
    return new NextResponse(null, { status: 404 });
  }

  const { pathname } = request.nextUrl;
  const isAsset =
    pathname.startsWith(`${PROXY_PREFIX}/static/`) ||
    pathname.startsWith(`${PROXY_PREFIX}/array/`);
  const hostname = isAsset ? posthogAssetsHost : posthogHost;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("host", hostname);
  // This site's cookies (theme, likes visitor id) are none of PostHog's
  // business; posthog-js keeps its own state in localStorage.
  requestHeaders.delete("cookie");
  // Only forward the SDK's public project token (Bearer phc_...), which
  // capture needs. Strip any other credentials.
  if (!requestHeaders.get("authorization")?.startsWith("Bearer phc_")) {
    requestHeaders.delete("authorization");
  }

  const url = request.nextUrl.clone();
  url.protocol = "https";
  url.hostname = hostname;
  url.port = "443";
  url.pathname = pathname.slice(PROXY_PREFIX.length) || "/";

  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: "/ingest/:path*",
};

import type { Instrumentation } from "next";

import { emitLog, errorAttributes, flushLogs } from "./src/lib/logger";

// Required entry point; the PostHog log exporter lives in src/lib/logger.ts.
export function register() {}

// Uncaught errors from server rendering, route handlers, server actions and
// the proxy. Next.js already prints these to the console, so this only
// forwards them to PostHog Logs (emitLog skips the console).
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  emitLog("error", "Unhandled server error", {
    ...errorAttributes(error),
    "http.method": request.method,
    "url.path": request.path,
    "next.route_path": context.routePath,
    "next.route_type": context.routeType,
    "next.router_kind": context.routerKind,
    "next.render_source": context.renderSource,
    "next.revalidate_reason": context.revalidateReason,
  });
  await flushLogs();
};

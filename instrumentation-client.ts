import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!posthogKey || !posthogHost) {
  if (process.env.NODE_ENV !== "production") {
    const variableName = posthogKey
      ? "NEXT_PUBLIC_POSTHOG_HOST"
      : "NEXT_PUBLIC_POSTHOG_KEY";

    console.error(
      new Error(
        `${variableName} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variableName} is configured`,
      ),
    );
  }
} else {
  posthog.init(posthogKey, {
    // Same-origin reverse proxy (rewrites in next.config.ts) so ad blockers
    // don't drop events. ui_host keeps toolbar/app links pointing at PostHog.
    api_host: "/ingest",
    ui_host: posthogHost.replace(".i.posthog.com", ".posthog.com"),
    defaults: "2025-05-24",
    // Lazy-loaded SDK scripts (config, recorder, surveys) default to being
    // inserted before the first <body> script — our theme-init <Script> —
    // which runs before hydration and causes a React hydration mismatch.
    external_scripts_inject_target: "head",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}

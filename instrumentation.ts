import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if ((!posthogKey || !posthogHost) && process.env.NODE_ENV !== "production") {
  if (!posthogKey) {
    console.error(
      new Error(
        "NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured",
      ),
    );
  }

  if (!posthogHost) {
    console.error(
      new Error(
        "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
      ),
    );
  }
}

const logsEndpoint = posthogHost
  ? `${posthogHost.replace(/\/$/, "")}/i/v1/logs`
  : undefined;

export const posthogLogProvider =
  posthogKey && logsEndpoint
    ? new LoggerProvider({
        resource: resourceFromAttributes({
          "service.name": "harshit-portfolio",
        }),
        processors: [
          new BatchLogRecordProcessor({
            exporter: new OTLPLogExporter({
              url: logsEndpoint,
              headers: {
                Authorization: `Bearer ${posthogKey}`,
                "Content-Type": "application/json",
              },
            }),
          }),
        ],
      })
    : undefined;

// This logger is intentionally used only by purpose-written PostHog log lines.
export const posthogLikeLogger = posthogLogProvider?.getLogger(
  "posthog-wizard.likes",
);

export async function flushPostHogLogs() {
  await posthogLogProvider?.forceFlush();
}

// Keep this Next.js instrumentation entry point without registering the
// provider globally: only posthogLikeLogger is allowed to export logs.
export function register() {}

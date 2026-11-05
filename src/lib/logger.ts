import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from "@opentelemetry/sdk-logs";
import { after } from "next/server";

// Server-side logger: every call still prints to the console (so Vercel's
// runtime logs keep working) and is also exported to PostHog Logs over OTLP.
// Server code only — never import this from a client component.

export type LogLevel = "info" | "warn" | "error";
export type LogAttributes = Record<
  string,
  string | number | boolean | null | undefined
>;

const SEVERITY: Record<LogLevel, SeverityNumber> = {
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
};

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// Server-to-server, so this goes straight to PostHog rather than through the
// browser-facing /ingest proxy.
const provider =
  posthogKey && posthogHost
    ? new LoggerProvider({
        resource: resourceFromAttributes({
          "service.name": "harshit-portfolio",
          // production / preview / development — filter dev noise in PostHog.
          "deployment.environment":
            process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
        }),
        processors: [
          new BatchLogRecordProcessor({
            exporter: new OTLPLogExporter({
              url: `${posthogHost.replace(/\/$/, "")}/i/v1/logs`,
              headers: {
                Authorization: `Bearer ${posthogKey}`,
                "Content-Type": "application/json",
              },
            }),
          }),
        ],
      })
    : undefined;

const otelLogger = provider?.getLogger("harshit-portfolio");

export async function flushLogs() {
  await provider?.forceFlush();
}

// Batched logs would be lost when the serverless function freezes after the
// response, so flush once the response has been sent. after() only works
// inside a request; outside one (build, startup) flush right away.
function scheduleFlush() {
  if (!provider) return;
  try {
    after(flushLogs);
  } catch {
    void flushLogs();
  }
}

// OpenTelemetry semantic-convention keys, so PostHog shows them as exception
// fields. `digest` is the id Next.js shows users on its error page.
export function errorAttributes(error: unknown): LogAttributes {
  if (error instanceof Error) {
    return {
      "exception.type": error.name,
      "exception.message": error.message,
      "exception.stacktrace": error.stack,
      "next.digest": (error as Error & { digest?: string }).digest,
    };
  }
  return { "exception.message": String(error) };
}

function cleanAttributes(attributes: LogAttributes = {}) {
  return Object.fromEntries(
    Object.entries(attributes).filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== undefined && entry[1] !== null,
    ),
  );
}

// PostHog only — no console output. For callers whose error Next.js already
// prints itself (onRequestError); everything else should use `logger`.
export function emitLog(
  level: LogLevel,
  message: string,
  attributes?: LogAttributes,
) {
  otelLogger?.emit({
    body: message,
    severityNumber: SEVERITY[level],
    severityText: level.toUpperCase(),
    attributes: cleanAttributes(attributes),
  });
}

// Keep `message` constant ("Failed to load blog post") and put the variable
// parts in `attributes` ({ slug }) so PostHog can group and filter them.
export const logger = {
  info(message: string, attributes?: LogAttributes) {
    console.info(message, cleanAttributes(attributes));
    emitLog("info", message, attributes);
    scheduleFlush();
  },
  warn(message: string, attributes?: LogAttributes) {
    console.warn(message, cleanAttributes(attributes));
    emitLog("warn", message, attributes);
    scheduleFlush();
  },
  error(message: string, error?: unknown, attributes?: LogAttributes) {
    console.error(message, cleanAttributes(attributes), error);
    emitLog("error", message, {
      ...attributes,
      ...(error === undefined ? {} : errorAttributes(error)),
    });
    scheduleFlush();
  },
};

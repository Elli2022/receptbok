import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NETLIFY_CONTEXT ?? process.env.NODE_ENV,
  release: process.env.NETLIFY_COMMIT_REF,
  tracesSampleRate: 0.1,
});

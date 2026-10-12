import { initSentry } from "@entry/observability";

// DSN 은 빌드 변수로 주입되며, 비어 있으면 Sentry 가 꺼진다.
initSentry({
  app: "entry-admin",
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  release: import.meta.env.VITE_SENTRY_RELEASE,
});

import { initSentry } from "@entry/observability";

// main.tsx 가 가장 먼저 import 해 다른 모듈(@entry/ui 의 env 검증 등)보다 앞서 초기화된다.
// 값은 Worker 별 빌드 변수로 주입되며 DSN 이 비면 꺼진다 (docs/OBSERVABILITY.md).
initSentry({
  app: "entry-admission",
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  release: import.meta.env.VITE_SENTRY_RELEASE,
});

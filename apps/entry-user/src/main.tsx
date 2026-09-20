// Sentry 초기화. 다른 모듈보다 먼저 평가되도록 가장 먼저 import 한다.
import "./instrument";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { reactErrorHandler } from "@entry/observability";
import App from "./App.tsx";
import { queryClient } from "./apis";

// React 19 오류 훅: 에러 바운더리(react-router 기본 errorElement 포함)가 잡은 렌더 오류도 Sentry 로 보낸다.
const root = createRoot(document.getElementById("root")!, {
  onCaughtError: reactErrorHandler(),
  onUncaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
});

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

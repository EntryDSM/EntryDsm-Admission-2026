// Sentry 를 다른 모듈보다 먼저 초기화하도록 가장 먼저 import 한다.
import "./instrument";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { reactErrorHandler } from "@entry/observability";

import { queryClient } from "./apis";
import { App } from "./App";

// 에러 바운더리가 잡은 렌더 오류도 Sentry 로 보낸다.
const root = createRoot(document.getElementById("root") as HTMLElement, {
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

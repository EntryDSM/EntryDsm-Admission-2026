import { useEffect } from "react";
import { readApiError } from "@entry/utils";
import { startClientLogCollector } from "./clientLogCollector";
import { ensureCsrfToken, getCachedCsrfToken, invalidateCsrfToken } from "./csrfToken";

export type MonitoringService = "IDENTITY" | "AUTH" | "APPLICATION";

interface UseSessionMonitoringOptions {
  service: MonitoringService;
  apiBaseUrl?: string;
}

interface SessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    heartbeatIntervalSeconds: number;
  };
}

type SessionEvent = "ENTER" | "HEARTBEAT" | "LEAVE";

const DEFAULT_HEARTBEAT_INTERVAL_SECONDS = 15;

class SessionMonitoringError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code?: string) {
    super(`Session monitoring request failed with status ${status}`);
    this.status = status;
    this.code = code;
  }
}

const getEndpoint = (apiBaseUrl: string) => `${apiBaseUrl.replace(/\/$/, "")}/api/monitor/v11/collect/session`;

const getPageUrl = () => window.location.pathname;

const createHeaders = (token: string): HeadersInit => ({
  "Content-Type": "application/json",
  "X-XSRF-TOKEN": token,
});

const postSessionEvent = async (
  endpoint: string,
  apiBaseUrl: string,
  event: SessionEvent,
  service: MonitoringService,
  sessionId?: string
) => {
  const body = JSON.stringify({ event, sessionId, service, pageUrl: getPageUrl() });
  const send = (token: string) =>
    fetch(endpoint, {
      method: "POST",
      headers: createHeaders(token),
      credentials: "include",
      body,
    });

  // 세션 시작 전에 CSRF 토큰을 확보하고, 이탈 시에도 캐시된 토큰을 사용합니다.
  const token = await ensureCsrfToken(apiBaseUrl);
  if (!token) throw new Error("Session monitoring CSRF token unavailable");
  let response = await send(token);

  if (response.status === 403 && token) {
    invalidateCsrfToken();
    const refreshedToken = await ensureCsrfToken(apiBaseUrl);
    if (refreshedToken && refreshedToken !== token) {
      response = await send(refreshedToken);
    }
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new SessionMonitoringError(response.status, readApiError(body).code);
  }

  return response;
};

export const useSessionMonitoring = ({ service, apiBaseUrl = "" }: UseSessionMonitoringOptions) => {
  useEffect(() => {
    const endpoint = getEndpoint(apiBaseUrl);
    let sessionId: string | null = null;
    const clientLogs = startClientLogCollector(apiBaseUrl, () => sessionId);
    let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let isDisposed = false;
    let isPageHidden = document.visibilityState === "hidden";
    let isStarting = false;

    const stopHeartbeat = () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = undefined;
    };

    const stopStartTimer = () => {
      if (startTimer !== undefined) clearTimeout(startTimer);
      startTimer = undefined;
    };

    const sendLeave = (leavingSessionId: string) => {
      const payload = JSON.stringify({
        event: "LEAVE",
        sessionId: leavingSessionId,
        service,
        pageUrl: getPageUrl(),
      });
      // 이탈 시 토큰 발급 왕복은 보장할 수 없고 sendBeacon은 CSRF 헤더를 붙일 수 없습니다.
      const token = getCachedCsrfToken();
      if (!token) return;

      void fetch(endpoint, {
        method: "POST",
        headers: createHeaders(token),
        credentials: "include",
        keepalive: true,
        body: payload,
      }).catch(() => undefined);
    };

    const leave = () => {
      stopHeartbeat();
      stopStartTimer();
      if (!sessionId) return;

      clientLogs.flush();
      const leavingSessionId = sessionId;
      sessionId = null;
      sendLeave(leavingSessionId);
    };

    const heartbeat = async () => {
      if (!sessionId || isPageHidden || isDisposed) return;
      const heartbeatSessionId = sessionId;

      try {
        await postSessionEvent(endpoint, apiBaseUrl, "HEARTBEAT", service, heartbeatSessionId);
      } catch (error) {
        if (
          error instanceof SessionMonitoringError &&
          error.status === 404 &&
          error.code === "SESSION_NOT_FOUND" &&
          sessionId === heartbeatSessionId &&
          !isPageHidden &&
          !isDisposed
        ) {
          stopHeartbeat();
          sessionId = null;
          await enter();
        }
        // Monitoring must never interrupt the user flow. The next heartbeat retries automatically.
      }
    };

    const enter = async () => {
      if (sessionId || isStarting || isPageHidden || isDisposed) return;

      stopStartTimer();
      isStarting = true;
      try {
        const response = await postSessionEvent(endpoint, apiBaseUrl, "ENTER", service);
        const result = (await response.json()) as SessionResponse;
        const enteredSessionId = result.data?.sessionId;

        if (!result.success || !enteredSessionId) return;

        if (isDisposed || isPageHidden) {
          sendLeave(enteredSessionId);
          return;
        }

        sessionId = enteredSessionId;
        const intervalSeconds =
          result.data.heartbeatIntervalSeconds > 0
            ? result.data.heartbeatIntervalSeconds
            : DEFAULT_HEARTBEAT_INTERVAL_SECONDS;
        heartbeatTimer = setInterval(() => void heartbeat(), intervalSeconds * 1_000);
      } catch {
        // Session metrics are best-effort and should not surface errors in the product UI.
      } finally {
        isStarting = false;
        if (!sessionId && !isPageHidden && !isDisposed) {
          startTimer = setTimeout(() => void enter(), DEFAULT_HEARTBEAT_INTERVAL_SECONDS * 1_000);
        }
      }
    };

    const handleVisibilityChange = () => {
      isPageHidden = document.visibilityState === "hidden";
      if (isPageHidden) leave();
      else void enter();
    };

    const handlePageHide = () => {
      isPageHidden = true;
      leave();
    };

    const handlePageShow = () => {
      isPageHidden = document.visibilityState === "hidden";
      if (!isPageHidden) void enter();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    // Deferring avoids duplicate ENTER requests caused by React StrictMode's development-only effect replay.
    startTimer = setTimeout(() => void enter(), 0);

    return () => {
      isDisposed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      leave();
      clientLogs.dispose();
    };
  }, [apiBaseUrl, service]);
};

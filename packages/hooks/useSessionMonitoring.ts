import { useEffect } from "react";
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

const getEndpoint = (apiBaseUrl: string) => `${apiBaseUrl.replace(/\/$/, "")}/api/monitor/v11/collect/session`;

const getPageUrl = () => window.location.pathname;

const createHeaders = (token: string | null): HeadersInit =>
  token ? { "Content-Type": "application/json", "X-XSRF-TOKEN": token } : { "Content-Type": "application/json" };

const postSessionEvent = async (
  endpoint: string,
  apiBaseUrl: string,
  event: SessionEvent,
  service: MonitoringService,
  sessionId?: string,
  keepalive = false
) => {
  const body = JSON.stringify({ event, sessionId, service, pageUrl: getPageUrl() });
  const send = (token: string | null) =>
    fetch(endpoint, {
      method: "POST",
      headers: createHeaders(token),
      credentials: "include",
      keepalive,
      body,
    });

  // 로그인 쿠키가 실린 요청은 게이트웨이가 CSRF 더블서브밋을 검사하므로 GET 이 아닌 요청에는 항상 토큰을 붙입니다.
  const token = await ensureCsrfToken(apiBaseUrl);
  let response = await send(token);

  if (response.status === 403 && token) {
    invalidateCsrfToken();
    const refreshedToken = await ensureCsrfToken(apiBaseUrl);
    if (refreshedToken && refreshedToken !== token) {
      response = await send(refreshedToken);
    }
  }

  if (!response.ok) {
    throw new Error(`Session monitoring request failed with status ${response.status}`);
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

    const sendLeave = (leavingSessionId: string) => {
      const payload = JSON.stringify({
        event: "LEAVE",
        sessionId: leavingSessionId,
        service,
        pageUrl: getPageUrl(),
      });
      // sendBeacon 은 헤더를 싣지 못해 로그인 상태에선 게이트웨이 CSRF 검사(403)에 걸립니다.
      // 캐시된 토큰이 있으면 keepalive fetch 로 X-XSRF-TOKEN 을 실어 보내고, 없을 때만 beacon 으로 보냅니다.
      const token = getCachedCsrfToken();
      if (token) {
        void fetch(endpoint, {
          method: "POST",
          headers: createHeaders(token),
          credentials: "include",
          keepalive: true,
          body: payload,
        }).catch(() => undefined);
        return;
      }

      const sent = navigator.sendBeacon?.(endpoint, new Blob([payload], { type: "application/json" })) ?? false;

      if (!sent) {
        void postSessionEvent(endpoint, apiBaseUrl, "LEAVE", service, leavingSessionId, true).catch(() => undefined);
      }
    };

    const leave = () => {
      stopHeartbeat();
      if (!sessionId) return;

      clientLogs.flush();
      const leavingSessionId = sessionId;
      sessionId = null;
      sendLeave(leavingSessionId);
    };

    const heartbeat = async () => {
      if (!sessionId || isPageHidden || isDisposed) return;

      try {
        await postSessionEvent(endpoint, apiBaseUrl, "HEARTBEAT", service, sessionId);
      } catch {
        // Monitoring must never interrupt the user flow. The next heartbeat retries automatically.
      }
    };

    const enter = async () => {
      if (sessionId || isStarting || isPageHidden || isDisposed) return;

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
      if (startTimer) clearTimeout(startTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      leave();
      clientLogs.dispose();
    };
  }, [apiBaseUrl, service]);
};

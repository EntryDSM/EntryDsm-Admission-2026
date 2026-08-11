import { useEffect } from "react";

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

const postSessionEvent = async (
  endpoint: string,
  event: SessionEvent,
  service: MonitoringService,
  sessionId?: string,
  keepalive = false
) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    keepalive,
    body: JSON.stringify({ event, sessionId, service, pageUrl: getPageUrl() }),
  });

  if (!response.ok) {
    throw new Error(`Session monitoring request failed with status ${response.status}`);
  }

  return response;
};

export const useSessionMonitoring = ({ service, apiBaseUrl = "" }: UseSessionMonitoringOptions) => {
  useEffect(() => {
    const endpoint = getEndpoint(apiBaseUrl);
    let sessionId: string | null = null;
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
      const sent = navigator.sendBeacon?.(endpoint, new Blob([payload], { type: "application/json" })) ?? false;

      if (!sent) {
        void postSessionEvent(endpoint, "LEAVE", service, leavingSessionId, true).catch(() => undefined);
      }
    };

    const leave = () => {
      stopHeartbeat();
      if (!sessionId) return;

      const leavingSessionId = sessionId;
      sessionId = null;
      sendLeave(leavingSessionId);
    };

    const heartbeat = async () => {
      if (!sessionId || isPageHidden || isDisposed) return;

      try {
        await postSessionEvent(endpoint, "HEARTBEAT", service, sessionId);
      } catch {
        // Monitoring must never interrupt the user flow. The next heartbeat retries automatically.
      }
    };

    const enter = async () => {
      if (sessionId || isStarting || isPageHidden || isDisposed) return;

      isStarting = true;
      try {
        const response = await postSessionEvent(endpoint, "ENTER", service);
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
    };
  }, [apiBaseUrl, service]);
};

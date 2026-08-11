import { useEffect, useRef, useState } from "react";
import {
  API_BASE_URL,
  type DashboardApi,
  type DashboardBusiness,
  type DashboardData,
  type DashboardResource,
  type DashboardServices,
  type DashboardTraffic,
} from "../apis";
import { isWithinLastHour } from "../utils";

const LOG_EXPIRATION_CHECK_INTERVAL = 60 * 1000;

export interface MonitoringStreamLog {
  eventId: string;
  kind: "CLIENT" | "SERVER";
  level: string;
  service?: string;
  method?: string;
  path?: string;
  status?: number;
  code?: string;
  message?: string;
  source?: string;
  pageUrl?: string;
  browser?: string;
  os?: string;
  count: number;
  occurredAt: string;
}

const parseEventData = <T>(event: Event): T | null => {
  try {
    return JSON.parse((event as MessageEvent<string>).data) as T;
  } catch {
    return null;
  }
};

const mergeServices = (current: DashboardServices, incoming: DashboardServices): DashboardServices => {
  const items = new Map(current.items.map(item => [item.service, item]));
  incoming.items.forEach(item => items.set(item.service, item));

  return { windowSeconds: incoming.windowSeconds, items: [...items.values()] };
};

export const useMonitoringStream = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [logs, setLogs] = useState<MonitoringStreamLog[]>([]);
  const [hasResourceUpdate, setHasResourceUpdate] = useState(false);
  const recentLogEventIds = useRef(new Set<string>());
  const recentLogEventIdQueue = useRef<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/monitor/v11/stream`, { withCredentials: true });
    const expirationTimer = window.setInterval(
      () => setLogs(current => current.filter(({ occurredAt }) => isWithinLastHour(occurredAt))),
      LOG_EXPIRATION_CHECK_INTERVAL
    );
    const cleanups: Array<() => void> = [];

    const listen = <T>(eventName: string, handler: (data: T, event: Event) => void) => {
      const listener = (event: Event) => {
        const data = parseEventData<T>(event);
        if (data) handler(data, event);
      };

      eventSource.addEventListener(eventName, listener);
      cleanups.push(() => eventSource.removeEventListener(eventName, listener));
    };

    listen<DashboardData>("snapshot", data => setDashboard(data));
    listen<DashboardTraffic>("traffic", data =>
      setDashboard(current => (current ? { ...current, traffic: data } : current))
    );
    listen<DashboardApi>("api", data => setDashboard(current => (current ? { ...current, api: data } : current)));
    listen<DashboardBusiness>("business", data =>
      setDashboard(current => (current ? { ...current, business: data } : current))
    );
    listen<DashboardServices>("service", data =>
      setDashboard(current => (current ? { ...current, services: mergeServices(current.services, data) } : current))
    );
    listen<DashboardResource>("resource", data => {
      setDashboard(current => (current ? { ...current, resource: data } : current));
      setHasResourceUpdate(true);
    });
    listen<Omit<MonitoringStreamLog, "eventId">>("log", (data, event) => {
      const eventId = (event as MessageEvent<string>).lastEventId;

      if (eventId) {
        if (recentLogEventIds.current.has(eventId)) return;

        recentLogEventIds.current.add(eventId);
        recentLogEventIdQueue.current.push(eventId);

        if (recentLogEventIdQueue.current.length > 100) {
          const expiredEventId = recentLogEventIdQueue.current.shift();
          if (expiredEventId) recentLogEventIds.current.delete(expiredEventId);
        }
      }

      setLogs(current =>
        [{ ...data, eventId }, ...current].filter(({ occurredAt }) => isWithinLastHour(occurredAt)).slice(0, 100)
      );

      if (data.kind === "CLIENT" && (data.level === "ERROR" || data.level === "WARN")) {
        setDashboard(current => {
          if (!current) return current;

          return {
            ...current,
            clientLog: {
              errorCount: current.clientLog.errorCount + (data.level === "ERROR" ? 1 : 0),
              warnCount: current.clientLog.warnCount + (data.level === "WARN" ? 1 : 0),
            },
          };
        });
      }
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
      window.clearInterval(expirationTimer);
      eventSource.close();
    };
  }, []);

  return { dashboard, logs, hasResourceUpdate };
};

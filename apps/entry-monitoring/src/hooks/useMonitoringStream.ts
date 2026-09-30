import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  API_BASE_URL,
  getMyAccount,
  HttpError,
  monitoringQueryKeys,
  type DashboardApi,
  type DashboardBusiness,
  type DashboardData,
  type DashboardResource,
  type DashboardServices,
  type DashboardTraffic,
} from "../apis";
import { isWithinLastHour } from "../utils";

const LOG_EXPIRATION_CHECK_INTERVAL = 60 * 1000;
/** 서버가 연결을 거절해 브라우저가 재연결을 포기했을 때 다시 붙는 간격. 첫 값은 서버가 주는 reconnectTime(5초)과 같다. */
const RECONNECT_INITIAL_DELAY = 5 * 1000;
const RECONNECT_MAX_DELAY = 60 * 1000;

/** connecting: 첫 연결 중. open: 수신 중. reconnecting: 끊겨서 다시 연결하는 중(화면 값은 마지막으로 받은 값). */
export type MonitoringStreamConnection = "connecting" | "open" | "reconnecting";

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
  const [connection, setConnection] = useState<MonitoringStreamConnection>("connecting");
  const recentLogEventIds = useRef(new Set<string>());
  const recentLogEventIdQueue = useRef<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const expirationTimer = window.setInterval(
      () => setLogs(current => current.filter(({ occurredAt }) => isWithinLastHour(occurredAt))),
      LOG_EXPIRATION_CHECK_INTERVAL
    );
    let eventSource: EventSource | null = null;
    let cleanups: Array<() => void> = [];
    let reconnectTimer: number | undefined;
    let reconnectDelay = RECONNECT_INITIAL_DELAY;

    const disconnect = () => {
      cleanups.forEach(cleanup => cleanup());
      cleanups = [];
      eventSource?.close();
      eventSource = null;
    };

    const listen = <T>(source: EventSource, eventName: string, handler: (data: T, event: Event) => void) => {
      const listener = (event: Event) => {
        const data = parseEventData<T>(event);
        if (data) handler(data, event);
      };

      source.addEventListener(eventName, listener);
      cleanups.push(() => source.removeEventListener(eventName, listener));
    };

    // 새 연결마다 서버가 snapshot 을 먼저 보내므로 재연결하면 대시보드가 최신 값으로 다시 맞춰진다.
    const subscribe = (source: EventSource) => {
      const listenTo = <T>(eventName: string, handler: (data: T, event: Event) => void) =>
        listen(source, eventName, handler);

      listenTo<DashboardData>("snapshot", data => setDashboard(data));
      listenTo<DashboardTraffic>("traffic", data =>
        setDashboard(current => (current ? { ...current, traffic: data } : current))
      );
      listenTo<DashboardApi>("api", data => setDashboard(current => (current ? { ...current, api: data } : current)));
      listenTo<DashboardBusiness>("business", data =>
        setDashboard(current => (current ? { ...current, business: data } : current))
      );
      listenTo<DashboardServices>("service", data =>
        setDashboard(current => (current ? { ...current, services: mergeServices(current.services, data) } : current))
      );
      listenTo<DashboardResource>("resource", data => {
        setDashboard(current => (current ? { ...current, resource: data } : current));
        setHasResourceUpdate(true);
      });
      listenTo<Omit<MonitoringStreamLog, "eventId">>("log", (data, event) => {
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
    };

    const connect = () => {
      const source = new EventSource(`${API_BASE_URL}/api/monitor/v11/stream`, { withCredentials: true });
      eventSource = source;
      subscribe(source);

      const handleOpen = () => {
        reconnectDelay = RECONNECT_INITIAL_DELAY;
        setConnection("open");
      };
      // 네트워크가 잠깐 끊기거나 서버가 30분 만료로 닫으면 브라우저가 스스로 다시 붙는다(readyState CONNECTING).
      // 서버가 연결을 거절하면(401·동시 연결 제한·5xx 등) readyState 가 CLOSED 로 끝나 다시 붙지 않으므로 직접 재연결한다.
      const handleError = () => {
        setConnection("reconnecting");
        if (source.readyState !== EventSource.CLOSED) return;

        disconnect();
        // EventSource 는 상태 코드를 알려주지 않는다. 세션 만료(401)일 수 있으니 내 계정을 다시 조회해,
        // 만료됐으면 30초 주기 쿼리를 기다리지 않고 바로 로그인으로 보낸다(RequireMonitoringAccess·queryClient).
        // 가드의 계정 쿼리를 invalidate 하면 다시 조회하는 동안 가드가 확인 중 화면으로 바뀌어 이 페이지가 언마운트되고,
        // 재연결 대기·백오프와 받아 둔 로그가 초기화된다. 그래서 직접 조회해 401 일 때만 가드 쿼리를 다시 확인시킨다.
        void getMyAccount().then(
          account => queryClient.setQueryData(monitoringQueryKeys.account.me, account),
          (error: unknown) => {
            if (error instanceof HttpError && error.status === 401) {
              void queryClient.invalidateQueries({ queryKey: monitoringQueryKeys.account.me });
            }
          }
        );
        reconnectTimer = window.setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
      };

      source.addEventListener("open", handleOpen);
      source.addEventListener("error", handleError);
      cleanups.push(() => {
        source.removeEventListener("open", handleOpen);
        source.removeEventListener("error", handleError);
      });
    };

    connect();

    return () => {
      window.clearTimeout(reconnectTimer);
      window.clearInterval(expirationTimer);
      disconnect();
    };
  }, [queryClient]);

  return { dashboard, logs, hasResourceUpdate, connection };
};

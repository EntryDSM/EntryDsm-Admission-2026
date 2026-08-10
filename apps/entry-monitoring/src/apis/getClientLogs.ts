import { http } from "./http";

export type ClientLogLevel = "ERROR" | "WARN";

export interface ClientLogItem {
  fingerprint: string;
  level: ClientLogLevel;
  message: string;
  source: string;
  pageUrl: string;
  browser: string;
  os: string;
  count: number;
  firstOccurredAt: string;
  lastOccurredAt: string;
}

export interface ClientLogsData {
  totalCount: number;
  errorCount: number;
  warnCount: number;
  items: ClientLogItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

interface GetClientLogsParams {
  level?: ClientLogLevel[];
  from?: string;
  to?: string;
  size?: number;
  cursor?: string;
}

export const getClientLogs = (params: GetClientLogsParams = {}, signal?: AbortSignal) => {
  const query = new URLSearchParams();

  if (params.level?.length) query.set("level", params.level.join(","));
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.size) query.set("size", String(params.size));
  if (params.cursor) query.set("cursor", params.cursor);

  const queryString = query.toString();
  const path = `/api/monitor/v11/logs/client${queryString ? `?${queryString}` : ""}`;

  return http.get<ClientLogsData>(path, { signal });
};

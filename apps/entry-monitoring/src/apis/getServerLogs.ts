import { http } from "./http";

export type ServerLogService =
  | "IDENTITY"
  | "AUTH"
  | "APPLICATION"
  | "EVALUATION"
  | "DOCUMENT"
  | "NOTIFICATION"
  | "SCHEDULE";

export type ServerLogStatus = "4xx" | "5xx";

export interface ServerLogItem {
  fingerprint: string;
  service: ServerLogService;
  method: string;
  path: string;
  status: number;
  code: string;
  grpcStatus: string;
  message: string;
  count: number;
  firstOccurredAt: string;
  lastOccurredAt: string;
}

export interface ServerLogsData {
  totalCount: number;
  items: ServerLogItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

interface GetServerLogsParams {
  service?: ServerLogService;
  status?: ServerLogStatus;
  from?: string;
  to?: string;
  size?: number;
  cursor?: string;
}

export const getServerLogs = (params: GetServerLogsParams = {}, signal?: AbortSignal) => {
  const query = new URLSearchParams();

  if (params.service) query.set("service", params.service);
  if (params.status) query.set("status", params.status);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.size) query.set("size", String(params.size));
  if (params.cursor) query.set("cursor", params.cursor);

  const queryString = query.toString();
  const path = `/api/monitor/v11/logs/server${queryString ? `?${queryString}` : ""}`;

  return http.get<ServerLogsData>(path, { signal });
};

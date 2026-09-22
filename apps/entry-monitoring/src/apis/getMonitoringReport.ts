import { http } from "./http";

export interface MonitoringReport {
  status: string;
  downloadUrl: string;
  fileName: string;
  sizeBytes: number;
  expiresAt: string;
}

export const getMonitoringReport = (signal?: AbortSignal) =>
  http.post<MonitoringReport>("/api/monitor/v11/reports?format=xlsx", {}, { signal });

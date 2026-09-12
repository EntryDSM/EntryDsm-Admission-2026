import { http } from "./http";

export type MonitoringReport =
  | {
      status: "READY";
      downloadUrl: string;
      fileName: string;
      sizeBytes: number;
      expiresAt: string;
    }
  | {
      status: "GENERATING";
      jobId: string;
      pollAfterSeconds: number;
    };

export const getMonitoringReport = (signal?: AbortSignal) =>
  http.get<MonitoringReport>("/api/monitor/v11/reports?format=xlsx", { signal });

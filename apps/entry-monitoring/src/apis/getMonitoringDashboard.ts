import type { MonitoringData } from "../types";
import { bytesToMegabytes } from "../utils";
import { http } from "./http";

export interface DashboardDevice {
  type: string;
  count: number;
  ratio: number;
}

export interface DashboardService {
  service: "TOTAL" | "IDENTITY" | "AUTH" | "APPLICATION" | string;
  label: string;
  activeUsers: number;
  status: "UP" | "DEGRADED" | "DOWN";
}

export interface DashboardTraffic {
  totalVisitors: number;
  concurrent: { current: number; max: number; avg: number };
  avgSessionDurationSeconds: number;
  devices: DashboardDevice[];
}

export interface DashboardApi {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  failureRate: number;
}

export interface DashboardBusiness {
  applicationSubmit: { success: number; failure: number };
  pdfDownload: { success: number; failure: number };
}

export interface DashboardServices {
  windowSeconds: number;
  items: DashboardService[];
}

export interface DashboardResource {
  dbUsedBytes: number;
  bucketUsedBytes: number;
  measuredAt: string;
}

export interface DashboardData {
  generatedAt?: string;
  period?: {
    type: string;
    round: string;
    from: string;
    to: string;
  };
  traffic: DashboardTraffic;
  api: DashboardApi;
  business: DashboardBusiness;
  services: DashboardServices;
  clientLog: {
    errorCount: number;
    warnCount: number;
  };
  resource: DashboardResource;
}

/*
  SSE snapshot과 REST dashboard 응답은 같은 구조를 사용한다.
  화면 모델 변환을 공유해 두 경로의 표시 결과가 달라지지 않게 한다.
*/
export const toMonitoringData = (dashboard: DashboardData): MonitoringData => ({
  deviceStats: dashboard.traffic.devices.map(device => ({
    label: device.type,
    count: device.count,
    percentage: ratioToPercentage(device.ratio),
  })),
  totalApiRequests: dashboard.api.totalRequests,
  apiSuccessCount: dashboard.api.successCount,
  apiFailCount: dashboard.api.failureCount,
  apiFailRate: ratioToPercentage(dashboard.api.failureRate),
  apiRequestChartLabels: [],
  apiRequestChart: [],
  totalUsers: dashboard.traffic.totalVisitors,
  concurrentMax: dashboard.traffic.concurrent.max,
  concurrentAvg: dashboard.traffic.concurrent.avg,
  avgStayTime: formatDuration(dashboard.traffic.avgSessionDurationSeconds),
  applicationSuccess: dashboard.business.applicationSubmit.success,
  applicationFail: dashboard.business.applicationSubmit.failure,
  pdfSuccess: dashboard.business.pdfDownload.success,
  pdfFail: dashboard.business.pdfDownload.failure,
  visitorChartLabels: [],
  visitorChart: [],
  clientErrorLogs: [],
  clientLogTotalCount: 0,
  serverErrorLogs: [],
  serverLogTotalCount: 0,
  summary: {
    total: getActiveUsers(dashboard.services.items, "TOTAL"),
    user: getActiveUsers(dashboard.services.items, "IDENTITY"),
    auth: getActiveUsers(dashboard.services.items, "AUTH"),
    application: getActiveUsers(dashboard.services.items, "APPLICATION"),
  },
  dbUsageMb: bytesToMegabytes(dashboard.resource.dbUsedBytes),
  bucketUsageMb: bytesToMegabytes(dashboard.resource.bucketUsedBytes),
  clientErrorCount: dashboard.clientLog.errorCount,
  clientWarnCount: dashboard.clientLog.warnCount,
});

const DEFAULT_ADMISSION_ROUND = import.meta.env.VITE_ADMISSION_ROUND ?? "2026-1";

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}시간 ${minutes}분 ${seconds}초`;
};

const ratioToPercentage = (ratio: number) => Number((ratio * 100).toFixed(2));

const getActiveUsers = (services: DashboardService[], serviceName: string) =>
  services.find(({ service }) => service === serviceName)?.activeUsers ?? 0;

export const getMonitoringDashboard = async (
  round = DEFAULT_ADMISSION_ROUND,
  signal?: AbortSignal
): Promise<MonitoringData> => {
  const query = new URLSearchParams({ round });
  const dashboard = await http.get<DashboardData>(`/api/monitor/v11/dashboard?${query}`, { signal });

  return toMonitoringData(dashboard);
};

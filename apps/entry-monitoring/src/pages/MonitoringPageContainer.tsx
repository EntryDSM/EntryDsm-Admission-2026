import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { toMonitoringData, type ClientLogItem, type ServerLogItem } from "../apis";
import { ServiceHealthModal } from "../components";
import {
  useClientLogs,
  useMetricSeries,
  useMonitoringDashboard,
  useMonitoringStream,
  useResources,
  useServiceHealth,
  useServerLogs,
  type MonitoringStreamLog,
} from "../hooks";
import { isWithinLastHour } from "../utils";
import type { MonitoringData } from "../types";
import { MonitoringPage } from "./MonitoringPage";

interface MonitoringPageContainerProps {
  onReload?: () => void;
  onDownload?: (signal?: AbortSignal) => Promise<void>;
}

const emptyDashboard: MonitoringData = {
  deviceStats: [],
  totalApiRequests: 0,
  apiSuccessCount: 0,
  apiFailCount: 0,
  apiFailRate: 0,
  apiRequestChartLabels: [],
  apiRequestChart: [],
  totalUsers: 0,
  concurrentMax: 0,
  concurrentAvg: 0,
  avgStayTime: "—",
  applicationSuccess: 0,
  applicationFail: 0,
  pdfSuccess: 0,
  pdfFail: 0,
  visitorChartLabels: [],
  visitorChart: [],
  clientErrorLogs: [],
  clientLogTotalCount: 0,
  serverErrorLogs: [],
  serverLogTotalCount: 0,
  summary: { total: 0, user: 0, auth: 0, application: 0 },
  dbUsageMb: 0,
  bucketUsageMb: 0,
  clientErrorCount: 0,
  clientWarnCount: 0,
};

const formatClientLog = ({ level, message, source, pageUrl, browser, os, count }: ClientLogItem) =>
  `[${level}] ${message} · ${source} · ${pageUrl} · ${browser}/${os} · ${count}회`;

const formatServerLog = ({ service, status, method, path, code, message, count }: ServerLogItem) =>
  `[${service}/${status}] ${method} ${path} · ${code} · ${message} · ${count}회`;

const formatStreamLog = (log: MonitoringStreamLog) => {
  if (log.kind === "SERVER") {
    return `[${log.service ?? "SERVER"}/${log.status ?? log.level}] ${log.method ?? ""} ${log.path ?? ""} · ${log.code ?? log.message ?? "서버 오류"} · ${log.count}회`;
  }

  return `[${log.level}] ${log.message ?? log.code ?? "클라이언트 오류"} · ${log.source ?? log.pageUrl ?? "CLIENT"} · ${log.count}회`;
};

export const MonitoringPageContainer = ({ onReload, onDownload }: MonitoringPageContainerProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadController = useRef<AbortController | null>(null);
  useEffect(() => () => downloadController.current?.abort(), []);
  const handleDownload = async () => {
    if (!onDownload || downloadController.current) return;
    const controller = new AbortController();
    downloadController.current = controller;
    setIsDownloading(true);
    try {
      await onDownload(controller.signal);
    } catch (error) {
      if (!controller.signal.aborted)
        toast.error(error instanceof Error ? error.message : "리포트 다운로드에 실패했습니다.");
    } finally {
      downloadController.current = null;
      if (!controller.signal.aborted) setIsDownloading(false);
    }
  };
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const dashboardQuery = useMonitoringDashboard();
  const clientLogsQuery = useClientLogs();
  const serverLogsQuery = useServerLogs();
  const metricSeriesQuery = useMetricSeries();
  const resourcesQuery = useResources();
  const serviceHealthQuery = useServiceHealth(isStatusOpen);
  const monitoringStream = useMonitoringStream();
  const liveDashboardData = monitoringStream.dashboard ? toMonitoringData(monitoringStream.dashboard) : undefined;
  const dashboardData = liveDashboardData ?? dashboardQuery.data;
  const liveClientLogs = monitoringStream.logs.filter(
    ({ kind, level, occurredAt }) =>
      kind === "CLIENT" && (level === "ERROR" || level === "WARN") && isWithinLastHour(occurredAt)
  );
  const liveServerLogs = monitoringStream.logs.filter(
    ({ kind, service, status, occurredAt }) =>
      kind === "SERVER" &&
      service === "APPLICATION" &&
      typeof status === "number" &&
      status >= 500 &&
      status < 600 &&
      isWithinLastHour(occurredAt)
  );
  const isLoading =
    dashboardQuery.isLoading ||
    clientLogsQuery.isLoading ||
    serverLogsQuery.isLoading ||
    metricSeriesQuery.isLoading ||
    resourcesQuery.isLoading;
  const errors = [
    ["전체 현황", dashboardQuery.error],
    ["클라이언트 로그", clientLogsQuery.error],
    ["서버 로그", serverLogsQuery.error],
    ["시간대별 그래프", metricSeriesQuery.error],
    ["저장소 사용량", resourcesQuery.error],
  ] as const;
  const failedQueries = errors.filter(([, error]) => error);
  const retry = () => {
    void dashboardQuery.refetch();
    void clientLogsQuery.refetch();
    void serverLogsQuery.refetch();
    void metricSeriesQuery.refetch();
    void resourcesQuery.refetch();
  };
  const data: MonitoringData = {
    ...(dashboardData ?? emptyDashboard),
    dbUsageMb: monitoringStream.hasResourceUpdate
      ? (dashboardData?.dbUsageMb ?? 0)
      : (resourcesQuery.data?.dbUsageMb ?? dashboardData?.dbUsageMb ?? 0),
    bucketUsageMb: monitoringStream.hasResourceUpdate
      ? (dashboardData?.bucketUsageMb ?? 0)
      : (resourcesQuery.data?.bucketUsageMb ?? dashboardData?.bucketUsageMb ?? 0),
    apiRequestChartLabels: metricSeriesQuery.data?.apiRequest.labels ?? [],
    apiRequestChart: metricSeriesQuery.data?.apiRequest.values ?? [],
    visitorChartLabels: metricSeriesQuery.data?.visitor.labels ?? [],
    visitorChart: metricSeriesQuery.data?.visitor.values ?? [],
    clientErrorLogs: [
      ...liveClientLogs.map(formatStreamLog),
      ...(clientLogsQuery.data?.items.map(formatClientLog) ?? []),
    ].slice(0, 100),
    clientLogTotalCount: (clientLogsQuery.data?.totalCount ?? 0) + liveClientLogs.length,
    serverErrorLogs: [
      ...liveServerLogs.map(formatStreamLog),
      ...(serverLogsQuery.data?.items.map(formatServerLog) ?? []),
    ].slice(0, 100),
    serverLogTotalCount: (serverLogsQuery.data?.totalCount ?? 0) + liveServerLogs.length,
  };

  return (
    <>
      {failedQueries.length > 0 && (
        <PageState role="alert">
          <span>
            일부 데이터를 불러오지 못했습니다. 조회된 값은 유지하며, 미수신 항목은 — 또는 빈 그래프로 표시합니다.
          </span>
          {failedQueries.map(([label, error]) => (
            <span key={label}>
              {label}: {error?.message}
            </span>
          ))}
          <RetryButton onClick={retry}>다시 시도</RetryButton>
        </PageState>
      )}
      {isLoading && <PageState role="status">모니터링 데이터를 불러오는 중입니다.</PageState>}
      <MonitoringPage
        data={data}
        availability={{
          dashboard: !!dashboardData,
          resources: !!resourcesQuery.data || !!dashboardData,
          clientLogs: !!clientLogsQuery.data,
          serverLogs: !!serverLogsQuery.data,
        }}
        onReload={onReload}
        onDownload={onDownload ? handleDownload : undefined}
        isDownloading={isDownloading}
        onStatus={() => setIsStatusOpen(true)}
      />
      <ServiceHealthModal
        isOpen={isStatusOpen}
        data={serviceHealthQuery.data}
        error={serviceHealthQuery.error}
        isLoading={serviceHealthQuery.isLoading}
        isFetching={serviceHealthQuery.isFetching}
        onClose={() => setIsStatusOpen(false)}
        onRetry={() => void serviceHealthQuery.refetch()}
      />
    </>
  );
};

const PageState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 16px 24px 0;
  padding: 16px;
  border-radius: 12px;
  background: #f7f7fb;
  color: #555555;
`;

const RetryButton = styled.button`
  border: 0;
  border-radius: 8px;
  padding: 12px 20px;
  background: #6c63ff;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
`;

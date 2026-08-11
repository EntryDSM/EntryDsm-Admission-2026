import styled from "@emotion/styled";
import { toMonitoringData, type ClientLogItem, type ServerLogItem } from "../apis";
import {
  useClientLogs,
  useMetricSeries,
  useMonitoringDashboard,
  useMonitoringStream,
  useResources,
  useServerLogs,
  type MonitoringStreamLog,
} from "../hooks";
import { isWithinLastHour } from "../utils";
import { MonitoringPage } from "./MonitoringPage";

interface MonitoringPageContainerProps {
  onReload?: () => void;
  onDownload?: () => void;
  onStatus?: () => void;
}

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

export const MonitoringPageContainer = ({ onReload, onDownload, onStatus }: MonitoringPageContainerProps) => {
  const dashboardQuery = useMonitoringDashboard();
  const clientLogsQuery = useClientLogs();
  const serverLogsQuery = useServerLogs();
  const metricSeriesQuery = useMetricSeries();
  const resourcesQuery = useResources();
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
  const error =
    dashboardQuery.error ??
    clientLogsQuery.error ??
    serverLogsQuery.error ??
    metricSeriesQuery.error ??
    resourcesQuery.error;

  const data =
    dashboardData && clientLogsQuery.data && serverLogsQuery.data && metricSeriesQuery.data && resourcesQuery.data
      ? {
          ...dashboardData,
          dbUsageMb: monitoringStream.hasResourceUpdate ? dashboardData.dbUsageMb : resourcesQuery.data.dbUsageMb,
          bucketUsageMb: monitoringStream.hasResourceUpdate
            ? dashboardData.bucketUsageMb
            : resourcesQuery.data.bucketUsageMb,
          apiRequestChartLabels: metricSeriesQuery.data.apiRequest.labels,
          apiRequestChart: metricSeriesQuery.data.apiRequest.values,
          visitorChartLabels: metricSeriesQuery.data.visitor.labels,
          visitorChart: metricSeriesQuery.data.visitor.values,
          clientErrorLogs: [
            ...liveClientLogs.map(formatStreamLog),
            ...clientLogsQuery.data.items.map(formatClientLog),
          ].slice(0, 100),
          clientLogTotalCount: clientLogsQuery.data.totalCount + liveClientLogs.length,
          serverErrorLogs: [
            ...liveServerLogs.map(formatStreamLog),
            ...serverLogsQuery.data.items.map(formatServerLog),
          ].slice(0, 100),
          serverLogTotalCount: serverLogsQuery.data.totalCount + liveServerLogs.length,
        }
      : undefined;

  if (isLoading) {
    return <PageState role="status">모니터링 데이터를 불러오는 중입니다.</PageState>;
  }

  if (error || !data) {
    return (
      <PageState role="alert">
        <span>{error?.message ?? "모니터링 데이터가 없습니다."}</span>
        {onReload && <RetryButton onClick={onReload}>다시 시도</RetryButton>}
      </PageState>
    );
  }

  return <MonitoringPage data={data} onReload={onReload} onDownload={onDownload} onStatus={onStatus} />;
};

const PageState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 400px;
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

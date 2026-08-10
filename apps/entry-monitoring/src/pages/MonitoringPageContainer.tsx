import styled from "@emotion/styled";
import type { ClientLogItem, ServerLogItem } from "../apis";
import { useClientLogs, useMetricSeries, useMonitoringDashboard, useServerLogs } from "../hooks";
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

export const MonitoringPageContainer = ({ onReload, onDownload, onStatus }: MonitoringPageContainerProps) => {
  const dashboardQuery = useMonitoringDashboard();
  const clientLogsQuery = useClientLogs();
  const serverLogsQuery = useServerLogs();
  const metricSeriesQuery = useMetricSeries();
  const isLoading =
    dashboardQuery.isLoading || clientLogsQuery.isLoading || serverLogsQuery.isLoading || metricSeriesQuery.isLoading;
  const error = dashboardQuery.error ?? clientLogsQuery.error ?? serverLogsQuery.error ?? metricSeriesQuery.error;

  const data =
    dashboardQuery.data && clientLogsQuery.data && serverLogsQuery.data && metricSeriesQuery.data
      ? {
          ...dashboardQuery.data,
          apiRequestChartLabels: metricSeriesQuery.data.apiRequest.labels,
          apiRequestChart: metricSeriesQuery.data.apiRequest.values,
          visitorChartLabels: metricSeriesQuery.data.visitor.labels,
          visitorChart: metricSeriesQuery.data.visitor.values,
          clientErrorLogs: clientLogsQuery.data.items.map(formatClientLog),
          clientLogTotalCount: clientLogsQuery.data.totalCount,
          clientErrorCount: clientLogsQuery.data.errorCount,
          clientWarnCount: clientLogsQuery.data.warnCount,
          serverErrorLogs: serverLogsQuery.data.items.map(formatServerLog),
          serverLogTotalCount: serverLogsQuery.data.totalCount,
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

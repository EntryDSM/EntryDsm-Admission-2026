import styled from "@emotion/styled";
import { useMonitoringDashboard } from "../hooks";
import { MonitoringPage } from "./MonitoringPage";

interface MonitoringPageContainerProps {
  onReload?: () => void;
  onDownload?: () => void;
  onStatus?: () => void;
}

export const MonitoringPageContainer = ({ onReload, onDownload, onStatus }: MonitoringPageContainerProps) => {
  const { data, error, isLoading } = useMonitoringDashboard();

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

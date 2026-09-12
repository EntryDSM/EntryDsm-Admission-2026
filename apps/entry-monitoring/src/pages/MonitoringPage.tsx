import styled from "@emotion/styled";
import { StatCard, ErrorLogCard, BarChartCard, DeviceChartCard } from "../components";
import type { MonitoringData } from "../types";
import { DownloadIcon } from "@entry/ui";

interface MonitoringPageProps {
  data: MonitoringData;
  availability?: { dashboard: boolean; resources: boolean; clientLogs: boolean; serverLogs: boolean };
  onReload?: () => void;
  onDownload?: () => void;
  isDownloading?: boolean;
  onStatus?: () => void;
}

export const MonitoringPage = ({
  data,
  onReload,
  onDownload,
  onStatus,
  isDownloading,
  availability,
}: MonitoringPageProps) => {
  const display = (value: string, available = availability?.dashboard ?? true) => (available ? value : "—");
  return (
    <Grid>
      <DeviceArea>
        <DeviceChartCard title="접근 기기 종류" data={data.deviceStats} />
      </DeviceArea>

      <ApiReqArea>
        <StatCard
          label="총 API 요청"
          value={display(`${data.totalApiRequests.toLocaleString()}회`)}
          variant="primary"
        />
        <StatCard label="API 응답 성공" value={display(`${data.apiSuccessCount}회`)} variant="gray" />
      </ApiReqArea>

      <ApiChartArea>
        <BarChartCard
          title="API 요청 수"
          labels={data.apiRequestChartLabels}
          values={data.apiRequestChart}
          unit="회"
          height="100%"
        />
      </ApiChartArea>

      <TotalUsrArea>
        <StatCard label="총 접속자 수" value={display(`${data.totalUsers}명`)} variant="primary" />
      </TotalUsrArea>

      <ConcurrentArea>
        <StatCard
          label="동시접속 기록"
          value={display(`Max ${data.concurrentMax} Avg ${data.concurrentAvg}`)}
          variant="primary"
        />
      </ConcurrentArea>

      <AvgTimeArea>
        <StatCard label="사용자 평균 체류시간" value={display(data.avgStayTime)} variant="gray" />
      </AvgTimeArea>

      <ApiFailArea>
        <StatCard label="API 응답 실패" value={display(`${data.apiFailCount}회`)} variant="gray" />
      </ApiFailArea>

      <ApiFailRateArea>
        <StatCard label="API 응답 실패율" value={display(`${data.apiFailRate}%`)} variant="primary" />
      </ApiFailRateArea>

      <AppSuccessArea>
        <StatCard label="원서 접수 성공" value={display(`${data.applicationSuccess}명`)} variant="gray" />
      </AppSuccessArea>

      <AppFailArea>
        <StatCard label="원서 접수 실패" value={display(`${data.applicationFail}명`)} variant="gray" />
      </AppFailArea>

      <VisChartArea>
        <BarChartCard title="접속자 수" labels={data.visitorChartLabels} values={data.visitorChart} unit="명" />
        <SummaryGrid>
          <StatCard label="종합" value={display(`${data.summary.total}명`)} variant="primary" />
          <StatCard label="유저" value={display(`${data.summary.user}명`)} variant="gray" />
          <StatCard label="인증" value={display(`${data.summary.auth}명`)} variant="gray" />
          <StatCard label="접수" value={display(`${data.summary.application}명`)} variant="gray" />
        </SummaryGrid>
        <SummaryArea>
          <StatCard label="Client 오류" value={display(`${data.clientErrorCount}회`)} variant="gray" />
          <StatCard label="Client 경고" value={display(`${data.clientWarnCount}회`)} variant="primary" />
        </SummaryArea>
      </VisChartArea>

      <ClientLogArea>
        <ErrorLogCard
          label="최근 1시간 클라이언트 오류/경고"
          value={display(`${data.clientLogTotalCount}건`, availability?.clientLogs)}
          items={data.clientErrorLogs}
        />
      </ClientLogArea>

      <ServerLogArea>
        <ErrorLogCard
          label="최근 1시간 서버 API 오류"
          value={display(`${data.serverLogTotalCount}건`, availability?.serverLogs)}
          items={data.serverErrorLogs}
        />
      </ServerLogArea>

      <PdfSuccessArea>
        <StatCard label="PDF 다운로드 성공" value={display(`${data.pdfSuccess}명`)} variant="gray" />
        <StatCard label="DB 총 용량" value={display(`${data.dbUsageMb}MB`, availability?.resources)} variant="gray" />
        <Info>
          <div className="hot-menu">Hot Menu</div>
          <ActionButton variant="primary" onClick={onReload} disabled={!onReload}>
            Reload
          </ActionButton>
        </Info>
      </PdfSuccessArea>

      <PdfFailArea>
        <StatCard label="PDF 다운로드 실패" value={display(`${data.pdfFail}명`)} variant="primary" />
        <StatCard
          label="버킷 총 용량"
          value={display(`${data.bucketUsageMb}MB`, availability?.resources)}
          variant="gray"
        />
        <Info>
          <ActionButton
            variant="primary"
            onClick={onDownload}
            disabled={!onDownload || isDownloading}
            aria-label="리포트 다운로드"
            aria-busy={isDownloading}
          >
            {isDownloading ? "리포트 생성 중…" : <DownloadIcon />}
          </ActionButton>
          <ActionButton variant="light" onClick={onStatus} disabled={!onStatus}>
            Status
          </ActionButton>
        </Info>
      </PdfFailArea>
    </Grid>
  );
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: auto auto 240px 120px;
  gap: 16px;
  padding: 24px;
  grid-template-areas:
    "device      device      device      device      apireq      apireq      apichart    apichart"
    "totalusr    concurrent  avgtime     avgtime     apifail     apifailrate appsuccess  appfail"
    "vischart    vischart    clientlog   clientlog   serverlog   serverlog   pdfsuccess  pdffail"
    "summary     summary     clientlog   clientlog   serverlog   serverlog   actions     actions";
`;

const DeviceArea = styled.div`
  grid-area: device;
`;
const ApiReqArea = styled.div`
  grid-area: apireq;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const ApiChartArea = styled.div`
  grid-area: apichart;
`;
const TotalUsrArea = styled.div`
  grid-area: totalusr;
`;
const ConcurrentArea = styled.div`
  grid-area: concurrent;
`;
const AvgTimeArea = styled.div`
  grid-area: avgtime;
`;
const ApiFailArea = styled.div`
  grid-area: apifail;
`;
const ApiFailRateArea = styled.div`
  grid-area: apifailrate;
`;
const AppSuccessArea = styled.div`
  grid-area: appsuccess;
`;
const AppFailArea = styled.div`
  grid-area: appfail;
`;
const VisChartArea = styled.div`
  grid-area: vischart;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const ClientLogArea = styled.div`
  grid-area: clientlog;
  height: 100%;
  min-height: 0;
`;
const ServerLogArea = styled.div`
  grid-area: serverlog;
`;
const PdfSuccessArea = styled.div`
  grid-area: pdfsuccess;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
`;
const PdfFailArea = styled.div`
  grid-area: pdffail;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
`;

const Info = styled.div`
  display: flex;
  height: 100%;
  gap: 8px;
  flex: 1;

  .hot-menu {
    display: flex;
    text-align: center;
    padding: 12px;
    width: 100%;
    height: 70px;
    border: 1px solid #cccccc;
    border-radius: 8px;
  }
`;

const SummaryArea = styled.div`
  grid-area: summary;
  display: flex;
  gap: 20px;
`;
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
`;

const ActionButton = styled.button<{ variant: "primary" | "light" }>`
  border: none;
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  height: 70px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ variant }) => (variant === "primary" ? "#6C63FF" : "#E9E9F2")};
  color: ${({ variant }) => (variant === "primary" ? "#fff" : "#333")};
`;

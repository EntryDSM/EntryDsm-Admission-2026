import type { ReactNode } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { colors, media } from "@entry/design";
import { AUTH_APP_URL, Btn, usePageTitle } from "@entry/ui";
import { toast } from "react-toastify";
import { HttpError } from "../apis/http";
import { getApplicationResult, type ApplicationResult } from "../apis/mypage";
import { getSchedules, type Schedule } from "../apis/schedule";
import {
  PASS_STATUS_LABEL,
  REGION_LABEL,
  RESULT_ADMISSION_TYPE_LABEL,
  RESULT_GUIDE_SCHEDULE_TITLE,
  SCREENING_ROUND_TITLE,
  formatBirthDate,
  getScreeningRound,
  isPassedStatus,
  labelOf,
  type ScreeningRound,
} from "../utils/applicationResult";
import { formatScheduleDate, formatScheduleDateWithTime, formatScheduleTime, hasScheduleTime } from "../utils/schedule";

const SCHOOL_NAME = "대덕소프트웨어마이스터고등학교";
const SCHOOL_ADDRESS = `대전광역시 유성구 가정북로 76, ${SCHOOL_NAME}`;
const SCHOOL_HOMEPAGE = "http://dsmhs.djsch.kr";
const UNDECIDED_SCHEDULE = "추후 안내";
const HOME_BUTTON_LABEL = "홈으로 돌아가기";

/**
 * 합격자 발표 페이지 (/mypage/result). 마이페이지의 "합격 결과 확인" 버튼으로 들어온다.
 * 합격 여부 조회 응답의 passStatus 로 1차/최종 회차와 합격·불합격을 나눠 보여준다.
 */
export const ApplicationResultPage = () => {
  const navigate = useNavigate();
  const resultQuery = useQuery({
    queryKey: ["application-result"],
    queryFn: getApplicationResult,
    retry: false,
    // 비로그인 상태의 401 은 정상 흐름이라 Sentry 에 보내지 않는다 (docs/OBSERVABILITY.md 2절).
    meta: { sentryIgnoreStatuses: [401] },
  });
  const passStatus = resultQuery.data?.passStatus;
  const round = passStatus ? getScreeningRound(passStatus) : null;
  const isPassed = passStatus ? isPassedStatus(passStatus) : false;
  // 일정 안내(2차 전형·합격자 등록·OT)는 합격자에게만 보여주므로 그때만 일정을 조회한다.
  const { data: schedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedules,
    enabled: isPassed,
  });

  usePageTitle(round ? `${SCREENING_ROUND_TITLE[round]} | EntryDSM` : undefined);

  const goHome = () => navigate("/");
  const homeButton = (
    <ActionSlot>
      <Btn width="100%" onClick={goHome}>
        {HOME_BUTTON_LABEL}
      </Btn>
    </ActionSlot>
  );

  if (resultQuery.isPending) {
    return <ResultNotice title="합격 결과를 확인하고 있습니다." />;
  }

  if (resultQuery.isError) {
    const status = resultQuery.error instanceof HttpError ? resultQuery.error.status : undefined;

    if (status === 401) {
      return (
        <ResultNotice title="로그인이 필요합니다." description="합격 결과는 로그인 후 확인할 수 있습니다.">
          <ActionSlot>
            <Btn
              width="100%"
              onClick={() => {
                window.location.href = AUTH_APP_URL;
              }}
            >
              로그인
            </Btn>
          </ActionSlot>
          {homeButton}
        </ResultNotice>
      );
    }

    if (status === 404) {
      return (
        <ResultNotice
          title="지원 정보를 찾을 수 없습니다."
          description="원서를 접수한 계정으로 로그인했는지 확인해 주세요."
        >
          {homeButton}
        </ResultNotice>
      );
    }

    return (
      <ResultNotice title="합격 결과를 불러오지 못했습니다." description="잠시 후 다시 시도해 주세요.">
        <ActionSlot>
          <Btn
            width="100%"
            onClick={() => {
              resultQuery.refetch();
            }}
          >
            다시 시도
          </Btn>
        </ActionSlot>
        {homeButton}
      </ResultNotice>
    );
  }

  // 로딩·오류를 거르고 나면 data 가 있는 성공 상태만 남는다 (미리 꺼내 둔 별칭은 좁혀지지 않아 여기서 읽는다).
  const result = resultQuery.data;

  if (result.passStatus === "PENDING") {
    return (
      <ResultNotice title="아직 합격 결과가 발표되지 않았습니다." description="합격자 발표일에 다시 확인해 주세요.">
        {homeButton}
      </ResultNotice>
    );
  }

  if (!round) {
    return (
      <ResultNotice title="합격 결과를 확인할 수 없습니다." description="문의처로 연락해 주세요.">
        {homeButton}
      </ResultNotice>
    );
  }

  return (
    <ResultAnnouncement result={result} round={round} isPassed={isPassed} schedules={schedules} onGoHome={goHome} />
  );
};

interface ResultNoticeProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/** 발표 전·오류 등 결과 표를 보여줄 수 없을 때의 안내 화면 */
const ResultNotice = ({ title, description, children }: ResultNoticeProps) => (
  <PageContainer>
    <ContentWrapper>
      <Title>{title}</Title>
      {description && <Message isPassed={false}>{description}</Message>}
      {children && <ButtonRow>{children}</ButtonRow>}
    </ContentWrapper>
  </PageContainer>
);

interface ResultAnnouncementProps {
  result: ApplicationResult;
  round: ScreeningRound;
  isPassed: boolean;
  schedules: Schedule[] | undefined;
  onGoHome: () => void;
}

const ResultAnnouncement = ({ result, round, isPassed, schedules, onGoHome }: ResultAnnouncementProps) => {
  const findSchedule = (title: string) => schedules?.find(schedule => schedule.title === title);
  const interview = findSchedule(RESULT_GUIDE_SCHEDULE_TITLE.interview);
  const registration = findSchedule(RESULT_GUIDE_SCHEDULE_TITLE.registration);
  const orientation = findSchedule(RESULT_GUIDE_SCHEDULE_TITLE.orientation);
  const isFinalPassed = isPassed && round === "FINAL";

  const roundText = round === "FIRST" ? "1차 전형에서" : "2차 전형에서 최종";
  const message = isPassed
    ? `축하합니다! ${result.name} 지원자님은 ${roundText} 합격하였습니다.`
    : `아쉽게도 ${result.name} 지원자님은 ${roundText} 불합격하였습니다.`;

  const handleDownloadRegistrationDocuments = () => {
    // TODO: 합격자 등록 서류 다운로드 API 연동
    toast.info("합격자 등록 서류 다운로드는 준비 중입니다.");
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Title>
          {SCHOOL_NAME} {SCREENING_ROUND_TITLE[round]}
        </Title>
        <Message isPassed={isPassed}>{message}</Message>

        <ResultTable>
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "30%" }} />
          </colgroup>
          <tbody>
            <tr>
              <th scope="row">접수번호</th>
              <td>{result.applicationNumber}</td>
              <th scope="row">수험번호</th>
              <td>{result.examineeNumber ?? "-"}</td>
            </tr>
            <tr>
              <th scope="row">성명</th>
              <td>{result.name}</td>
              <th scope="row">생년월일</th>
              <td>{formatBirthDate(result.birthDate)}</td>
            </tr>
            <tr>
              <th scope="row">지역 구분</th>
              <td>{labelOf(REGION_LABEL, result.region)}</td>
              <th scope="row">전형 구분</th>
              <td>{labelOf(RESULT_ADMISSION_TYPE_LABEL, result.admissionType)}</td>
            </tr>
            <tr>
              <th scope="row">합불 사항</th>
              <td colSpan={3}>
                <PassStatusText isPassed={isPassed}>
                  {result.passDescription || PASS_STATUS_LABEL[result.passStatus]}
                </PassStatusText>
              </td>
            </tr>
            <tr>
              <th scope="row">비고</th>
              <td colSpan={3}>{result.note || "-"}</td>
            </tr>
          </tbody>
        </ResultTable>

        {isPassed && round === "FIRST" && (
          <GuideSection>
            <GuideTitle>2차 전형 안내</GuideTitle>
            <GuideList>
              <li>일자: {interview ? formatScheduleDate(interview.startAt) : UNDECIDED_SCHEDULE}</li>
              <li>
                시간:{" "}
                {interview && hasScheduleTime(interview.startAt) ? formatScheduleTime(interview.startAt) : "별도 안내"}
              </li>
              <li>장소: {SCHOOL_ADDRESS}</li>
            </GuideList>
            <GuideNote>
              지원자는 반드시 시간에 맞춰 2차 전형 진행 장소에 도착하여야 합니다.
              <br />
              보호자는 면접장 내부에서 대기하실 수 없습니다.
            </GuideNote>
          </GuideSection>
        )}

        {isFinalPassed && (
          <>
            <GuideSection>
              <GuideTitle>합격자 등록 안내</GuideTitle>
              <GuideList>
                <li>
                  기간:{" "}
                  {registration
                    ? `${formatScheduleDate(registration.startAt)} ~ ${formatScheduleDateWithTime(registration.endAt)}`
                    : UNDECIDED_SCHEDULE}
                </li>
                <li>장소: {SCHOOL_ADDRESS}</li>
              </GuideList>
              <GuideNote>
                지원자는 반드시 아래 서류를 기간내에 방문 또는 우편으로 제출하여야 합격자 등록이 완료됩니다.
              </GuideNote>
            </GuideSection>
            <GuideSection>
              <GuideTitle>합격자 오리엔테이션 안내</GuideTitle>
              <GuideList>
                <li>일시: {orientation ? formatScheduleDateWithTime(orientation.startAt) : UNDECIDED_SCHEDULE}</li>
                <li>장소: {SCHOOL_ADDRESS}</li>
              </GuideList>
              <GuideNote>자세한 내용은 합격자 등록 서류에 첨부된 문서를 참고하여 주세요.</GuideNote>
            </GuideSection>
          </>
        )}

        <GuideSection>
          <GuideTitle>문의처</GuideTitle>
          <GuideList>
            <li>042) 866-8820, 8822, {SCHOOL_NAME} SW교육부</li>
            <li>
              <ContactLink href={SCHOOL_HOMEPAGE} target="_blank" rel="noopener noreferrer">
                {SCHOOL_HOMEPAGE}
              </ContactLink>
            </li>
          </GuideList>
        </GuideSection>

        <ButtonRow>
          {isFinalPassed && (
            <ActionSlot grow={3.6}>
              <Btn width="100%" onClick={handleDownloadRegistrationDocuments}>
                합격자 등록 서류 다운로드
              </Btn>
            </ActionSlot>
          )}
          <ActionSlot>
            <Btn
              width="100%"
              backgroundColor={isFinalPassed ? colors.gray[400] : colors.orange[800]}
              hoverBackgroundColor={isFinalPassed ? colors.gray[500] : colors.orange[850]}
              onClick={onGoHome}
            >
              {HOME_BUTTON_LABEL}
            </Btn>
          </ActionSlot>
        </ButtonRow>
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 70px);
  min-height: calc(100svh - 70px);
  display: flex;
  justify-content: center;
  background-color: ${colors.extra.realWhite};
  padding: 100px 0 110px;

  ${media.tablet} {
    padding: 40px 0 60px;
  }
`;

const ContentWrapper = styled.div`
  width: min(1000px, calc(100% - 48px));
  display: flex;
  flex-direction: column;

  ${media.medium} {
    width: calc(100% - 32px);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  color: ${colors.gray[500]};
  text-align: center;
  overflow-wrap: anywhere;

  ${media.tablet} {
    font-size: 20px;
  }
`;

const Message = styled.p<{ isPassed: boolean }>`
  margin: 12px 0 0;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ isPassed }) => (isPassed ? colors.orange[800] : colors.gray[400])};
  text-align: center;
  overflow-wrap: anywhere;

  ${media.tablet} {
    font-size: 16px;
  }
`;

// 데스크톱은 [항목|값|항목|값] 4열 표, 태블릿 이하에서는 행마다 [항목|값] 2열로 접는다.
const ResultTable = styled.table`
  width: 100%;
  margin-top: 40px;
  table-layout: fixed;
  border-collapse: collapse;
  border: 1px solid ${colors.gray[300]};
  border-top: 2px solid ${colors.orange[800]};
  font-size: 15px;
  font-weight: 500;
  line-height: 19px;
  color: ${colors.gray[500]};
  text-align: center;

  th,
  td {
    padding: 6px 12px;
    border: 1px solid ${colors.gray[300]};
    overflow-wrap: anywhere;
  }

  th {
    font-weight: 500;
    background-color: ${colors.gray[50]};
  }

  ${media.tablet} {
    display: block;
    margin-top: 32px;
    border-bottom: none;
    font-size: 14px;

    tbody {
      display: block;
    }

    tr {
      display: grid;
      grid-template-columns: 112px minmax(0, 1fr);
    }

    th,
    td {
      border: none;
      border-bottom: 1px solid ${colors.gray[300]};
    }

    th {
      border-right: 1px solid ${colors.gray[300]};
    }

    td {
      text-align: left;
    }
  }
`;

const PassStatusText = styled.span<{ isPassed: boolean }>`
  color: ${({ isPassed }) => (isPassed ? colors.orange[800] : colors.extra.error)};
`;

const GuideSection = styled.section`
  margin-top: 40px;

  ${media.tablet} {
    margin-top: 32px;
  }
`;

const GuideTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${colors.orange[800]};
`;

const GuideList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 16px 0 0;
  padding: 0 0 0 8px;
  list-style: none;
  font-size: 15px;
  line-height: 1.5;
  color: ${colors.gray[500]};
  overflow-wrap: anywhere;

  li::before {
    content: "·";
    margin-right: 6px;
  }
`;

const GuideNote = styled.p`
  margin: 20px 0 0;
  padding-left: 8px;
  font-size: 15px;
  line-height: 1.6;
  color: ${colors.gray[500]};
  overflow-wrap: anywhere;
`;

const ContactLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
`;

// 내용이 짧아도 버튼은 화면 아래쪽에 붙는다 (margin-top: auto).
const ButtonRow = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  margin-top: auto;
  padding-top: 60px;

  ${media.tablet} {
    flex-direction: column;
    gap: 12px;
    padding-top: 40px;
  }
`;

const ActionSlot = styled.div<{ grow?: number }>`
  flex: ${({ grow = 1 }) => grow} 1 0;
  min-width: 0;
`;

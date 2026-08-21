import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { RecruitmentSchedule } from "@entry/ui";
import { downloadIcon } from "../assets";

const SCHEDULE_TITLE = "2027학년도 신입생 전형 일정";

const SCHEDULE_ITEMS = [
  {
    category: "원서 접수",
    date: "2026. 10. 19.(월) 09:00 ~ 10. 22.(목) 17:00",
    note: "인터넷 접수 (본교 홈페이지에 별도 안내)",
  },
  {
    category: "원서 및 증빙 서류 제출",
    date: "2026. 10. 19.(월) ~ 10. 22.(목) 17:00 \n (* 본교 접수 시간: 10:00 ~ 17:00)",
    note: "본교 접수처 또는 등기우편",
  },
  { category: "1차 전형 합격자 발표", date: "2026. 10. 26.(월) 15:00", note: "원서접수 사이트" },
  {
    category: "2차 전형(심층면접 등)",
    date: "2026. 10. 30.(금)",
    note: "본교 내 지정장소 \n 세부 운영 시간은 별도 안내",
  },
  { category: "최종 합격자 발표", date: "2026. 11. 04.(수) 10:00", note: "원서접수 사이트" },
  {
    category: "합격자 등록 (입학동의서 제출)",
    date: "2026. 11. 06.(금) ~ 11. 13.(금) 17:00 \n (* 본교 접수 시간: 10:00 ~ 17:00)",
    note: "본교 등록 접수처 또는 등기우편",
  },
  {
    category: "건강검진 결과 제출",
    date: "2026. 11. 07.(금) ~ 11. 21.(토) ",
    note: "병원에서 검사 후 본교에 제출 \n 오리엔테이션(11.21,토) 참가 시 제출 가능",
  },
];

const SCHEDULE_NOTES = [
  "등기우편 접수는 제출 마감일 우체국 소인까지 인정함.",
  "합격자 등록은 입학동의서 제출로 대신함.",
  "원서는 전형의 구분과 상관없이 단일 지원이 원칙임.",
  "전형 일정은 추후 변경될 수 있음.",
];

const ATTACHMENT_FILE_NAME = "2027학년도 대덕소프트웨어마이스터고등학교 신입생 입학전형 요강.pdf";

export const AdmissionOverviewPage = () => {
  const downloadAttachment = () => {
    const link = document.createElement("a");
    link.href = `/${ATTACHMENT_FILE_NAME}`;
    link.download = ATTACHMENT_FILE_NAME;
    link.click();
  };

  return (
    <Container>
      <PageTitle>신입생 전형 요강</PageTitle>

      <TitleGap />

      <ContentWrapper>
        <ScheduleTitle>{SCHEDULE_TITLE}</ScheduleTitle>
        <RecruitmentSchedule scheduleItems={SCHEDULE_ITEMS} notes={SCHEDULE_NOTES} />

        <AttachmentSection>
          <AttachmentLabel>첨부 파일</AttachmentLabel>
          <AttachmentDivider />
          <DownloadButton type="button" onClick={downloadAttachment} aria-label={`${ATTACHMENT_FILE_NAME} 다운로드`}>
            <AttachmentFileName>{ATTACHMENT_FILE_NAME}</AttachmentFileName>
            <DownloadIconImg src={downloadIcon} alt="" />
          </DownloadButton>
        </AttachmentSection>
      </ContentWrapper>

      <BottomGap />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1540px;
  min-height: calc(100vh - 70px);
  min-height: calc(100svh - 70px);
  margin: 0 auto;
  padding: 42px 0 0 0;

  @media (max-width: 1780px) {
    max-width: none;
    padding-left: 120px;
    padding-right: 120px;
  }

  /* 본문 폭(1040px)이 유지되도록 좌우 여백을 줄인다 - 표에 가로 스크롤이 생기지 않게 */
  @media (max-width: 1400px) {
    padding-left: 60px;
    padding-right: 60px;
  }

  @media (max-width: 1200px) {
    padding-left: 20px;
    padding-right: 20px;
  }

  @media (max-width: 768px) {
    padding-top: 32px;
  }

  @media (max-height: 760px) {
    padding-top: 28px;
  }
`;

// 디자인(1920×1391)의 제목 아래 144px : 본문 아래 300px 비율을 유지하되,
// 화면이 낮으면 두 여백이 함께 줄어 본문이 첫 화면을 넘지 않게 한다
const TitleGap = styled.div`
  flex: 1 1 0;
  min-height: 40px;
  max-height: 144px;

  @media (max-height: 760px) {
    min-height: 32px;
  }
`;

const BottomGap = styled.div`
  flex: 2 1 0;
  min-height: 24px;

  @media (max-height: 760px) {
    min-height: 20px;
  }
`;

const PageTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: ${colors.gray[500]};

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
`;

const ScheduleTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.orange[800]};
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const AttachmentSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 56px;
  padding: 11px 8px;
  line-height: 1.2;
  border-top: 1px solid ${colors.gray[300]};
  border-bottom: 1px solid ${colors.gray[300]};

  @media (max-height: 760px) {
    margin-top: 40px;
  }
`;

const AttachmentLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.gray[500]};
`;

const AttachmentDivider = styled.span`
  width: 1px;
  height: 10px;
  background-color: ${colors.gray[300]};
`;

const AttachmentFileName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.gray[500]};
`;

// 파일명과 아이콘을 함께 감싸서 둘 중 어디를 눌러도 다운로드된다
const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover span {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &:hover img {
    opacity: 0.7;
  }

  &:focus-visible {
    outline: 2px solid ${colors.orange[700]};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const DownloadIconImg = styled.img`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

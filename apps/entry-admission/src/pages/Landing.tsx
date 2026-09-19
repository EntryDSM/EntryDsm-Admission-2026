import { colors, media } from "@entry/design";
import { Btn, EntryLogo, USER_APP_URL } from "@entry/ui";
import styled from "@emotion/styled";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useGetAllSchedule, useStartApplication } from "../apis";
import type { ScheduleDateTime } from "../apis";
import { LinkIcon } from "../assets";

// 전형 요강 PDF 는 entry-user 의 public 폴더에서 서빙되므로 사용자 앱 도메인으로 연결한다.
const GUIDELINE_FILE_NAME = "2027학년도 대덕소프트웨어마이스터고등학교 신입생 입학전형 요강.pdf";
const GUIDELINE_URL = `${USER_APP_URL}/${encodeURIComponent(GUIDELINE_FILE_NAME)}`;

const formatScheduleDate = (date: ScheduleDateTime | undefined) => {
  if (!date) return null;

  const parsedDate = new Date(date.year, date.month - 1, date.day);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(parsedDate);
};

export const Landing = () => {
  const navigate = useNavigate();
  const { mutateAsync: startApplication, isPending } = useStartApplication();
  const { data: schedules } = useGetAllSchedule();
  const applicationSchedule = schedules?.find(schedule => schedule.title === "원서 접수");
  const startDate = formatScheduleDate(applicationSchedule?.startAt);
  const endDate = formatScheduleDate(applicationSchedule?.endAt);
  // 일정을 아직 받지 못했거나 등록되지 않았으면 날짜 대신 일반 문구로 안내한다.
  const submissionPeriod = startDate && endDate ? `${startDate} ~ ${endDate}까지` : "원서 접수 기간 내에";

  // 로그인 여부는 RequireAuth 가드와 서버 401 처리(http.ts)가 담당한다.
  const handleStartApplication = async () => {
    try {
      await startApplication();
      navigate("/application-classification");
    } catch {
      // useStartApplication의 onError에서 사용자에게 실패 안내를 표시합니다.
    }
  };

  toast.error("원서 작성 시작 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  return (
    <Container>
      <PageHeader>
        <EntryLogo width={65} height={75} />
        <Title>대덕소프트웨어마이스터고등학교 입학 원서 접수</Title>
        <SubTitle>지원 전 안내사항을 반드시 읽어주세요</SubTitle>
      </PageHeader>

      <Section>
        <SectionTitle>
          <SectionNumber>01.</SectionNumber>원서 및 성적 입력
        </SectionTitle>
        <BulletList>
          <li>절차를 읽고 원서와 성적을 작성해 주시면 원서 접수가 완료됩니다.</li>
        </BulletList>
        <GuidelineLink href={GUIDELINE_URL} target="_blank" rel="noopener noreferrer">
          <LinkIcon />
          입학 전형 요강 다운로드
        </GuidelineLink>
      </Section>

      <Section>
        <SectionTitle>
          <SectionNumber>02.</SectionNumber>입학 원서 제출
        </SectionTitle>
        <BulletList>
          <li>
            작성하신 입학 원서와 추가 서류는 <Em>마이페이지에서 출력</Em> 가능합니다.
          </li>
          <li>
            서류를 출력 후 확인 부분에 서명 후 <Highlight>{submissionPeriod}</Highlight> 해당 서류를 원서 접수처에
            제출합니다.
          </li>
          <li>
            제출 방법은 <Highlight>등기 우편</Highlight>(제출 마감일 우체국 소인까지 인정) 또는{" "}
            <Highlight>방문 접수</Highlight>(매일 10:00 ~ 17:00)만 가능합니다.
          </li>
        </BulletList>
      </Section>

      <Section>
        <SectionTitle>
          <SectionNumber>03.</SectionNumber>1차 전형
        </SectionTitle>
        <BulletList>
          <li>
            내신 성적 점수(교과 성적, 출석 점수, 봉사활동 점수)와 가산점의 합으로 <Em>정원의 200% 이내의 인원</Em>을
            발표합니다.
          </li>
        </BulletList>
      </Section>

      <Section>
        <SectionTitle>
          <SectionNumber>04.</SectionNumber>2차 전형
        </SectionTitle>
        <BulletList>
          <li>
            전형 요소는 1차 전형의 점수와 직업기초 소양 평가, 심층 면접, 컴퓨팅 사고력 측정의 점수 합으로 구성됩니다.
          </li>
          <li>
            내신 성적, 직업기초 소양 평가, 심층 면접은 전형 구분에 따라 반영률이 다르며, 컴퓨팅 사고력 측정은 마이스터
            인재 전형에서만 시행합니다.
          </li>
          <li>
            학교생활에 대한 자세, 학업의지, 소프트웨어 이해도, 소프트웨어에 대한 열정 및 발전가능성 등을 종합적으로
            심사합니다.
          </li>
        </BulletList>
      </Section>

      <Section>
        <SectionTitle>
          <SectionNumber>05.</SectionNumber>결과 발표
        </SectionTitle>
        <BulletList>
          <li>
            1차 전형 합격자에 한하여 1차 전형 요소별 점수와 2차 전형 요소별 점수를 합산하여 점수가 높은 순으로 모집
            정원의 100%를 선발합니다.
          </li>
          <li>
            전형유형에 관계없이 1, 2차 전형 합산 200점 미만은 입학전형위원회의 협의를 거쳐 해당 전형에서 불합격
            처리합니다. (후순위는 합격 가능)
          </li>
          <li>
            심층면접(70점)의 15%(10.5점) 미만은 입학전형위원회의 협의를 거쳐 해당 전형에서 불합격 처리합니다. (후순위는
            합격 가능)
          </li>
        </BulletList>
      </Section>

      <NoticeSection>
        <NoticeTitle>원서 접수 전 꼭 읽어주세요!</NoticeTitle>
        <BulletList>
          <li>
            전기학교(전국의 모든 마이스터고등학교 포함)에 이중으로 지원할 수 없음. (단, 불합격자는 특성화고 및 후기고에
            지원이 가능함)
          </li>
          <li>본교 최종 합격자(미등록자 포함)는 시·도교육청 시행 2027학년도 고등학교 신입생 모집에 지원할 수 없음.</li>
          <li>
            전형유형(일반전형·특별전형)에 따라 전형 방법 및 전형 요소별 배점이 다름을 유의하여 입학원서를 작성해야 함.
          </li>
          <li>
            기재 착오 또는 서류 미비로 인한 불이익은 지원자가 책임지며, 제출서류(증빙서류 포함) 또는 제출서류에 기재된
            사항이 허위인 경우 합격 취소, 입학 취소 또는 퇴학 처리됨.
          </li>
          <li>제출한 서류는 일체 반환하지 아니함.</li>
          <li>
            천재지변, 감염병 유행 등에 따른 위기 상황 발생 시 중앙방역대책본부 및 교육부의 지침 등에 따라 입학전형
            요강을 탄력적으로 시행할 수 있으며 변동사항은 홈페이지에 안내함.
          </li>
          <li>
            전교생이 기숙사에서 생활하므로 건강 등의 사유로 공동생활에 적응이 어렵다고 판단되는 경우 충분히 고려하여
            신중히 응시해야 함.
          </li>
          <li>
            다음에 해당하는 자는 입학전형위원회의 심의를 거쳐 입학을 배제할 수 있음.
            <SubList>
              <li>1) 본교의 학업이나 실습 수행에 지장이 있다고 판정된 자</li>
              <li>2) 흡연검사 결과 양성 반응자(2차 전형시 흡연검사 실시함)</li>
            </SubList>
          </li>
          <li>
            본 입학전형요강에 명시되지 않은 사항 및 특별한 경우는 『2027학년도 마이스터고 입학전형업무관리지침(2026.6,
            대전광역시교육청 과학직업정보과)』 및 본교 입학전형위원회의 결정에 따라 처리함.
          </li>
        </BulletList>
      </NoticeSection>

      <NoticeSection>
        <NoticeTitle>문의처</NoticeTitle>
        <BulletList>
          <li>042) 866-8820, 042) 866-8822 (대덕소프트웨어마이스터고등학교 SW교육부)</li>
          <li>
            <ContactLink href="http://dsmhs.djsch.kr" target="_blank" rel="noopener noreferrer">
              http://dsmhs.djsch.kr
            </ContactLink>
          </li>
        </BulletList>
      </NoticeSection>

      <ButtonArea>
        <Btn width="100%" onClick={() => void handleStartApplication()} isBlocked={isPending}>
          접수하기
        </Btn>
      </ButtonArea>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: min(1000px, calc(100% - 48px));
  margin: 0 auto;
  padding: 40px 0 80px;

  ${media.medium} {
    width: calc(100% - 32px);
    padding: 28px 0 56px;
  }
`;

const PageHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
  color: ${colors.gray[500]};
  word-break: keep-all;

  ${media.tablet} {
    font-size: 22px;
  }
`;

const SubTitle = styled.p`
  font-size: 20px;
  font-weight: 400;
  color: ${colors.gray[400]};

  ${media.tablet} {
    font-size: 16px;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 36px 0;
  border-bottom: 1px solid ${colors.gray[200]};
`;

const NoticeSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 36px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  color: ${colors.gray[500]};
`;

const SectionNumber = styled.span`
  margin-right: 8px;
  color: ${colors.orange[800]};
`;

const NoticeTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  color: ${colors.orange[800]};
`;

const BulletList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.7;
  color: ${colors.gray[500]};
  word-break: keep-all;

  & > li {
    position: relative;
    padding-left: 14px;
  }

  /* 글로벌 스타일이 list-style 을 지우므로 가운뎃점 불릿을 직접 그린다 */
  & > li::before {
    content: "·";
    position: absolute;
    left: 2px;
    top: 0;
    font-weight: 700;
  }

  ${media.tablet} {
    font-size: 15px;
  }
`;

const SubList = styled.ol`
  display: flex;
  flex-direction: column;
  padding-left: 16px;
`;

const Em = styled.strong`
  font-weight: 700;
`;

const Highlight = styled.strong`
  font-weight: 700;
  color: ${colors.orange[800]};
`;

const GuidelineLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-left: 14px;
  font-size: 15px;
  font-weight: 500;
  color: ${colors.gray[400]};
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: ${colors.gray[500]};
  }

  &:focus-visible {
    outline: 2px solid ${colors.orange[700]};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const ContactLink = styled.a`
  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const ButtonArea = styled.div`
  padding-top: 56px;
`;

import styled from "@emotion/styled";
import { AttendanceForm, CertCheckForm } from "@entry/ui";
import { useCalculationPageData, type CalculationState } from "../../contexts";
import { media } from "@entry/design";

// API 연동 없음
// Activity 페이지는 계산 컨텍스트의 로컬 상태만 사용합니다.

type ActivityPageKey = "primaryActivity" | "graduatedActivity" | "qeActivity";
type ActivityFormData = CalculationState[ActivityPageKey];

const DEFAULT_ACTIVITY_DATA: Record<ActivityPageKey, ActivityFormData> = {
  primaryActivity: {
    absences: "",
    earlyLeaves: "",
    lateArrivals: "",
    resultMissing: "",
    volunteerHours: "",
    dsmAlgorithm: null,
    infoProcessing: null,
  },
  graduatedActivity: {
    absences: "",
    earlyLeaves: "",
    lateArrivals: "",
    resultMissing: "",
    volunteerHours: "",
    dsmAlgorithm: null,
    infoProcessing: null,
  },
  qeActivity: {
    absences: "",
    earlyLeaves: "",
    lateArrivals: "",
    resultMissing: "",
    volunteerHours: "",
    dsmAlgorithm: null,
    infoProcessing: null,
  },
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  width: 100%;
  height: fit-content;

  ${media.tablet} {
    gap: 32px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  width: 100%;

  ${media.tablet} {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;

  ${media.tablet} {
    font-size: 20px;
  }

  ${media.medium} {
    font-size: 18px;
  }
`;

interface ActivityProps {
  pageKey: ActivityPageKey;
}

export const Activity = ({ pageKey }: ActivityProps) => {
  const dataKey = pageKey;
  const [activityData, setActivityData] = useCalculationPageData(dataKey);

  const safeActivityData: ActivityFormData = {
    ...DEFAULT_ACTIVITY_DATA[dataKey],
    ...activityData,
  };

  const updateActivityData = (patch: Partial<ActivityFormData>) => {
    setActivityData({
      ...safeActivityData,
      ...patch,
    });
  };

  const handleAbsencesChange = (value: string) => {
    updateActivityData({ absences: value });
  };

  const handleEarlyLeavesChange = (value: string) => {
    updateActivityData({ earlyLeaves: value });
  };

  const handleLateArrivalsChange = (value: string) => {
    updateActivityData({ lateArrivals: value });
  };

  const handleResultMissingChange = (value: string) => {
    updateActivityData({ resultMissing: value });
  };

  const handleVolunteerHoursChange = (value: string) => {
    updateActivityData({ volunteerHours: value });
  };

  const handleDsmAlgorithmChange = (value: "O" | "X") => {
    updateActivityData({ dsmAlgorithm: value });
  };

  const handleInfoProcessingChange = (value: "O" | "X") => {
    updateActivityData({ infoProcessing: value });
  };

  return (
    <Container>
      {dataKey !== "qeActivity" && (
        <>
          <Section>
            <SectionTitle>출결</SectionTitle>
            <GridContainer>
              <AttendanceForm
                width="100%"
                title="결석"
                value={safeActivityData.absences}
                onChange={handleAbsencesChange}
                defaultCount={10}
                prefix="미인정"
              />
              <AttendanceForm
                width="100%"
                title="조퇴"
                value={safeActivityData.earlyLeaves}
                onChange={handleEarlyLeavesChange}
                defaultCount={10}
                prefix="미인정"
              />
              <AttendanceForm
                width="100%"
                title="지각"
                value={safeActivityData.lateArrivals}
                onChange={handleLateArrivalsChange}
                defaultCount={10}
                prefix="미인정"
              />
              <AttendanceForm
                width="100%"
                title="결과"
                value={safeActivityData.resultMissing}
                onChange={handleResultMissingChange}
                defaultCount={10}
                prefix="미인정"
              />
            </GridContainer>
          </Section>
          <Section>
            <SectionTitle>봉사</SectionTitle>
            <AttendanceForm
              width="100%"
              title="봉사시간"
              value={safeActivityData.volunteerHours}
              onChange={handleVolunteerHoursChange}
              defaultCount={10}
            />
          </Section>
        </>
      )}
      <Section>
        <SectionTitle>자격증</SectionTitle>
        <CertCheckForm
          width="100%"
          compactOnMobile
          title="DSM 알고리즘 대회 입상"
          value={safeActivityData.dsmAlgorithm}
          onChange={handleDsmAlgorithmChange}
        />
        <CertCheckForm
          width="100%"
          compactOnMobile
          title="프로그래밍기능사 자격증 취득"
          value={safeActivityData.infoProcessing}
          onChange={handleInfoProcessingChange}
        />
      </Section>
    </Container>
  );
};

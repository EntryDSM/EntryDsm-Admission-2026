import styled from "@emotion/styled";
import { Text } from "@entry/design";
import { AttendanceForm, CertCheckForm } from "@entry/ui";
import { useCalculationPageData, type CalculationState } from "../../contexts";

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
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
`;

interface ActivityProps {
  pageKey: ActivityPageKey;
}

export const Activity = ({ pageKey }: ActivityProps) => {
  const dataKey = pageKey;
  const isQE = pageKey === "qeActivity";
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
      {!isQE && (
        <>
          <Section>
            <Text fontSize={24} fontWeight={600}>
              출결
            </Text>
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
            <Text fontSize={24} fontWeight={600}>
              봉사
            </Text>
            <AttendanceForm
              width="748px"
              title="봉사시간"
              value={safeActivityData.volunteerHours}
              onChange={handleVolunteerHoursChange}
              defaultCount={10}
            />
          </Section>
        </>
      )}
      <Section>
        <Text fontSize={24} fontWeight={600}>
          자격증
        </Text>
        <CertCheckForm
          width="100%"
          title="DSM 알고리즘 대회 입상"
          value={safeActivityData.dsmAlgorithm}
          onChange={handleDsmAlgorithmChange}
        />
        <CertCheckForm
          width="100%"
          title="프로그래밍기능사 자격증 취득"
          value={safeActivityData.infoProcessing}
          onChange={handleInfoProcessingChange}
        />
      </Section>
    </Container>
  );
};

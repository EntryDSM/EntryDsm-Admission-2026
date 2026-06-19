import { Fragment, useMemo } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

import {
  ApplicationPeriodIcon,
  AdmissionRateIcon,
  CompetitionRateIcon,
  FirstRoundDeadlineIcon,
  OneIcon,
  TwoIcon,
  ThreeIcon,
  FourIcon,
  ArrowIcon,
} from "../assets";

// 날짜 포맷 변환 함수 (yyyy-MM-ddTHH:mm:ss -> MM/DD)
const formatDateToMMDD = (dateString: string) => {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
};

// D-day 계산 함수
const calculateDday = (dateString: string) => {
  if (!dateString) {
    return null;
  }

  const targetDate = new Date(dateString);
  const today = new Date();

  // 시간 제거하고 날짜만 비교
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

const MOCK_SCHEDULE_DATA = {
  schedules: [
    { type: "START_DATE", date: "2026-10-20T09:00:00" },
    { type: "END_DATE", date: "2026-10-24T17:00:00" },
    { type: "FIRST_ANNOUNCEMENT", date: "2026-10-31T10:00:00" },
    { type: "INTERVIEW", date: "2026-11-07T09:00:00" },
    { type: "SECOND_ANNOUNCEMENT", date: "2026-11-14T10:00:00" },
  ],
};

const MOCK_REGION_DATA: Record<string, number> = {
  대전: 8,
  전국: 63,
  서울: 22,
  경기: 31,
  충청: 18,
  기타: 11,
};

const MOCK_GENDER_DATA: Record<string, number> = {
  남자: 104,
  여자: 43,
};

const MOCK_COMPETITION_DATA = [
  { applicationType: "COMMON", count: 92 },
  { applicationType: "MEISTER", count: 35 },
  { applicationType: "SOCIAL", count: 20 },
];

export const StatisticsLandingPage = () => {
  const TOTAL_CAPACITY = 128;
  const scheduleData = MOCK_SCHEDULE_DATA;
  const regionData = MOCK_REGION_DATA;
  const competitionData = MOCK_COMPETITION_DATA;
  const genderData = MOCK_GENDER_DATA;
  const isLoading = false;
  const isRegionLoading = false;
  const isCompetitionLoading = false;
  const isGenderLoading = false;
  const regionItems = useMemo(() => {
    if (!regionData) {
      return [];
    }

    return Object.entries(regionData).map(([regionName, count]) => ({
      regionName,
      count,
    }));
  }, [regionData]);

  const genderItems = useMemo(() => {
    if (!genderData) {
      return [];
    }

    return Object.entries(genderData).map(([genderName, count]) => ({
      genderName,
      count,
    }));
  }, [genderData]);

  const competitionSummary = useMemo(() => {
    const byTypeMap = new Map<string, number>();
    let totalApplicants = 0;

    competitionData.forEach(item => {
      totalApplicants += item.count;
      byTypeMap.set(item.applicationType, (byTypeMap.get(item.applicationType) ?? 0) + item.count);
    });

    const byType = Array.from(byTypeMap.entries()).map(([applicationType, applicants]) => ({
      applicationType,
      applicants,
    }));

    return { totalApplicants, byType };
  }, [competitionData]);

  // 스케줄 데이터에서 날짜 찾기
  const findDate = (type: string) => scheduleData.schedules.find(s => s.type === type)?.date || "";

  const startDate = findDate("START_DATE");
  const endDate = findDate("END_DATE");
  const firstAnnouncement = findDate("FIRST_ANNOUNCEMENT");
  const interview = findDate("INTERVIEW");
  const finalAnnouncement = findDate("SECOND_ANNOUNCEMENT");

  // 원서 제출 기간 포맷
  const applicationPeriod = isLoading
    ? ""
    : startDate && endDate
      ? `${formatDateToMMDD(startDate)}~${formatDateToMMDD(endDate)}`
      : "--/--~--/--";

  // 전형 일정
  const PROCESS_SCHEDULE = [
    { step: "원서 제출", date: isLoading ? "" : applicationPeriod },
    { step: "1차 발표", date: isLoading ? "" : firstAnnouncement ? formatDateToMMDD(firstAnnouncement) : "--/--" },
    { step: "2차 전형", date: isLoading ? "" : interview ? formatDateToMMDD(interview) : "--/--" },
    {
      step: "최종 합격자 발표",
      date: isLoading ? "" : finalAnnouncement ? formatDateToMMDD(finalAnnouncement) : "--/--",
    },
  ];

  // 각 단계별 마감일 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 각 단계 완료 여부 확인
  const endDateTime = endDate ? new Date(endDate) : null;
  const firstAnnouncementTime = firstAnnouncement ? new Date(firstAnnouncement) : null;
  const interviewTime = interview ? new Date(interview) : null;
  const finalAnnouncementTime = finalAnnouncement ? new Date(finalAnnouncement) : null;

  if (endDateTime) {
    endDateTime.setHours(0, 0, 0, 0);
  }

  if (firstAnnouncementTime) {
    firstAnnouncementTime.setHours(0, 0, 0, 0);
  }

  if (interviewTime) {
    interviewTime.setHours(0, 0, 0, 0);
  }

  if (finalAnnouncementTime) {
    finalAnnouncementTime.setHours(0, 0, 0, 0);
  }

  const isStep1Complete = endDateTime ? endDateTime <= today : false; // 원서 제출 마감
  const isStep2Complete = firstAnnouncementTime ? firstAnnouncementTime <= today : false; // 1차 발표
  const isStep3Complete = interviewTime ? interviewTime <= today : false; // 2차 전형
  const isStep4Complete = finalAnnouncementTime ? finalAnnouncementTime <= today : false; // 최종 발표

  // 현재 진행 중인 단계의 마감일 계산
  let currentDeadline = "";
  let currentDeadlineDate = "";

  if (!isStep1Complete && endDate) {
    // 1차: 원서 제출 마감
    const dday = calculateDday(endDate);
    currentDeadlineDate = endDate;
    currentDeadline = dday === null ? "--일" : dday > 0 ? `${dday}일` : dday === 0 ? "오늘" : "마감";
  } else if (!isStep2Complete && firstAnnouncement) {
    // 2차: 1차 발표일
    const dday = calculateDday(firstAnnouncement);
    currentDeadlineDate = firstAnnouncement;
    currentDeadline = dday === null ? "--일" : dday > 0 ? `${dday}일` : dday === 0 ? "오늘" : "마감";
  } else if (!isStep3Complete && interview) {
    // 3차: 2차 전형일
    const dday = calculateDday(interview);
    currentDeadlineDate = interview;
    currentDeadline = dday === null ? "--일" : dday > 0 ? `${dday}일` : dday === 0 ? "오늘" : "마감";
  } else if (!isStep4Complete && finalAnnouncement) {
    // 4차: 최종 발표일
    const dday = calculateDday(finalAnnouncement);
    currentDeadlineDate = finalAnnouncement;
    currentDeadline = dday === null ? "--일" : dday > 0 ? `${dday}일` : dday === 0 ? "오늘" : "마감";
  } else {
    currentDeadline = "0일";
  }

  const displayDeadline = isLoading ? "" : currentDeadline;
  const ddayValue = currentDeadlineDate ? calculateDday(currentDeadlineDate) : null;

  return (
    <Container>
      <ProcessTitle>전형 정보</ProcessTitle>
      <ProcessSection>
        <ProcessSteps>
          {PROCESS_SCHEDULE.map((item, index) => (
            <Fragment key={index}>
              <ProcessItem>
                <StepIcon>
                  {index === 0 && <OneIcon isActive={isStep1Complete} />}
                  {index === 1 && <TwoIcon isActive={isStep2Complete} />}
                  {index === 2 && <ThreeIcon isActive={isStep3Complete} />}
                  {index === 3 && <FourIcon isActive={isStep4Complete} />}
                </StepIcon>
                <StepLabel>{item.step}</StepLabel>
                {isLoading ? <SkeletonDate /> : <StepDate>{item.date}</StepDate>}
              </ProcessItem>
              {index < PROCESS_SCHEDULE.length - 1 && (
                <ArrowContainer>
                  <ArrowIcon />
                </ArrowContainer>
              )}
            </Fragment>
          ))}
        </ProcessSteps>
      </ProcessSection>

      <StatsGrid>
        <StatCard>
          <StatContent>
            <StatTitle>원서 제출 기간</StatTitle>
            {isLoading ? <SkeletonValue /> : <StatValue>{applicationPeriod}</StatValue>}
          </StatContent>
          <StatIcon>
            <ApplicationPeriodIcon />
          </StatIcon>
        </StatCard>

        <StatCard>
          <StatContent>
            <StatTitle>신입생 지원율</StatTitle>
            {isCompetitionLoading ? (
              <SkeletonValue />
            ) : (
              <StatValue>
                {competitionSummary.totalApplicants}명 /{TOTAL_CAPACITY}명
              </StatValue>
            )}
          </StatContent>
          <StatIcon>
            <AdmissionRateIcon />
          </StatIcon>
        </StatCard>

        <StatCard>
          <StatContent>
            <StatTitle>경쟁률</StatTitle>
            {isCompetitionLoading ? (
              <SkeletonValue />
            ) : (
              <StatValue>
                {TOTAL_CAPACITY > 0 ? (competitionSummary.totalApplicants / TOTAL_CAPACITY).toFixed(1) : "0.0"} : 1
              </StatValue>
            )}
          </StatContent>
          <StatIcon>
            <CompetitionRateIcon />
          </StatIcon>
        </StatCard>

        <StatCard>
          <StatContent>
            <StatTitle>
              {!isStep1Complete && endDate
                ? "1차 전형 마감일"
                : !isStep2Complete && firstAnnouncement
                  ? "2차 전형 마감일"
                  : !isStep3Complete && interview
                    ? "입학절차 마감일"
                    : !isStep4Complete && finalAnnouncement
                      ? "입학절차 마감일"
                      : "전형 마감일"}
            </StatTitle>
            {isLoading ? (
              <SkeletonValue />
            ) : (
              <StatValue>
                {ddayValue !== null && ddayValue > 0 && <StatSubtitle>앞으로 </StatSubtitle>}
                {displayDeadline}
              </StatValue>
            )}
          </StatContent>
          <StatIcon>
            <FirstRoundDeadlineIcon />
          </StatIcon>
        </StatCard>
      </StatsGrid>

      <SectionContainer>
        <SectionTitle>전형별 접수 현황</SectionTitle>
        <ApplicationTypesGrid>
          {isCompetitionLoading ? (
            <>
              <ApplicationTypeCard>
                <SkeletonValue />
              </ApplicationTypeCard>
              <ApplicationTypeCard>
                <SkeletonValue />
              </ApplicationTypeCard>
              <ApplicationTypeCard>
                <SkeletonValue />
              </ApplicationTypeCard>
            </>
          ) : (
            competitionSummary.byType.map((item, index) => {
              const typeColors: { [key: string]: string } = {
                GENERAL: "#1DB954",
                COMMON: "#1DB954", // COMMON도 일반 전형 색상 사용
                MEISTER: "#FF7A00",
                SOCIAL: "#007BFF",
              };
              const typeNames: { [key: string]: string } = {
                GENERAL: "일반 전형",
                COMMON: "일반 전형",
                MEISTER: "마이스터 전형",
                SOCIAL: "사회 통합 전형",
              };
              const progressPercentage =
                competitionSummary.totalApplicants > 0
                  ? (item.applicants / competitionSummary.totalApplicants) * 100
                  : 0;
              const percentage = progressPercentage.toFixed(2);

              return (
                <ApplicationTypeCard key={index}>
                  <ApplicationTypeHeader>
                    <ApplicationTypeTitle>
                      {typeNames[item.applicationType] || item.applicationType}
                    </ApplicationTypeTitle>
                    <ApplicationTypeCount>{item.applicants}명</ApplicationTypeCount>
                  </ApplicationTypeHeader>
                  <ProgressBarContainer>
                    <ProgressBar progress={progressPercentage} color={typeColors[item.applicationType] || "#666"} />
                  </ProgressBarContainer>
                  <ApplicationTypePercentage>1차 선발 인원의 {percentage}%</ApplicationTypePercentage>
                </ApplicationTypeCard>
              );
            })
          )}
        </ApplicationTypesGrid>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>지원자 성비</SectionTitle>
        <GenderGrid>
          {isGenderLoading ? (
            <>
              <GenderCard>
                <SkeletonValue />
              </GenderCard>
              <GenderCard>
                <SkeletonValue />
              </GenderCard>
            </>
          ) : (
            genderItems.slice(0, 2).map((item, index) => {
              const total = genderItems.reduce((sum, current) => sum + current.count, 0);
              const normalizedPercentage = total > 0 ? (item.count / total) * 100 : 0;
              const displayPercentage = `${normalizedPercentage.toFixed(2)}%`;
              const color = index === 0 ? "#4F46E5" : "#EC4899";

              return (
                <GenderCard key={`${item.genderName}-${index}`}>
                  <GenderTitle>{item.genderName}</GenderTitle>
                  <GenderCount>{item.count}명</GenderCount>
                  <ProgressBarContainer>
                    <ProgressBar progress={normalizedPercentage} color={color} />
                  </ProgressBarContainer>
                  <GenderPercentage>{displayPercentage}가 지원했습니다.</GenderPercentage>
                </GenderCard>
              );
            })
          )}
        </GenderGrid>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>지역별 접수 현황</SectionTitle>
        <RegionGrid>
          {isRegionLoading ? (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <RegionCard key={index}>
                  <SkeletonValue />
                </RegionCard>
              ))}
            </>
          ) : (
            regionItems.map((item, index) => (
              <RegionCard key={index}>
                <RegionName>{item.regionName}</RegionName>
                <RegionCount>{item.count}명</RegionCount>
              </RegionCard>
            ))
          )}
        </RegionGrid>
      </SectionContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: ${colors.extra.realWhite};
  margin: 0 auto;
`;

const ProcessSection = styled.div`
  width: 100%;
  margin-bottom: 60px;
  border-radius: 8px;
  border: 1px solid ${colors.gray[200]};
`;

const ProcessTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: ${colors.gray[500]};
  margin-bottom: 24px;
`;

const ProcessSteps = styled.div`
  width: 100%;
  height: 133px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80px;
  background-color: ${colors.extra.realWhite};
  border-radius: 8px;
`;

const ProcessItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const ArrowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
`;

const StepIcon = styled.div`
  width: 64px;
  height: 64px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StepLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.gray[500]};
`;

const StatsGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 44px;
  margin-bottom: 44px;
`;

const StepDate = styled.div`
  font-size: 18px;
  font-weight: 400;
  color: ${colors.extra.realBlack};
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 180px;
  padding: 24px 32px;
  background-color: ${colors.extra.realWhite};
  border-radius: 8px;
  border: 1px solid ${colors.gray[200]};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: ${colors.gray[500]};
  margin-bottom: 6px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${colors.gray[500]};
`;

const StatSubtitle = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: ${colors.gray[300]};
`;

const SectionContainer = styled.section`
  width: 100%;
  margin-bottom: 44px;
  padding: 32px;
  background-color: ${colors.extra.realWhite};
  border-radius: 12px;
  border: 1px solid ${colors.gray[200]};
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 600;
  color: ${colors.gray[500]};
  margin-bottom: 24px;
`;

const ApplicationTypesGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
`;

const ApplicationTypeCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background-color: ${colors.extra.realWhite};
  border-radius: 12px;
`;

const ApplicationTypeTitle = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: ${colors.gray[500]};
`;

const ApplicationTypeCount = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${colors.gray[500]};
`;
const ApplicationTypeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${colors.gray[200]};
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

const ProgressBar = styled.div<{ progress: number; color: string }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background-color: ${({ color }) => color};
  transition: width 0.3s ease;
`;

const ApplicationTypePercentage = styled.div`
  font-size: 20px;
  font-weight: 400;
  color: ${colors.gray[400]};
`;

const GenderGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const GenderCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background-color: ${colors.extra.realWhite};
  border-radius: 12px;
  border: 1px solid ${colors.gray[200]};
`;

const GenderTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.gray[500]};
`;

const GenderCount = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${colors.gray[500]};
`;

const GenderPercentage = styled.div`
  font-size: 20px;
  font-weight: 400;
  color: ${colors.gray[400]};
`;

const RegionGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const RegionCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: ${colors.extra.realWhite};
  border-radius: 8px;
  border: 1px solid ${colors.gray[200]};
`;

const RegionName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.gray[500]};
`;

const RegionCount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.gray[500]};
`;

const SkeletonDate = styled.div`
  width: 80px;
  height: 20px;
  background-color: ${colors.gray[200]};
  border-radius: 4px;
  margin-bottom: 20px;
  animation: skeleton-loading 1.5s infinite ease-in-out;

  @keyframes skeleton-loading {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

const SkeletonValue = styled.div`
  width: 120px;
  height: 32px;
  background-color: ${colors.gray[200]};
  border-radius: 4px;
  animation: skeleton-loading 1.5s infinite ease-in-out;

  @keyframes skeleton-loading {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

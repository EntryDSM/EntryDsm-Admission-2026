import { type ReactNode, Fragment } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

import {
  AdmissionRateIcon,
  ApplicationPeriodIcon,
  ArrowIcon,
  CompetitionRateIcon,
  FirstRoundDeadlineIcon,
  FourIcon,
  OneIcon,
  ThreeIcon,
  TwoIcon,
} from "../assets";
import type { ScheduleDeadline, StatisticsSummary } from "./StatisticsLandingPageHooks";

interface StatisticsPageLayoutProps {
  children: ReactNode;
}

export const StatisticsPageLayout = ({ children }: StatisticsPageLayoutProps) => {
  return <StatisticsPageContainer>{children}</StatisticsPageContainer>;
};

interface ProcessStepsSectionProps {
  processSchedule: StatisticsSummary["processSchedule"];
  scheduleDeadline: ScheduleDeadline;
  isLoading: boolean;
}

export const ProcessStepsSection = ({ processSchedule, scheduleDeadline, isLoading }: ProcessStepsSectionProps) => {
  const stepCompletionStates = [
    scheduleDeadline.isStep1Complete,
    scheduleDeadline.isStep2Complete,
    scheduleDeadline.isStep3Complete,
    scheduleDeadline.isStep4Complete,
  ];
  const stepIcons = [OneIcon, TwoIcon, ThreeIcon, FourIcon];

  return (
    <>
      <ProcessTitle>전형 정보</ProcessTitle>
      <ProcessSection>
        <ProcessSteps>
          {processSchedule.map((item, index) => {
            const StepIconComponent = stepIcons[index];

            return (
              <Fragment key={item.step}>
                <ProcessItem>
                  <StepIcon>
                    {StepIconComponent && <StepIconComponent isActive={stepCompletionStates[index]} />}
                  </StepIcon>
                  <StepLabel>{item.step}</StepLabel>
                  {isLoading ? <SkeletonDate /> : <StepDate>{item.date}</StepDate>}
                </ProcessItem>
                {index < processSchedule.length - 1 && (
                  <ArrowContainer>
                    <ArrowIcon />
                  </ArrowContainer>
                )}
              </Fragment>
            );
          })}
        </ProcessSteps>
      </ProcessSection>
    </>
  );
};

interface StatCardsGridProps {
  applicationPeriod: string;
  competitionSummary: StatisticsSummary["competitionSummary"];
  scheduleDeadline: ScheduleDeadline;
  totalCapacity: number;
  isLoading: boolean;
  isCompetitionLoading: boolean;
}

export const StatCardsGrid = ({
  applicationPeriod,
  competitionSummary,
  scheduleDeadline,
  totalCapacity,
  isLoading,
  isCompetitionLoading,
}: StatCardsGridProps) => {
  const displayDeadline = isLoading ? "" : scheduleDeadline.currentDeadline;

  return (
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
              {competitionSummary.totalApplicants}명 /{totalCapacity}명
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
              {totalCapacity > 0 ? (competitionSummary.totalApplicants / totalCapacity).toFixed(1) : "0.0"} : 1
            </StatValue>
          )}
        </StatContent>
        <StatIcon>
          <CompetitionRateIcon />
        </StatIcon>
      </StatCard>

      <StatCard>
        <StatContent>
          <StatTitle>{scheduleDeadline.deadlineTitle}</StatTitle>
          {isLoading ? (
            <SkeletonValue />
          ) : (
            <StatValue>
              {scheduleDeadline.ddayValue !== null && scheduleDeadline.ddayValue > 0 && (
                <StatSubtitle>앞으로 </StatSubtitle>
              )}
              {displayDeadline}
            </StatValue>
          )}
        </StatContent>
        <StatIcon>
          <FirstRoundDeadlineIcon />
        </StatIcon>
      </StatCard>
    </StatsGrid>
  );
};

interface CompetitionSectionProps {
  competitionSummary: StatisticsSummary["competitionSummary"];
  isCompetitionLoading: boolean;
}

export const CompetitionSection = ({ competitionSummary, isCompetitionLoading }: CompetitionSectionProps) => {
  const typeColors: Record<string, string> = {
    GENERAL: "#1DB954",
    COMMON: "#1DB954",
    MEISTER: "#FF7A00",
    SOCIAL: "#007BFF",
  };
  const typeNames: Record<string, string> = {
    GENERAL: "일반 전형",
    COMMON: "일반 전형",
    MEISTER: "마이스터 전형",
    SOCIAL: "사회 통합 전형",
  };

  return (
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
            const progressPercentage =
              competitionSummary.totalApplicants > 0 ? (item.applicants / competitionSummary.totalApplicants) * 100 : 0;
            const percentage = progressPercentage.toFixed(2);

            return (
              <ApplicationTypeCard key={index}>
                <ApplicationTypeHeader>
                  <ApplicationTypeTitle>{typeNames[item.applicationType] || item.applicationType}</ApplicationTypeTitle>
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
  );
};

interface GenderSectionProps {
  genderItems: StatisticsSummary["genderItems"];
  isGenderLoading: boolean;
}

export const GenderSection = ({ genderItems, isGenderLoading }: GenderSectionProps) => {
  const totalGenderCount = genderItems.reduce((sum, current) => sum + current.count, 0);

  return (
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
            const normalizedPercentage = totalGenderCount > 0 ? (item.count / totalGenderCount) * 100 : 0;
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
  );
};

interface RegionSectionProps {
  regionItems: StatisticsSummary["regionItems"];
  isRegionLoading: boolean;
}

export const RegionSection = ({ regionItems, isRegionLoading }: RegionSectionProps) => {
  return (
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
  );
};

const StatisticsPageContainer = styled.div`
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

import { useSchedules, useStatistics } from "../hooks";
import { toScheduleDeadlineData } from "../utils";
import {
  CompetitionSection,
  GenderSection,
  ProcessStepsSection,
  RegionSection,
  StatCardsGrid,
  StatisticsErrorNotice,
  StatisticsPageLayout,
} from "./StatisticsLandingPageSections";
import { type GenderData, useScheduleDeadline, useStatisticsSummary } from "./StatisticsLandingPageHooks";

const TOTAL_CAPACITY = 128;

// 성비(gender)는 통계 API 범위 밖이라 아직 목업을 사용한다.
const MOCK_GENDER_DATA: GenderData = {
  남자: 104,
  여자: 43,
};

export const StatisticsLandingPage = () => {
  const {
    competitionData,
    regionData,
    isLoading: isStatisticsLoading,
    isError: isStatisticsError,
    refetch: refetchStatistics,
  } = useStatistics();

  const { schedules, isLoading: isScheduleLoading } = useSchedules();
  const scheduleDeadline = useScheduleDeadline(toScheduleDeadlineData(schedules));
  const { regionItems, genderItems, competitionSummary, applicationPeriod, processSchedule } = useStatisticsSummary({
    scheduleDeadline,
    regionData,
    genderData: MOCK_GENDER_DATA,
    competitionData,
    isLoading: isScheduleLoading,
  });

  return (
    <StatisticsPageLayout>
      <ProcessStepsSection
        processSchedule={processSchedule}
        scheduleDeadline={scheduleDeadline}
        isLoading={isScheduleLoading}
      />
      {isStatisticsError ? (
        <StatisticsErrorNotice onRetry={() => refetchStatistics()} />
      ) : (
        <>
          <StatCardsGrid
            applicationPeriod={applicationPeriod}
            competitionSummary={competitionSummary}
            scheduleDeadline={scheduleDeadline}
            totalCapacity={TOTAL_CAPACITY}
            isLoading={isScheduleLoading}
            isCompetitionLoading={isStatisticsLoading}
          />
          <CompetitionSection competitionSummary={competitionSummary} isCompetitionLoading={isStatisticsLoading} />
          <GenderSection genderItems={genderItems} isGenderLoading={false} />
          <RegionSection regionItems={regionItems} isRegionLoading={isStatisticsLoading} />
        </>
      )}
    </StatisticsPageLayout>
  );
};

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
import { useScheduleDeadline, useStatisticsSummary } from "./StatisticsLandingPageHooks";

const TOTAL_CAPACITY = 128;

export const StatisticsLandingPage = () => {
  const {
    competitionData,
    genderData,
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
    genderData,
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
          <GenderSection genderItems={genderItems} isGenderLoading={isStatisticsLoading} />
          <RegionSection regionItems={regionItems} isRegionLoading={isStatisticsLoading} />
        </>
      )}
    </StatisticsPageLayout>
  );
};

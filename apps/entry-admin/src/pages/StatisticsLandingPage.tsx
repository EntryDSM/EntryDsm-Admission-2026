import { useStatistics } from "../hooks";
import {
  CompetitionSection,
  GenderSection,
  ProcessStepsSection,
  RegionSection,
  StatCardsGrid,
  StatisticsPageLayout,
} from "./StatisticsLandingPageSections";
import {
  type GenderData,
  type ScheduleData,
  useScheduleDeadline,
  useStatisticsSummary,
} from "./StatisticsLandingPageHooks";

const TOTAL_CAPACITY = 128;

// 일정(schedule)·성비(gender)는 통계 API 범위 밖이라 아직 목업을 사용한다.
const MOCK_SCHEDULE_DATA: ScheduleData = {
  schedules: [
    { type: "START_DATE", date: "2026-10-20T09:00:00" },
    { type: "END_DATE", date: "2026-10-24T17:00:00" },
    { type: "FIRST_ANNOUNCEMENT", date: "2026-10-31T10:00:00" },
    { type: "INTERVIEW", date: "2026-11-07T09:00:00" },
    { type: "SECOND_ANNOUNCEMENT", date: "2026-11-14T10:00:00" },
  ],
};

const MOCK_GENDER_DATA: GenderData = {
  남자: 104,
  여자: 43,
};

export const StatisticsLandingPage = () => {
  const { competitionData, regionData, isLoading: isStatisticsLoading } = useStatistics();

  const scheduleDeadline = useScheduleDeadline(MOCK_SCHEDULE_DATA);
  const { regionItems, genderItems, competitionSummary, applicationPeriod, processSchedule } = useStatisticsSummary({
    scheduleDeadline,
    regionData,
    genderData: MOCK_GENDER_DATA,
    competitionData,
    isLoading: false,
  });

  return (
    <StatisticsPageLayout>
      <ProcessStepsSection processSchedule={processSchedule} scheduleDeadline={scheduleDeadline} isLoading={false} />
      <StatCardsGrid
        applicationPeriod={applicationPeriod}
        competitionSummary={competitionSummary}
        scheduleDeadline={scheduleDeadline}
        totalCapacity={TOTAL_CAPACITY}
        isLoading={false}
        isCompetitionLoading={isStatisticsLoading}
      />
      <CompetitionSection competitionSummary={competitionSummary} isCompetitionLoading={isStatisticsLoading} />
      <GenderSection genderItems={genderItems} isGenderLoading={false} />
      <RegionSection regionItems={regionItems} isRegionLoading={isStatisticsLoading} />
    </StatisticsPageLayout>
  );
};

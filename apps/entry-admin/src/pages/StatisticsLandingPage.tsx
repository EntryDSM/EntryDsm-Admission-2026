import {
  CompetitionSection,
  GenderSection,
  ProcessStepsSection,
  RegionSection,
  StatCardsGrid,
  StatisticsPageLayout,
} from "./StatisticsLandingPageSections";
import {
  type CompetitionData,
  type GenderData,
  type RegionData,
  type ScheduleData,
  useScheduleDeadline,
  useStatisticsSummary,
} from "./StatisticsLandingPageHooks";

const TOTAL_CAPACITY = 128;

const MOCK_SCHEDULE_DATA: ScheduleData = {
  schedules: [
    { type: "START_DATE", date: "2026-10-20T09:00:00" },
    { type: "END_DATE", date: "2026-10-24T17:00:00" },
    { type: "FIRST_ANNOUNCEMENT", date: "2026-10-31T10:00:00" },
    { type: "INTERVIEW", date: "2026-11-07T09:00:00" },
    { type: "SECOND_ANNOUNCEMENT", date: "2026-11-14T10:00:00" },
  ],
};

const MOCK_REGION_DATA: RegionData = {
  대전: 8,
  전국: 63,
  서울: 22,
  경기: 31,
  충청: 18,
  기타: 11,
};

const MOCK_GENDER_DATA: GenderData = {
  남자: 104,
  여자: 43,
};

const MOCK_COMPETITION_DATA: CompetitionData = [
  { applicationType: "COMMON", count: 92 },
  { applicationType: "MEISTER", count: 35 },
  { applicationType: "SOCIAL", count: 20 },
];

export const StatisticsLandingPage = () => {
  const isLoading = false;
  const isRegionLoading = false;
  const isCompetitionLoading = false;
  const isGenderLoading = false;
  const scheduleDeadline = useScheduleDeadline(MOCK_SCHEDULE_DATA);
  const { regionItems, genderItems, competitionSummary, applicationPeriod, processSchedule } = useStatisticsSummary({
    scheduleDeadline,
    regionData: MOCK_REGION_DATA,
    genderData: MOCK_GENDER_DATA,
    competitionData: MOCK_COMPETITION_DATA,
    isLoading,
  });

  return (
    <StatisticsPageLayout>
      <ProcessStepsSection
        processSchedule={processSchedule}
        scheduleDeadline={scheduleDeadline}
        isLoading={isLoading}
      />
      <StatCardsGrid
        applicationPeriod={applicationPeriod}
        competitionSummary={competitionSummary}
        scheduleDeadline={scheduleDeadline}
        totalCapacity={TOTAL_CAPACITY}
        isLoading={isLoading}
        isCompetitionLoading={isCompetitionLoading}
      />
      <CompetitionSection competitionSummary={competitionSummary} isCompetitionLoading={isCompetitionLoading} />
      <GenderSection genderItems={genderItems} isGenderLoading={isGenderLoading} />
      <RegionSection regionItems={regionItems} isRegionLoading={isRegionLoading} />
    </StatisticsPageLayout>
  );
};

import { useMemo } from "react";

export interface ScheduleData {
  schedules: {
    type: string;
    date: string;
  }[];
}

export type RegionData = Record<string, number>;
export type GenderData = Record<string, number>;

export interface CompetitionDataItem {
  applicationType: string;
  count: number;
}

export type CompetitionData = CompetitionDataItem[];

const formatDateToMMDD = (dateString: string) => {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
};

const calculateDday = (dateString: string) => {
  if (!dateString) {
    return null;
  }

  const targetDate = new Date(dateString);
  const today = new Date();

  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const useScheduleDeadline = (scheduleData: ScheduleData) => {
  const findDate = (type: string) => scheduleData.schedules.find(schedule => schedule.type === type)?.date || "";

  const startDate = findDate("START_DATE");
  const endDate = findDate("END_DATE");
  const firstAnnouncement = findDate("FIRST_ANNOUNCEMENT");
  const interview = findDate("INTERVIEW");
  const finalAnnouncement = findDate("SECOND_ANNOUNCEMENT");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toComparableDate = (dateString: string) => {
    if (!dateString) {
      return null;
    }

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const endDateTime = toComparableDate(endDate);
  const firstAnnouncementTime = toComparableDate(firstAnnouncement);
  const interviewTime = toComparableDate(interview);
  const finalAnnouncementTime = toComparableDate(finalAnnouncement);
  const isStep1Complete = endDateTime ? endDateTime <= today : false;
  const isStep2Complete = firstAnnouncementTime ? firstAnnouncementTime <= today : false;
  const isStep3Complete = interviewTime ? interviewTime <= today : false;
  const isStep4Complete = finalAnnouncementTime ? finalAnnouncementTime <= today : false;
  const deadlineSteps = [
    { isComplete: isStep1Complete, date: endDate, title: "1차 전형 마감일" },
    { isComplete: isStep2Complete, date: firstAnnouncement, title: "2차 전형 마감일" },
    { isComplete: isStep3Complete, date: interview, title: "입학절차 마감일" },
    { isComplete: isStep4Complete, date: finalAnnouncement, title: "입학절차 마감일" },
  ];
  const activeDeadlineStep = deadlineSteps.find(({ isComplete, date }) => !isComplete && date);
  const currentDeadlineDate = activeDeadlineStep?.date ?? "";
  const dday = currentDeadlineDate ? calculateDday(currentDeadlineDate) : null;
  const currentDeadline = activeDeadlineStep
    ? dday === null
      ? "--일"
      : dday > 0
        ? `${dday}일`
        : dday === 0
          ? "오늘"
          : "마감"
    : "마감";

  return {
    startDate,
    firstAnnouncement,
    interview,
    finalAnnouncement,
    isStep1Complete,
    isStep2Complete,
    isStep3Complete,
    isStep4Complete,
    currentDeadline,
    ddayValue: dday,
    deadlineTitle: activeDeadlineStep?.title ?? "전형 마감일",
    applicationPeriod:
      startDate && endDate ? `${formatDateToMMDD(startDate)}~${formatDateToMMDD(endDate)}` : "--/--~--/--",
  };
};

export type ScheduleDeadline = ReturnType<typeof useScheduleDeadline>;

interface UseStatisticsSummaryParams {
  scheduleDeadline: ScheduleDeadline;
  regionData: RegionData;
  genderData: GenderData;
  competitionData: CompetitionData;
  isLoading: boolean;
}

export const useStatisticsSummary = ({
  scheduleDeadline,
  regionData,
  genderData,
  competitionData,
  isLoading,
}: UseStatisticsSummaryParams) => {
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

  const processSchedule = [
    { step: "원서 제출", date: isLoading ? "" : scheduleDeadline.applicationPeriod },
    {
      step: "1차 발표",
      date: isLoading
        ? ""
        : scheduleDeadline.firstAnnouncement
          ? formatDateToMMDD(scheduleDeadline.firstAnnouncement)
          : "--/--",
    },
    {
      step: "2차 전형",
      date: isLoading ? "" : scheduleDeadline.interview ? formatDateToMMDD(scheduleDeadline.interview) : "--/--",
    },
    {
      step: "최종 합격자 발표",
      date: isLoading
        ? ""
        : scheduleDeadline.finalAnnouncement
          ? formatDateToMMDD(scheduleDeadline.finalAnnouncement)
          : "--/--",
    },
  ];

  return {
    regionItems,
    genderItems,
    competitionSummary,
    applicationPeriod: isLoading ? "" : scheduleDeadline.applicationPeriod,
    processSchedule,
  };
};

export type StatisticsSummary = ReturnType<typeof useStatisticsSummary>;

import type { AdminSchedule, ScheduleDateTime } from "../apis/types";

/** 원서 접수 일정 title. admission 앱과 일정 기본값이 같은 이름을 쓴다. */
export const APPLICATION_SCHEDULE_TITLE = "원서 접수";

/** closed 는 시작 전·마감 후이거나 일정이 없는 경우다. */
export type ApplicationPeriodStatus = "open" | "closed";

/** 일정과 서버 시각을 같은 방식으로 Date 로 바꿔 비교하므로 시간대와 무관하다. */
const toDate = ({ year, month, day, hour, minute, second }: ScheduleDateTime) =>
  new Date(year, month - 1, day, hour, minute, second);

export const findApplicationSchedule = (schedules: AdminSchedule[]) =>
  schedules.find(schedule => schedule.title === APPLICATION_SCHEDULE_TITLE);

/** 서버 시각이 원서 접수 기간(양 끝 포함) 안이면 open. 지원자 앱의 제출 가능 판정과 같은 규칙이다. */
export const getApplicationPeriodStatus = (
  schedules: AdminSchedule[],
  serverTime: ScheduleDateTime
): ApplicationPeriodStatus => {
  const applicationSchedule = findApplicationSchedule(schedules);
  if (!applicationSchedule) {
    return "closed";
  }

  const now = toDate(serverTime).getTime();
  const startAt = toDate(applicationSchedule.startAt).getTime();
  const endAt = toDate(applicationSchedule.endAt).getTime();
  return startAt <= now && now <= endAt ? "open" : "closed";
};

/** 서버 시각이 발표 시작 전(before)인지 뒤(after)인지. 발표 일정이 없으면 unscheduled 다. */
export type AnnouncementStatus = "before" | "after" | "unscheduled";

const getAnnouncementStatus = (
  schedules: AdminSchedule[],
  serverTime: ScheduleDateTime,
  title: string
): AnnouncementStatus => {
  const announcement = schedules.find(schedule => schedule.title === title);
  if (!announcement) {
    return "unscheduled";
  }

  return toDate(serverTime).getTime() < toDate(announcement.startAt).getTime() ? "before" : "after";
};

export const FIRST_ANNOUNCEMENT_SCHEDULE_TITLE = "1차 합격 발표";

/**
 * 1차 합격자 개별 등록·취소는 발표 시작 전(before)에만, 2차 합격자 등록·불합격 처리는 발표 뒤(after)에만 된다.
 * 발표 일정이 없으면 서버가 둘 다 거절한다.
 */
export const getFirstAnnouncementStatus = (schedules: AdminSchedule[], serverTime: ScheduleDateTime) =>
  getAnnouncementStatus(schedules, serverTime, FIRST_ANNOUNCEMENT_SCHEDULE_TITLE);

export const FINAL_ANNOUNCEMENT_SCHEDULE_TITLE = "최종 합격 발표";

/** 2차 불합격 처리·2차 합격 취소는 발표 시작 전(before)에만 된다. 발표 일정이 없으면 서버가 거절한다. */
export const getFinalAnnouncementStatus = (schedules: AdminSchedule[], serverTime: ScheduleDateTime) =>
  getAnnouncementStatus(schedules, serverTime, FINAL_ANNOUNCEMENT_SCHEDULE_TITLE);

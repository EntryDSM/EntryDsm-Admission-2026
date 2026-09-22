import type { AdmissionSchedule, ScheduleDateTime } from "../apis/schedule";

/** 원서 접수 기간 일정의 title. 백엔드(configuration 시스템)에 등록된 값과 같아야 한다. */
export const APPLICATION_SCHEDULE_TITLE = "원서 접수";

/** open: 접수 기간 안. closed: 시작 전·마감 후이거나 일정이 등록되지 않음(안전하게 차단). */
export type ApplicationPeriodStatus = "open" | "closed";

/**
 * 백엔드가 연·월·일·시·분·초로 분해해 내려주는 시각 → Date. ISO 문자열이 아니라 `new Date(value)` 로는 만들 수 없다.
 * 브라우저 로컬 시간대로 만들지만 서버 현재 시각(/time)도 같은 방식으로 변환하므로 일정과의 비교는 시간대와 무관하게 일관된다.
 */
export const toDate = ({ year, month, day, hour, minute, second }: ScheduleDateTime) =>
  new Date(year, month - 1, day, hour, minute, second);

export const findApplicationSchedule = (schedules: AdmissionSchedule[] | undefined) =>
  schedules?.find(schedule => schedule.title === APPLICATION_SCHEDULE_TITLE);

/** 서버 현재 시각이 원서 접수 일정의 startAt 이상 endAt 이하(초 단위, 양 끝 포함)인지 판정한다. */
export const getApplicationPeriodStatus = (
  schedules: AdmissionSchedule[],
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

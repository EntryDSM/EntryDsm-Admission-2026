import type { Schedule, ScheduleDateTime } from "../apis/schedule";

/**
 * 백엔드 분해 시각 → 날짜(자정) Date. 브라우저 로컬 시간대 기준으로 만든다.
 * 서버 현재 시각(/time)도 같은 방식으로 변환하므로 일정 시각과의 비교는 시간대와 무관하게 일관된다.
 * 시·분을 버리므로 날짜 단위 기간 판정과 요일 계산에 쓰고, 발표 시각처럼 시점 비교가 필요하면 `toDateTime` 을 쓴다.
 */
export const toDate = (dateTime: ScheduleDateTime) => new Date(dateTime.year, dateTime.month - 1, dateTime.day);

/** 백엔드 분해 시각 → 시·분·초까지 포함한 Date. `toDate` 와 같은 로컬 시간대 기준이다. */
export const toDateTime = ({ year, month, day, hour, minute, second }: ScheduleDateTime) =>
  new Date(year, month - 1, day, hour, minute, second);

/** 타임라인 표기용 `M.D HH:mm` (24시간제). 예: 9.10 12:00 */
export const formatScheduleDateTime = (dateTime: ScheduleDateTime) => `${dateTime.month}월 ${dateTime.day}일 `;

const DAY_OF_WEEK_LABEL = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

/** 안내문 표기용 `YYYY년 M월 D일 (요일)`. 요일은 응답의 dayOfWeek 대신 날짜로 계산해 어긋남을 막는다. */
export const formatScheduleDate = (dateTime: ScheduleDateTime) =>
  `${dateTime.year}년 ${dateTime.month}월 ${dateTime.day}일 (${DAY_OF_WEEK_LABEL[toDate(dateTime).getDay()]})`;

/** 시각이 자정(00:00)이면 시간이 정해지지 않은 일정으로 본다. */
export const hasScheduleTime = (dateTime: ScheduleDateTime) => dateTime.hour !== 0 || dateTime.minute !== 0;

/** 안내문 표기용 12시간제 시각. 예: 오전 8시 30분, 오후 3시 */
export const formatScheduleTime = (dateTime: ScheduleDateTime) => {
  const meridiem = dateTime.hour < 12 ? "오전" : "오후";
  const hour = dateTime.hour % 12 === 0 ? 12 : dateTime.hour % 12;
  return dateTime.minute === 0 ? `${meridiem} ${hour}시` : `${meridiem} ${hour}시 ${dateTime.minute}분`;
};

/** 날짜 뒤에 시각이 정해져 있으면 붙인다. 예: 2026년 11월 21일 (토요일) 오전 10시 */
export const formatScheduleDateWithTime = (dateTime: ScheduleDateTime) =>
  hasScheduleTime(dateTime)
    ? `${formatScheduleDate(dateTime)} ${formatScheduleTime(dateTime)}`
    : formatScheduleDate(dateTime);

/** 원서 접수 기간 일정의 title. 백엔드(configuration 시스템)에 등록된 표준 명칭과 같아야 한다. */
export const APPLICATION_SCHEDULE_TITLE = "원서 접수";

/** 1차 합격 발표 일정의 title. 백엔드(configuration 시스템)에 등록된 표준 명칭과 같아야 한다. */
export const FIRST_ANNOUNCEMENT_SCHEDULE_TITLE = "1차 합격 발표";

/** 홈 타임라인 표시 순서. 목록에 없는 title 은 이 뒤에 응답 순서대로 붙는다. */
const TIMELINE_TITLE_ORDER = [APPLICATION_SCHEDULE_TITLE, FIRST_ANNOUNCEMENT_SCHEDULE_TITLE, "면접", "최종 합격 발표"];

const timelineOrderOf = ({ title }: Schedule) => {
  const index = TIMELINE_TITLE_ORDER.indexOf(title);
  return index === -1 ? TIMELINE_TITLE_ORDER.length : index;
};

/** 응답 순서와 무관하게 타임라인 표시 순서로 정렬한 새 배열을 돌려준다. */
export const sortSchedulesForTimeline = (schedules: Schedule[]) =>
  [...schedules].sort((a, b) => timelineOrderOf(a) - timelineOrderOf(b));

/**
 * 1차 합격 발표가 시작됐는지. 서버 현재 시각이 "1차 합격 발표" 일정의 startAt(시·분 포함) 이상이면 true.
 * 일정이 없거나 서버 시각을 아직 모르면 false 로 두어 홈 버튼이 기본(지원하기) 동작을 유지하게 한다.
 */
export const hasFirstAnnouncementStarted = (
  schedules: Schedule[] | undefined,
  serverTime: ScheduleDateTime | undefined
) => {
  const announcement = schedules?.find(schedule => schedule.title === FIRST_ANNOUNCEMENT_SCHEDULE_TITLE);
  return Boolean(announcement && serverTime && toDateTime(serverTime) >= toDateTime(announcement.startAt));
};

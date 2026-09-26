import type { Schedule, ScheduleDateTime } from "../apis/schedule";

/**
 * 백엔드 분해 시각 → Date. 브라우저 로컬 시간대 기준으로 만든다.
 * 서버 현재 시각(/time)도 같은 방식으로 변환하므로 일정 시각과의 비교는 시간대와 무관하게 일관된다.
 */
export const toDate = (dateTime: ScheduleDateTime) => new Date(dateTime.year, dateTime.month - 1, dateTime.day);

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

/** 홈 타임라인 표시 순서. 목록에 없는 title 은 이 뒤에 응답 순서대로 붙는다. */
const TIMELINE_TITLE_ORDER = ["원서 접수", "1차 합격 발표", "면접", "최종 합격 발표"];

const timelineOrderOf = ({ title }: Schedule) => {
  const index = TIMELINE_TITLE_ORDER.indexOf(title);
  return index === -1 ? TIMELINE_TITLE_ORDER.length : index;
};

/** 응답 순서와 무관하게 타임라인 표시 순서로 정렬한 새 배열을 돌려준다. */
export const sortSchedulesForTimeline = (schedules: Schedule[]) =>
  [...schedules].sort((a, b) => timelineOrderOf(a) - timelineOrderOf(b));

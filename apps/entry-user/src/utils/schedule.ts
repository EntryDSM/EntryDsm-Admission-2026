import type { Schedule, ScheduleDateTime } from "../apis/schedule";

/**
 * 백엔드 분해 시각 → Date. 브라우저 로컬 시간대 기준으로 만든다.
 * 서버 현재 시각(/time)도 같은 방식으로 변환하므로 일정 시각과의 비교는 시간대와 무관하게 일관된다.
 */
export const toDate = (dateTime: ScheduleDateTime) =>
  new Date(dateTime.year, dateTime.month - 1, dateTime.day, dateTime.hour, dateTime.minute, dateTime.second);

const pad = (value: number) => String(value).padStart(2, "0");

/** 타임라인 표기용 `M.D HH:mm` (24시간제). 예: 9.10 12:00 */
export const formatScheduleDateTime = (dateTime: ScheduleDateTime) =>
  `${dateTime.month}.${dateTime.day} ${pad(dateTime.hour)}:${pad(dateTime.minute)}`;

/** 홈 타임라인 표시 순서. 목록에 없는 title 은 이 뒤에 응답 순서대로 붙는다. */
const TIMELINE_TITLE_ORDER = ["원서 접수", "1차 합격 발표", "면접", "최종 합격 발표"];

const timelineOrderOf = ({ title }: Schedule) => {
  const index = TIMELINE_TITLE_ORDER.indexOf(title);
  return index === -1 ? TIMELINE_TITLE_ORDER.length : index;
};

/** 응답 순서와 무관하게 타임라인 표시 순서로 정렬한 새 배열을 돌려준다. */
export const sortSchedulesForTimeline = (schedules: Schedule[]) =>
  [...schedules].sort((a, b) => timelineOrderOf(a) - timelineOrderOf(b));

import type { ScheduleDateTime } from "../apis/schedule";

/**
 * 백엔드 분해 시각 → Date. 브라우저 로컬 시간대 기준으로 만든다.
 * 서버 현재 시각(/time)도 같은 방식으로 변환하므로 일정 시각과의 비교는 시간대와 무관하게 일관되고,
 * 화면 표시(Intl.DateTimeFormat, 로컬 시간대)에서도 백엔드가 준 연·월·일·시·분이 그대로 나온다.
 */
export const toDate = (dateTime: ScheduleDateTime) =>
  new Date(dateTime.year, dateTime.month - 1, dateTime.day, dateTime.hour, dateTime.minute, dateTime.second);

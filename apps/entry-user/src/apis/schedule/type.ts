/** 요일 (백엔드 표기) */
export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

/**
 * 백엔드가 연·월·일·요일·시·분·초로 분해해 내려주는 시각.
 * 일정의 startAt/endAt 과 서버 현재 시각(currentTime)이 모두 이 형태다. ISO 문자열이 아니므로
 * `new Date(value)` 로 바로 넘기면 Invalid Date 가 된다 — `utils/schedule.ts` 의 `toDate` 로 변환한다.
 */
export interface ScheduleDateTime {
  year: number;
  month: number;
  day: number;
  dayOfWeek: DayOfWeek;
  hour: number;
  minute: number;
  second: number;
}

export interface Schedule {
  scheduleId: number;
  title: string;
  startAt: ScheduleDateTime;
  endAt: ScheduleDateTime;
}

export interface ScheduleResponse {
  status: number;
  message: string;
  data: Schedule[];
}

export type ServerTime = ScheduleDateTime;

export interface ServerTimeResponse {
  status: "SUCCESS";
  message: string;
  data: {
    currentTime: ServerTime;
  };
}

import type { AdminSchedule, DayOfWeek, ScheduleDateTime, UpdateScheduleItem } from "../apis/types";

/** 전형 일정 수정 화면(DropDownSection)이 사용하는 뷰 모델. 시각은 `YYYY-MM-DDTHH:mm` 문자열로 다룬다. */
export interface ScheduleFieldView {
  scheduleId: number;
  title: string;
  start: string;
  end: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** ScheduleDateTime → DropDownSection 이 파싱하는 `YYYY-MM-DDTHH:mm` 문자열 */
export const toDateTimeInput = (dateTime: ScheduleDateTime): string =>
  `${dateTime.year}-${pad(dateTime.month)}-${pad(dateTime.day)}T${pad(dateTime.hour)}:${pad(dateTime.minute)}`;

/** `getDay()`(0=일) 인덱스 → 백엔드 요일 코드 */
const DAY_OF_WEEK: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** `YYYY-MM-DDTHH:mm` 문자열 → 백엔드 ScheduleDateTime (초는 0, 요일은 날짜로 계산) */
export const toScheduleDateTime = (value: string): ScheduleDateTime => {
  const [date = "", time = ""] = value.split("T");
  const [year = 0, month = 0, day = 0] = date.split("-").map(Number);
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  const dayOfWeek = DAY_OF_WEEK[new Date(year, month - 1, day).getDay()];

  return { year, month, day, dayOfWeek, hour, minute, second: 0 };
};

/** 조회 응답 → 화면 뷰 모델 배열 */
export const toScheduleFields = (schedules: AdminSchedule[]): ScheduleFieldView[] =>
  schedules.map(schedule => ({
    scheduleId: schedule.scheduleId,
    title: schedule.title,
    start: toDateTimeInput(schedule.startAt),
    end: toDateTimeInput(schedule.endAt),
  }));

/** 화면 뷰 모델 → 일괄 수정 요청 본문 */
export const toUpdateSchedulePayload = (fields: ScheduleFieldView[]): UpdateScheduleItem[] =>
  fields.map(field => ({
    scheduleId: field.scheduleId,
    title: field.title,
    startAt: toScheduleDateTime(field.start),
    endAt: toScheduleDateTime(field.end),
  }));

/* ─────────────── 홈(통계) 화면용 일정 매핑 ─────────────── */

/** 홈 화면 useScheduleDeadline 이 조회하는 일정 타입 코드 */
export type ScheduleDeadlineType =
  | "START_DATE"
  | "END_DATE"
  | "FIRST_ANNOUNCEMENT"
  | "INTERVIEW"
  | "SECOND_ANNOUNCEMENT";

/** useScheduleDeadline 이 받는 `{ type, date }[]` 형태 (ScheduleData 와 구조 호환) */
export interface ScheduleDeadlineData {
  schedules: { type: ScheduleDeadlineType; date: string }[];
}

/**
 * 백엔드 일정 title → 홈 화면 타입 코드 매핑 규칙.
 * 명세에 title↔의미 대응이 없어 title 키워드로 추정한다. 백엔드 title 이 다르면 이 상수들만 고치면 되고,
 * 매칭 실패한 슬롯은 홈 화면에서 잘못된 값 대신 placeholder(`--/--`)로 표시된다.
 */
const APPLICATION_KEYWORDS = ["원서", "접수", "지원"];
const ANNOUNCEMENT_RULES: { type: ScheduleDeadlineType; keywords: string[] }[] = [
  { type: "FIRST_ANNOUNCEMENT", keywords: ["1차"] },
  { type: "INTERVIEW", keywords: ["면접"] },
  { type: "SECOND_ANNOUNCEMENT", keywords: ["최종", "2차"] },
];

const includesAny = (title: string, keywords: string[]) => keywords.some(keyword => title.includes(keyword));

/**
 * 조회 뷰 모델 → 홈 화면 일정 데이터.
 * '원서 접수' 성격의 일정은 시작/종료를 각각 START_DATE/END_DATE 로,
 * 발표·면접 일정은 시작 시각을 해당 타입으로 매핑한다.
 */
export const toScheduleDeadlineData = (fields: ScheduleFieldView[]): ScheduleDeadlineData => {
  const result: ScheduleDeadlineData["schedules"] = [];

  fields.forEach(field => {
    const title = field.title ?? "";

    if (includesAny(title, APPLICATION_KEYWORDS)) {
      result.push({ type: "START_DATE", date: field.start });
      result.push({ type: "END_DATE", date: field.end });
      return;
    }

    const rule = ANNOUNCEMENT_RULES.find(({ keywords }) => includesAny(title, keywords));
    if (rule) {
      result.push({ type: rule.type, date: field.start });
    }
  });

  return { schedules: result };
};

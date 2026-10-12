import type { AdminSchedule, DayOfWeek, ScheduleDateTime, UpdateScheduleItem } from "../apis/types";

/** 일정 화면용 모델. 시각은 `YYYY-MM-DDTHH:mm` 문자열이고, `scheduleId` 가 null 이면 아직 등록 전인 일정이다. */
export interface ScheduleFieldView {
  scheduleId: number | null;
  title: string;
  start: string;
  end: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

export const toDateTimeInput = (dateTime: ScheduleDateTime): string =>
  `${dateTime.year}-${pad(dateTime.month)}-${pad(dateTime.day)}T${pad(dateTime.hour)}:${pad(dateTime.minute)}`;

/** `getDay()`(0=일요일) 순서 */
const DAY_OF_WEEK: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** 초는 0 으로, 요일은 날짜로 계산해 채운다. */
export const toScheduleDateTime = (value: string): ScheduleDateTime => {
  const [date = "", time = ""] = value.split("T");
  const [year = 0, month = 0, day = 0] = date.split("-").map(Number);
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  const dayOfWeek = DAY_OF_WEEK[new Date(year, month - 1, day).getDay()];

  return { year, month, day, dayOfWeek, hour, minute, second: 0 };
};

/** 일정 표준 명칭과 표시 순서. 기본 일정 생성과 정렬에 쓰며, 홈 화면 일정 매핑이 이 명칭을 기준으로 한다. */
const SCHEDULE_TITLE_ORDER = ["원서 접수", "1차 합격 발표", "면접", "최종 합격 발표"];

const scheduleOrderOf = (title: string) => {
  const index = SCHEDULE_TITLE_ORDER.indexOf(title);
  return index === -1 ? SCHEDULE_TITLE_ORDER.length : index;
};

export const toScheduleFields = (schedules: AdminSchedule[]): ScheduleFieldView[] =>
  [...schedules]
    .sort((a, b) => scheduleOrderOf(a.title) - scheduleOrderOf(b.title))
    .map(schedule => ({
      scheduleId: schedule.scheduleId,
      title: schedule.title,
      start: toDateTimeInput(schedule.startAt),
      end: toDateTimeInput(schedule.endAt),
    }));

export const toScheduleRequestItem = (field: ScheduleFieldView): UpdateScheduleItem => ({
  title: field.title,
  startAt: toScheduleDateTime(field.start),
  endAt: toScheduleDateTime(field.end),
});

export const toUpdateSchedulePayload = (fields: ScheduleFieldView[]): UpdateScheduleItem[] =>
  fields.map(toScheduleRequestItem);

/** 등록된 일정이 없을 때 띄울 기본 일정 */
export const createDefaultScheduleFields = (): ScheduleFieldView[] =>
  SCHEDULE_TITLE_ORDER.map(title => ({
    scheduleId: null,
    title,
    start: "",
    end: "",
  }));

/* ─────────────── 홈(통계) 화면용 일정 매핑 ─────────────── */

export type ScheduleDeadlineType =
  | "START_DATE"
  | "END_DATE"
  | "FIRST_ANNOUNCEMENT"
  | "INTERVIEW"
  | "SECOND_ANNOUNCEMENT";

export interface ScheduleDeadlineData {
  schedules: { type: ScheduleDeadlineType; date: string }[];
}

/** 일정 title 의 키워드로 홈 화면 일정 종류를 정한다. 맞는 일정이 없으면 홈 화면은 `--/--` 로 표시한다. */
const APPLICATION_KEYWORDS = ["원서", "접수", "지원"];
const ANNOUNCEMENT_RULES: { type: ScheduleDeadlineType; keywords: string[] }[] = [
  { type: "FIRST_ANNOUNCEMENT", keywords: ["1차"] },
  { type: "INTERVIEW", keywords: ["면접"] },
  { type: "SECOND_ANNOUNCEMENT", keywords: ["최종", "2차"] },
];

const includesAny = (title: string, keywords: string[]) => keywords.some(keyword => title.includes(keyword));

/** 원서 접수 일정은 시작·종료를, 발표·면접 일정은 시작 시각을 쓴다. */
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

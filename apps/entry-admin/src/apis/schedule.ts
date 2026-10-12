import { http } from "./http";
import type { AdminSchedule, CurrentTimeResponse, UpdateScheduleItem } from "./types";

const SCHEDULES_ENDPOINT = "/api/schedule/v11/schedules";
const SERVER_TIME_ENDPOINT = "/api/schedule/v11/time";

/** 일정 API 는 `{ status, message, data }` 봉투라 여기서 벗긴다(공통 `http` 는 `{ success, data }` 만 벗긴다). */
type ScheduleEnvelope<T> = { status?: number | string; message?: string; data: T };

const unwrap = <T>(body: ScheduleEnvelope<T> | T): T =>
  body !== null && typeof body === "object" && !Array.isArray(body) && "data" in body
    ? (body as ScheduleEnvelope<T>).data
    : (body as T);

/** 올해 일정만 온다. */
export const getSchedules = async () => {
  const body = await http.get<ScheduleEnvelope<AdminSchedule[]> | AdminSchedule[]>(SCHEDULES_ENDPOINT);
  return unwrap(body);
};

/** 원서 접수 기간 판정에 쓰는 서버 시각 */
export const getServerTime = async () => {
  const body = await http.get<ScheduleEnvelope<CurrentTimeResponse> | CurrentTimeResponse>(SERVER_TIME_ENDPOINT);
  return unwrap(body).currentTime;
};

/** 새 일정을 하나씩 등록한다. */
export const createSchedule = async (schedule: UpdateScheduleItem) => {
  const body = await http.post<ScheduleEnvelope<AdminSchedule> | AdminSchedule>(SCHEDULES_ENDPOINT, schedule);
  return unwrap(body);
};

/** title 로 기존 일정을 찾아 시각을 바꾼다. */
export const updateSchedules = async (schedules: UpdateScheduleItem[]) => {
  const body = await http.patch<ScheduleEnvelope<AdminSchedule[]> | AdminSchedule[]>(
    `${SCHEDULES_ENDPOINT}/bulk`,
    schedules
  );
  return unwrap(body);
};

import { http } from "./http";
import type { AdminSchedule, UpdateScheduleItem } from "./types";

const SCHEDULES_ENDPOINT = "/api/schedule/v11/schedules";

/**
 * 일정 API 응답 봉투. 공통 `http` 는 `{ success, data }` 봉투만 벗기므로,
 * 이 도메인의 `{ status, message, data }` 봉투는 여기서 직접 벗겨낸다.
 * (봉투 없이 내려오는 경우도 대비해 `data` 유무로 분기한다.)
 */
type ScheduleEnvelope<T> = { status?: number | string; message?: string; data: T };

const unwrap = <T>(body: ScheduleEnvelope<T> | T): T =>
  body !== null && typeof body === "object" && !Array.isArray(body) && "data" in body
    ? (body as ScheduleEnvelope<T>).data
    : (body as T);

/** 전형 일정 목록 조회 (백엔드가 해당 년도 일정만 반환) */
export const getSchedules = async () => {
  const body = await http.get<ScheduleEnvelope<AdminSchedule[]> | AdminSchedule[]>(SCHEDULES_ENDPOINT);
  return unwrap(body);
};

/** 전형 일정 일괄 수정 */
export const updateSchedules = async (schedules: UpdateScheduleItem[]) => {
  const body = await http.patch<ScheduleEnvelope<AdminSchedule[]> | AdminSchedule[]>(
    `${SCHEDULES_ENDPOINT}/bulk`,
    schedules
  );
  return unwrap(body);
};

import { http } from "./http";
import type { AdminSchedule, CurrentTimeResponse, UpdateScheduleItem } from "./types";

const SCHEDULES_ENDPOINT = "/api/schedule/v11/schedules";
const SERVER_TIME_ENDPOINT = "/api/schedule/v11/time";

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

/**
 * 서버 현재 시각. 원서 접수 기간 판정은 브라우저 시계가 아니라 이 값을 기준으로 한다(admission 앱과 같은 기준).
 * 인증 없이도 응답하는 공개 API 지만 공통 `http` 로 보내도 무방하다.
 */
export const getServerTime = async () => {
  const body = await http.get<ScheduleEnvelope<CurrentTimeResponse> | CurrentTimeResponse>(SERVER_TIME_ENDPOINT);
  return unwrap(body).currentTime;
};

/** 전형 일정 등록 (201). bulk 수정은 없는 title 을 404 로 거절하므로 신규 일정은 이 API 로 하나씩 만든다. */
export const createSchedule = async (schedule: UpdateScheduleItem) => {
  const body = await http.post<ScheduleEnvelope<AdminSchedule> | AdminSchedule>(SCHEDULES_ENDPOINT, schedule);
  return unwrap(body);
};

/** 전형 일정 일괄 수정. title 로 기존 일정을 찾아 시각을 바꾼다. 요청자 식별/권한은 인증 쿠키로만 처리한다. */
export const updateSchedules = async (schedules: UpdateScheduleItem[]) => {
  const body = await http.patch<ScheduleEnvelope<AdminSchedule[]> | AdminSchedule[]>(
    `${SCHEDULES_ENDPOINT}/bulk`,
    schedules
  );
  return unwrap(body);
};

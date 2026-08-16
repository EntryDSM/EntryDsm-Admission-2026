import { buildQueryString } from "../utils/queryString";
import { http } from "./http";
import type { CreateNoticePayload, GetNoticesParams, GetNoticesResponse, NoticeDetail } from "./types";

const NOTIFICATIONS_ENDPOINT = "/api/notification/v11/notifications/notification";
const ADMIN_NOTICES_ENDPOINT = "/api/v11/admin/notices";

/**
 * 공지(notification) API 응답 봉투. 공통 `http` 는 `{ success, data }` 봉투만 벗기므로,
 * 이 도메인의 `{ status, message, data }` 봉투는 여기서 직접 벗겨낸다.
 * (봉투 없이 내려오는 경우도 대비해 `data` 유무로 분기한다.)
 */
type NoticeEnvelope<T> = { status?: number | string; message?: string; data: T };

const unwrap = <T>(body: NoticeEnvelope<T> | T): T =>
  body !== null && typeof body === "object" && !Array.isArray(body) && "data" in body
    ? (body as NoticeEnvelope<T>).data
    : (body as T);

/** 공지 전체 조회 (페이지네이션) */
export const getNotices = async (params: GetNoticesParams = {}) => {
  const queryString = buildQueryString({ ...params });
  const body = await http.get<NoticeEnvelope<GetNoticesResponse> | GetNoticesResponse>(
    `${NOTIFICATIONS_ENDPOINT}${queryString}`
  );
  return unwrap(body);
};

/** 공지 상세 조회 */
export const getNoticeDetail = async (noticeId: number) => {
  const body = await http.get<NoticeEnvelope<NoticeDetail> | NoticeDetail>(`${NOTIFICATIONS_ENDPOINT}/${noticeId}`);
  return unwrap(body);
};

/** 공지 등록 (201 Created, 본문 없음) */
export const createNotice = (payload: CreateNoticePayload) => http.post<void>(ADMIN_NOTICES_ENDPOINT, payload);

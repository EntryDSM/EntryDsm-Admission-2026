import { buildQueryString } from "../utils/queryString";
import { http } from "./http";
import type {
  CreateNoticePayload,
  UpdateNoticePayload,
  GetNoticesParams,
  GetNoticesResponse,
  NoticeDetail,
} from "./types";

const NOTIFICATIONS_ENDPOINT = "/api/notification/v11/notifications/notification";
const ADMIN_NOTICES_ENDPOINT = "/api/v11/admin/notices";

/** 공지 조회 API 는 `{ status, message, data }` 봉투라 여기서 벗긴다(공통 `http` 는 `{ success, data }` 만 벗긴다). */
type NoticeEnvelope<T> = { status?: number | string; message?: string; data: T };

const unwrap = <T>(body: NoticeEnvelope<T> | T): T =>
  body !== null && typeof body === "object" && !Array.isArray(body) && "data" in body
    ? (body as NoticeEnvelope<T>).data
    : (body as T);

export const getNotices = async (params: GetNoticesParams = {}) => {
  const queryString = buildQueryString({ ...params });
  const body = await http.get<NoticeEnvelope<GetNoticesResponse> | GetNoticesResponse>(
    `${NOTIFICATIONS_ENDPOINT}${queryString}`
  );
  return unwrap(body);
};

export const getNoticeDetail = async (noticeId: number) => {
  const body = await http.get<NoticeEnvelope<NoticeDetail> | NoticeDetail>(`${NOTIFICATIONS_ENDPOINT}/${noticeId}`);
  return unwrap(body);
};

export const createNotice = (payload: CreateNoticePayload) => http.post<void>(ADMIN_NOTICES_ENDPOINT, payload);

export const updateNotice = (payload: UpdateNoticePayload, noticeId: number) =>
  http.patch<void>(`${ADMIN_NOTICES_ENDPOINT}/${noticeId}`, payload);

export const deleteNotice = (noticeId: number) => http.delete<void>(`${ADMIN_NOTICES_ENDPOINT}/${noticeId}`);

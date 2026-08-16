import { buildQueryString } from "../utils/queryString";
import { http } from "./http";
import type {
  AdminApplicantDetail,
  GetApplicantsParams,
  GetApplicantsResponse,
  UpdateApplicantStatusPayload,
} from "./types";

const APPLICANTS_ENDPOINT = "/api/v11/admin/applicants";

/** 지원자(원서) 목록 조회 */
export const getApplicants = (params: GetApplicantsParams = {}) => {
  const queryString = buildQueryString({ ...params });
  return http.get<GetApplicantsResponse>(`${APPLICANTS_ENDPOINT}${queryString}`);
};

/** 지원자 상세 조회 */
export const getApplicantDetail = (applicantId: number) =>
  http.get<AdminApplicantDetail>(`${APPLICANTS_ENDPOINT}/${applicantId}`);

/**
 * 원서 도착 처리 (204).
 * 명세상 요청 본문이 없는 PATCH 라(REST 원칙 적용 명시), 도착 상태로 표시하는 단방향 액션으로 해석한다.
 * (도착 취소는 명세에 없어 지원하지 않는다.)
 */
export const updateApplicantArrival = (applicantId: number) =>
  http.patch<void>(`${APPLICANTS_ENDPOINT}/${applicantId}/arrival`);

/** 개별 상태 변경(정정) (204) */
export const updateApplicantStatus = (applicantId: number, payload: UpdateApplicantStatusPayload) =>
  http.patch<void>(`${APPLICANTS_ENDPOINT}/${applicantId}/status`, payload);

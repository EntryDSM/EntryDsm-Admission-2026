import { buildQueryString } from "../utils/queryString";
import { http } from "./http";
import type { AdminApplicantDetail, GetApplicantsParams, GetApplicantsResponse } from "./types";

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
 * 원서(원본) 도착 표시 (204). 요청 본문 `{ isArrived }` 는 필수(`@NotNull`)다.
 * - `true`: `arrivedAt` 이 비어 있을 때만 현재 시각으로 채운다(이미 도착 처리된 원서는 그대로).
 * - `false`: `arrivedAt` 을 지워 도착을 취소한다.
 * (백엔드 `documents/features/admin-applicant-via-grpc/api-spec.md` "3. 원본 도착 표시" 절)
 */
export const updateApplicantArrival = (applicantId: number, isArrived: boolean) =>
  http.patch<void>(`${APPLICANTS_ENDPOINT}/${applicantId}/arrival`, { isArrived });

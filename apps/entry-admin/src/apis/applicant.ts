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

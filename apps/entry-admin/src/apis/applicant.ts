import { buildQueryString } from "../utils/queryString";
import { http } from "./http";
import type {
  AdminApplicantDetail,
  ApplicationCorrectionResult,
  CorrectApplicationPayload,
  EditableApplicationFields,
  GetApplicantsParams,
  GetApplicantsResponse,
  UpdateApplicantStatusPayload,
} from "./types";

const APPLICANTS_ENDPOINT = "/api/v11/admin/applicants";

export const getApplicants = (params: GetApplicantsParams = {}) => {
  const queryString = buildQueryString({ ...params });
  return http.get<GetApplicantsResponse>(`${APPLICANTS_ENDPOINT}${queryString}`);
};

export const getApplicantDetail = (applicantId: number) =>
  http.get<AdminApplicantDetail>(`${APPLICANTS_ENDPOINT}/${applicantId}`);

/** 원서 원본 도착 표시. `false` 로 도착을 취소할 수 있다. */
export const updateApplicantArrival = (applicantId: number, isArrived: boolean) =>
  http.patch<void>(`${APPLICANTS_ENDPOINT}/${applicantId}/arrival`, { isArrived });

/** 전형 상태 변경. 1차 결과(FIRST_PASS·FIRST_FAIL)는 1차 합격 발표 전에만, 최종 결과는 발표 뒤에만 바꿀 수 있다. */
export const updateApplicantStatus = (applicantId: number, payload: UpdateApplicantStatusPayload) =>
  http.patch<void>(`${APPLICANTS_ENDPOINT}/${applicantId}/status`, payload);

/** 원서 접수 취소(되돌릴 수 없는 삭제). 서버가 접수 기간을 검사하지 않아 기간 판정은 화면이 맡는다. */
export const deleteApplicant = (applicantId: number) => http.delete<void>(`${APPLICANTS_ENDPOINT}/${applicantId}`);

/** 지금 원서를 정정할 수 있는지와 고칠 수 있는 항목. 정정과 같은 기준으로 판정한다. */
export const getApplicationEditableFields = (applicantId: number) =>
  http.get<EditableApplicationFields>(`${APPLICANTS_ENDPOINT}/${applicantId}/application`);

/** 원서 정정. 전형 결과가 없는(1차 산출 전) 원서만 고칠 수 있다. */
export const correctApplication = (applicantId: number, payload: CorrectApplicationPayload) =>
  http.patch<ApplicationCorrectionResult>(`${APPLICANTS_ENDPOINT}/${applicantId}/application`, payload);

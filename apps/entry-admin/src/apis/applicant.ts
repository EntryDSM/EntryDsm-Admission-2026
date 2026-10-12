import { buildQueryString } from "../utils/queryString";
import { http } from "./http";
import type {
  AdminApplicantDetail,
  ApplicationCorrectionResult,
  CorrectApplicationPayload,
  GetApplicantsParams,
  GetApplicantsResponse,
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
 * 원서(원본) 도착 표시 (204). 요청 본문 `{ isArrived }` 는 필수(`@NotNull`)다.
 * - `true`: `arrivedAt` 이 비어 있을 때만 현재 시각으로 채운다(이미 도착 처리된 원서는 그대로).
 * - `false`: `arrivedAt` 을 지워 도착을 취소한다.
 * (백엔드 `documents/features/admin-applicant-via-grpc/api-spec.md` "3. 원본 도착 표시" 절)
 */
export const updateApplicantArrival = (applicantId: number, isArrived: boolean) =>
  http.patch<void>(`${APPLICANTS_ENDPOINT}/${applicantId}/arrival`, { isArrived });

/**
 * 원서 접수 취소 — 지원자 삭제 (204, swagger 는 200 으로 표기).
 * 백엔드는 application 시스템의 원서 행을 gRPC 로 지운 뒤 admin 의 심사 행도 지우는 하드 삭제라 복구할 수 없다.
 * 없는 지원자는 404 `APPLICANT_NOT_FOUND`. 백엔드가 접수 기간을 검사하지 않으므로 기간 판정은 화면(useApplicationPeriod)이 맡는다.
 * (백엔드 `ApplicantController.delete` → `ApplicantService.delete` → application `ApplicationCommandService.deleteApplicant`)
 */
export const deleteApplicant = (applicantId: number) => http.delete<void>(`${APPLICANTS_ENDPOINT}/${applicantId}`);

/**
 * 제출(도착)된 원서 정정 (200). 1차 합격자 산출 전, 전형 결과가 없는 원서만 고칠 수 있다.
 * 보낸 항목만 바꾸며 상태·조건·에러 코드는 {@link ApplicationCorrectionResult} 참고.
 * (백엔드 #386 `ApplicationCorrectionController` → application `ApplicationCorrectionService`)
 */
export const correctApplication = (applicantId: number, payload: CorrectApplicationPayload) =>
  http.patch<ApplicationCorrectionResult>(`${APPLICANTS_ENDPOINT}/${applicantId}/application`, payload);

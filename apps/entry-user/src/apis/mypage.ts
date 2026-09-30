import { Http } from "./http";
import type { AdmissionType, ApplicationRegion } from "./types";

/** ARRIVAL 은 관리자가 원서 원본(우편) 도착을 처리한 상태로, 제출 이후 단계다. */
export type ApplicantStatus = "NONE" | "DRAFT" | "SUBMITTED" | "ARRIVAL" | "REVIEWING" | "COMPLETED" | "CANCELED";
/** 합격 여부. PENDING 은 발표 전, FIRST_* 는 1차(서류) 전형, FINAL_* 은 2차(최종) 전형 결과다. */
export type PassStatus = "PENDING" | "FIRST_PASSED" | "FIRST_FAILED" | "FINAL_PASSED" | "FINAL_FAILED";

export interface MyAccount {
  /** 외부 노출용 사용자 ID(`user_…`) */
  userId: string;
  role: "ADMIN" | "MONITOR" | "STUDENT";
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  name: string;
  phone: string;
  birthdate: string;
  signupType: "SELF" | "PARENT";
  applicantStatus: ApplicantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStatus {
  applicantStatus: ApplicantStatus;
  submittedAt: string | null;
  updatedAt: string;
}

/** GET /api/identity/v11/applications/result 응답 data */
export interface ApplicationResult {
  /** 접수번호 (예: "0006") */
  applicationNumber: string;
  /** 수험번호. 발급 전이면 null */
  examineeNumber: string | null;
  name: string;
  /** YYYY-MM-DD */
  birthDate: string;
  region: ApplicationRegion;
  admissionType: AdmissionType;
  passStatus: PassStatus;
  /** 합불 사항 표기 문구 (예: "1차 전형 합격") */
  passDescription: string;
  /** 비고. 없으면 null */
  note: string | null;
  /** 발표 시각(ISO 8601). 발표 전이면 null */
  announcedAt: string | null;
}

export interface ResetPasswordRequest {
  loginId: string;
  name: string;
  birthdate: string;
  newPassword: string;
}

export interface CancelApplicationRequest {
  email: string;
  password: string;
}

export interface ApplicationDownload {
  fileName: string;
  downloadUrl: string;
  expiresIn: number;
}

const accountPath = "/api/identity/v11/accounts/me";
const applicationPath = "/api/identity/v11/applications";

export const getMyAccount = () => Http.get<MyAccount>(accountPath);

export const getApplicationStatus = () => Http.get<ApplicationStatus>(`${applicationPath}/status`);

export const getApplicationResult = () => Http.get<ApplicationResult>(`${applicationPath}/result`);

// The API specification defines an empty request body for account deletion.
export const deleteMyAccount = () => Http.delete<null>(accountPath);

export const resetPassword = (payload: ResetPasswordRequest) =>
  Http.patch<null>("/api/identity/v11/auth/password-reset", payload);

export const logout = () => Http.post<null>("/api/identity/v11/auth/logout", {});

export const cancelApplication = (payload: CancelApplicationRequest) =>
  Http.patch<null>(`${applicationPath}/cancellation`, payload);

// 원서 문서 파일 조회에 사용하는 API 경로입니다.
const APPLICATION_DOCUMENT_ENDPOINT = "/api/document/v11/applications";

export interface GetApplicationDocumentResponse {
  fileName: string;
  size: number;
  downloadUrl: string;
  expiresIn: number;
}

// 파일 자체가 아닌 존재 여부와 저장소 key/fileName 메타데이터만 조회합니다.
export const getApplicationDocument = () =>
  Http.get<GetApplicationDocumentResponse>(`${APPLICATION_DOCUMENT_ENDPOINT}`);

// 최종 합격자 등록 서류 조회에 사용하는 API 경로입니다.
const REGISTRATION_DOCUMENT_ENDPOINT = "/api/document/v11/registration-documents/latest";

/** GET /api/document/v11/registration-documents/latest 응답 data */
export interface GetRegistrationDocumentResponse {
  /** 파일 공개 ID (`registration-document_…`) */
  id: string;
  /** 관리자가 올린 원본 파일명 */
  fileName: string;
  size: number;
  /** 서명된 URL. `expiresIn` 초 동안만 열린다. */
  downloadUrl: string;
  expiresIn: number;
}

// 관리자가 가장 최근에 올린 등록 서류를 조회합니다. 최종 합격자가 아니면 403, 올라온 서류가 없으면 404 입니다.
export const getRegistrationDocument = () => Http.get<GetRegistrationDocumentResponse>(REGISTRATION_DOCUMENT_ENDPOINT);

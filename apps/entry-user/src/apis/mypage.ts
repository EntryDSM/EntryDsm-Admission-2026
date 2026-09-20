import { Http } from "./http";

export type ApplicantStatus = "NONE" | "DRAFT" | "SUBMITTED" | "REVIEWING" | "COMPLETED" | "CANCELED";
export type PassStatus = "PENDING" | "PASSED" | "FAILED";

export interface MyAccount {
  userId: number;
  role: "ADMIN" | "MONITOR" | "STUDENT";
  status: "ACTIVE" | "DELETED" | "SUSPENDED";
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

export interface ApplicationResult {
  passStatus: PassStatus;
  announcedAt: string;
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

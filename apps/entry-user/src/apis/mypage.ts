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

export const getApplicationDownload = (receiptCode: string, format: "pdf" | "hwp" = "pdf") =>
  Http.get<ApplicationDownload>("/application/download", {
    auth: false,
    params: { receiptCode, format },
  });

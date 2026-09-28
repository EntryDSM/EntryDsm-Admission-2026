import { Http } from "./http";

export type ApplicantStatus = "NONE" | "DRAFT" | "SUBMITTED" | "REVIEWING" | "COMPLETED" | "CANCELED";

export interface MyAccount {
  userId: string;
  role: "ADMIN" | "MONITOR" | "STUDENT";
  status: "ACTIVE" | "DELETED" | "SUSPENDED";
  name: string;
  phone: string;
  birthdate: string;
  signupType: "SELF" | "PARENT";
  applicantStatus: ApplicantStatus;
  is_sensitive_agree: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStatus {
  applicantStatus: ApplicantStatus;
  submittedAt: string | null;
  updatedAt: string;
}

export const getMyAccount = () => Http.get<MyAccount>("/api/identity/v11/accounts/me");

// 마이페이지와 같은 원서 상태 API를 사용해 중복 원서 생성을 방지합니다.
export const getApplicationStatus = () => Http.get<ApplicationStatus>("/api/identity/v11/applications/status");

export interface AgreeRequset {
  sensitiveAgree: boolean;
}

export interface AgreeResponses {
  updatedAt: string;
  sensitiveAgree: boolean;
}

export const getSensitiveAgree = async ({ ...data }: AgreeRequset) => {
  return Http.patch<AgreeResponses>("/api/identity/v11/accounts/sensitive-agree", data);
};

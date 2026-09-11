import { Http } from "./http";

export type ApplicantStatus = "NONE" | "DRAFT" | "SUBMITTED" | "REVIEWING" | "COMPLETED" | "CANCELED";

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

export const getMyAccount = () => Http.get<MyAccount>("/api/identity/v11/accounts/me");

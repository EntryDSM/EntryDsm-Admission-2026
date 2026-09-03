import type {
  AdminApplicantDetail,
  AdminApplicantSummary,
  AdmissionType,
  ApplicantStatus,
  GraduationStatus,
  Region,
} from "../apis/types";
import { formatDotDate } from "./format";

/** 목록 화면(Applicant 컴포넌트)이 사용하는 뷰 모델 */
export interface ApplicantListItem {
  applicantId: number;
  receiptCode: number;
  applicantName: string;
  region: Region;
  isDaejeon: boolean;
  applicationType: AdmissionType;
  educationalStatus: GraduationStatus;
  examinationNumber?: string;
  isArrived: boolean;
  status: ApplicantStatus;
}

/** 상세 모달이 사용하는 뷰 모델 (API 가 제공하지 않는 필드는 optional) */
export interface ApplicantDetailView {
  applicantId: number;
  receiptCode: number;
  name: string;
  birthDay?: string;
  phoneNumber?: string;
  region: Region;
  isDaejeon: boolean;
  applicationType: AdmissionType;
  educationalStatus: GraduationStatus;
  schoolName?: string;
  examinationNumber?: string;
  status: ApplicantStatus;
  totalScore?: number;
  subjectScore?: number;
  attendanceScore?: number;
  volunteerScore?: number;
}

export const toApplicantListItem = (dto: AdminApplicantSummary): ApplicantListItem => ({
  applicantId: dto.applicantId,
  receiptCode: dto.receiptNumber,
  applicantName: dto.name,
  region: dto.region,
  isDaejeon: dto.region === "DAEJEON",
  applicationType: dto.admissionType,
  educationalStatus: dto.graduationStatus,
  examinationNumber: dto.examineeNumber ?? undefined,
  isArrived: dto.isSubmitted,
  status: dto.status,
});

export const toApplicantDetailView = (dto: AdminApplicantDetail): ApplicantDetailView => ({
  applicantId: dto.applicantId,
  receiptCode: dto.receiptNumber,
  name: dto.name,
  birthDay: formatDotDate(dto.birthDate),
  phoneNumber: dto.phoneNumber,
  region: dto.region,
  isDaejeon: dto.region === "DAEJEON",
  applicationType: dto.admissionType,
  educationalStatus: dto.graduationStatus,
  schoolName: dto.schoolName,
  examinationNumber: dto.examineeNumber ?? undefined,
  status: dto.status,
  totalScore: dto.score?.totalScore,
  subjectScore: dto.score?.subjectScore,
  attendanceScore: dto.score?.attendanceScore,
  volunteerScore: dto.score?.volunteerScore,
});

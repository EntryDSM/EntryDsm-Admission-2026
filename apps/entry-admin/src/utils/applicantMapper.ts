import type {
  AdminApplicantDetail,
  AdminApplicantSummary,
  AdmissionType,
  ApplicantStatus,
  GraduationStatus,
  Region,
} from "../apis/types";
import { formatDotDate, formatReceiptNumber } from "./format";

/** 목록 화면(Applicant 컴포넌트)이 사용하는 뷰 모델. 원서에 비어 있을 수 있는 항목은 optional 이다. */
export interface ApplicantListItem {
  applicantId: number;
  /** 접수번호 표기 (`applicantId` 네 자리, 예: `0001`) */
  receiptCode: string;
  applicantName?: string;
  region?: Region;
  isDaejeon?: boolean;
  applicationType?: AdmissionType;
  educationalStatus?: GraduationStatus;
  examinationNumber?: string;
  isArrived: boolean;
  status: ApplicantStatus;
}

/** 상세 모달이 사용하는 뷰 모델 (API 가 제공하지 않는 필드는 optional) */
export interface ApplicantDetailView {
  applicantId: number;
  /** 접수번호 표기 (`applicantId` 네 자리, 예: `0001`) */
  receiptCode: string;
  name?: string;
  birthDay?: string;
  phoneNumber?: string;
  region?: Region;
  isDaejeon?: boolean;
  applicationType?: AdmissionType;
  educationalStatus?: GraduationStatus;
  schoolName?: string;
  examinationNumber?: string;
  isArrived: boolean;
  status: ApplicantStatus;
  totalScore?: number;
  /** 과목·출결·봉사 세부 점수는 API 가 더 이상 내려주지 않아 항상 비어 있다. */
  subjectScore?: number;
  attendanceScore?: number;
  volunteerScore?: number;
}

/** 지역이 비어 있으면 대전/전국을 판단할 수 없으므로 undefined 로 둔다(화면은 `-` 표기). */
const toIsDaejeon = (region: Region | null) => (region ? region === "DAEJEON" : undefined);

export const toApplicantListItem = (dto: AdminApplicantSummary): ApplicantListItem => ({
  applicantId: dto.applicantId,
  receiptCode: formatReceiptNumber(dto.applicantId),
  applicantName: dto.name ?? undefined,
  region: dto.region ?? undefined,
  isDaejeon: toIsDaejeon(dto.region),
  applicationType: dto.admissionType ?? undefined,
  educationalStatus: dto.graduationStatus ?? undefined,
  examinationNumber: dto.examineeNumber ?? undefined,
  isArrived: dto.isArrived,
  status: dto.status,
});

export const toApplicantDetailView = (dto: AdminApplicantDetail): ApplicantDetailView => ({
  applicantId: dto.applicantId,
  receiptCode: formatReceiptNumber(dto.applicantId),
  name: dto.name ?? undefined,
  birthDay: formatDotDate(dto.birthDate ?? undefined),
  phoneNumber: dto.phoneNumber ?? undefined,
  region: dto.region ?? undefined,
  isDaejeon: toIsDaejeon(dto.region),
  applicationType: dto.admissionType ?? undefined,
  educationalStatus: dto.graduationStatus ?? undefined,
  schoolName: dto.schoolName ?? undefined,
  examinationNumber: dto.examineeNumber ?? undefined,
  isArrived: dto.isArrived,
  status: dto.status,
  totalScore: dto.score?.totalScore,
});

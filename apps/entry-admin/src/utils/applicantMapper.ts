import type {
  AdminApplicantDetail,
  AdminApplicantSummary,
  AdmissionType,
  ApplicantGedScores,
  ApplicantStatus,
  GraduationStatus,
  Region,
} from "../apis/types";
import { formatDotDate, formatReceiptNumber } from "./format";

export interface ApplicantListItem {
  applicantId: number;
  /** 접수번호 표기(예: `0001`) */
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

export interface ApplicantDetailView {
  applicantId: number;
  /** 접수번호 표기(예: `0001`) */
  receiptCode: string;
  name?: string;
  /** 표시용(예: `2010.03.15`) */
  birthDay?: string;
  /** `YYYY-MM-DD`. 원서 정정 입력칸의 초깃값으로 쓴다. */
  birthDate?: string;
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
  subjectScore?: number;
  attendanceScore?: number;
  volunteerScore?: number;
  additionalScore?: number;
  gedScores?: ApplicantGedScores;
  photoFileId?: string;
  introduction?: string;
  studyPlan?: string;
}

/** 지역이 비어 있으면 대전/전국을 알 수 없어 undefined 다(화면은 `-`). */
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
  birthDate: dto.birthDate ?? undefined,
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
  subjectScore: dto.score?.subjectScore,
  attendanceScore: dto.score?.attendanceScore,
  volunteerScore: dto.score?.volunteerScore,
  additionalScore: dto.score?.additionalScore,
  gedScores: dto.gedScores ?? undefined,
  photoFileId: dto.photoFileId ?? undefined,
  introduction: dto.introduction ?? undefined,
  studyPlan: dto.studyPlan ?? undefined,
});

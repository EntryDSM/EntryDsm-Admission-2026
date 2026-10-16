import type {
  AdminApplicantDetail,
  AdminApplicantSummary,
  AdmissionType,
  ApplicantStatus,
  GraduationStatus,
  Region,
  SchoolSemester,
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
  /** 반영된 학기만 학년·학기 순으로 둔다. 검정고시는 비어 있다. */
  semesterScores: Array<{ semester: SchoolSemester; label: string; score: number }>;
  photoFileId?: string;
  introduction?: string;
  studyPlan?: string;
}

const SEMESTERS: ReadonlyArray<{ semester: SchoolSemester; label: string }> = [
  { semester: "FIRST_GRADE_FIRST_SEMESTER", label: "1학년 1학기" },
  { semester: "FIRST_GRADE_SECOND_SEMESTER", label: "1학년 2학기" },
  { semester: "SECOND_GRADE_FIRST_SEMESTER", label: "2학년 1학기" },
  { semester: "SECOND_GRADE_SECOND_SEMESTER", label: "2학년 2학기" },
  { semester: "THIRD_GRADE_FIRST_SEMESTER", label: "3학년 1학기" },
  { semester: "THIRD_GRADE_SECOND_SEMESTER", label: "3학년 2학기" },
];

/** 다른 점수 항목처럼 소수 셋째 자리까지 보인다. */
const roundScore = (score: number) => Math.round(score * 1000) / 1000;

const toSemesterScores = (scores: AdminApplicantDetail["semesterScores"] = {}) =>
  SEMESTERS.flatMap(({ semester, label }) => {
    const score = scores[semester];
    return score === undefined ? [] : [{ semester, label, score: roundScore(score) }];
  });

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
  semesterScores: toSemesterScores(dto.semesterScores),
  photoFileId: dto.photoFileId ?? undefined,
  introduction: dto.introduction ?? undefined,
  studyPlan: dto.studyPlan ?? undefined,
});

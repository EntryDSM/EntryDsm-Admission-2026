import type {
  AdminApplicantDetail,
  AdminApplicantSummary,
  AdmissionType,
  ApplicantStatus,
  ExportFilter,
  GetApplicantsParams,
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
  /** 교과·출결·봉사·가산점. 백엔드 #263 배포 전 응답에는 없어 비어 있다(화면은 `-`). */
  subjectScore?: number;
  attendanceScore?: number;
  volunteerScore?: number;
  additionalScore?: number;
  /** 증명사진 파일 ID. 사진 URL 은 `useApplicantPhoto` 가 document 에서 받는다. */
  photoFileId?: string;
  /** 자기소개서·학업계획서 본문. 지원자가 쓴 줄바꿈(`\n`)이 그대로 있다. */
  introduction?: string;
  studyPlan?: string;
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
  subjectScore: dto.score?.subjectScore,
  attendanceScore: dto.score?.attendanceScore,
  volunteerScore: dto.score?.volunteerScore,
  additionalScore: dto.score?.additionalScore,
  photoFileId: dto.photoFileId ?? undefined,
  introduction: dto.introduction ?? undefined,
  studyPlan: dto.studyPlan ?? undefined,
});

/**
 * 지원자 목록 조회 조건 → 내보내기(`POST /exports`) 대상 조건. 페이지 정보는 빼고 값이 있는 조건만 남긴다.
 * 조건이 하나도 없으면 undefined 를 돌려줘 `filter` 를 생략(전체 지원자)하게 한다.
 */
export const toExportFilter = (params: GetApplicantsParams): ExportFilter | undefined => {
  const { keyword, regions, admissionTypes, graduationStatuses, isArrived, statuses } = params;
  const filter: ExportFilter = {
    ...(keyword ? { keyword } : {}),
    ...(regions && regions.length > 0 ? { regions } : {}),
    ...(admissionTypes && admissionTypes.length > 0 ? { admissionTypes } : {}),
    ...(graduationStatuses && graduationStatuses.length > 0 ? { graduationStatuses } : {}),
    ...(isArrived !== undefined ? { isArrived } : {}),
    ...(statuses && statuses.length > 0 ? { statuses } : {}),
  };

  return Object.keys(filter).length > 0 ? filter : undefined;
};

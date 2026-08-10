/**
 * 관리자(admin) 도메인 API 타입 정의.
 * 백엔드 명세(`/api/v11/admin/...`)의 응답/요청 형태를 그대로 따른다.
 */

/* ─────────────────────────── 공통 Enum ─────────────────────────── */

/** 지원 지역 */
export type Region = "DAEJEON" | "NATIONWIDE";

/** 전형 구분 */
export type AdmissionType = "GENERAL" | "MEISTER" | "SOCIAL";

/** 학력 구분 */
export type GraduationStatus = "EXPECTED" | "GRADUATED" | "GED";

/**
 * 지원자 전형 상태.
 * 명세 예시(`FIRST_PASS` / `FIRST_FAIL`) 외 값은 미확정이라, 알려진 값 + 임의 문자열을 허용한다.
 */
export type ApplicantStatus =
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "FIRST_PASS"
  | "FIRST_FAIL"
  | "FINAL_PASS"
  | "FINAL_FAIL"
  | (string & {});

/* ─────────────────────── 목록 조회 (GET /applicants) ─────────────────────── */

export type GetApplicantsParams = {
  /** 이름 또는 수험번호 부분 일치 검색 */
  keyword?: string;
  regions?: Region[];
  admissionTypes?: AdmissionType[];
  graduationStatuses?: GraduationStatus[];
  /** 원서 도착 여부 */
  isSubmitted?: boolean;
  statuses?: ApplicantStatus[];
  /** 1-indexed, 기본 1 */
  page?: number;
  /** 기본 10, 최대 100 */
  size?: number;
  /** `{field},{direction}` 형식 (예: `createdAt,desc`) */
  sort?: string;
};

/** 목록 응답의 단일 지원자 요약 */
export interface AdminApplicantSummary {
  applicantId: number;
  receiptNumber: number;
  name: string;
  region: Region;
  admissionType: AdmissionType;
  graduationStatus: GraduationStatus;
  examineeNumber: string | null;
  isSubmitted: boolean;
  status: ApplicantStatus;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

export interface GetApplicantsResponse {
  applicants: AdminApplicantSummary[];
  pageInfo: PageInfo;
}

/* ───────────────────── 상세 조회 (GET /applicants/{id}) ───────────────────── */

export interface ApplicantScore {
  subjectScore: number;
  attendanceScore: number;
  volunteerScore: number;
  totalScore: number;
}

export interface AdminApplicantDetail {
  applicantId: number;
  receiptNumber: number;
  name: string;
  /** ISO date (예: `2010-03-15`) */
  birthDate: string;
  phoneNumber: string;
  region: Region;
  admissionType: AdmissionType;
  graduationStatus: GraduationStatus;
  schoolName: string;
  examineeNumber: string | null;
  isSubmitted: boolean;
  status: ApplicantStatus;
  score: ApplicantScore;
  /** ISO datetime */
  submittedAt: string;
  /** ISO datetime */
  updatedAt: string;
}

/* ───────────────────── 통계 조회 (GET /statistics) ───────────────────── */

export type StatisticsMetric =
  | "APPLICANT_COUNT"
  | "COMPETITION_RATE"
  | "REGION_DISTRIBUTION"
  | "TYPE_DISTRIBUTION"
  | "DAILY_TREND";

/** 지원자 수 (명세 확정) */
export interface ApplicantCountMetric {
  total: number;
  byType: Partial<Record<AdmissionType, number>>;
}

/** 전형별 경쟁률 (명세 확정) */
export type CompetitionRateMetric = Partial<Record<AdmissionType, number>>;

/** 지역별 분포 — 명세에 응답 예시가 없어 `{ 지역코드: 수 }` 형태로 가정 */
export type RegionDistributionMetric = Record<string, number>;

/** 전형별 분포 — 명세에 응답 예시가 없어 `{ 전형: 수 }` 형태로 가정 */
export type TypeDistributionMetric = Partial<Record<AdmissionType, number>>;

/** 일자별 추이 — 명세에 응답 예시가 없어 `[{ 날짜, 수 }]` 형태로 가정 */
export type DailyTrendMetric = { date: string; count: number }[];

export interface StatisticsMetrics {
  APPLICANT_COUNT?: ApplicantCountMetric;
  COMPETITION_RATE?: CompetitionRateMetric;
  REGION_DISTRIBUTION?: RegionDistributionMetric;
  TYPE_DISTRIBUTION?: TypeDistributionMetric;
  DAILY_TREND?: DailyTrendMetric;
}

export interface GetStatisticsResponse {
  /** ISO datetime */
  generatedAt: string;
  metrics: StatisticsMetrics;
}

/* ───────────────── 전형 일정 (GET/PATCH /schedules) ───────────────── */

/** 요일 (백엔드 표기) */
export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

/** 일정의 시각. 백엔드는 연·월·일·요일·시·분·초로 분해해 주고받는다. */
export interface ScheduleDateTime {
  year: number;
  month: number;
  day: number;
  dayOfWeek: DayOfWeek;
  hour: number;
  minute: number;
  second: number;
}

/** 단일 전형 일정 (조회 응답 항목) */
export interface AdminSchedule {
  scheduleId: number;
  title: string;
  startAt: ScheduleDateTime;
  endAt: ScheduleDateTime;
}

/**
 * 일정 수정 요청 항목.
 * 엔드포인트가 `/schedules/bulk` 라 배열로 보내며, 각 항목을 `scheduleId` 로 식별하도록 함께 전송한다.
 */
export interface UpdateScheduleItem {
  scheduleId: number;
  title: string;
  startAt: ScheduleDateTime;
  endAt: ScheduleDateTime;
}

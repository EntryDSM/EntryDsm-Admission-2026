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
 * 지원자 전형 상태 (백엔드 `ApplicantStatus` enum, 2026-09-21 확인).
 * 정상 흐름은 `PENDING` → 1차 결과 → 최종 결과 순으로만 진행한다.
 */
export type ApplicantStatus = "PENDING" | "FIRST_PASS" | "FIRST_FAIL" | "FINAL_PASS" | "FINAL_FAIL";

/* ───────────── 내 계정 조회 (GET /api/identity/v11/accounts/me) ───────────── */

/** 계정 권한. ADMIN 만 어드민 페이지에 접근할 수 있다. */
export type AccountRole = "ADMIN" | "MONITOR" | "STUDENT";

/** 계정 상태 (identity swagger enum, 2026-09-21 확인) */
export type AccountStatus = "ACTIVE" | "INACTIVE" | "DELETED";

/** 가입 유형 (본인/보호자 명의) */
export type SignupType = "SELF" | "PARENT";

/** identity 도메인의 지원 상태 — admin 도메인 `ApplicantStatus` 와 값 체계가 다르다. */
export type AccountApplicantStatus = "NONE" | "DRAFT" | "SUBMITTED" | "REVIEWING" | "COMPLETED" | "CANCELED";

/** 내 계정 정보 */
export interface MyAccount {
  userId: string;
  role: AccountRole;
  status: AccountStatus;
  name: string;
  phone: string;
  /** ISO date (예: `2009-03-27`) */
  birthdate: string;
  signupType: SignupType;
  applicantStatus: AccountApplicantStatus;
  /** ISO datetime */
  createdAt: string;
  /** ISO datetime */
  updatedAt: string;
}

/* ─────────────────────── 목록 조회 (GET /applicants) ─────────────────────── */

export type GetApplicantsParams = {
  /** 이름 또는 수험번호 부분 일치 검색 */
  keyword?: string;
  regions?: Region[];
  admissionTypes?: AdmissionType[];
  graduationStatuses?: GraduationStatus[];
  /** 원서 원본(우편) 도착 여부 (이전 이름 `isSubmitted`) */
  isArrived?: boolean;
  statuses?: ApplicantStatus[];
  /** 1-indexed, 기본 1 */
  page?: number;
  /** 기본 10, 최대 100 */
  size?: number;
};

/**
 * 목록 응답의 단일 지원자 요약.
 * 별도 접수 번호는 없고 `applicantId` 가 접수 순서를 겸한다(화면 표기는 `formatReceiptNumber` 참고).
 * 이름·지역·전형·학력은 제출된 원서에도 비어 있을 수 있어 nullable 이다.
 */
export interface AdminApplicantSummary {
  applicantId: number;
  name: string | null;
  region: Region | null;
  admissionType: AdmissionType | null;
  graduationStatus: GraduationStatus | null;
  examineeNumber: string | null;
  /** 원서 원본(우편) 도착 여부 */
  isArrived: boolean;
  status: ApplicantStatus;
}

/** admin 도메인 공통 규약의 목록 응답 형식 */
export interface AdminPageResponse<T> {
  items: T[];
  /** 1-indexed */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type GetApplicantsResponse = AdminPageResponse<AdminApplicantSummary>;

/* ───────────────────── 상세 조회 (GET /applicants/{id}) ───────────────────── */

/** application 이 산출한 총점. 과목·출결·봉사 세부 점수는 내려오지 않는다. */
export interface ApplicantScore {
  totalScore: number;
}

/** 상세 응답. 목록과 같은 이유로 원서 항목은 nullable 이다. */
export interface AdminApplicantDetail {
  applicantId: number;
  name: string | null;
  /** ISO date (예: `2010-03-15`) */
  birthDate: string | null;
  phoneNumber: string | null;
  region: Region | null;
  admissionType: AdmissionType | null;
  graduationStatus: GraduationStatus | null;
  schoolName: string | null;
  examineeNumber: string | null;
  /** 원서 원본(우편) 도착 여부 */
  isArrived: boolean;
  status: ApplicantStatus;
  /** 총점이 아직 없으면 null */
  score: ApplicantScore | null;
  /** ISO datetime — 원서를 제출한 시각 */
  submittedAt: string | null;
  /** ISO datetime — 원서 원본(우편)이 도착한 시각 */
  arrivedAt: string | null;
  /** ISO datetime */
  updatedAt: string | null;
}

/* ───────────── 1차 합격자 일괄 산출 (POST /screenings/first/results) ───────────── */

/** 일괄 산출 결과 집계 */
export interface ScreeningResult {
  /** true 면 상태를 변경하지 않고 산출 결과만 반환한 것(검토용) */
  dryRun: boolean;
  passCount: number;
  failCount: number;
  excludedCount: number;
  /** ISO datetime */
  processedAt: string;
}

/* ───── 2차(최종) 합격자 개별 등록 (POST /screenings/final/results/{applicantId}) ───── */

/** 개별 등록 결과. 등록한 지원자는 FINAL_PASS 가 되며, 명세상 `status` 는 전형 상태 enum 전체를 쓴다. */
export interface FinalScreeningResult {
  applicantId: number;
  status: ApplicantStatus;
  /** ISO datetime */
  processedAt: string;
}

/* ───────────── 수험번호 일괄 발급 (POST /examinee-numbers/issue) ───────────── */

/** 일괄 발급 결과 집계. 명세 예시 기준 `issuedCount + skippedCount === totalTargets`. */
export interface ExamineeNumberIssueResult {
  /** 이번 요청으로 새로 발급된 지원자 수 */
  issuedCount: number;
  /** 발급하지 않고 건너뛴 지원자 수 (이미 발급된 경우 등 — 건너뛴 사유는 명세 미기재) */
  skippedCount: number;
  /** 발급 대상 지원자 전체 수 */
  totalTargets: number;
}

/* ───── 내보내기 잡 (POST /exports → 202, GET /exports/{exportJobId}) ───── */

/** 내보내기 산출물 종류 — 수험표 ZIP / 지원자 목록 엑셀 */
export type ExportType = "ADMISSION_TICKET" | "APPLICANT_LIST";

/** 내보내기 잡 상태. `COMPLETED` 일 때만 `downloadUrl` 이 내려온다. */
export type ExportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

/** 내보내기 대상 조건. 지원자 목록 조회(`GET /applicants`)와 같은 조건이며, 비어 있으면 거르지 않는다. */
export type ExportFilter = Pick<
  GetApplicantsParams,
  "keyword" | "regions" | "admissionTypes" | "graduationStatuses" | "isArrived" | "statuses"
>;

export interface CreateExportPayload {
  type: ExportType;
  filter?: ExportFilter;
}

/** 잡 접수 응답 (202 Accepted). 실제 생성은 서버가 비동기로 진행한다. */
export interface CreateExportResult {
  exportJobId: string;
  status: ExportStatus;
}

/** 잡 조회 응답. 완료 시 서명된 `downloadUrl`(기본 15분 유효)이 내려온다. */
export interface ExportJob {
  exportJobId: string;
  type: ExportType;
  status: ExportStatus;
  downloadUrl: string | null;
  /** ISO datetime — downloadUrl 만료 시각 */
  expiresAt: string | null;
  /** ISO datetime */
  createdAt: string;
  /** ISO datetime */
  completedAt: string | null;
}

/* ───────────────────── 통계 조회 (GET /statistics) ───────────────────── */

/**
 * 요청 가능한 메트릭 — 백엔드 enum 과 동일해야 한다(2026-09-11 백엔드 확인).
 * 이 외 값을 넘기면 바인딩 실패로 400 이 난다. 응답 예시에만 있는 `GENDER_RATIO`/`REGION_STATUS` 는
 * 요청 파라미터로 쓸 수 없다({@link StatisticsMetrics} 참고).
 */
export type StatisticsMetric =
  | "APPLICANT_COUNT"
  | "COMPETITION_RATE"
  | "REGION_DISTRIBUTION"
  | "TYPE_DISTRIBUTION"
  | "DAILY_TREND";

/** 성별 (백엔드 표기) */
export type Gender = "MALE" | "FEMALE";

/** 지원자 수 (명세 확정) */
export interface ApplicantCountMetric {
  total: number;
  byType: Partial<Record<AdmissionType, number>>;
}

/** 전형별 경쟁률 (명세 확정) */
export type CompetitionRateMetric = Partial<Record<AdmissionType, number>>;

/** 지역별 분포 `{ DAEJEON|NATIONWIDE: 수 }` (백엔드 응답 매퍼 확인, 2026-09-21) */
export type RegionDistributionMetric = Record<string, number>;

/** 전형별 분포 `{ 전형: 수 }` (백엔드 응답 매퍼 확인) */
export type TypeDistributionMetric = Partial<Record<AdmissionType, number>>;

/** 일자별 추이 `[{ date: YYYY-MM-DD, count }]` — 원서 제출일 기준 (백엔드 응답 매퍼 확인) */
export type DailyTrendMetric = { date: string; count: number }[];

/** 지원 성비 (명세 응답 예시 기준) */
export interface GenderRatioMetric {
  total: number;
  byGender: Partial<Record<Gender, number>>;
  /** 남성 비율 (0~1) */
  maleRatio: number;
  byType: Partial<Record<AdmissionType, Partial<Record<Gender, number>>>>;
}

/** 지역별 접수 현황 (명세 응답 예시 기준) */
export interface RegionStatusMetric {
  total: number;
  /** 관내(LOCAL)/전국(NATIONWIDE) 구분 */
  byScope: Partial<Record<"LOCAL" | "NATIONWIDE", number>>;
  /** 시·도 코드 → 수 (예: DAEJEON, SEJONG, …, ETC) */
  byRegion: Record<string, number>;
}

/**
 * 응답의 `metrics` 맵. 요청한 메트릭만 담겨 오므로 전부 옵셔널이다.
 * `GENDER_RATIO`/`REGION_STATUS` 는 백엔드 enum 에 없고 서버(StatisticsService)도 만들지 않는다(2026-09-21 확인)
 * — 성비 카드·시도별 지역 현황은 백엔드가 지표를 추가하기 전까지 빈 값이며, 매퍼는 둘 다 없어도 안전하게 동작한다.
 */
export interface StatisticsMetrics {
  APPLICANT_COUNT?: ApplicantCountMetric;
  COMPETITION_RATE?: CompetitionRateMetric;
  REGION_DISTRIBUTION?: RegionDistributionMetric;
  TYPE_DISTRIBUTION?: TypeDistributionMetric;
  DAILY_TREND?: DailyTrendMetric;
  GENDER_RATIO?: GenderRatioMetric;
  REGION_STATUS?: RegionStatusMetric;
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
 * 일정 요청 항목. 등록은 `POST /schedules`(항목 하나씩, 201), 수정은 `PATCH /schedules/bulk`(배열)에 쓴다.
 * bulk 수정은 title 로 기존 일정을 찾아 시각만 바꾸고 없는 title 은 404 로 거절하므로,
 * 신규 일정은 반드시 POST 로 만든다(2026-09-21 백엔드 ScheduleService 확인).
 */
export interface UpdateScheduleItem {
  title: string;
  startAt: ScheduleDateTime;
  endAt: ScheduleDateTime;
}

/* ───────────── 공지사항·QnA (GET /notifications/..., POST /admin/notices) ───────────── */

/**
 * 공지 분류 (백엔드 `NoticeCategory` 저장값, 2026-09-21 확인). admin 등록/수정 요청의 `division` 과
 * notification 목록 조회의 `category` 파라미터가 같은 값을 쓴다. 서버는 한글 이름(입학 공지사항/예비 신입생 안내)과
 * Notion 명세의 영문 이름(Admissions Notice/Prospective Students Notice)도 같은 값으로 받아 준다.
 */
export type NoticeDivision = "ADMISSION_NOTICE" | "PROSPECTIVE_STUDENT";

/** notification 도메인 목록 조회 파라미터 (`page` 0-indexed 기본 0, `size` 기본 10 — swagger 확인). */
export type PageParams = {
  /** 0-indexed */
  page?: number;
  size?: number;
};

/** 공지 목록은 `category` 파라미터로 분류를 거른다(값은 {@link NoticeDivision}). */
export type GetNoticesParams = PageParams & { category?: NoticeDivision };
/** QnA 목록의 `category` 는 FAQ 분류 문자열이라 별도 타입을 두지 않는다. */
export type GetQnasParams = PageParams & { category?: string };

/** notification 도메인 목록 응답 공통 형태 */
export interface PageResponse<T> {
  content: T[];
  /** 0-indexed */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * 목록 응답의 단일 공지 요약.
 * 분류(`division`)·고정 여부(`isPinned`)는 조회 API 가 돌려주지 않는다(2026-09-21 확인) — 내려올 경우만 대비해 optional 로 둔다.
 */
export interface NoticeSummary {
  noticeId: number;
  title: string;
  author: string;
  /** ISO datetime */
  createdAt: string;
  division?: string;
  isPinned?: boolean;
}

export type GetNoticesResponse = PageResponse<NoticeSummary>;

/** 목록 응답의 단일 QnA(자주 묻는 질문) 요약 */
export interface QnaSummary {
  faqId: number;
  category: string;
  question: string;
  answer: string;
}

export type GetQnasResponse = PageResponse<QnaSummary>;

/** QnA 상세 응답 */
export interface QnaDetail extends QnaSummary {
  viewCount: number;
  /** ISO datetime */
  createdAt: string;
  /** ISO datetime */
  updatedAt: string;
}

/** 상세 응답. `division`/`isPinned` 는 목록과 같은 이유로 optional. */
export interface NoticeDetail {
  noticeId: number;
  title: string;
  content: string;
  author: string;
  viewCount: number;
  /** ISO datetime */
  createdAt: string;
  /** ISO datetime */
  updatedAt: string;
  division?: string;
  isPinned?: boolean;
}

/** 공지 등록 요청 (POST /api/v11/admin/notices → 201, 응답 `{ noticeId, title, isPinned, createdAt }`) */
export interface CreateNoticePayload {
  title: string;
  division: NoticeDivision;
  content: string;
  isPinned: boolean;
  /** 파일관리(document) 업로드 API 미연동이라 현재는 보내지 않는다. */
  attachmentIds?: string[];
}

/**
 * 공지 수정 요청 (PATCH /api/v11/admin/notices/{noticeId} → 204).
 * 보낸 필드만 바뀌고 없거나 null 인 필드는 유지된다. `attachmentIds` 는 보내면 목록 전체가 교체된다(빈 배열 = 첨부 제거).
 */
export interface UpdateNoticePayload {
  title?: string;
  content?: string;
  division?: NoticeDivision;
  isPinned?: boolean;
  attachmentIds?: string[];
}

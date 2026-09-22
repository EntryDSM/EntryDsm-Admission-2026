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

/**
 * application 이 산출한 점수. `totalScore` 는 항상 있고, 세부 항목(교과·출결·봉사·가산점)은
 * 백엔드 #263(feat/260-admin-applicant-detail)이 배포된 뒤에만 내려오므로 옵셔널이다(배포 전 응답은 `totalScore` 만).
 * 세부 항목은 application `ScoreCalculator.calculateBreakdown` 결과(소수 셋째 자리 반올림)이고,
 * `totalScore` 는 전형별 상한(일반 173·특별 119)으로 잘린 저장값이라 항목 합과 다를 수 있다.
 */
export interface ApplicantScore {
  subjectScore?: number;
  attendanceScore?: number;
  volunteerScore?: number;
  additionalScore?: number;
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
  /**
   * 증명사진 파일 ID(`photo_…`). 사진 자체는 document `GET /api/document/v11/photos/{photoFileId}` 가
   * 서명 URL 로 준다({@link DocumentFile}). 올리지 않았으면 null. (백엔드 #252, 2026-09-21)
   */
  photoFileId: string | null;
  /** 자기소개서. 지원자가 쓴 줄바꿈(`\n`)이 그대로 있다. 쓰지 않았으면 null */
  introduction: string | null;
  /** 학업계획서. `introduction` 과 같다 */
  studyPlan: string | null;
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

/* ───────────── 모집 정원 (GET/PUT /admission-quotas) ───────────── */

/**
 * 지역 → 전형 → 정원(명). 대전/전국 × 일반/마이스터/사회통합 6개 조합이 모두 0 이상으로 채워져야 하며,
 * 하나라도 빠지거나 음수면 백엔드가 400(INVALID_ADMISSION_QUOTA)으로 거절한다(2026-09-22 백엔드 AdmissionQuota 확인).
 * 최종 합격자 산출과 경쟁률(COMPETITION_RATE)의 기준이고, 전형별 정원은 두 지역 정원의 합이다.
 */
export type AdmissionQuotaMap = Record<Region, Record<AdmissionType, number>>;

/** 조회·수정 응답. 등록된 정원이 없으면 조회는 404(ADMISSION_QUOTA_NOT_FOUND)를 준다. */
export interface AdmissionQuota {
  quotas: AdmissionQuotaMap;
  /** ISO datetime */
  updatedAt: string;
  /** 마지막 수정자 — 게이트웨이가 인증 쿠키로 채운 `X-User-Id`(계정 userId) */
  updatedBy: string;
}

/**
 * 전체 교체 요청 (PUT /api/v11/admin/admission-quotas → 200, 저장된 {@link AdmissionQuota}).
 * swagger 의 필수 헤더 `X-User-Id` 는 게이트웨이가 인증 쿠키로 주입하므로(클라이언트가 보낸 값은 지운다) 본문만 보낸다.
 */
export interface UpdateAdmissionQuotaPayload {
  quotas: AdmissionQuotaMap;
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
 * 요청 가능한 메트릭 — 백엔드 `StatisticsMetric` enum 과 동일해야 한다.
 * 이 외 값이 하나라도 섞이면 바인딩 실패로 요청 전체가 400 이 난다(2026-09-11 백엔드 확인).
 * `GENDER_RATIO`/`REGION_STATUS` 는 백엔드 #264(feat/137-admin-statistics)가 추가한 지표라 배포 전 서버는
 * 400 으로 거절한다 — `getStatisticsWithOptional` 이 그 경우 핵심 지표만으로 재조회한다.
 */
export type StatisticsMetric =
  | "APPLICANT_COUNT"
  | "COMPETITION_RATE"
  | "REGION_DISTRIBUTION"
  | "TYPE_DISTRIBUTION"
  | "DAILY_TREND"
  | "GENDER_RATIO"
  | "REGION_STATUS";

/** 성별 (백엔드 `Gender` enum) */
export type Gender = "MALE" | "FEMALE";

/**
 * 거주지 시·도 (백엔드 `ResidenceRegion` enum, #264). 원서의 기본 주소에서 시·도 명칭을 찾아 매기고,
 * 주소가 없거나 알아볼 수 없으면 `ETC` 로 집계한다.
 */
export type ResidenceRegion =
  | "SEOUL"
  | "BUSAN"
  | "DAEGU"
  | "INCHEON"
  | "GWANGJU"
  | "DAEJEON"
  | "ULSAN"
  | "SEJONG"
  | "GYEONGGI"
  | "GANGWON"
  | "CHUNGBUK"
  | "CHUNGNAM"
  | "JEONBUK"
  | "JEONNAM"
  | "GYEONGBUK"
  | "GYEONGNAM"
  | "JEJU"
  | "ETC";

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

/**
 * 지원 성비 (백엔드 #264 `AdminResponseMapper` 확인). 성별이 빈 원서는 `byGender`/`byType` 에서 빠지고 `total` 에는 든다.
 */
export interface GenderRatioMetric {
  total: number;
  byGender: Partial<Record<Gender, number>>;
  /** 남학생 비율 (0~1, 소수 셋째 자리 반올림). 지원자가 없으면 0 */
  maleRatio: number;
  /** 전형별 성별 수. 전형이나 성별이 빈 원서는 빠진다 */
  byType: Partial<Record<AdmissionType, Partial<Record<Gender, number>>>>;
}

/** 지역별 접수 현황 (백엔드 #264 `AdminResponseMapper` 확인) */
export interface RegionStatusMetric {
  total: number;
  /** 모집 범위 — 관내(대전, `LOCAL`)/전국(`NATIONWIDE`). 지역이 빈 원서는 빠진다 */
  byScope: Partial<Record<"LOCAL" | "NATIONWIDE", number>>;
  /** 거주지 시·도 → 수. 집계된 시·도만 담기며, 주소가 없거나 알아볼 수 없으면 `ETC` */
  byRegion: Partial<Record<ResidenceRegion, number>>;
}

/**
 * 응답의 `metrics` 맵. 요청한 메트릭만 담겨 오므로 전부 옵셔널이다.
 * `GENDER_RATIO`/`REGION_STATUS` 는 백엔드 #264 배포 전에는 요청할 수 없어 빠져 오며(핵심 지표 재조회 폴백),
 * 매퍼는 둘 다 없어도 안전하게 동작한다(성비 카드는 빈 값, 지역은 `REGION_DISTRIBUTION` 사용).
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

/* ───────────── 파일 조회 (GET /api/document/v11/photos/{photoId}) ───────────── */

/**
 * document 도메인의 파일 응답(configuration `FileResponse`). `downloadUrl` 은 서명 URL 이라 `expiresIn` 초 동안만 유효하다.
 * 증명사진(PHOTO)은 본인과 ADMIN 만 받을 수 있다(백엔드 `FileCategory` 권한표). 봉투는 admin 과 같은 `{ success, data }`.
 */
export interface DocumentFile {
  /** 공개 ID (`photo_…`) */
  id: string | null;
  fileName: string;
  /** bytes */
  size: number;
  downloadUrl: string;
  /** `downloadUrl` 유효 시간(초) */
  expiresIn: number;
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

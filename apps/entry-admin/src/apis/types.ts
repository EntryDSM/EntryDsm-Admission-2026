/* ─────────────────────────── 공통 Enum ─────────────────────────── */

export type Region = "DAEJEON" | "NATIONWIDE";

export type AdmissionType = "GENERAL" | "MEISTER" | "SOCIAL";

export type GraduationStatus = "EXPECTED" | "GRADUATED" | "GED";

/** 전형 상태. `PENDING` → 1차 결과 → 최종 결과 순으로만 진행한다. */
export type ApplicantStatus = "PENDING" | "FIRST_PASS" | "FIRST_FAIL" | "FINAL_PASS" | "FINAL_FAIL";

/* ───────────── 내 계정 조회 (GET /api/identity/v11/accounts/me) ───────────── */

/** ADMIN 만 어드민 페이지에 접근할 수 있다. */
export type AccountRole = "ADMIN" | "MONITOR" | "STUDENT";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "DELETED";

/** 본인/보호자 명의 가입 */
export type SignupType = "SELF" | "PARENT";

/** identity 의 지원 상태. admin 의 {@link ApplicantStatus} 와 값 체계가 다르다. */
export type AccountApplicantStatus =
  | "NONE"
  | "DRAFT"
  | "SUBMITTED"
  | "ARRIVAL"
  | "REVIEWING"
  | "COMPLETED"
  | "CANCELED";

export interface MyAccount {
  userId: string;
  role: AccountRole;
  status: AccountStatus;
  name: string;
  phone: string;
  birthdate: string;
  signupType: SignupType;
  applicantStatus: AccountApplicantStatus;
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────── 목록 조회 (GET /applicants) ─────────────────────── */

export type GetApplicantsParams = {
  /** 이름 또는 수험번호 부분 일치 */
  keyword?: string;
  regions?: Region[];
  admissionTypes?: AdmissionType[];
  graduationStatuses?: GraduationStatus[];
  /** 원서 원본(우편) 도착 여부 */
  isArrived?: boolean;
  statuses?: ApplicantStatus[];
  /** 1부터 시작 */
  page?: number;
  /** 기본 10, 최대 100 */
  size?: number;
};

/**
 * 별도 접수 번호는 없고 `applicantId` 가 접수 순서를 겸한다.
 * 원서 항목은 제출된 원서에도 비어 있을 수 있어 nullable 이다.
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

export interface AdminPageResponse<T> {
  items: T[];
  /** 1부터 시작 */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type GetApplicantsResponse = AdminPageResponse<AdminApplicantSummary>;

/* ───────────────────── 상세 조회 (GET /applicants/{id}) ───────────────────── */

/** 세부 항목은 없을 수 있다. `totalScore` 는 전형별 상한(일반 173·특별 119)으로 잘린 값이라 항목 합과 다를 수 있다. */
export interface ApplicantScore {
  subjectScore?: number;
  attendanceScore?: number;
  volunteerScore?: number;
  additionalScore?: number;
  totalScore: number;
}

/** 검정고시 과목별 점수(0~100). 원서 입력 API 와 달리 필드명에 `Score` 가 붙지 않는다. */
export interface ApplicantGedScores {
  korean: number;
  society: number;
  history: number;
  math: number;
  science: number;
  technology: number;
  english: number;
}

export interface AdminApplicantDetail {
  applicantId: number;
  name: string | null;
  /** `YYYY-MM-DD` */
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
  /** 검정고시 지원자만 있다(응답에 없을 수 있다). */
  gedScores?: ApplicantGedScores | null;
  submittedAt: string | null;
  arrivedAt: string | null;
  updatedAt: string | null;
  /** 증명사진 파일 ID. 사진은 document 파일 조회로 서명 URL 을 받아 연다. */
  photoFileId: string | null;
  /** 지원자가 쓴 줄바꿈(`\n`)이 그대로 있다. */
  introduction: string | null;
  studyPlan: string | null;
}

/* ───────────── 1차 합격자 일괄 산출 (POST /screenings/first/results) ───────────── */

export interface ScreeningResult {
  /** true 면 상태를 바꾸지 않고 산출 결과만 돌려준 것 */
  dryRun: boolean;
  passCount: number;
  failCount: number;
  excludedCount: number;
  processedAt: string;
}

/* ───── 2차(최종) 합격자 개별 등록 (POST /screenings/final/results/{applicantId}) ───── */

export interface FinalScreeningResult {
  applicantId: number;
  status: ApplicantStatus;
  processedAt: string;
}

/* ───────── 원서 정정 (PATCH /applicants/{applicantId}/application) ───────── */

/** 조회 응답의 {@link GraduationStatus} 와 달리 졸업 예정은 `PROSPECTIVE` 로 보내야 한다. */
export type CorrectionGraduationType = "PROSPECTIVE" | "GRADUATED" | "GED";

/** 특기 사항. 국가유공자·특례입학 대상자는 일반 전형만 지원할 수 있다. */
export type SpecialAdmissionType = "NONE" | "NATIONAL_MERIT" | "SPECIAL_ADMISSION";

export type SchoolSemester =
  | "FIRST_GRADE_FIRST_SEMESTER"
  | "FIRST_GRADE_SECOND_SEMESTER"
  | "SECOND_GRADE_FIRST_SEMESTER"
  | "SECOND_GRADE_SECOND_SEMESTER"
  | "THIRD_GRADE_FIRST_SEMESTER"
  | "THIRD_GRADE_SECOND_SEMESTER";

/** `X` 는 미이수(자유학기 등)로 평균에서 빠진다. */
export type SubjectGrade = "A" | "B" | "C" | "D" | "E" | "X";

export interface SubjectGradesCorrection {
  korean: SubjectGrade;
  society: SubjectGrade;
  history: SubjectGrade;
  math: SubjectGrade;
  science: SubjectGrade;
  technology: SubjectGrade;
  english: SubjectGrade;
}

export type GedScoresCorrection = Record<keyof SubjectGradesCorrection, number>;

/**
 * 성적은 일부만 보낼 수 없고 전체를 교체한다.
 * 검정고시는 `subjectGrades` 를 비우고 `gedScores` 를, 그 밖에는 `subjectGrades` 만 보낸다.
 */
export interface AcademicRecordCorrection {
  /** 미인정 결석(일) */
  absentCount: number;
  /** 미인정 지각(회) */
  lateCount: number;
  /** 미인정 조퇴(회) */
  earlyLeaveCount: number;
  /** 미인정 결과(회) */
  classAbsenceCount: number;
  volunteerTime: number;
  dsmAlgorithmAwarded: boolean;
  programmingCertified: boolean;
  subjectGrades: Partial<Record<SchoolSemester, SubjectGradesCorrection>>;
  gedScores: GedScoresCorrection | null;
}

/** 보낸 항목만 바뀌고 나머지는 그대로다. */
export interface ApplicationFormChanges {
  admissionType?: AdmissionType;
  region?: Region;
  graduationType?: CorrectionGraduationType;
  /** `YYYY-MM`. 검정고시는 보내지 않는다. */
  graduationDate?: string;
  specialAdmissionType?: SpecialAdmissionType;
  name?: string;
  /** `YYYY-MM-DD` */
  birthdate?: string;
  gender?: Gender;
  guardianName?: string;
  /** `010-0000-0000` */
  guardianPhoneNumber?: string;
  guardianGender?: Gender;
  guardianRelation?: string;
  zipCode?: string;
  addressBase?: string;
  addressDetail?: string;
  introduction?: string;
  studyPlan?: string;
  academicRecord?: AcademicRecordCorrection;
}

/** `reason` 은 필수(500자 이하)다. */
export interface CorrectApplicationPayload {
  reason: string;
  changes: ApplicationFormChanges;
}

/**
 * 전형·졸업 구분·성적이 바뀌면 서버가 총점을 다시 계산한다.
 * 전형 결과가 이미 있으면 409, 항목이 잘못됐거나 바뀐 항목이 없으면 400 이다(어느 항목인지는 알려주지 않는다).
 */
export interface ApplicationCorrectionResult {
  applicantId: number;
  version: number;
}

/* ───────────── 모집 정원 (GET/PUT /admission-quotas) ───────────── */

/** 전형별 정원. 세 전형 모두 0 이상이어야 한다. */
export type AdmissionQuotaMap = Record<AdmissionType, number>;

/** 등록된 정원이 없으면 조회가 404 를 준다. */
export interface AdmissionQuota extends AdmissionQuotaMap {
  updatedAt: string;
  updatedBy: string;
}

/** 수정자 헤더는 게이트웨이가 붙이므로 본문만 보낸다. */
export type UpdateAdmissionQuotaPayload = AdmissionQuotaMap;

/* ───────────── 수험번호 일괄 발급 (POST /examinee-numbers/issue) ───────────── */

export interface ExamineeNumberIssueResult {
  issuedCount: number;
  /** 이미 발급된 지원자 등 건너뛴 수 */
  skippedCount: number;
  totalTargets: number;
}

/* ───── 내보내기 잡 (POST /exports → 202, GET /exports/{exportJobId}) ───── */

/**
 * 파일 출력은 모두 `{ type }` 만 보내 접수하는 비동기 잡이다.
 * - `ADMISSION_TICKET`: 1차 합격자 수험표(XLSX). 1차 합격자가 없으면 접수가 409 로 거절된다.
 * - `FIRST_PASS`: 1차 합격자 명단(XLSX)
 * - `ADMISSION_FILE`: 전형 자료(XLSX)
 * - `APPLICATION_CHECKLIST`: 지원자 점검표(XLSX)
 * - `ESSAYS`: 자기소개서·학업계획서 PDF 묶음
 */
export type ExportType = "ADMISSION_TICKET" | "FIRST_PASS" | "ADMISSION_FILE" | "APPLICATION_CHECKLIST" | "ESSAYS";

/** `COMPLETED` 일 때만 `downloadUrl` 이 있다. */
export type ExportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface CreateExportPayload {
  type: ExportType;
}

export interface CreateExportResult {
  exportJobId: string;
  status: ExportStatus;
}

/** 완료되면 서명된 `downloadUrl`(15분 유효)이 내려온다. */
export interface ExportJob {
  exportJobId: string;
  type: ExportType;
  status: ExportStatus;
  totalCount?: number;
  processedCount?: number;
  downloadUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
  completedAt: string | null;
}

/* ───────────────────── 통계 조회 (GET /statistics) ───────────────────── */

/** 서버가 모르는 지표가 하나라도 섞이면 요청 전체가 400 이다. */
export type StatisticsMetric =
  | "APPLICANT_COUNT"
  | "COMPETITION_RATE"
  | "FIRST_PASS_QUOTA"
  | "REGION_DISTRIBUTION"
  | "TYPE_DISTRIBUTION"
  | "DAILY_TREND"
  | "GENDER_RATIO";

export type Gender = "MALE" | "FEMALE";

/** 기본 주소에서 시·도를 찾아 매기고, 찾지 못하면 `ETC` 로 집계한다. */
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

export interface ApplicantCountMetric {
  total: number;
  byType: Partial<Record<AdmissionType, number>>;
}

export type CompetitionRateMetric = Partial<Record<AdmissionType, number>>;

/** 전형별 1차 선발 인원(모집 정원 × 1차 배수, 올림). 정원을 등록하지 않았으면 빈 맵이다. */
export type FirstPassQuotaMetric = Partial<Record<AdmissionType, number>>;

export interface RegionDistributionMetric {
  total: number;
  /** 모집 범위별 수(관내 `LOCAL`·전국 `NATIONWIDE`) */
  byScope: Partial<Record<"LOCAL" | "NATIONWIDE", number>>;
  /** 거주지 시·도별 수. 집계된 시·도만 담긴다. */
  byRegion: Partial<Record<ResidenceRegion, number>>;
}

export type TypeDistributionMetric = Partial<Record<AdmissionType, number>>;

/** 원서 제출일 기준 일자별 수 */
export type DailyTrendMetric = { date: string; count: number }[];

export interface GenderRatioMetric {
  total: number;
  byGender: Partial<Record<Gender, number>>;
  /** 남학생 비율(0~1). 지원자가 없으면 0 */
  maleRatio: number;
  byType: Partial<Record<AdmissionType, Partial<Record<Gender, number>>>>;
}

/** 요청한 지표만 담겨 온다. */
export interface StatisticsMetrics {
  APPLICANT_COUNT?: ApplicantCountMetric;
  COMPETITION_RATE?: CompetitionRateMetric;
  FIRST_PASS_QUOTA?: FirstPassQuotaMetric;
  REGION_DISTRIBUTION?: RegionDistributionMetric;
  TYPE_DISTRIBUTION?: TypeDistributionMetric;
  DAILY_TREND?: DailyTrendMetric;
  GENDER_RATIO?: GenderRatioMetric;
}

export interface GetStatisticsResponse {
  generatedAt: string;
  metrics: StatisticsMetrics;
}

/* ───────────── 파일 조회 (GET /api/document/v11/photos/{photoId}) ───────────── */

/** `downloadUrl` 은 `expiresIn` 초 동안만 유효한 서명 URL 이다. */
export interface DocumentFile {
  /** 공개 ID. 원서·수험표 PDF 처럼 지원자 ID 로 찾는 파일은 null */
  id: string | null;
  fileName: string;
  size: number;
  downloadUrl: string;
  expiresIn: number;
}

/* ───────────────── 전형 일정 (GET/PATCH /schedules) ───────────────── */

export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

/** 서버는 시각을 연·월·일·요일·시·분·초로 나눠 주고받는다. */
export interface ScheduleDateTime {
  year: number;
  month: number;
  day: number;
  dayOfWeek: DayOfWeek;
  hour: number;
  minute: number;
  second: number;
}

export interface AdminSchedule {
  scheduleId: number;
  title: string;
  startAt: ScheduleDateTime;
  endAt: ScheduleDateTime;
}

/**
 * 새 일정은 `POST /schedules` 로 하나씩 만들고, 기존 일정은 `PATCH /schedules/bulk` 로 바꾼다.
 * bulk 는 title 로 일정을 찾아 없으면 404 다.
 */
export interface UpdateScheduleItem {
  title: string;
  startAt: ScheduleDateTime;
  endAt: ScheduleDateTime;
}

/** 원서 접수 기간 판정은 브라우저 시계가 아니라 이 서버 시각을 기준으로 한다. */
export interface CurrentTimeResponse {
  currentTime: ScheduleDateTime;
}

/* ───────────── 공지사항 (GET /notifications/..., POST /admin/notices) ───────────── */

/** 공지 분류. 등록·수정의 `division` 과 목록 조회의 `category` 가 같은 값을 쓴다. */
export type NoticeDivision = "ADMISSION_NOTICE" | "PROSPECTIVE_STUDENT";

export type PageParams = {
  /** 0부터 시작 */
  page?: number;
  size?: number;
};

export type GetNoticesParams = PageParams & { category?: NoticeDivision };

export interface PageResponse<T> {
  content: T[];
  /** 0부터 시작 */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** 조회 API 는 분류·고정 여부를 돌려주지 않아 optional 이다. */
export interface NoticeSummary {
  noticeId: number;
  title: string;
  author: string;
  createdAt: string;
  division?: string;
  isPinned?: boolean;
}

export type GetNoticesResponse = PageResponse<NoticeSummary>;

export interface NoticeDetail {
  noticeId: number;
  title: string;
  content: string;
  author: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  division?: string;
  isPinned?: boolean;
}

export interface CreateNoticePayload {
  title: string;
  division: NoticeDivision;
  content: string;
  isPinned: boolean;
  /** 첨부 업로드가 돌려준 ID 목록 */
  attachmentIds?: string[];
}

/** 보낸 필드만 바뀐다. `attachmentIds` 를 보내면 첨부 목록 전체가 바뀐다(빈 배열이면 모두 삭제). */
export interface UpdateNoticePayload {
  title?: string;
  content?: string;
  division?: NoticeDivision;
  isPinned?: boolean;
  attachmentIds?: string[];
}

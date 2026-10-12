/**
 * 백엔드 enum → 한국어 라벨 매핑.
 * 백엔드 명세 값(GENERAL/EXPECTED/…)과 기존 프론트 mock 값(COMMON/PROSPECTIVE_GRADUATE/…)을
 * 모두 지원해, 매퍼를 거치지 않은 값이 들어와도 안전하게 표시된다.
 */

const withLabel = (labels: Record<string, string>) => (value?: string) => (value ? (labels[value] ?? value) : "-");

const APPLICATION_TYPE_LABELS: Record<string, string> = {
  GENERAL: "일반",
  COMMON: "일반",
  MEISTER: "마이스터전형",
  SOCIAL: "사회통합",
};

const EDUCATIONAL_STATUS_LABELS: Record<string, string> = {
  EXPECTED: "졸업 예정",
  PROSPECTIVE_GRADUATE: "졸업 예정",
  GRADUATED: "졸업",
  GRADUATE: "졸업",
  GED: "검정고시",
  QUALIFICATION_EXAM: "검정고시",
};

const REGION_LABELS: Record<string, string> = {
  // 모집 범위(Region)
  DAEJEON: "대전",
  NATIONWIDE: "전국",
  // 통계 REGION_DISTRIBUTION.byRegion 의 거주지 시·도 코드(백엔드 ResidenceRegion, 17개 + 기타)
  SEOUL: "서울",
  BUSAN: "부산",
  DAEGU: "대구",
  INCHEON: "인천",
  GWANGJU: "광주",
  ULSAN: "울산",
  SEJONG: "세종",
  GYEONGGI: "경기",
  GANGWON: "강원",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  JEJU: "제주",
  ETC: "기타",
};

const GENDER_LABELS: Record<string, string> = {
  MALE: "남자",
  FEMALE: "여자",
};

// 백엔드 `ApplicantStatus.label`(엑셀 등 대외 문서 표기)과 같은 문구를 쓴다.
const APPLICANT_STATUS_LABELS: Record<string, string> = {
  PENDING: "심사 대기",
  FIRST_PASS: "1차 합격",
  FIRST_FAIL: "1차 불합격",
  FINAL_PASS: "최종 합격",
  FINAL_FAIL: "최종 불합격",
};

export const getApplicationTypeLabel = withLabel(APPLICATION_TYPE_LABELS);
export const getEducationalStatusLabel = withLabel(EDUCATIONAL_STATUS_LABELS);
export const getRegionLabel = withLabel(REGION_LABELS);
export const getGenderLabel = withLabel(GENDER_LABELS);
export const getApplicantStatusLabel = withLabel(APPLICANT_STATUS_LABELS);

/** 원서 원본(우편) 도착 여부 → 지원자 목록·상세 모달의 "상태" 표기. 두 화면이 같은 문구를 쓰도록 한 곳에서 정한다. */
export const getArrivalStatusLabel = (isArrived?: boolean) => (isArrived ? "원서 도착" : "-");

/**
 * 지원자 목록 마지막 열 버튼의 역할. 1차 합격자 산출 전(심사 대기)에는 원서 정정 메뉴(정정·접수 취소),
 * 산출 결과를 받으면 2차(최종) 합격자 등록. 열 제목과 버튼 문구가 같은 값을 쓰도록 한 곳에서 정한다.
 */
export type ApplicantActionMode = "correct" | "register";

const APPLICANT_ACTION_LABELS: Record<ApplicantActionMode, string> = {
  correct: "원서 정정",
  register: "2차 합격자 등록",
};

export const getApplicantActionLabel = (mode: ApplicantActionMode) => APPLICANT_ACTION_LABELS[mode];

/**
 * 지원자별 버튼 역할. 백엔드 원서 정정과 같은 기준으로, 전형 결과가 없는(심사 대기) 지원자만 정정·접수 취소 대상이다.
 * 1차 산출에서 빠진 지원자(원서 미도착·수험번호 미발급 등)는 산출 뒤에도 심사 대기로 남아 계속 정정할 수 있다.
 */
export const getApplicantActionMode = (status: string): ApplicantActionMode =>
  status === "PENDING" ? "correct" : "register";

/** 마지막 열 제목. 보이는 지원자의 역할이 모두 같으면 그 이름을, 섞여 있으면 "관리" 를 쓴다. */
export const getApplicantActionHeader = (modes: ApplicantActionMode[]) => {
  const [firstMode = "correct"] = modes;
  return modes.every(mode => mode === firstMode) ? getApplicantActionLabel(firstMode) : "관리";
};

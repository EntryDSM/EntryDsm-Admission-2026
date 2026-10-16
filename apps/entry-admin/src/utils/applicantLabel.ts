import type { FirstAnnouncementStatus } from "./applicationPeriod";

/** 서버 enum → 한국어 라벨. 예전 mock 값(COMMON 등)도 표시할 수 있게 함께 둔다. */

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
  // 모집 범위
  DAEJEON: "대전",
  NATIONWIDE: "전국",
  // 통계의 거주지 시·도
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

// 서버가 만드는 문서(엑셀 등)와 같은 문구를 쓴다.
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

export const getArrivalStatusLabel = (isArrived?: boolean) =>
  isArrived === undefined ? "-" : isArrived ? "도착" : "미도착";

/**
 * 지원자 목록 마지막 열 버튼. 심사 대기는 원서 정정 메뉴, 1차 합격 발표 전에는 1차 합격자 등록·취소,
 * 발표 뒤에는 1차 합격자의 "2차 결과" 메뉴(등록·불합격 처리)와 2차 합격자 등록·취소다. `none` 은 할 수 있는 일이 없는 지원자다.
 */
export type ApplicantActionMode =
  | "correct"
  | "firstPassSelect"
  | "firstPassCancel"
  | "finalResult"
  | "register"
  | "finalPassCancel"
  | "none";

const APPLICANT_ACTION_LABELS: Record<Exclude<ApplicantActionMode, "none">, string> = {
  correct: "원서 정정",
  firstPassSelect: "1차 합격자 등록",
  firstPassCancel: "1차 합격 취소",
  finalResult: "2차 결과",
  register: "2차 합격자 등록",
  finalPassCancel: "2차 합격 취소",
};

export const getApplicantActionLabel = (mode: Exclude<ApplicantActionMode, "none">) => APPLICANT_ACTION_LABELS[mode];

/**
 * 전형 결과가 없는(심사 대기) 지원자만 정정·접수 취소 대상이다. 1차 산출에서 빠진 지원자도 발표 전까지 심사 대기로 남는다.
 * 1차 합격을 취소한 지원자는 1차 불합격이 되고, 발표 전까지 다시 등록할 수 있다. 발표 뒤 1차 불합격자는 2차 대상이 아니다.
 * 2차 합격을 취소했거나 2차 불합격으로 처리한 지원자는 최종 불합격이 되고, 다시 2차 합격자로 등록할 수 있다.
 * 발표 전후를 아직 모르거나 발표 일정이 없으면 1차 결과가 있는 지원자의 버튼을 숨긴다.
 */
export const getApplicantActionMode = (
  status: string,
  firstAnnouncementStatus: FirstAnnouncementStatus | undefined
): ApplicantActionMode => {
  if (status === "PENDING") {
    return "correct";
  }

  if (status === "FINAL_PASS") {
    return "finalPassCancel";
  }

  if (status === "FINAL_FAIL") {
    return "register";
  }

  if (firstAnnouncementStatus === "before") {
    if (status === "FIRST_PASS") {
      return "firstPassCancel";
    }

    if (status === "FIRST_FAIL") {
      return "firstPassSelect";
    }
  }

  if (firstAnnouncementStatus === "after" && status === "FIRST_PASS") {
    return "finalResult";
  }

  return "none";
};

/** 보이는 지원자의 버튼이 모두 같으면 그 이름을, 섞여 있거나 버튼이 없으면 "관리" 를 열 제목으로 쓴다. */
export const getApplicantActionHeader = (modes: ApplicantActionMode[]) => {
  const [firstMode = "correct"] = modes;
  return firstMode !== "none" && modes.every(mode => mode === firstMode) ? getApplicantActionLabel(firstMode) : "관리";
};

import type { PassStatus } from "../apis/mypage";
import type { AdmissionType, ApplicationRegion } from "../apis/types";

/** 합격자 발표 회차. 1차(서류) 전형과 2차(최종) 전형 결과를 서로 다른 안내 화면으로 보여준다. */
export type ScreeningRound = "FIRST" | "FINAL";

type AnnouncedPassStatus = Exclude<PassStatus, "PENDING">;

const PASS_STATUS_ROUND: Record<AnnouncedPassStatus, ScreeningRound> = {
  FIRST_PASSED: "FIRST",
  FIRST_FAILED: "FIRST",
  FINAL_PASSED: "FINAL",
  FINAL_FAILED: "FINAL",
};

/** 발표된 결과의 회차. 발표 전(PENDING)이거나 명세에 없는 값이면 null. */
export const getScreeningRound = (passStatus: PassStatus): ScreeningRound | null =>
  passStatus in PASS_STATUS_ROUND ? PASS_STATUS_ROUND[passStatus as AnnouncedPassStatus] : null;

export const isPassedStatus = (passStatus: PassStatus) =>
  passStatus === "FIRST_PASSED" || passStatus === "FINAL_PASSED";

/** 합불 사항 표기. 응답의 passDescription 이 비어 있을 때 대신 쓴다. */
export const PASS_STATUS_LABEL: Record<PassStatus, string> = {
  PENDING: "발표 대기 중",
  FIRST_PASSED: "1차 전형 합격",
  FIRST_FAILED: "1차 전형 불합격",
  FINAL_PASSED: "2차 전형 최종 합격",
  FINAL_FAILED: "2차 전형 최종 불합격",
};

export const SCREENING_ROUND_TITLE: Record<ScreeningRound, string> = {
  FIRST: "1차 전형 합격자 발표",
  FINAL: "최종 합격자 발표",
};

export const REGION_LABEL: Record<ApplicationRegion, string> = {
  DAEJEON: "대전",
  NATIONAL: "전국",
};

/** 합격자 발표 표의 전형 구분 표기 (모의 성적 계산의 constants/admissionType 과는 enum 값이 다르다). */
export const RESULT_ADMISSION_TYPE_LABEL: Record<AdmissionType, string> = {
  REGULAR: "일반 전형",
  MEISTER: "마이스터 전형",
  SOCIAL: "사회통합 전형",
};

/** enum 라벨 조회. 명세에 없는 값이 오면 원문을 그대로 보여준다. */
export const labelOf = <K extends string>(labels: Record<K, string>, value: K | string) =>
  (labels as Record<string, string>)[value] ?? value;

/** `YYYY-MM-DD` → `YYYY년 MM월 DD일`. 형식이 다르면 원문 그대로. */
export const formatBirthDate = (birthDate: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  return match ? `${match[1]}년 ${match[2]}월 ${match[3]}일` : birthDate;
};

/**
 * 합격 후 안내(2차 전형·합격자 등록·OT)에 쓰는 전형 일정의 title.
 * configuration 시스템(관리자 일정 화면)에 등록된 표준 명칭과 맞춘다 — 목록에 없는 일정은 "추후 안내"로 표시된다.
 */
export const RESULT_GUIDE_SCHEDULE_TITLE = {
  interview: "면접",
  registration: "합격자 등록",
  orientation: "합격자 OT",
} as const;

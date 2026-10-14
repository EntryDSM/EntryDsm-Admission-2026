import { http } from "./http";
import type { FinalScreeningResult, ScreeningResult } from "./types";

const SCREENINGS_ENDPOINT = "/api/v11/admin/screenings";

/** 1차 합격자 일괄 산출. `dryRun` 이면 상태를 바꾸지 않고 결과만 받는다. */
export const runFirstScreening = (dryRun: boolean) =>
  http.post<ScreeningResult>(`${SCREENINGS_ENDPOINT}/first/results`, { dryRun });

/** 1차 합격 발표 전에 지원자 한 명을 1차 합격자로 등록한다. 1차 합격을 취소한 지원자도 다시 등록할 수 있다. */
export const selectFirstPassApplicant = (applicantId: number) =>
  http.post<void>(`${SCREENINGS_ENDPOINT}/first/applicants/${applicantId}`);

/** 1차 합격 발표 전에 1차 합격을 취소한다. 취소한 지원자는 1차 불합격이 되고 자동 선발에서 빠진다. */
export const cancelFirstPassApplicant = (applicantId: number) =>
  http.delete<void>(`${SCREENINGS_ENDPOINT}/first/applicants/${applicantId}`);

/** 2차(최종) 합격자 개별 등록 */
export const registerFinalScreeningResult = (applicantId: number) =>
  http.post<FinalScreeningResult>(`${SCREENINGS_ENDPOINT}/final/results/${applicantId}`);

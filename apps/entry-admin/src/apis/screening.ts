import { http } from "./http";
import type { FinalScreeningResult, ScreeningResult } from "./types";

const SCREENINGS_ENDPOINT = "/api/v11/admin/screenings";

/** 1차 합격자 일괄 산출. `dryRun` 이면 상태를 바꾸지 않고 결과만 받는다. */
export const runFirstScreening = (dryRun: boolean) =>
  http.post<ScreeningResult>(`${SCREENINGS_ENDPOINT}/first/results`, { dryRun });

/** 2차(최종) 합격자 개별 등록 */
export const registerFinalScreeningResult = (applicantId: number) =>
  http.post<FinalScreeningResult>(`${SCREENINGS_ENDPOINT}/final/results/${applicantId}`);

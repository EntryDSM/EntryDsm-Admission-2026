import { http } from "./http";
import type { FinalScreeningResult, ScreeningResult } from "./types";

const SCREENINGS_ENDPOINT = "/api/v11/admin/screenings";

/** 1차(서류) 합격자 일괄 산출. `dryRun: true` 면 상태 변경 없이 산출 결과만 반환한다(검토용). */
export const runFirstScreening = (dryRun: boolean) =>
  http.post<ScreeningResult>(`${SCREENINGS_ENDPOINT}/first/results`, { dryRun });

/** 2차(최종) 합격자 개별 등록. 본문 없이 대상 지원자만 지정하며, 등록한 지원자는 최종 합격 처리된다. */
export const registerFinalScreeningResult = (applicantId: number) =>
  http.post<FinalScreeningResult>(`${SCREENINGS_ENDPOINT}/final/results/${applicantId}`);

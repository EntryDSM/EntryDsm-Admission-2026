import { http } from "./http";
import type { ScreeningResult } from "./types";

const SCREENINGS_ENDPOINT = "/api/v11/admin/screenings";

/** 1차(서류) 합격자 일괄 산출. `dryRun: true` 면 상태 변경 없이 산출 결과만 반환한다(검토용). */
export const runFirstScreening = (dryRun: boolean) =>
  http.post<ScreeningResult>(`${SCREENINGS_ENDPOINT}/first/results`, { dryRun });

/**
 * 최종 합격자 일괄 산출.
 * 명세 본문이 잘못 채워져 있어(로그인 API 예시), 1차 산출과 동일한 요청/응답 형태로 가정한다.
 */
export const runFinalScreening = (dryRun: boolean) =>
  http.post<ScreeningResult>(`${SCREENINGS_ENDPOINT}/final/results`, { dryRun });

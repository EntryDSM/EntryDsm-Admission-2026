import { http } from "./http";
import type { ScreeningResult } from "./types";

const SCREENINGS_ENDPOINT = "/api/v11/admin/screenings";

/** 1차(서류) 합격자 일괄 산출. `dryRun: true` 면 상태 변경 없이 산출 결과만 반환한다(검토용). */
export const runFirstScreening = (dryRun: boolean) =>
  http.post<ScreeningResult>(`${SCREENINGS_ENDPOINT}/first/results`, { dryRun });

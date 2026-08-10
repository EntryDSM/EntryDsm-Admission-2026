import { buildQueryString } from "../utils/queryString";
import { http } from "./http";
import type { GetStatisticsResponse, StatisticsMetric } from "./types";

const STATISTICS_ENDPOINT = "/api/v11/admin/statistics";

/** 지원 현황 통계 조회. `metrics` 는 필수 파라미터다. */
export const getStatistics = (metrics: StatisticsMetric[]) => {
  const queryString = buildQueryString({ metrics });
  return http.get<GetStatisticsResponse>(`${STATISTICS_ENDPOINT}${queryString}`);
};

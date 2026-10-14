import { buildQueryString } from "../utils/queryString";
import { http, HttpError } from "./http";
import type { GetStatisticsResponse, StatisticsMetric } from "./types";

const STATISTICS_ENDPOINT = "/api/v11/admin/statistics";

export const getStatistics = (metrics: StatisticsMetric[]) => {
  const queryString = buildQueryString({ metrics });
  return http.get<GetStatisticsResponse>(`${STATISTICS_ENDPOINT}${queryString}`);
};

const isBadRequest = (error: unknown) => error instanceof HttpError && error.status === 400;

/**
 * 핵심 지표와 선택 지표를 함께 요청한다. 서버가 모르는 지표가 섞이면 요청 전체가 400 이라,
 * 400 이면 핵심 지표를 다시 받고 선택 지표는 하나씩 따로 받아 받은 것만 합친다.
 */
export const getStatisticsWithOptional = async (metrics: StatisticsMetric[], optionalMetrics: StatisticsMetric[]) => {
  if (optionalMetrics.length === 0) {
    return getStatistics(metrics);
  }

  try {
    return await getStatistics([...metrics, ...optionalMetrics]);
  } catch (error) {
    if (!isBadRequest(error)) {
      throw error;
    }
  }

  const [core, ...optionalResponses] = await Promise.all([
    getStatistics(metrics),
    ...optionalMetrics.map(metric =>
      getStatistics([metric]).catch((error: unknown) => {
        if (isBadRequest(error)) return null;
        throw error;
      })
    ),
  ]);

  return {
    ...core,
    metrics: Object.assign({}, core.metrics, ...optionalResponses.map(response => response?.metrics)),
  };
};

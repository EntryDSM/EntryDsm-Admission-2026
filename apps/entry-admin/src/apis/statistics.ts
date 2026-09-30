import { buildQueryString } from "../utils/queryString";
import { http, HttpError } from "./http";
import type { GetStatisticsResponse, StatisticsMetric } from "./types";

const STATISTICS_ENDPOINT = "/api/v11/admin/statistics";

/** 지원 현황 통계 조회. `metrics` 는 필수 파라미터다. */
export const getStatistics = (metrics: StatisticsMetric[]) => {
  const queryString = buildQueryString({ metrics });
  return http.get<GetStatisticsResponse>(`${STATISTICS_ENDPOINT}${queryString}`);
};

const isBadRequest = (error: unknown) => error instanceof HttpError && error.status === 400;

/**
 * 핵심 지표와 함께, 서버가 아직 지원하지 않을 수 있는 확장 지표도 한 번에 요청한다.
 * 백엔드는 모르는 `metrics` 값이 하나라도 섞이면 바인딩 실패로 요청 전체를 400 으로 거절하므로(2026-09-11 확인),
 * 400 이면 핵심 지표를 다시 받고 확장 지표는 하나씩 따로 물어 받은 것만 합친다.
 * 서버마다 아는 확장 지표가 달라서다(예: prod 는 `GENDER_RATIO` 는 알지만 #324 `FIRST_PASS_QUOTA` 는 모른다).
 * 그 외 에러는 그대로 던진다(전역 토스트·Sentry 보고 대상).
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

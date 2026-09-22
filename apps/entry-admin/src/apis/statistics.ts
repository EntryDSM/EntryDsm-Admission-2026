import { buildQueryString } from "../utils/queryString";
import { http, HttpError } from "./http";
import type { GetStatisticsResponse, StatisticsMetric } from "./types";

const STATISTICS_ENDPOINT = "/api/v11/admin/statistics";

/** 지원 현황 통계 조회. `metrics` 는 필수 파라미터다. */
export const getStatistics = (metrics: StatisticsMetric[]) => {
  const queryString = buildQueryString({ metrics });
  return http.get<GetStatisticsResponse>(`${STATISTICS_ENDPOINT}${queryString}`);
};

/**
 * 핵심 지표와 함께, 서버가 아직 지원하지 않을 수 있는 확장 지표도 한 번에 요청한다.
 * 백엔드는 모르는 `metrics` 값이 하나라도 섞이면 바인딩 실패로 요청 전체를 400 으로 거절하므로(2026-09-11 확인),
 * 400 이면 핵심 지표만 다시 조회해 확장 지표(#264 `GENDER_RATIO`·`REGION_STATUS`) 배포 전에도 홈 통계가 살아 있게 한다.
 * 그 외 에러는 그대로 던진다(전역 토스트·Sentry 보고 대상).
 */
export const getStatisticsWithOptional = async (metrics: StatisticsMetric[], optionalMetrics: StatisticsMetric[]) => {
  if (optionalMetrics.length === 0) {
    return getStatistics(metrics);
  }

  try {
    return await getStatistics([...metrics, ...optionalMetrics]);
  } catch (error) {
    if (error instanceof HttpError && error.status === 400) {
      return getStatistics(metrics);
    }
    throw error;
  }
};

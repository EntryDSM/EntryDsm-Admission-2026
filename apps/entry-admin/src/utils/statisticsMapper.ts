import type { StatisticsMetrics } from "../apis/types";
import { getRegionLabel } from "./applicantLabel";

/** 통계 페이지 "전형별 접수 현황"이 사용하는 형태 */
export interface CompetitionDatum {
  applicationType: string;
  count: number;
}

/**
 * `APPLICANT_COUNT.byType` → 전형별 접수 배열.
 * 통계 API 가 값을 주지 않으면 빈 배열을 반환한다.
 */
export const toCompetitionData = (metrics: StatisticsMetrics): CompetitionDatum[] => {
  const byType = metrics.APPLICANT_COUNT?.byType ?? {};

  return Object.entries(byType).map(([applicationType, count]) => ({
    applicationType,
    count: count ?? 0,
  }));
};

/**
 * `REGION_DISTRIBUTION` → `{ 지역라벨: 수 }`.
 * 지역 코드는 한국어 라벨로 변환한다. 값이 없으면 빈 객체를 반환한다.
 */
export const toRegionData = (metrics: StatisticsMetrics): Record<string, number> => {
  const distribution = metrics.REGION_DISTRIBUTION ?? {};

  return Object.entries(distribution).reduce<Record<string, number>>((acc, [region, count]) => {
    acc[getRegionLabel(region)] = count ?? 0;
    return acc;
  }, {});
};

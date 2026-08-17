import type { Gender, StatisticsMetrics } from "../apis/types";
import { getGenderLabel, getRegionLabel } from "./applicantLabel";

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
 * 지역별 접수 현황 → `{ 지역라벨: 수 }`.
 * 시·도 단위 상세가 있는 `REGION_STATUS.byRegion` 을 우선 쓰고,
 * 없으면 기존 `REGION_DISTRIBUTION` 으로 폴백한다. 지역 코드는 한국어 라벨로 변환한다.
 */
export const toRegionData = (metrics: StatisticsMetrics): Record<string, number> => {
  const distribution = metrics.REGION_STATUS?.byRegion ?? metrics.REGION_DISTRIBUTION ?? {};

  return Object.entries(distribution).reduce<Record<string, number>>((acc, [region, count]) => {
    acc[getRegionLabel(region)] = count ?? 0;
    return acc;
  }, {});
};

// 성비 카드는 순서(색상)가 인덱스 기반이라, 응답 키 순서에 좌우되지 않게 남→여 순서를 고정한다.
const GENDER_ORDER: Gender[] = ["MALE", "FEMALE"];

/**
 * `GENDER_RATIO.byGender` → `{ 성별라벨: 수 }`.
 * 남/여 고정 순서로 만들고 응답에 없는 성별은 0 으로 채워, 카드 순서·개수를 결정적으로 유지한다.
 * 메트릭 자체가 없으면 빈 객체를 반환한다.
 */
export const toGenderData = (metrics: StatisticsMetrics): Record<string, number> => {
  const byGender = metrics.GENDER_RATIO?.byGender;

  if (!byGender) {
    return {};
  }

  return GENDER_ORDER.reduce<Record<string, number>>((acc, gender) => {
    acc[getGenderLabel(gender)] = byGender[gender] ?? 0;
    return acc;
  }, {});
};

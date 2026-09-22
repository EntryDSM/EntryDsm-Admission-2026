import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getStatisticsWithOptional, type StatisticsMetric } from "../apis";
import { toCompetitionData, toGenderData, toRegionData } from "../utils";

/** 홈 통계가 항상 쓰는 지표. 백엔드 `StatisticsMetric` enum 에 처음부터 있던 값들이다. */
const CORE_METRICS: StatisticsMetric[] = ["APPLICANT_COUNT", "COMPETITION_RATE", "REGION_DISTRIBUTION"];

/**
 * 성비·시도별 접수 현황. 백엔드 #264(feat/137-admin-statistics)가 추가한 지표라 배포 전 서버는 400 으로 거절한다
 * → `getStatisticsWithOptional` 이 핵심 지표만으로 재조회한다(성비 카드는 빈 값, 지역은 REGION_DISTRIBUTION 사용).
 */
const OPTIONAL_METRICS: StatisticsMetric[] = ["GENDER_RATIO", "REGION_STATUS"];

/**
 * 지원 현황 통계 조회 훅.
 * 원시 metrics 응답을 통계 화면이 바로 쓰는 형태(전형별/성비/지역별)로 가공해 돌려준다.
 */
export const useStatistics = (metrics: StatisticsMetric[] = CORE_METRICS, optionalMetrics = OPTIONAL_METRICS) => {
  const query = useQuery({
    queryKey: adminQueryKeys.statistics.byMetrics([...metrics, ...optionalMetrics]),
    queryFn: () => getStatisticsWithOptional(metrics, optionalMetrics),
  });

  return {
    generatedAt: query.data?.generatedAt,
    competitionData: query.data ? toCompetitionData(query.data.metrics) : [],
    genderData: query.data ? toGenderData(query.data.metrics) : {},
    regionData: query.data ? toRegionData(query.data.metrics) : {},
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

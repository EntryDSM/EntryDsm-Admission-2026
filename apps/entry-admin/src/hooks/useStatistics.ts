import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getStatistics, type StatisticsMetric } from "../apis";
import { toCompetitionData, toRegionData } from "../utils";

const DEFAULT_METRICS: StatisticsMetric[] = ["APPLICANT_COUNT", "COMPETITION_RATE", "REGION_DISTRIBUTION"];

/**
 * 지원 현황 통계 조회 훅.
 * 원시 metrics 응답을 통계 화면이 바로 쓰는 형태(전형별/지역별)로 가공해 돌려준다.
 */
export const useStatistics = (metrics: StatisticsMetric[] = DEFAULT_METRICS) => {
  const query = useQuery({
    queryKey: adminQueryKeys.statistics(metrics),
    queryFn: () => getStatistics(metrics),
  });

  return {
    generatedAt: query.data?.generatedAt,
    competitionData: query.data ? toCompetitionData(query.data.metrics) : [],
    regionData: query.data ? toRegionData(query.data.metrics) : {},
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

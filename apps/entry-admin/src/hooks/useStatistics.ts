import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getStatistics, type StatisticsMetric } from "../apis";
import { toCompetitionData, toGenderData, toRegionData } from "../utils";

// 지역은 시·도 상세가 있는 REGION_STATUS 를 우선 쓰되, 새 메트릭 키가 요청 파라미터로 아직
// 지원되지 않을 가능성(명세 미기재 가정)에 대비해 기존 REGION_DISTRIBUTION 도 함께 요청한다.
// (매퍼 폴백은 응답에 실제로 담겨 온 값이 있어야 발동할 수 있다.)
const DEFAULT_METRICS: StatisticsMetric[] = [
  "APPLICANT_COUNT",
  "COMPETITION_RATE",
  "GENDER_RATIO",
  "REGION_STATUS",
  "REGION_DISTRIBUTION",
];

/**
 * 지원 현황 통계 조회 훅.
 * 원시 metrics 응답을 통계 화면이 바로 쓰는 형태(전형별/성비/지역별)로 가공해 돌려준다.
 */
export const useStatistics = (metrics: StatisticsMetric[] = DEFAULT_METRICS) => {
  const query = useQuery({
    queryKey: adminQueryKeys.statistics(metrics),
    queryFn: () => getStatistics(metrics),
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

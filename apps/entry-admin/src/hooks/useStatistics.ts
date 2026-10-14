import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getStatisticsWithOptional, type StatisticsMetric } from "../apis";
import { toCompetitionData, toGenderData, toRegionData } from "../utils";

const CORE_METRICS: StatisticsMetric[] = ["APPLICANT_COUNT", "COMPETITION_RATE", "REGION_DISTRIBUTION"];

/** 서버에 따라 없을 수 있는 지표. 없으면 성비 카드는 빈 값, 1차 선발 인원은 "미등록"으로 표시한다. */
const OPTIONAL_METRICS: StatisticsMetric[] = ["GENDER_RATIO", "FIRST_PASS_QUOTA"];

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
    /** 지표가 없거나 정원을 등록하지 않았으면 비어 있다. */
    firstPassQuota: query.data?.metrics.FIRST_PASS_QUOTA ?? {},
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

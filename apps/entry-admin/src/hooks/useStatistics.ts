import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getStatistics, type StatisticsMetric } from "../apis";
import { toCompetitionData, toGenderData, toRegionData } from "../utils";

// 백엔드 metrics enum 은 APPLICANT_COUNT/COMPETITION_RATE/REGION_DISTRIBUTION/TYPE_DISTRIBUTION/DAILY_TREND
// 5종만 허용한다(그 외 값은 바인딩 실패로 400). 성비(GENDER_RATIO)·지역 현황(REGION_STATUS)은 요청 파라미터로
// 보낼 수 없고 서버가 응답에 실어 줄 때만 매퍼가 사용한다(없으면 성비는 빈 값, 지역은 REGION_DISTRIBUTION 사용).
const DEFAULT_METRICS: StatisticsMetric[] = ["APPLICANT_COUNT", "COMPETITION_RATE", "REGION_DISTRIBUTION"];

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

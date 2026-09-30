import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getStatisticsWithOptional, type StatisticsMetric } from "../apis";
import { toCompetitionData, toGenderData, toRegionData } from "../utils";

/** 홈 통계가 항상 쓰는 지표. 백엔드 `StatisticsMetric` enum 에 처음부터 있던 값들이다. */
const CORE_METRICS: StatisticsMetric[] = ["APPLICANT_COUNT", "COMPETITION_RATE", "REGION_DISTRIBUTION"];

/**
 * 서버에 따라 없을 수 있는 확장 지표. 모르는 서버는 400 으로 거절하고, `getStatisticsWithOptional` 이 받을 수 있는 것만 합친다.
 * - `GENDER_RATIO`: 성비. 백엔드 #264(feat/137-admin-statistics). 없으면 성비 카드는 빈 값.
 * - `FIRST_PASS_QUOTA`: 전형별 1차 선발 인원. 백엔드 #324(develop 2026-09-29, prod 미배포). 없으면 "1차 선발 인원 미등록".
 */
const OPTIONAL_METRICS: StatisticsMetric[] = ["GENDER_RATIO", "FIRST_PASS_QUOTA"];

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
    /** 전형 → 1차 선발 인원. 서버가 지표를 모르거나 모집 정원을 등록하지 않았으면 비어 있다. */
    firstPassQuota: query.data?.metrics.FIRST_PASS_QUOTA ?? {},
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

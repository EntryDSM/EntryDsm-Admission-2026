import type { Gender, StatisticsMetrics } from "../apis/types";
import { getGenderLabel, getRegionLabel } from "./applicantLabel";

export interface CompetitionDatum {
  applicationType: string;
  count: number;
}

export const toCompetitionData = (metrics: StatisticsMetrics): CompetitionDatum[] => {
  const byType = metrics.APPLICANT_COUNT?.byType ?? {};

  return Object.entries(byType).map(([applicationType, count]) => ({
    applicationType,
    count: count ?? 0,
  }));
};

// 응답의 지역 순서는 바뀔 수 있어 고정 순서로 정렬한다(대전 먼저, 기타 마지막).
const REGION_ORDER = [
  "DAEJEON",
  "SEOUL",
  "BUSAN",
  "DAEGU",
  "INCHEON",
  "GWANGJU",
  "ULSAN",
  "SEJONG",
  "GYEONGGI",
  "GANGWON",
  "CHUNGBUK",
  "CHUNGNAM",
  "JEONBUK",
  "JEONNAM",
  "GYEONGBUK",
  "GYEONGNAM",
  "JEJU",
  "ETC",
];

const getRegionRank = (region: string) => {
  const rank = REGION_ORDER.indexOf(region);
  return rank === -1 ? REGION_ORDER.length : rank;
};

/** 거주지 시·도별 수를 `{ 지역 라벨: 수 }` 로 바꾼다. 집계된 시·도만 오므로 0 으로 채우지 않는다. */
export const toRegionData = (metrics: StatisticsMetrics): Record<string, number> => {
  const byRegion = metrics.REGION_DISTRIBUTION?.byRegion ?? {};

  return Object.entries(byRegion)
    .sort(([regionA], [regionB]) => getRegionRank(regionA) - getRegionRank(regionB))
    .reduce<Record<string, number>>((acc, [region, count]) => {
      acc[getRegionLabel(region)] = count ?? 0;
      return acc;
    }, {});
};

// 성비 카드 색이 순서로 정해져 남→여 순서를 고정한다.
const GENDER_ORDER: Gender[] = ["MALE", "FEMALE"];

/** 응답에 없는 성별은 0 으로 채운다. 지표가 없으면 빈 객체다. */
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

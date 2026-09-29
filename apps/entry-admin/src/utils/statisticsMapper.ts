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

// 지역 카드 순서. 백엔드 맵은 집계 순서라 요청마다 뒤바뀔 수 있어 고정 순서로 정렬한다
// — 학교가 있는 대전이 먼저, 나머지는 백엔드 ResidenceRegion enum 순서(기타는 마지막).
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

/** 순서표에 없는 코드는 맨 뒤로 보낸다(백엔드가 지역을 더 늘려도 화면은 깨지지 않게). */
const getRegionRank = (region: string) => {
  const rank = REGION_ORDER.indexOf(region);
  return rank === -1 ? REGION_ORDER.length : rank;
};

/**
 * 지역별 접수 현황 → `{ 지역라벨: 수 }` (삽입 순서 = 화면 카드 순서).
 * `REGION_DISTRIBUTION.byRegion`(원서 주소의 거주지 시·도 기준)에 담겨 온 시·도를 하나도 빼지 않고 그대로 옮긴다.
 * 시·도 코드는 한국어 라벨로 변환한다. 집계된 시·도만 담겨 오므로 0 으로 채우지 않는다.
 */
export const toRegionData = (metrics: StatisticsMetrics): Record<string, number> => {
  const byRegion = metrics.REGION_DISTRIBUTION?.byRegion ?? {};

  return Object.entries(byRegion)
    .sort(([regionA], [regionB]) => getRegionRank(regionA) - getRegionRank(regionB))
    .reduce<Record<string, number>>((acc, [region, count]) => {
      acc[getRegionLabel(region)] = count ?? 0;
      return acc;
    }, {});
};

// 성비 카드는 순서(색상)가 인덱스 기반이라, 응답 키 순서에 좌우되지 않게 남→여 순서를 고정한다.
const GENDER_ORDER: Gender[] = ["MALE", "FEMALE"];

/**
 * `GENDER_RATIO.byGender` → `{ 성별라벨: 수 }`.
 * 남/여 고정 순서로 만들고 응답에 없는 성별은 0 으로 채워, 카드 순서·개수를 결정적으로 유지한다.
 * 메트릭 자체가 없으면(백엔드 #264 배포 전) 빈 객체를 반환한다.
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

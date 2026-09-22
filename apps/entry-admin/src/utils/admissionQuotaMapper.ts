import type {
  AdmissionQuota,
  AdmissionQuotaMap,
  AdmissionType,
  Region,
  UpdateAdmissionQuotaPayload,
} from "../apis/types";

/** 정원 화면의 지역 표시 순서 (백엔드 Region enum 순서와 같다) */
export const QUOTA_REGIONS: Region[] = ["DAEJEON", "NATIONWIDE"];

/** 정원 화면의 전형 표시 순서 (백엔드 AdmissionType enum 순서와 같다) */
export const QUOTA_ADMISSION_TYPES: AdmissionType[] = ["GENERAL", "MEISTER", "SOCIAL"];

/** 전형별 정원(대전+전국 합)과 총 인원 */
export interface AdmissionQuotaSummary {
  byType: Record<AdmissionType, number>;
  total: number;
}

const mapAdmissionTypes = (value: (admissionType: AdmissionType) => number) =>
  QUOTA_ADMISSION_TYPES.reduce(
    (acc, admissionType) => ({ ...acc, [admissionType]: value(admissionType) }),
    {} as Record<AdmissionType, number>
  );

/**
 * 조회 응답 → 편집 상태(지역 → 전형 → 정원).
 * 백엔드는 6개 조합을 모두 보장하지만, 혹시 빠진 조합이 있어도 0 으로 채워 입력칸 6개를 항상 유지한다.
 * 등록된 정원이 없거나(null) 아직 조회 전(undefined)이면 전부 0 으로 시작한다.
 */
export const toAdmissionQuotaMap = (quota?: AdmissionQuota | null): AdmissionQuotaMap =>
  QUOTA_REGIONS.reduce(
    (acc, region) => ({
      ...acc,
      [region]: mapAdmissionTypes(admissionType => quota?.quotas[region]?.[admissionType] ?? 0),
    }),
    {} as AdmissionQuotaMap
  );

/** 편집 상태 → 전체 교체(PUT) 요청 본문 */
export const toUpdateAdmissionQuotaPayload = (quotas: AdmissionQuotaMap): UpdateAdmissionQuotaPayload => ({ quotas });

/** 입력칸 문자열 → 정원 값. 백엔드가 0 이상의 정수만 받으므로 음수·소수·빈 값은 0 이상 정수로 정리한다. */
export const parseQuotaInput = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
};

/** 전형별 정원(대전+전국 합)과 총 인원 — 백엔드 `AdmissionQuota.byType` 과 같은 계산 */
export const summarizeAdmissionQuota = (quotas: AdmissionQuotaMap): AdmissionQuotaSummary => {
  const byType = mapAdmissionTypes(admissionType =>
    QUOTA_REGIONS.reduce((sum, region) => sum + quotas[region][admissionType], 0)
  );
  const total = QUOTA_ADMISSION_TYPES.reduce((sum, admissionType) => sum + byType[admissionType], 0);

  return { byType, total };
};

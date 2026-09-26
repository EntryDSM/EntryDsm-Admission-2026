import type { AdmissionQuota, AdmissionQuotaMap, AdmissionType, UpdateAdmissionQuotaPayload } from "../apis/types";

/** 정원 화면의 전형 표시 순서 (백엔드 AdmissionType enum 순서와 같다) */
export const QUOTA_ADMISSION_TYPES: AdmissionType[] = ["GENERAL", "MEISTER", "SOCIAL"];

const mapAdmissionTypes = (value: (admissionType: AdmissionType) => number): AdmissionQuotaMap =>
  QUOTA_ADMISSION_TYPES.reduce(
    (acc, admissionType) => ({ ...acc, [admissionType]: value(admissionType) }),
    {} as AdmissionQuotaMap
  );

/**
 * 조회 응답 → 편집 상태(전형 → 정원). 응답의 `updatedAt`/`updatedBy` 는 버리고 전형 3개만 고른다.
 * 백엔드는 세 전형을 모두 보장하지만, 혹시 빠진 전형이 있어도 0 으로 채워 입력칸 3개를 항상 유지한다.
 * 등록된 정원이 없거나(null) 아직 조회 전(undefined)이면 전부 0 으로 시작한다.
 */
export const toAdmissionQuotaMap = (quota?: AdmissionQuota | null): AdmissionQuotaMap =>
  mapAdmissionTypes(admissionType => quota?.[admissionType] ?? 0);

/** 편집 상태 → 전체 교체(PUT) 요청 본문 `{ GENERAL, MEISTER, SOCIAL }`. 전형 3개 키만 보낸다. */
export const toUpdateAdmissionQuotaPayload = (quotas: AdmissionQuotaMap): UpdateAdmissionQuotaPayload =>
  mapAdmissionTypes(admissionType => quotas[admissionType]);

/** 입력칸 문자열 → 정원 값. 백엔드가 0 이상의 정수만 받으므로 음수·소수·빈 값은 0 이상 정수로 정리한다. */
export const parseQuotaInput = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
};

/** 총 모집 인원(전형별 정원의 합) */
export const getAdmissionQuotaTotal = (quotas: AdmissionQuotaMap): number =>
  QUOTA_ADMISSION_TYPES.reduce((sum, admissionType) => sum + quotas[admissionType], 0);

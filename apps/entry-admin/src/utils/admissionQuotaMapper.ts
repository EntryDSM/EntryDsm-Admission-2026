import type { AdmissionQuota, AdmissionQuotaMap, AdmissionType, UpdateAdmissionQuotaPayload } from "../apis/types";

/** 정원 화면의 전형 표시 순서 */
export const QUOTA_ADMISSION_TYPES: AdmissionType[] = ["GENERAL", "MEISTER", "SOCIAL"];

const mapAdmissionTypes = (value: (admissionType: AdmissionType) => number): AdmissionQuotaMap =>
  QUOTA_ADMISSION_TYPES.reduce(
    (acc, admissionType) => ({ ...acc, [admissionType]: value(admissionType) }),
    {} as AdmissionQuotaMap
  );

/** 조회 응답에서 전형 3개만 고른다. 정원이 없거나 조회 전이면 모두 0 으로 시작한다. */
export const toAdmissionQuotaMap = (quota?: AdmissionQuota | null): AdmissionQuotaMap =>
  mapAdmissionTypes(admissionType => quota?.[admissionType] ?? 0);

/** 전형 3개 키만 보낸다. */
export const toUpdateAdmissionQuotaPayload = (quotas: AdmissionQuotaMap): UpdateAdmissionQuotaPayload =>
  mapAdmissionTypes(admissionType => quotas[admissionType]);

/** 입력값을 0 이상의 정수로 정리한다. */
export const parseQuotaInput = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
};

export const getAdmissionQuotaTotal = (quotas: AdmissionQuotaMap): number =>
  QUOTA_ADMISSION_TYPES.reduce((sum, admissionType) => sum + quotas[admissionType], 0);

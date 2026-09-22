import { http, HttpError } from "./http";
import type { AdmissionQuota, UpdateAdmissionQuotaPayload } from "./types";

const ADMISSION_QUOTAS_ENDPOINT = "/api/v11/admin/admission-quotas";

/** 등록된 정원이 없을 때 조회가 404 와 함께 주는 에러 코드 (백엔드 admin `ErrorCode.ADMISSION_QUOTA_NOT_FOUND`) */
const ADMISSION_QUOTA_NOT_FOUND = "ADMISSION_QUOTA_NOT_FOUND";

/**
 * 현재 모집 정원 조회.
 * 아직 등록된 정원이 없으면 백엔드가 404(ADMISSION_QUOTA_NOT_FOUND)를 주는데, 이는 첫 등록 전의 정상 상태라
 * 에러 대신 `null` 로 돌려준다(전역 에러 토스트·Sentry 보고 대상에서 제외). 그 외 에러는 그대로 던진다.
 */
export const getAdmissionQuota = async (): Promise<AdmissionQuota | null> => {
  try {
    return await http.get<AdmissionQuota>(ADMISSION_QUOTAS_ENDPOINT);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404 && error.code === ADMISSION_QUOTA_NOT_FOUND) {
      return null;
    }
    throw error;
  }
};

/**
 * 모집 정원 전체 교체(PUT). 6개 조합을 모두 보내야 하며 저장된 정원을 돌려준다(200).
 * 수정자(`X-User-Id`)는 게이트웨이가 인증 쿠키로 주입하므로 클라이언트는 헤더를 보내지 않는다.
 */
export const updateAdmissionQuota = (payload: UpdateAdmissionQuotaPayload) =>
  http.put<AdmissionQuota>(ADMISSION_QUOTAS_ENDPOINT, payload);

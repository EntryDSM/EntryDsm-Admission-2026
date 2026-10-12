import { http, HttpError } from "./http";
import type { AdmissionQuota, UpdateAdmissionQuotaPayload } from "./types";

const ADMISSION_QUOTAS_ENDPOINT = "/api/v11/admin/admission-quotas";

const ADMISSION_QUOTA_NOT_FOUND = "ADMISSION_QUOTA_NOT_FOUND";

/** 정원을 아직 등록하지 않았으면(404) 에러 대신 null 을 돌려준다. 화면은 이때 등록 모드가 된다. */
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

export const updateAdmissionQuota = (payload: UpdateAdmissionQuotaPayload) =>
  http.put<AdmissionQuota>(ADMISSION_QUOTAS_ENDPOINT, payload);

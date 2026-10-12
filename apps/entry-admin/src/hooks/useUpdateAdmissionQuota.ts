import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, updateAdmissionQuota, type AdmissionQuota, type AdmissionQuotaMap } from "../apis";
import { toUpdateAdmissionQuotaPayload } from "../utils";

/** 첫 등록과 수정 모두 PUT 이다. 저장된 정원을 캐시에 바로 넣고, 정원으로 계산하는 통계는 다시 받는다. */
export const useUpdateAdmissionQuota = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (quotas: AdmissionQuotaMap) => updateAdmissionQuota(toUpdateAdmissionQuotaPayload(quotas)),
    onSuccess: (saved: AdmissionQuota) => {
      toast.success("모집 정원을 저장했습니다.");
      queryClient.setQueryData(adminQueryKeys.admissionQuota, saved);
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.statistics.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "모집 정원 저장 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    updateAdmissionQuota: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, updateAdmissionQuota, type AdmissionQuota, type AdmissionQuotaMap } from "../apis";
import { toUpdateAdmissionQuotaPayload } from "../utils";

/**
 * 모집 정원 저장(전체 교체) 훅. 첫 등록과 수정 모두 같은 PUT 을 쓴다.
 * 응답이 저장된 정원 그대로라 조회 캐시에 바로 반영하고, 정원을 기준으로 계산되는 경쟁률(홈 통계)은 무효화해 다시 받는다.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 */
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, updateApplicantArrival } from "../apis";

/**
 * 원서 도착 처리 훅.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 * 성공 시 지원자 목록/상세 캐시를 무효화해 최신 값으로 갱신한다.
 */
export const useUpdateApplicantArrival = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (applicantId: number) => updateApplicantArrival(applicantId),
    onSuccess: () => {
      toast.success("원서 도착 처리했습니다.");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "원서 도착 처리 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    updateArrival: mutation.mutate,
    isUpdatingArrival: mutation.isPending,
  };
};

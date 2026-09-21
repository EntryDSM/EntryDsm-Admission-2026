import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, updateApplicantArrival } from "../apis";

/** 도착 표시 대상. `isArrived: false` 는 도착 취소다. */
export interface UpdateApplicantArrivalTarget {
  applicantId: number;
  isArrived: boolean;
}

/**
 * 원서 도착 표시/취소 훅.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 * 성공 시 지원자 목록/상세 캐시를 무효화해 최신 값으로 갱신한다.
 */
export const useUpdateApplicantArrival = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId, isArrived }: UpdateApplicantArrivalTarget) =>
      updateApplicantArrival(applicantId, isArrived),
    onSuccess: (_data, { isArrived }) => {
      toast.success(isArrived ? "원서 도착 처리했습니다." : "원서 도착 처리를 취소했습니다.");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
    },
    onError: (error: unknown, { isArrived }) => {
      const fallback = isArrived ? "원서 도착 처리 중 오류가 발생했습니다." : "원서 도착 취소 중 오류가 발생했습니다.";
      const message = error instanceof HttpError ? error.message : fallback;
      toast.error(message);
    },
  });

  return {
    updateArrival: mutation.mutate,
    isUpdatingArrival: mutation.isPending,
  };
};

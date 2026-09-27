import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, deleteApplicant, HttpError } from "../apis";

/** 접수 취소 대상. 결과 토스트에 이름을 쓰기 위해 id 와 함께 받는다. */
export interface CancelApplicationTarget {
  applicantId: number;
  applicantName?: string;
}

/**
 * 원서 접수 취소(지원자 삭제) 훅. 원서 접수 기간에만 쓰이며, 삭제된 원서는 복구할 수 없다.
 * 성공하면 지원자 수가 바뀌므로 목록/상세와 통계 캐시를 무효화한다.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 */
export const useCancelApplication = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId }: CancelApplicationTarget) => deleteApplicant(applicantId),
    onSuccess: (_data, target) => {
      const name = target.applicantName || `지원자 ${target.applicantId}`;
      toast.success(`${name} 님의 원서 접수를 취소했습니다.`);

      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.statistics.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "원서 접수 취소 중 오류가 발생했습니다.";
      toast.error(message);

      // 이미 지워진 지원자(404)면 목록의 해당 행이 낡은 것이므로 다시 받아 온다.
      if (error instanceof HttpError && error.status === 404) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
  });

  return {
    cancelApplication: mutation.mutate,
    isCancelingApplication: mutation.isPending,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, deleteApplicant, HttpError } from "../apis";

export interface CancelApplicationTarget {
  applicantId: number;
  applicantName?: string;
}

/** 원서 접수 취소. 삭제된 원서는 복구할 수 없다. */
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

      // 이미 지워진 지원자면 목록이 낡은 것이라 다시 받는다.
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

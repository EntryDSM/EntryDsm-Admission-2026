import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, correctApplication, type CorrectApplicationPayload, HttpError } from "../apis";

export interface CorrectApplicationTarget {
  applicantId: number;
  applicantName?: string;
  payload: CorrectApplicationPayload;
}

/** 원서 정정. 전형·지역·총점이 바뀔 수 있어 성공하면 지원자와 통계를 다시 받는다. */
export const useCorrectApplication = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId, payload }: CorrectApplicationTarget) => correctApplication(applicantId, payload),
    onSuccess: (_result, target) => {
      const name = target.applicantName || `지원자 ${target.applicantId}`;
      toast.success(`${name} 님의 원서를 정정했습니다.`);

      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.statistics.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "원서 정정 중 오류가 발생했습니다.";
      toast.error(message);

      // 지워졌거나(404) 그사이 전형 결과가 나온(409) 지원자면 목록이 낡은 것이라 다시 받는다.
      if (error instanceof HttpError && (error.status === 404 || error.status === 409)) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
  });

  return {
    correctApplication: mutation.mutate,
    isCorrectingApplication: mutation.isPending,
  };
};

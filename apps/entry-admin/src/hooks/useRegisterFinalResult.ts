import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, registerFinalScreeningResult } from "../apis";

export interface RegisterFinalResultTarget {
  applicantId: number;
  applicantName?: string;
}

/**
 * 2차 합격자 개별 등록. 1차 합격자와 최종 불합격자를 등록할 수 있다.
 * 등록하지 않은 1차 합격자는 2차 불합격으로 처리하기 전까지 1차 합격으로 남는다.
 */
export const useRegisterFinalResult = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId }: RegisterFinalResultTarget) => registerFinalScreeningResult(applicantId),
    onSuccess: (_data, { applicantId, applicantName }) => {
      const name = applicantName || `지원자 ${applicantId}`;
      toast.success(`${name} 님을 최종 합격자로 등록했습니다.`);
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
    },
    onError: (error: unknown) => {
      if (error instanceof HttpError && error.status === 409) {
        toast.error("2차 합격자로 등록할 수 없습니다. 1차 합격자인지, 1차 합격 발표가 끝났는지 확인해 주세요.");
      } else {
        toast.error(error instanceof HttpError ? error.message : "2차 합격자 등록 중 오류가 발생했습니다.");
      }

      // 지워졌거나(404) 그사이 상태가 바뀐(409) 지원자면 목록이 낡은 것이라 다시 받는다.
      if (error instanceof HttpError && (error.status === 404 || error.status === 409)) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
  });

  return {
    registerFinalResult: mutation.mutate,
    isRegisteringFinalResult: mutation.isPending,
  };
};

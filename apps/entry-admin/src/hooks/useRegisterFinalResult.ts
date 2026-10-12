import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, registerFinalScreeningResult, type FinalScreeningResult } from "../apis";

export interface RegisterFinalResultTarget {
  applicantId: number;
  applicantName?: string;
}

/** 2차 합격자 개별 등록. 등록한 지원자는 최종 합격, 등록하지 않은 지원자는 최종 불합격 처리된다. */
export const useRegisterFinalResult = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId }: RegisterFinalResultTarget) => registerFinalScreeningResult(applicantId),
    onSuccess: (result: FinalScreeningResult, target) => {
      const name = target.applicantName || `지원자 ${result.applicantId}`;

      // 응답 status 가 FINAL_FAIL 일 수도 있어 나눠 알린다.
      alert(
        result.status === "FINAL_PASS"
          ? `${name} 님이 최종 합격자로 등록되었습니다.`
          : `${name} 님은 최종 불합격 처리되었습니다.`
      );

      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "2차 합격자 등록 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    registerFinalResult: mutation.mutate,
    isRegisteringFinalResult: mutation.isPending,
  };
};

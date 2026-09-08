import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, registerFinalScreeningResult, type FinalScreeningResult } from "../apis";

/** 등록 대상. 결과 알림창에 이름을 쓰기 위해 id 와 함께 받는다. */
export interface RegisterFinalResultTarget {
  applicantId: number;
  applicantName?: string;
}

/**
 * 2차(최종) 합격자 개별 등록 훅. 등록한 지원자는 최종 합격 처리되고, 등록하지 않은 지원자는 최종 불합격 처리된다.
 * 등록 결과를 알림창으로 띄우고, 지원자 상태가 변경되므로 목록/상세 캐시를 무효화한다.
 */
export const useRegisterFinalResult = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId }: RegisterFinalResultTarget) => registerFinalScreeningResult(applicantId),
    onSuccess: (result: FinalScreeningResult, target) => {
      const name = target.applicantName || `지원자 ${result.applicantId}`;

      // 명세상 응답 status 에 FINAL_FAIL 도 올 수 있어 방어적으로 분기한다.
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

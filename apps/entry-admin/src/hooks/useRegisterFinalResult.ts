import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  adminQueryKeys,
  HttpError,
  registerFinalScreeningResult,
  updateApplicantStatus,
  type FinalScreeningResult,
} from "../apis";

export interface RegisterFinalResultTarget {
  applicantId: number;
  applicantName?: string;
  /** 지금 전형 상태. 2차 합격을 취소한(최종 불합격) 지원자는 다른 경로로 다시 등록한다. */
  status?: string;
}

const registerFinalResult = ({
  applicantId,
  status,
}: RegisterFinalResultTarget): Promise<FinalScreeningResult | undefined> =>
  // 최종 불합격은 정상 흐름으로 되돌릴 수 없어 강제 변경으로 다시 등록한다.
  status === "FINAL_FAIL"
    ? updateApplicantStatus(applicantId, { status: "FINAL_PASS", force: true, reason: "2차 합격자 재등록" }).then(
        () => undefined
      )
    : registerFinalScreeningResult(applicantId);

/** 2차 합격자 개별 등록. 등록한 지원자는 최종 합격, 등록하지 않은 지원자는 최종 불합격 처리된다. */
export const useRegisterFinalResult = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: registerFinalResult,
    onSuccess: (result, target) => {
      const name = target.applicantName || `지원자 ${target.applicantId}`;

      // 응답 status 가 FINAL_FAIL 일 수도 있어 나눠 알린다.
      alert(
        result?.status === "FINAL_FAIL"
          ? `${name} 님은 최종 불합격 처리되었습니다.`
          : `${name} 님이 최종 합격자로 등록되었습니다.`
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, updateApplicantStatus } from "../apis";

export interface CancelFinalResultTarget {
  applicantId: number;
  applicantName?: string;
}

/**
 * 2차 합격자 등록 취소. 1차 합격 발표 뒤에는 1차 합격으로 되돌릴 수 없어 최종 불합격으로 바꾼다.
 * 취소한 지원자는 다시 2차 합격자로 등록할 수 있다.
 */
export const useCancelFinalResult = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId }: CancelFinalResultTarget) =>
      updateApplicantStatus(applicantId, { status: "FINAL_FAIL", force: true, reason: "2차 합격자 등록 취소" }),
    onSuccess: (_data, { applicantId, applicantName }) => {
      const name = applicantName || `지원자 ${applicantId}`;
      toast.success(`${name} 님의 2차 합격을 취소했습니다.`);
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
    },
    onError: (error: unknown) => {
      if (error instanceof HttpError && error.status === 409) {
        toast.error("2차 합격을 취소할 수 없습니다. 1차 합격 발표가 끝났는지 확인해 주세요.");
      } else {
        toast.error(error instanceof HttpError ? error.message : "2차 합격 취소 중 오류가 발생했습니다.");
      }

      // 지워졌거나(404) 그사이 상태가 바뀐(409) 지원자면 목록이 낡은 것이라 다시 받는다.
      if (error instanceof HttpError && (error.status === 404 || error.status === 409)) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
  });

  return {
    cancelFinalResult: mutation.mutate,
    isCancelingFinalResult: mutation.isPending,
  };
};

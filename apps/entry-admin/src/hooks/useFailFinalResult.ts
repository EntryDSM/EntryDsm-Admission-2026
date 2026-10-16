import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, updateApplicantStatus } from "../apis";

export interface FailFinalResultTarget {
  applicantId: number;
  applicantName?: string;
  /** 지금 전형 상태. 최종 합격자는 2차 합격 취소, 1차 합격자는 2차 불합격 처리다. */
  status: string;
}

const isFinalPassCancel = (status: string) => status === "FINAL_PASS";

// 1차 합격 → 최종 불합격은 정상 흐름이지만, 최종 합격을 되돌리는 것은 강제 변경이다.
const failFinalResult = ({ applicantId, status }: FailFinalResultTarget) =>
  updateApplicantStatus(
    applicantId,
    isFinalPassCancel(status)
      ? { status: "FINAL_FAIL", force: true, reason: "2차 합격자 등록 취소" }
      : { status: "FINAL_FAIL" }
  );

// 서버는 거절 이유를 나눠 주지 않아(409) 확인할 것을 함께 알린다.
const CONFLICT_MESSAGES = {
  cancel: "2차 합격을 취소할 수 없습니다. 1차 합격 발표가 끝났는지 확인해 주세요.",
  fail: "2차 불합격으로 처리할 수 없습니다. 1차 합격자인지, 1차 합격 발표가 끝났는지 확인해 주세요.",
} as const;

/**
 * 2차 합격 취소와 2차 불합격 처리. 1차 합격 발표 뒤에는 1차 합격으로 되돌릴 수 없어 둘 다 최종 불합격으로 바꾼다.
 * 최종 불합격이 된 지원자는 다시 2차 합격자로 등록할 수 있다.
 */
export const useFailFinalResult = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: failFinalResult,
    onSuccess: (_data, { applicantId, applicantName, status }) => {
      const name = applicantName || `지원자 ${applicantId}`;
      toast.success(
        isFinalPassCancel(status)
          ? `${name} 님의 2차 합격을 취소했습니다.`
          : `${name} 님을 2차 불합격으로 처리했습니다.`
      );
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
    },
    onError: (error: unknown, { status }) => {
      const isCancel = isFinalPassCancel(status);

      if (error instanceof HttpError && error.status === 409) {
        toast.error(CONFLICT_MESSAGES[isCancel ? "cancel" : "fail"]);
      } else {
        const fallback = isCancel ? "2차 합격 취소 중 오류가 발생했습니다." : "2차 불합격 처리 중 오류가 발생했습니다.";
        toast.error(error instanceof HttpError ? error.message : fallback);
      }

      // 지워졌거나(404) 그사이 상태가 바뀐(409) 지원자면 목록이 낡은 것이라 다시 받는다.
      if (error instanceof HttpError && (error.status === 404 || error.status === 409)) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
  });

  return {
    failFinalResult: mutation.mutate,
    isFailingFinalResult: mutation.isPending,
  };
};

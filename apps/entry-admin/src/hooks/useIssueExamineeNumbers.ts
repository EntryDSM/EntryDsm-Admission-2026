import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, issueExamineeNumbers, type ExamineeNumberIssueResult } from "../apis";

/**
 * 수험번호 일괄 발급 훅.
 * 성공 시 발급/건너뜀 집계를 토스트로 알리고, 목록·상세의 `examineeNumber` 가 바뀌므로 지원자 캐시를 무효화한다.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 */
export const useIssueExamineeNumbers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: issueExamineeNumbers,
    onSuccess: (result: ExamineeNumberIssueResult) => {
      toast.success(
        `수험번호 발급 완료 — 발급 ${result.issuedCount} · 건너뜀 ${result.skippedCount} (대상 ${result.totalTargets})`
      );

      if (result.issuedCount > 0) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "수험번호 발급 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    issueExamineeNumbers: mutation.mutate,
    isIssuingExamineeNumbers: mutation.isPending,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, issueExamineeNumbers, type ExamineeNumberIssueResult } from "../apis";

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

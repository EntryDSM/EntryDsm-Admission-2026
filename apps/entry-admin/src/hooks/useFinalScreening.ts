import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, runFinalScreening, type ScreeningResult } from "../apis";

/**
 * 최종 합격자 일괄 산출 훅.
 * 성공 시 산출 집계를 토스트로 알리고, 지원자 상태가 일괄 변경되므로 목록/상세 캐시를 무효화한다.
 */
export const useFinalScreening = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dryRun: boolean) => runFinalScreening(dryRun),
    onSuccess: (result: ScreeningResult) => {
      toast.success(
        `최종 산출 완료 — 합격 ${result.passCount} · 불합격 ${result.failCount} · 제외 ${result.excludedCount}`
      );

      if (!result.dryRun) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "최종 합격자 산출 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    runFinalScreening: mutation.mutate,
    isRunningFinalScreening: mutation.isPending,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, runFirstScreening, type ScreeningResult } from "../apis";

export const useFirstScreening = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dryRun: boolean) => runFirstScreening(dryRun),
    onSuccess: (result: ScreeningResult) => {
      toast.success(
        `1차(서류) 산출 완료 — 합격 ${result.passCount} · 불합격 ${result.failCount} · 제외 ${result.excludedCount}`
      );

      if (!result.dryRun) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "1차 합격자 산출 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    runFirstScreening: mutation.mutate,
    isRunningFirstScreening: mutation.isPending,
  };
};

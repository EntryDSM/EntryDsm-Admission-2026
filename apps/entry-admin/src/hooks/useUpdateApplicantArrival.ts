import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, updateApplicantArrival } from "../apis";

/** `isArrived: false` 는 도착 취소다. */
export interface UpdateApplicantArrivalTarget {
  applicantId: number;
  isArrived: boolean;
}

export const useUpdateApplicantArrival = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId, isArrived }: UpdateApplicantArrivalTarget) =>
      updateApplicantArrival(applicantId, isArrived),
    onSuccess: (_data, { isArrived }) => {
      toast.success(isArrived ? "원서 도착 처리했습니다." : "원서 도착 처리를 취소했습니다.");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
    },
    onError: (error: unknown, { isArrived }) => {
      const fallback = isArrived ? "원서 도착 처리 중 오류가 발생했습니다." : "원서 도착 취소 중 오류가 발생했습니다.";
      const message = error instanceof HttpError ? error.message : fallback;
      toast.error(message);
    },
  });

  return {
    updateArrival: mutation.mutate,
    isUpdatingArrival: mutation.isPending,
  };
};

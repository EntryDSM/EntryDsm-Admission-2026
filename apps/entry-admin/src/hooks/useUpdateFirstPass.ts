import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, cancelFirstPassApplicant, HttpError, selectFirstPassApplicant } from "../apis";

/** `isFirstPass: false` 는 1차 합격 취소다. */
export interface UpdateFirstPassTarget {
  applicantId: number;
  applicantName?: string;
  isFirstPass: boolean;
}

// 서버는 거절 이유를 나눠 주지 않아(409) 확인할 것을 함께 알린다.
const CONFLICT_MESSAGES = {
  select:
    "1차 합격자로 등록할 수 없습니다. 1차 합격 발표 전인지, 1차 선발 인원이 다 찼는지, 총점이 있는 지원자인지 확인해 주세요.",
  cancel: "1차 합격을 취소할 수 없습니다. 1차 합격 발표 전인지 확인해 주세요.",
} as const;

/** 1차 합격 발표 전에 1차 합격자를 한 명씩 등록하거나 취소한다. */
export const useUpdateFirstPass = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId, isFirstPass }: UpdateFirstPassTarget) =>
      isFirstPass ? selectFirstPassApplicant(applicantId) : cancelFirstPassApplicant(applicantId),
    onSuccess: (_data, { applicantId, applicantName, isFirstPass }) => {
      const name = applicantName || `지원자 ${applicantId}`;
      toast.success(isFirstPass ? `${name} 님을 1차 합격자로 등록했습니다.` : `${name} 님의 1차 합격을 취소했습니다.`);
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
    },
    onError: (error: unknown, { isFirstPass }) => {
      if (error instanceof HttpError && error.status === 409) {
        toast.error(CONFLICT_MESSAGES[isFirstPass ? "select" : "cancel"]);
      } else {
        const fallback = isFirstPass
          ? "1차 합격자 등록 중 오류가 발생했습니다."
          : "1차 합격 취소 중 오류가 발생했습니다.";
        toast.error(error instanceof HttpError ? error.message : fallback);
      }

      // 지워졌거나(404) 그사이 상태가 바뀐(409) 지원자면 목록이 낡은 것이라 다시 받는다.
      if (error instanceof HttpError && (error.status === 404 || error.status === 409)) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
  });

  return {
    updateFirstPass: mutation.mutate,
    isUpdatingFirstPass: mutation.isPending,
  };
};

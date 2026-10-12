import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, correctApplication, type CorrectApplicationPayload, HttpError } from "../apis";

/** 정정 대상과 요청 본문. 결과 토스트에 이름을 쓰기 위해 id 와 함께 받는다. */
export interface CorrectApplicationTarget {
  applicantId: number;
  applicantName?: string;
  payload: CorrectApplicationPayload;
}

/**
 * 원서 정정 훅.
 * 성공하면 목록·상세(전형·지역·총점이 바뀔 수 있다)와 통계(전형·지역별 집계·경쟁률) 캐시를 무효화한다.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 */
export const useCorrectApplication = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ applicantId, payload }: CorrectApplicationTarget) => correctApplication(applicantId, payload),
    onSuccess: (_result, target) => {
      const name = target.applicantName || `지원자 ${target.applicantId}`;
      toast.success(`${name} 님의 원서를 정정했습니다.`);

      queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.statistics.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "원서 정정 중 오류가 발생했습니다.";
      toast.error(message);

      // 지워졌거나(404) 그사이 1차 산출 등으로 정정할 수 없게 된(409) 지원자면 목록의 버튼이 낡은 것이므로 다시 받아 온다.
      if (error instanceof HttpError && (error.status === 404 || error.status === 409)) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.applicants.all });
      }
    },
  });

  return {
    correctApplication: mutation.mutate,
    isCorrectingApplication: mutation.isPending,
  };
};

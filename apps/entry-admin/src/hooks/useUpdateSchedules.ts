import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, HttpError, updateSchedules } from "../apis";
import { toUpdateSchedulePayload, type ScheduleFieldView } from "../utils";

/**
 * 전형 일정 일괄 수정 훅.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 * 성공 시 일정 캐시를 무효화해 최신 값으로 갱신한다.
 */
export const useUpdateSchedules = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (fields: ScheduleFieldView[]) => updateSchedules(toUpdateSchedulePayload(fields)),
    onSuccess: () => {
      toast.success("전형 일정을 저장했습니다.");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.schedules });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "일정 저장 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    updateSchedules: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

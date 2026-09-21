import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, createSchedule, HttpError, updateSchedules } from "../apis";
import { toScheduleRequestItem, type ScheduleFieldView } from "../utils";

/**
 * 전형 일정 저장 훅. 신규 행(scheduleId 없음)은 `POST /schedules` 로 하나씩 등록하고,
 * 기존 행은 `PATCH /schedules/bulk` 로 한 번에 수정한다(bulk 는 없는 title 을 404 로 거절한다 — 2026-09-21 백엔드 확인).
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 * 일부만 성공했을 수 있으므로 성공/실패와 무관하게 일정 캐시를 무효화해 서버 상태와 다시 맞춘다.
 */
export const useUpdateSchedules = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (fields: ScheduleFieldView[]) => {
      const newFields = fields.filter(field => field.scheduleId === null);
      const existingFields = fields.filter(field => field.scheduleId !== null);

      // 신규 등록은 순서대로 하나씩 보내, 하나가 실패하면 그 뒤 항목은 만들지 않는다.
      for (const field of newFields) {
        await createSchedule(toScheduleRequestItem(field));
      }

      if (existingFields.length > 0) {
        await updateSchedules(existingFields.map(toScheduleRequestItem));
      }
    },
    onSuccess: () => {
      toast.success("전형 일정을 저장했습니다.");
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "일정 저장 중 오류가 발생했습니다.";
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.schedules });
    },
  });

  return {
    updateSchedules: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

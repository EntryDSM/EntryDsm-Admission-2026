import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, createSchedule, HttpError, updateSchedules } from "../apis";
import { toScheduleRequestItem, type ScheduleFieldView } from "../utils";

/**
 * 새 일정은 하나씩 등록하고 기존 일정은 한 번에 수정한다.
 * 일부만 성공했을 수 있어 결과와 상관없이 일정을 다시 받는다.
 */
export const useUpdateSchedules = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (fields: ScheduleFieldView[]) => {
      const newFields = fields.filter(field => field.scheduleId === null);
      const existingFields = fields.filter(field => field.scheduleId !== null);

      // 하나가 실패하면 그 뒤 일정은 만들지 않는다.
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

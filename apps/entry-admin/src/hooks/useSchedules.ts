import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getSchedules } from "../apis";
import { toScheduleFields, type ScheduleFieldView } from "../utils";

// 로딩·에러 때 같은 빈 배열을 돌려줘 화면의 effect 가 다시 돌지 않게 한다.
const EMPTY_SCHEDULES: ScheduleFieldView[] = [];

export const useSchedules = () => {
  const query = useQuery({
    queryKey: adminQueryKeys.schedules,
    queryFn: getSchedules,
    select: toScheduleFields,
  });

  return {
    schedules: query.data ?? EMPTY_SCHEDULES,
    isLoading: query.isLoading,
    isError: query.isError,
    /** 로딩 중과 "등록된 일정 없음"을 구분할 때 쓴다. */
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

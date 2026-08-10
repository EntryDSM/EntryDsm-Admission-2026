import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getSchedules } from "../apis";
import { toScheduleFields } from "../utils";

/**
 * 전형 일정 조회 훅.
 * 응답 DTO 를 수정 화면이 바로 쓰는 뷰 모델(시각 문자열)로 변환해 돌려준다.
 */
export const useSchedules = () => {
  const query = useQuery({
    queryKey: adminQueryKeys.schedules,
    queryFn: getSchedules,
    select: toScheduleFields,
  });

  return {
    schedules: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

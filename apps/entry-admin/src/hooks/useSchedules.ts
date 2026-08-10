import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getSchedules } from "../apis";
import { toScheduleFields, type ScheduleFieldView } from "../utils";

// 로딩/에러 시 매 렌더마다 새 배열이 생기지 않도록 고정 참조를 공유한다.
// (AdmissionsSchedule 의 useEffect([schedules]) 가 불필요하게 재실행되는 것을 방지)
const EMPTY_SCHEDULES: ScheduleFieldView[] = [];

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
    schedules: query.data ?? EMPTY_SCHEDULES,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

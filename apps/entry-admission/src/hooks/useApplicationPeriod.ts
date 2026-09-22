import { useCallback } from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getSchedules, getServerTime } from "../apis/schedule";
import { QueryKeys } from "../apis/query";
import { getApplicationPeriodStatus } from "../utils/schedule";

/**
 * 접수 기간 판정 쿼리. 서버 현재 시각(/time)과 일정(/schedules)을 함께 받아 open/closed 로 줄인다.
 * staleTime 0·retry 없음: 가드와 재검증이 항상 새 서버 시각으로 판정하고, 실패는 곧바로 호출부에 알린다.
 */
const applicationPeriodQueryOptions = queryOptions({
  queryKey: QueryKeys.schedule.applicationPeriod,
  queryFn: async () => {
    const [schedules, serverTime] = await Promise.all([getSchedules(), getServerTime()]);
    return getApplicationPeriodStatus(schedules, serverTime);
  },
  staleTime: 0,
  retry: false,
});

/**
 * RequireApplicationPeriod 가드 전용 구독. 처음 진입할 때 한 번 판정하고,
 * 이후에는 useVerifyApplicationPeriod 가 같은 캐시를 갱신할 때만 다시 평가된다(포커스·재접속 자동 refetch 없음).
 */
export const useApplicationPeriodQuery = () => {
  const query = useQuery({
    ...applicationPeriodQueryOptions,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    periodStatus: query.data,
    periodError: query.error,
    /** 초기 판정·재시도 포함, 기간 확인 요청이 진행 중인지 */
    isCheckingPeriod: query.isFetching,
    refetchPeriod: query.refetch,
  };
};

/**
 * 접수 시작·단계 저장(다음)·최종 제출 직전에 서버 시각으로 접수 기간을 다시 확인한다.
 * - open: true 를 돌려 진행한다.
 * - closed: false 를 돌려 진행을 막는다. 유저 앱 이동은 같은 캐시를 구독하는 RequireApplicationPeriod 가드가 맡는다.
 * - 조회 실패: 안내 토스트를 띄우고 false 를 돌린다(fail-closed).
 */
export const useVerifyApplicationPeriod = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      return (await queryClient.fetchQuery(applicationPeriodQueryOptions)) === "open";
    } catch {
      toast.error("원서 접수 기간을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return false;
    }
  }, [queryClient]);
};

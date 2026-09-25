import { useCallback } from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, getSchedules, getServerTime } from "../apis";
import { getApplicationPeriodStatus } from "../utils";

/**
 * 원서 접수 기간 판정 쿼리. 일정(/schedules)과 서버 현재 시각(/time)을 함께 받아 open/closed 로 줄인다.
 * staleTime 0: 목록 진입과 접수 취소 직전 재확인이 항상 새 서버 시각으로 판정한다(admission 앱 useApplicationPeriod 와 같은 방식).
 * 조회 실패는 전역 QueryCache 가 토스트·보고한다.
 */
const applicationPeriodQueryOptions = queryOptions({
  queryKey: adminQueryKeys.applicationPeriod,
  queryFn: async () => {
    const [schedules, serverTime] = await Promise.all([getSchedules(), getServerTime()]);
    return getApplicationPeriodStatus(schedules, serverTime);
  },
  staleTime: 0,
});

/**
 * 지원자 목록 마지막 열 버튼의 역할을 정하는 구독.
 * 접수 기간(open)에는 "접수 취소", 접수가 끝났거나(closed) 판정에 실패하면 기존대로 "2차 합격자 등록" 버튼이 된다.
 */
export const useApplicationPeriod = () => {
  const query = useQuery(applicationPeriodQueryOptions);

  return {
    periodStatus: query.data,
    /** 첫 판정이 끝나기 전. 이 동안은 버튼 역할을 정할 수 없으므로 목록을 로딩 상태로 둔다. */
    isCheckingPeriod: query.isLoading,
  };
};

/**
 * 접수 취소 직전에 서버 시각으로 접수 기간을 다시 확인한다.
 * 목록을 열어 둔 채 마감이 지나도(버튼 문구가 그대로여도) 접수 기간이 아닌 원서를 지우지 않도록 한다.
 * - open: true 를 돌려 진행한다.
 * - closed: 안내 토스트를 띄우고 false. 같은 캐시를 구독하는 목록 버튼도 "2차 합격자 등록" 으로 바뀐다.
 * - 조회 실패: 전역 에러 토스트만 뜨고 false (fail-closed).
 */
export const useVerifyApplicationPeriod = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      if ((await queryClient.fetchQuery(applicationPeriodQueryOptions)) === "open") {
        return true;
      }

      toast.error("원서 접수 기간이 아니어서 접수를 취소할 수 없습니다.");
      return false;
    } catch {
      return false;
    }
  }, [queryClient]);
};

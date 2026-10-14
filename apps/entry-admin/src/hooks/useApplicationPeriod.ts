import { useCallback } from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, getSchedules, getServerTime } from "../apis";
import { getApplicationPeriodStatus, getFirstAnnouncementStatus } from "../utils";

/**
 * 일정과 서버 시각으로 원서 접수 기간과 1차 합격 발표 전후를 판정한다.
 * 접수 취소 직전 재확인도 새 서버 시각을 쓰도록 staleTime 0 이다.
 */
const applicationPeriodQueryOptions = queryOptions({
  queryKey: adminQueryKeys.applicationPeriod,
  queryFn: async () => {
    const [schedules, serverTime] = await Promise.all([getSchedules(), getServerTime()]);
    return {
      periodStatus: getApplicationPeriodStatus(schedules, serverTime),
      firstAnnouncementStatus: getFirstAnnouncementStatus(schedules, serverTime),
    };
  },
  staleTime: 0,
});

/** 접수 취소는 접수 기간(open)에만, 1차 합격자 등록·취소는 1차 합격 발표 전(before)에만 고를 수 있다. */
export const useApplicationPeriod = () => {
  const query = useQuery(applicationPeriodQueryOptions);

  return {
    periodStatus: query.data?.periodStatus,
    firstAnnouncementStatus: query.data?.firstAnnouncementStatus,
  };
};

/** 접수 취소 직전에 서버 시각으로 기간을 다시 확인한다. 기간이 아니거나 조회에 실패하면 false 다. */
export const useVerifyApplicationPeriod = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      if ((await queryClient.fetchQuery(applicationPeriodQueryOptions)).periodStatus === "open") {
        return true;
      }

      toast.error("원서 접수 기간이 아니어서 접수를 취소할 수 없습니다.");
      return false;
    } catch {
      return false;
    }
  }, [queryClient]);
};

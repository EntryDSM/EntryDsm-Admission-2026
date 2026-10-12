import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getNoticeDetail } from "../apis";

export const useNoticeDetail = (noticeId?: number) => {
  const query = useQuery({
    queryKey: adminQueryKeys.notices.detail(noticeId ?? 0),
    queryFn: () => getNoticeDetail(noticeId as number),
    enabled: noticeId !== undefined,
  });

  return {
    notice: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

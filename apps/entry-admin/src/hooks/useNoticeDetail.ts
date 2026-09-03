import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getNoticeDetail } from "../apis";

/**
 * 공지 상세 조회 훅.
 * `noticeId` 가 없으면(잘못된 라우트 등) 요청하지 않는다.
 */
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

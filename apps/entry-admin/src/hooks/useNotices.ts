import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getNotices, type GetNoticesParams } from "../apis";
import { toNoticeListItem, type NoticeListItem } from "../utils";

// 로딩·에러 때 같은 빈 배열을 돌려준다.
const EMPTY_NOTICES: NoticeListItem[] = [];

/** 페이지를 옮길 때 이전 데이터를 유지해 깜빡임을 줄인다. */
export const useNotices = (params: GetNoticesParams, enabled = true) => {
  const query = useQuery({
    queryKey: adminQueryKeys.notices.list(params),
    queryFn: () => getNotices(params),
    enabled,
    placeholderData: keepPreviousData,
    select: data => ({
      notices: data.content.map(toNoticeListItem),
      totalPages: data.totalPages,
      totalElements: data.totalElements,
    }),
  });

  return {
    notices: query.data?.notices ?? EMPTY_NOTICES,
    totalPages: query.data?.totalPages,
    totalElements: query.data?.totalElements,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

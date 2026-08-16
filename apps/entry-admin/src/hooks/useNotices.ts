import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getNotices, type GetNoticesParams } from "../apis";
import { toNoticeListItem, type NoticeListItem } from "../utils";

// 로딩/에러 시 매 렌더마다 새 배열이 생기지 않도록 고정 참조를 공유한다.
const EMPTY_NOTICES: NoticeListItem[] = [];

/**
 * 공지 목록 조회 훅.
 * 페이지는 서버 쿼리 파라미터로 전달하고, 응답 DTO 는 뷰 모델로 변환해 돌려준다.
 * `enabled`(예: 비활성 탭)면 요청하지 않고, 페이지 전환 시 이전 데이터를 유지해(`keepPreviousData`) 깜빡임을 줄인다.
 */
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

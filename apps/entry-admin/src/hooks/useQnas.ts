import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getQnas, type GetQnasParams, type QnaSummary } from "../apis";

// 로딩/에러 시 매 렌더마다 새 배열이 생기지 않도록 고정 참조를 공유한다.
const EMPTY_QNAS: QnaSummary[] = [];

/**
 * QnA(자주 묻는 질문) 목록 조회 훅.
 * 페이지는 서버 쿼리 파라미터로 전달하고, `enabled`(예: 비활성 탭)면 요청하지 않는다.
 * 페이지 전환 시 이전 데이터를 유지해(`keepPreviousData`) 깜빡임을 줄인다.
 */
export const useQnas = (params: GetQnasParams, enabled = true) => {
  const query = useQuery({
    queryKey: adminQueryKeys.qnas.list(params),
    queryFn: () => getQnas(params),
    enabled,
    placeholderData: keepPreviousData,
    select: data => ({
      qnas: data.content,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
    }),
  });

  return {
    qnas: query.data?.qnas ?? EMPTY_QNAS,
    totalPages: query.data?.totalPages,
    totalElements: query.data?.totalElements,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getApplicants, type GetApplicantsParams } from "../apis";
import { toApplicantListItem } from "../utils";

/**
 * 지원자 목록 조회 훅.
 * 필터/검색/페이지는 서버 쿼리 파라미터로 전달하고, 응답(`{ items, page, size, totalElements, totalPages }`)의
 * `items` 는 뷰 모델로 변환하고 나머지는 페이지 정보(`pageInfo`)로 돌려준다.
 * 페이지 전환 시 이전 데이터를 유지해(`keepPreviousData`) 깜빡임을 줄인다.
 */
export const useApplicants = (params: GetApplicantsParams) => {
  const query = useQuery({
    queryKey: adminQueryKeys.applicants.list(params),
    queryFn: () => getApplicants(params),
    placeholderData: keepPreviousData,
    select: ({ items, ...pageInfo }) => ({
      applicants: items.map(toApplicantListItem),
      pageInfo,
    }),
  });

  return {
    applicants: query.data?.applicants ?? [],
    pageInfo: query.data?.pageInfo,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

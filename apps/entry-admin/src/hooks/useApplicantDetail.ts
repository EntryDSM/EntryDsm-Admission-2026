import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getApplicantDetail } from "../apis";
import { toApplicantDetailView } from "../utils";

/**
 * 지원자 상세 조회 훅.
 * `applicantId` 가 없거나 `enabled` 가 false(예: 모달 닫힘)면 요청하지 않는다.
 * `alwaysRefetchOnMount` 면 캐시가 신선해도(전역 staleTime 1분) 마운트할 때마다 다시 받는다 — 원서 정정처럼 최신 원서가 필요할 때 쓴다.
 */
export const useApplicantDetail = (applicantId?: number, enabled = true, { alwaysRefetchOnMount = false } = {}) => {
  const query = useQuery({
    queryKey: adminQueryKeys.applicants.detail(applicantId ?? 0),
    queryFn: () => getApplicantDetail(applicantId as number),
    enabled: enabled && applicantId !== undefined,
    select: toApplicantDetailView,
    refetchOnMount: alwaysRefetchOnMount ? "always" : true,
  });

  return {
    detail: query.data,
    isLoading: query.isLoading,
    /** 캐시가 있어도 다시 받는 중이면 true. 원서 정정은 최신 원서를 받은 뒤에 입력칸을 채운다. */
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

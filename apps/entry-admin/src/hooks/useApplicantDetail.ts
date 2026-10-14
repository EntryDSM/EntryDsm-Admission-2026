import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getApplicantDetail } from "../apis";
import { toApplicantDetailView } from "../utils";

/** `alwaysRefetchOnMount` 면 캐시가 신선해도 마운트할 때마다 다시 받는다(원서 정정처럼 최신 원서가 필요할 때). */
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
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

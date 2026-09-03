import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getApplicantDetail } from "../apis";
import { toApplicantDetailView } from "../utils";

/**
 * 지원자 상세 조회 훅.
 * `applicantId` 가 없거나 `enabled` 가 false(예: 모달 닫힘)면 요청하지 않는다.
 */
export const useApplicantDetail = (applicantId?: number, enabled = true) => {
  const query = useQuery({
    queryKey: adminQueryKeys.applicants.detail(applicantId ?? 0),
    queryFn: () => getApplicantDetail(applicantId as number),
    enabled: enabled && applicantId !== undefined,
    select: toApplicantDetailView,
  });

  return {
    detail: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

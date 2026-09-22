import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getAdmissionQuota } from "../apis";

/**
 * 모집 정원 조회 훅.
 * `quota` 가 `null` 이면 조회는 성공했지만 아직 등록된 정원이 없는 것(등록 모드)이고,
 * `undefined` 면 아직 데이터가 없는 것(로딩/초기 조회 실패)이다.
 */
export const useAdmissionQuota = () => {
  const query = useQuery({
    queryKey: adminQueryKeys.admissionQuota,
    queryFn: getAdmissionQuota,
  });

  return {
    quota: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    /** 조회가 성공했는지. `quota === null`(등록된 정원 없음)과 로딩 중을 구분할 때 쓴다. */
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

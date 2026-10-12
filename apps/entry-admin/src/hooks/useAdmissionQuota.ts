import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getAdmissionQuota } from "../apis";

/** `quota` 가 null 이면 등록된 정원이 없는 것(등록 모드)이고, undefined 면 아직 받지 못한 것이다. */
export const useAdmissionQuota = () => {
  const query = useQuery({
    queryKey: adminQueryKeys.admissionQuota,
    queryFn: getAdmissionQuota,
  });

  return {
    quota: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

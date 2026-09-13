import { useQuery } from "@tanstack/react-query";

import { getServiceHealth } from "../apis";
import { HttpError } from "../apis/http";

export const useServiceHealth = (enabled: boolean) => {
  const query = useQuery({
    queryKey: ["monitoring", "service-health"],
    queryFn: ({ signal }) => getServiceHealth(signal),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    staleTime: 0,
    retry: (failureCount, error) =>
      !(error instanceof HttpError && (error.status === 401 || error.status === 403)) && failureCount < 1,
    meta: { suppressGlobalErrorToast: true },
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

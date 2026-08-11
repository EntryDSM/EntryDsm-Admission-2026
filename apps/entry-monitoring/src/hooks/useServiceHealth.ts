import { useQuery } from "@tanstack/react-query";

import { getServiceHealth } from "../apis";

export const useServiceHealth = (enabled: boolean) => {
  const query = useQuery({
    queryKey: ["monitoring", "service-health"],
    queryFn: ({ signal }) => getServiceHealth(signal),
    enabled,
    staleTime: 0,
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

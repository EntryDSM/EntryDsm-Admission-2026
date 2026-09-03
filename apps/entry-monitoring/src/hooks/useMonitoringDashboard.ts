import { useQuery } from "@tanstack/react-query";
import { getMonitoringDashboard } from "../apis";

export const useMonitoringDashboard = () => {
  const query = useQuery({
    queryKey: ["monitoring", "dashboard"],
    queryFn: ({ signal }) => getMonitoringDashboard(undefined, signal),
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

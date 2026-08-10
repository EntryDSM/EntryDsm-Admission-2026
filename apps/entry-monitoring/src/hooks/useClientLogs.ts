import { useQuery } from "@tanstack/react-query";
import { getClientLogs } from "../apis";

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

export const useClientLogs = () => {
  const query = useQuery({
    queryKey: ["monitoring", "client-logs", "recent-hour"],
    queryFn: ({ signal }) => {
      const to = new Date();
      const from = new Date(to.getTime() - ONE_HOUR_IN_MILLISECONDS);

      return getClientLogs(
        {
          level: ["ERROR", "WARN"],
          from: from.toISOString(),
          to: to.toISOString(),
          size: 100,
        },
        signal
      );
    },
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

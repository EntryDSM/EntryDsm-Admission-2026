import { useQuery } from "@tanstack/react-query";
import { getServerLogs } from "../apis";

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

export const useServerLogs = () => {
  const query = useQuery({
    queryKey: ["monitoring", "server-logs", "application", "5xx", "recent-hour"],
    queryFn: ({ signal }) =>
      getServerLogs(
        {
          service: "APPLICATION",
          status: "5xx",
          from: new Date(Date.now() - ONE_HOUR_IN_MILLISECONDS).toISOString(),
          size: 20,
        },
        signal
      ),
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

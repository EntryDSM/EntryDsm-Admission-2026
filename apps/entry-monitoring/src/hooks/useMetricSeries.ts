import { useQuery } from "@tanstack/react-query";
import { getMetricSeries } from "../apis";
import { getMetricWindowStart, toKoreanDateTime, toMetricChartData } from "../utils/metricChartWindow";

export const useMetricSeries = () => {
  const query = useQuery({
    queryKey: ["monitoring", "metric-series", "recent-12-hours", "1h"],
    refetchInterval: 30_000,
    queryFn: async ({ signal }) => {
      const to = new Date();
      const from = getMetricWindowStart(to);
      const data = await getMetricSeries(
        {
          metrics: ["API_REQUEST", "VISITOR"],
          from: toKoreanDateTime(from),
          to: toKoreanDateTime(to),
          interval: "1h",
        },
        signal
      );

      return {
        apiRequest: toMetricChartData(data.series, "API_REQUEST", from, to),
        visitor: toMetricChartData(data.series, "VISITOR", from, to),
      };
    },
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

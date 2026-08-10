import { useQuery } from "@tanstack/react-query";
import { getMetricSeries, type MetricName, type MetricSeries } from "../apis";

const toChartData = (series: MetricSeries[], metricName: MetricName) => {
  const points = series.find(({ metric }) => metric === metricName)?.points ?? [];

  return {
    labels: points.map(({ t }) => t.slice(11, 16)),
    values: points.map(({ v }) => v),
  };
};

export const useMetricSeries = () => {
  const query = useQuery({
    queryKey: ["monitoring", "metric-series", "today", "1h"],
    queryFn: ({ signal }) => {
      const to = new Date();
      const from = new Date(to);
      from.setHours(0, 0, 0, 0);

      return getMetricSeries(
        {
          metrics: ["API_REQUEST", "VISITOR"],
          from: from.toISOString(),
          to: to.toISOString(),
          interval: "1h",
        },
        signal
      );
    },
    select: data => ({
      apiRequest: toChartData(data.series, "API_REQUEST"),
      visitor: toChartData(data.series, "VISITOR"),
    }),
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

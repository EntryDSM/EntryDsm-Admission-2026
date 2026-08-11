import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMetricSeries, type MetricName, type MetricSeries } from "../apis";

const getLocalDateKey = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(value => String(value).padStart(2, "0")).join("-");

const getMillisecondsUntilTomorrow = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return tomorrow.getTime() - now.getTime();
};

const useToday = () => {
  const [today, setToday] = useState(() => getLocalDateKey(new Date()));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setToday(getLocalDateKey(new Date()));
    }, getMillisecondsUntilTomorrow() + 1_000);

    return () => clearTimeout(timeoutId);
  }, [today]);

  return today;
};

const toChartData = (series: MetricSeries[], metricName: MetricName) => {
  const points = series.find(({ metric }) => metric === metricName)?.points ?? [];

  return {
    labels: points.map(({ t }) => t.slice(11, 16)),
    values: points.map(({ v }) => v),
  };
};

export const useMetricSeries = () => {
  const today = useToday();
  const query = useQuery({
    queryKey: ["monitoring", "metric-series", today, "1h"],
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

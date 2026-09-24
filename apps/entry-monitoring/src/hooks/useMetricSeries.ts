import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMetricSeries, type MetricName, type MetricSeries } from "../apis";

const KOREAN_TIME_OFFSET = 9 * 60 * 60 * 1_000;

const toKoreanDateTime = (date: Date) =>
  new Date(date.getTime() + KOREAN_TIME_OFFSET).toISOString().replace("Z", "+09:00");

const getKoreanDateKey = (date: Date) => toKoreanDateTime(date).slice(0, 10);

const getMillisecondsUntilTomorrow = () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1_000);
  const tomorrowMidnight = new Date(`${getKoreanDateKey(tomorrow)}T00:00:00+09:00`);

  return tomorrowMidnight.getTime() - now.getTime();
};

const useToday = () => {
  const [today, setToday] = useState(() => getKoreanDateKey(new Date()));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setToday(getKoreanDateKey(new Date()));
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

      return getMetricSeries(
        {
          metrics: ["API_REQUEST", "VISITOR"],
          from: `${today}T00:00:00.000+09:00`,
          to: toKoreanDateTime(to),
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

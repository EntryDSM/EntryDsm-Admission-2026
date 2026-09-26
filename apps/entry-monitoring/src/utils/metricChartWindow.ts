import type { MetricName, MetricSeries } from "../apis/getMetricSeries";

const HOUR = 60 * 60 * 1_000;
const VISIBLE_HOURS = 12;
const KOREAN_TIME_OFFSET = 9 * HOUR;

export const toKoreanDateTime = (date: Date) =>
  new Date(date.getTime() + KOREAN_TIME_OFFSET).toISOString().replace("Z", "+09:00");

// Include the current partial hour and the preceding eleven hourly buckets.
export const getMetricWindowStart = (now: Date) =>
  new Date(Math.floor(now.getTime() / HOUR) * HOUR - (VISIBLE_HOURS - 1) * HOUR);

export const toMetricChartData = (series: MetricSeries[], metricName: MetricName, from: Date) => {
  const points = series.find(({ metric }) => metric === metricName)?.points ?? [];
  const valuesByHour = new Map(points.map(({ t, v }) => [Math.floor(new Date(t).getTime() / HOUR) * HOUR, v]));
  const hours = Array.from({ length: VISIBLE_HOURS }, (_, index) => from.getTime() + index * HOUR);

  return {
    labels: hours.map(hour => toKoreanDateTime(new Date(hour)).slice(11, 16)),
    values: hours.map(hour => valuesByHour.get(hour) ?? 0),
  };
};

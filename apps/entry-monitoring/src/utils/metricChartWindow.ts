import type { MetricName, MetricSeries } from "../apis/getMetricSeries";

const HOUR = 60 * 60 * 1_000;
const VISIBLE_HOURS = 12;
const KOREAN_TIME_OFFSET = 9 * HOUR;

export const toKoreanDateTime = (date: Date) =>
  new Date(date.getTime() + KOREAN_TIME_OFFSET).toISOString().replace("Z", "+09:00");

export const getMetricWindowStart = (now: Date) => new Date(now.getTime() - VISIBLE_HOURS * HOUR);

export const toMetricChartData = (series: MetricSeries[], metricName: MetricName, from: Date, to: Date) => {
  const points = series.find(({ metric }) => metric === metricName)?.points ?? [];
  const valuesByHour = new Map(points.map(({ t, v }) => [Math.floor(new Date(t).getTime() / HOUR) * HOUR, v]));
  // A rolling twelve-hour range can overlap thirteen clock-hour buckets.
  // Include both partial buckets, but exclude a bucket starting exactly at `to`.
  const firstHour = Math.floor(from.getTime() / HOUR) * HOUR;
  const endHour = Math.ceil(to.getTime() / HOUR) * HOUR;
  const hours = Array.from({ length: (endHour - firstHour) / HOUR }, (_, index) => firstHour + index * HOUR);

  return {
    labels: hours.map(hour => toKoreanDateTime(new Date(hour)).slice(11, 16)),
    values: hours.map(hour => valuesByHour.get(hour) ?? 0),
  };
};

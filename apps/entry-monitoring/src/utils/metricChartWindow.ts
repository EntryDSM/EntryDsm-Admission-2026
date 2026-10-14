import type { MetricName, MetricSeries } from "../apis/getMetricSeries";

const HOUR = 60 * 60 * 1_000;
const VISIBLE_HOURS = 12;
const KOREAN_TIME_OFFSET = 9 * HOUR;

export const toKoreanDateTime = (date: Date) =>
  new Date(date.getTime() + KOREAN_TIME_OFFSET).toISOString().replace("Z", "+09:00");

// 백엔드는 from 부터 1시간씩 나누므로 정시에 맞춰 막대(정시 단위)와 값을 맞춘다.
export const getMetricWindowStart = (now: Date) =>
  new Date(Math.floor((now.getTime() - VISIBLE_HOURS * HOUR) / HOUR) * HOUR);

export const toMetricChartData = (series: MetricSeries[], metricName: MetricName, from: Date, to: Date) => {
  const points = series.find(({ metric }) => metric === metricName)?.points ?? [];
  const valuesByHour = new Map(points.map(({ t, v }) => [Math.floor(new Date(t).getTime() / HOUR) * HOUR, v]));
  // 마지막(현재) 시간 칸만 부분 구간이다. `to` 와 같은 시각에 시작하는 칸은 넣지 않는다.
  const firstHour = Math.floor(from.getTime() / HOUR) * HOUR;
  const endHour = Math.ceil(to.getTime() / HOUR) * HOUR;
  const hours = Array.from({ length: (endHour - firstHour) / HOUR }, (_, index) => firstHour + index * HOUR);

  return {
    labels: hours.map(hour => toKoreanDateTime(new Date(hour)).slice(11, 16)),
    values: hours.map(hour => valuesByHour.get(hour) ?? 0),
  };
};

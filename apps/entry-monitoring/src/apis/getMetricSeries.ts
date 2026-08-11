import { http } from "./http";

export type MetricName = "API_REQUEST" | "VISITOR";
export type MetricInterval = "5m" | "30m" | "1h" | "1d";

export interface MetricPoint {
  t: string;
  v: number;
}

export interface MetricSeries {
  metric: MetricName;
  points: MetricPoint[];
}

export interface MetricSeriesData {
  from: string;
  to: string;
  interval: MetricInterval;
  series: MetricSeries[];
}

interface GetMetricSeriesParams {
  metrics: MetricName[];
  from?: string;
  to?: string;
  interval?: MetricInterval;
}

export const getMetricSeries = (params: GetMetricSeriesParams, signal?: AbortSignal) => {
  const query = new URLSearchParams({ metrics: params.metrics.join(",") });

  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.interval) query.set("interval", params.interval);

  return http.get<MetricSeriesData>(`/api/monitor/v11/metrics/series?${query}`, { signal });
};

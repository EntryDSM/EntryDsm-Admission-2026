import { http } from "./http";

export type ServiceHealthStatus = "UP" | "DEGRADED" | "DOWN";

export interface ServiceHealthDependency {
  name: string;
  status: ServiceHealthStatus;
}

export interface ServiceHealthItem {
  service: string;
  label: string;
  status: ServiceHealthStatus;
  responseTimeMs: number | null;
  version: string | null;
  dependencies: ServiceHealthDependency[];
}

export interface ServiceHealthData {
  overall: ServiceHealthStatus;
  checkedAt: string;
  services: ServiceHealthItem[];
}

export const getServiceHealth = (signal?: AbortSignal) =>
  http.get<ServiceHealthData>("/api/monitor/v1/health", { signal });

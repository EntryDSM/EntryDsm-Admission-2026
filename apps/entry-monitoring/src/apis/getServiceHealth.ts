import { http } from "./http";

export type ServiceHealthStatus = "UP" | "DEGRADED" | "DOWN";

export interface ServiceHealthDependency {
  name: string;
  status: string;
}

export interface ServiceHealthItem {
  service: string;
  label: string;
  status: string;
  responseTimeMs: number;
  version: string;
  dependencies: ServiceHealthDependency[];
}

export interface ServiceHealthData {
  overall: ServiceHealthStatus;
  checkedAt: string;
  services: ServiceHealthItem[];
}

export const getServiceHealth = (signal?: AbortSignal) =>
  http.get<ServiceHealthData>("/api/monitor/v11/health", { signal });

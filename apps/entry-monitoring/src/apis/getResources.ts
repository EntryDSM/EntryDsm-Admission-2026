import { http } from "./http";

export interface ResourcesData {
  database: {
    usedBytes: number;
    totalBytes: number | null;
    usageRatio: number | null;
    measuredAt: string;
  };
  bucket: {
    usedBytes: number;
    objectCount: number;
    measuredAt: string;
  };
  cacheTtlSeconds: number;
}

export const getResources = (signal?: AbortSignal) => http.get<ResourcesData>("/api/monitor/v11/resources", { signal });

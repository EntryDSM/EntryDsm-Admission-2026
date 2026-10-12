import type { GetApplicantsParams, GetNoticesParams, StatisticsMetric } from "./types";

export const adminQueryKeys = {
  account: {
    me: ["admin", "account", "me"] as const,
  },
  applicants: {
    all: ["admin", "applicants"] as const,
    list: (params: GetApplicantsParams) => ["admin", "applicants", "list", params] as const,
    detail: (applicantId: number) => ["admin", "applicants", "detail", applicantId] as const,
  },
  statistics: {
    all: ["admin", "statistics"] as const,
    byMetrics: (metrics: StatisticsMetric[]) => ["admin", "statistics", metrics] as const,
  },
  schedules: ["admin", "schedules"] as const,
  /** 원서 접수 기간 판정(일정 + 서버 시각) */
  applicationPeriod: ["admin", "application-period"] as const,
  documents: {
    photo: (photoFileId: string) => ["admin", "documents", "photo", photoFileId] as const,
  },
  admissionQuota: ["admin", "admission-quota"] as const,
  notices: {
    all: ["admin", "notices"] as const,
    list: (params: GetNoticesParams) => ["admin", "notices", "list", params] as const,
    detail: (noticeId: number) => ["admin", "notices", "detail", noticeId] as const,
  },
};

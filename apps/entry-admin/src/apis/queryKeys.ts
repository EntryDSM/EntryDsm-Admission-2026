import type { GetApplicantsParams, GetNoticesParams, GetQnasParams, StatisticsMetric } from "./types";

/** react-query 캐시 키 레지스트리. 키 구성을 한 곳에서 관리한다. */
export const adminQueryKeys = {
  applicants: {
    all: ["admin", "applicants"] as const,
    list: (params: GetApplicantsParams) => ["admin", "applicants", "list", params] as const,
    detail: (applicantId: number) => ["admin", "applicants", "detail", applicantId] as const,
  },
  statistics: (metrics: StatisticsMetric[]) => ["admin", "statistics", metrics] as const,
  schedules: ["admin", "schedules"] as const,
  notices: {
    all: ["admin", "notices"] as const,
    list: (params: GetNoticesParams) => ["admin", "notices", "list", params] as const,
    detail: (noticeId: number) => ["admin", "notices", "detail", noticeId] as const,
  },
  qnas: {
    all: ["admin", "qnas"] as const,
    list: (params: GetQnasParams) => ["admin", "qnas", "list", params] as const,
    detail: (faqId: number) => ["admin", "qnas", "detail", faqId] as const,
  },
};

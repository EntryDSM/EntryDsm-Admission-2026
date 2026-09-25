import type { GetApplicantsParams, GetNoticesParams, GetQnasParams, StatisticsMetric } from "./types";

/** react-query 캐시 키 레지스트리. 키 구성을 한 곳에서 관리한다. */
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
  /** 원서 접수 기간 판정(일정 + 서버 시각). 지원자 목록의 접수 취소 ↔ 2차 합격자 등록 버튼 분기에 쓴다. */
  applicationPeriod: ["admin", "application-period"] as const,
  documents: {
    /** 증명사진 서명 URL — photoFileId 별로 캐시한다 */
    photo: (photoFileId: string) => ["admin", "documents", "photo", photoFileId] as const,
  },
  /** 모집 정원은 단일 리소스라 파라미터 없는 고정 키를 쓴다. */
  admissionQuota: ["admin", "admission-quota"] as const,
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

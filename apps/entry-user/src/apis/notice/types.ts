export type NoticeCategory = "ADMISSION_NOTICE" | "PROSPECTIVE_STUDENT";

export interface NoticeSummary {
  noticeId: number;
  title: string;
  author: string;
  createdAt: string;
  division?: "Admissions Notice" | "Prospective Students Notice";
  isPinned?: boolean;
}

export interface NoticeDetail extends NoticeSummary {
  content: string;
  viewCount: number;
  updatedAt: string;
}

export interface NoticePageResponse {
  content: NoticeSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface NoticeEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

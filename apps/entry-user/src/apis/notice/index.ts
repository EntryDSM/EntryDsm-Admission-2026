import { useQuery } from "@tanstack/react-query";
import type { NoticeCategory, NoticeDetail, NoticeEnvelope, NoticePageResponse } from "./types";

export type { NoticeCategory, NoticeDetail, NoticeSummary } from "./types";

const path = "/api/notification/v11/notifications/notification";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const getNotice = async <T>(requestPath: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${requestPath}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("공지사항을 불러오지 못했습니다.");
  }

  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error("API 서버가 JSON이 아닌 응답을 반환했습니다.");
  }

  const body = (await response.json()) as NoticeEnvelope<T> | T;

  if (body !== null && typeof body === "object" && "data" in body) {
    return (body as NoticeEnvelope<T>).data;
  }

  return body as T;
};

/** 공지 목록 한 페이지의 개수. 백엔드 기본값(10)과 같다. */
export const NOTICE_PAGE_SIZE = 10;

/** 공지 목록 한 페이지. `page` 는 백엔드처럼 0부터 센다. 최신순(createdAt·id 내림차순)으로 온다. */
export const useGetAllNotice = (category: NoticeCategory, page = 0) => {
  const searchParams = new URLSearchParams({ category, page: String(page), size: String(NOTICE_PAGE_SIZE) });

  return useQuery({
    queryKey: ["notice", "list", category, page],
    queryFn: () => getNotice<NoticePageResponse>(`${path}?${searchParams.toString()}`),
    retry: false,
  });
};

export const useGetDetailNotice = (noticeId?: string) => {
  return useQuery({
    queryKey: ["notice", noticeId],
    queryFn: () => getNotice<NoticeDetail>(`${path}/${noticeId}`),
    retry: false,
    enabled: Boolean(noticeId),
  });
};

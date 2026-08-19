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

export const useGetAllNotice = (category: NoticeCategory) => {
  const searchParams = new URLSearchParams({ category });

  return useQuery({
    queryKey: ["notice", category],
    queryFn: () => getNotice<NoticePageResponse>(`${path}?${searchParams.toString()}`),
  });
};

export const useGetDetailNotice = (noticeId?: string) => {
  return useQuery({
    queryKey: ["notice", noticeId],
    queryFn: () => getNotice<NoticeDetail>(`${path}/${noticeId}`),
    enabled: Boolean(noticeId),
  });
};

import { API_BASE_URL } from "../utils/env";
import { getAccessToken } from "../utils/token";

/** HTTP 에러. status/code 를 담아 상위(토스트 등)에서 분기할 수 있게 한다. */
export class HttpError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const errorInfo = (body as ErrorBody | null)?.error;
    throw new HttpError(response.status, errorInfo?.message ?? response.statusText, errorInfo?.code);
  }

  // API 공통 규약의 `{ success, data }` 봉투를 쓰면 data 만 벗겨내고,
  // 봉투 없이 내려오면 본문을 그대로 반환한다.
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return (body as { data: T }).data;
  }

  return body as T;
};

export const http = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, payload?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "POST", body: payload === undefined ? undefined : JSON.stringify(payload) }),
  patch: <T>(path: string, payload?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: payload === undefined ? undefined : JSON.stringify(payload),
    }),
  put: <T>(path: string, payload?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "PUT", body: payload === undefined ? undefined : JSON.stringify(payload) }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "DELETE" }),
};

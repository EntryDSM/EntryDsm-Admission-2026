import {
  createRequestSignal,
  fetchWithAuthRefresh,
  getApiErrorMessage,
  getCsrfToken,
  readApiError,
} from "@entry/utils";
import { API_BASE_URL } from "../utils/env";

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

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

const isJsonResponse = (response: Response) =>
  response.headers.get("content-type")?.includes("application/json") ?? false;

/** 서비스마다 에러 본문 모양이 달라 `readApiError` 로 읽는다. 메시지는 토스트에 그대로 쓰인다. */
const createHttpError = (status: number, body: unknown) => {
  const errorInfo = readApiError(body);
  return new HttpError(status, getApiErrorMessage(status, errorInfo), errorInfo.code);
};

const toHttpError = async (response: Response) => {
  const body = isJsonResponse(response) ? await response.json().catch(() => null) : null;
  return createHttpError(response.status, body);
};

/** 인증 쿠키·CSRF 헤더·타임아웃을 붙여 요청한다. */
const send = async (path: string, options: RequestInit = {}): Promise<Response> => {
  return fetchWithAuthRefresh(
    API_BASE_URL,
    async () => {
      // 시도마다 새 시간 제한을 적용하고, 호출자가 전달한 취소 신호는 유지합니다.
      const signal = createRequestSignal(options.signal, options.body);
      const headers = new Headers(options.headers);
      // 본문 없는 GET 은 preflight 가 생기지 않게 Content-Type 을 붙이지 않는다. FormData 는 브라우저가 붙인다.
      if (
        options.body !== undefined &&
        options.body !== null &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
      ) {
        headers.set("Content-Type", "application/json");
      }

      // 변경 요청에는 CSRF 토큰을 붙인다.
      if (!SAFE_METHODS.includes((options.method ?? "GET").toUpperCase()) && !headers.has("X-XSRF-TOKEN")) {
        headers.set("X-XSRF-TOKEN", await getCsrfToken(API_BASE_URL, signal));
      }

      return fetch(`${API_BASE_URL}${path}`, {
        ...options,
        signal,
        credentials: "include",
        headers,
      });
    },
    options.credentials !== "omit"
  );
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await send(path, options);

  if (!response.ok) {
    throw await toHttpError(response);
  }

  const body = isJsonResponse(response) ? await response.json().catch(() => null) : null;

  // `{ success, data }` 봉투면 data 만 꺼내고, 봉투가 없으면 본문을 그대로 돌려준다.
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    if (!body.success) {
      throw createHttpError(response.status, body);
    }
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
  postFormData: <T>(path: string, formData: FormData, options?: RequestInit) =>
    request<T>(path, { ...options, method: "POST", body: formData }),
};

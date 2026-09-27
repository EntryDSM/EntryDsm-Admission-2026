import { createRequestSignal, getCsrfToken } from "@entry/utils";
import { API_BASE_URL } from "../utils/env";

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

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

const isJsonResponse = (response: Response) =>
  response.headers.get("content-type")?.includes("application/json") ?? false;

/** 실패 응답을 `HttpError` 로 바꾼다. 에러 봉투(`{ error: { code, message } }`)가 JSON 으로 오면 그 내용을 쓴다. */
const toHttpError = async (response: Response) => {
  const body = isJsonResponse(response) ? await response.json().catch(() => null) : null;
  const errorInfo = (body as ErrorBody | null)?.error;
  return new HttpError(response.status, errorInfo?.message ?? response.statusText, errorInfo?.code);
};

/** 인증 쿠키·CSRF 헤더·타임아웃 신호를 붙여 요청을 보내고 원본 `Response` 를 돌려준다. 상태 코드 판단은 호출자가 한다. */
const send = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const signal = createRequestSignal(options.signal);
  const headers = new Headers(options.headers);
  // body 없는 GET 이 preflight 없이 나가도록, 본문이 있을 때만 Content-Type 을 붙인다(entry-user 와 동일).
  // FormData 는 브라우저가 multipart boundary 를 포함한 Content-Type 을 직접 붙이므로 지정하지 않는다.
  if (
    options.body !== undefined &&
    options.body !== null &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  // HttpOnly 인증 쿠키는 JavaScript가 읽지 않고 브라우저가 요청에 포함한다.
  if (!SAFE_METHODS.includes((options.method ?? "GET").toUpperCase()) && !headers.has("X-XSRF-TOKEN")) {
    headers.set("X-XSRF-TOKEN", await getCsrfToken(API_BASE_URL, signal));
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    signal,
    credentials: "include",
    headers,
  });
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await send(path, options);

  if (!response.ok) {
    throw await toHttpError(response);
  }

  const body = isJsonResponse(response) ? await response.json().catch(() => null) : null;

  // API 공통 규약의 `{ success, data }` 봉투를 쓰면 data 만 벗겨내고,
  // 봉투 없이 내려오면 본문을 그대로 반환한다.
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    if (!body.success) {
      const errorInfo = (body as ErrorBody).error;
      throw new HttpError(response.status, errorInfo?.message ?? "API 요청이 실패했습니다.", errorInfo?.code);
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
  /** multipart 업로드(파일 첨부). 인증 쿠키·CSRF 헤더는 JSON 요청과 같이 붙고, Content-Type 만 브라우저에 맡긴다. */
  postFormData: <T>(path: string, formData: FormData, options?: RequestInit) =>
    request<T>(path, { ...options, method: "POST", body: formData }),
};

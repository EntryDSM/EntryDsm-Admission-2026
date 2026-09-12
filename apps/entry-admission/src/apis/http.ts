import { createRequestSignal, getCsrfToken } from "@entry/utils";
import type { ApiResponse } from "./types";

// HTTP 실패 상태와 서버 응답 본문을 호출 화면까지 전달하는 공통 오류 객체.
export class HttpError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface HttpRequestOptions extends Omit<RequestInit, "body" | "headers" | "method"> {
  // false이면 공개 API 요청으로 처리해 인증 쿠키와 X-XSRF-TOKEN 헤더를 보내지 않습니다.
  auth?: boolean;
  // 호출 화면이 추가 헤더나 AbortSignal을 전달할 때 사용합니다.
  headers?: HeadersInit;
  // undefined가 아닌 값만 URL query string으로 직렬화합니다.
  params?: Record<string, string | number | boolean | undefined>;
}

// undefined가 아닌 쿼리 파라미터만 URL에 붙입니다.
const createPath = (path: string, params?: HttpRequestOptions["params"]) => {
  if (!params) {
    return path;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};

// HttpOnly 인증 쿠키는 브라우저가 싣고, FormData에는 브라우저가 boundary를 설정하도록 둡니다.
const createHeaders = async (method: string, body: BodyInit | null | undefined, options: HttpRequestOptions) => {
  const headers = new Headers(options.headers);

  if (body !== undefined && body !== null && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && !["GET", "HEAD", "OPTIONS"].includes(method) && !headers.has("X-XSRF-TOKEN")) {
    headers.set("X-XSRF-TOKEN", await getCsrfToken(import.meta.env.VITE_API_BASE_URL, options.signal));
  }

  return headers;
};

// Http 전용 옵션을 제거한 뒤 fetch가 이해하는 RequestInit만 남깁니다.
const createRequestOptions = (options: HttpRequestOptions): RequestInit => {
  const requestOptions = { ...options };
  delete requestOptions.auth;
  delete requestOptions.headers;
  delete requestOptions.params;
  return requestOptions;
};

const createRequestUrl = (path: string, options: HttpRequestOptions) =>
  `${import.meta.env.VITE_API_BASE_URL}${createPath(path, options.params)}`;

// HttpOnly 인증 쿠키는 브라우저가 싣습니다. 401 은 토큰 재발급 없이 그대로 HttpError 로 올려 보내고,
// 로그인 페이지 이동은 RequireAuth 가드가 담당합니다 (entry-user·entry-admin 클라이언트와 같은 흐름).
const fetchApi = async (
  path: string,
  method: string,
  body: BodyInit | null | undefined,
  options: HttpRequestOptions
) => {
  options = { ...options, signal: createRequestSignal(options.signal) };

  return fetch(createRequestUrl(path, options), {
    ...createRequestOptions(options),
    method,
    body,
    headers: await createHeaders(method, body, options),
    credentials: options.auth === false ? "omit" : "include",
    signal: options.signal,
  });
};

// 프록시나 서버 장애로 JSON이 아닌 오류 본문이 와도 HTTP 상태와 본문을 함께 보존합니다.
const parseResponseBody = <T>(responseText: string): ApiResponse<T> | string | null => {
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as ApiResponse<T>;
  } catch {
    return responseText;
  }
};

// JSON API 응답을 공통 처리하고, success/data 래퍼가 있으면 data만 반환합니다.
const request = async <T>(
  path: string,
  method: string,
  body?: BodyInit | null,
  options: HttpRequestOptions = {}
): Promise<T> => {
  const response = await fetchApi(path, method, body, options);

  const responseText = await response.text();
  const responseBody = parseResponseBody<T>(responseText);

  if (!response.ok) {
    throw new HttpError("API 요청이 실패했습니다.", response.status, responseBody);
  }

  if (responseBody && typeof responseBody === "object" && "success" in responseBody && "data" in responseBody) {
    if (!responseBody.success) {
      throw new HttpError("API 요청이 실패했습니다.", response.status, responseBody);
    }

    return responseBody.data;
  }

  return responseBody as T;
};

// PDF처럼 JSON이 아닌 바이너리 응답을 Blob으로 반환합니다.
const requestBlob = async (path: string, method: string, body?: BodyInit | null, options: HttpRequestOptions = {}) => {
  const response = await fetchApi(path, method, body, options);

  if (!response.ok) {
    throw new HttpError("API 요청이 실패했습니다.", response.status, await response.text());
  }

  return response.blob();
};

// 앱의 모든 HTTP 요청에서 사용할 메서드별 진입점입니다.
export const Http = {
  get: <T>(path: string, options?: HttpRequestOptions) => request<T>(path, "GET", null, options),
  post: <T>(path: string, data: unknown, options?: HttpRequestOptions) =>
    request<T>(path, "POST", JSON.stringify(data), options),
  patch: <T>(path: string, data: unknown, options?: HttpRequestOptions) =>
    request<T>(path, "PATCH", JSON.stringify(data), options),
  postFormData: <T>(path: string, data: FormData, options?: HttpRequestOptions) =>
    request<T>(path, "POST", data, options),
  patchFormData: <T>(path: string, data: FormData, options?: HttpRequestOptions) =>
    request<T>(path, "PATCH", data, options),
  postBlob: (path: string, data: unknown, options?: HttpRequestOptions) =>
    requestBlob(path, "POST", JSON.stringify(data), options),
};

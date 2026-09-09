import type { ApiResponse } from "./types";

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
  auth?: boolean;
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean | undefined>;
}

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

const createHeaders = async (method: string, body: BodyInit | null | undefined, options: HttpRequestOptions) => {
  const headers = new Headers(options.headers);

  if (body !== undefined && body !== null && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && !["GET", "HEAD", "OPTIONS"].includes(method) && !headers.has("X-XSRF-TOKEN")) {
    const data = await request<{ token?: unknown } | null>("/api/identity/v11/auth/csrf", "GET");
    const token = typeof data?.token === "string" ? data.token.trim() : "";

    if (!token) {
      throw new HttpError("보안 토큰을 발급받지 못했습니다. 잠시 후 다시 시도해 주세요.", 422, data);
    }

    headers.set("X-XSRF-TOKEN", token);
  }

  return headers;
};

const createRequestOptions = (options: HttpRequestOptions): RequestInit => {
  const requestOptions = { ...options };
  delete requestOptions.auth;
  delete requestOptions.headers;
  delete requestOptions.params;
  return requestOptions;
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

const request = async <T>(
  path: string,
  method: string,
  body?: BodyInit | null,
  options: HttpRequestOptions = {}
): Promise<T> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${createPath(path, options.params)}`, {
    ...createRequestOptions(options),
    method,
    body,
    headers: await createHeaders(method, body, options),
    // HttpOnly 인증 쿠키는 JavaScript가 읽지 않고 브라우저가 요청에 포함합니다.
    credentials: options.auth === false ? "omit" : "include",
  });

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

const requestBlob = async (path: string, method: string, body?: BodyInit | null, options: HttpRequestOptions = {}) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${createPath(path, options.params)}`, {
    ...createRequestOptions(options),
    method,
    body,
    headers: await createHeaders(method, body, options),
    credentials: options.auth === false ? "omit" : "include",
  });

  if (!response.ok) {
    throw new HttpError("API 요청이 실패했습니다.", response.status, await response.text());
  }

  return response.blob();
};

export const Http = {
  get: <T>(path: string, options?: HttpRequestOptions) => request<T>(path, "GET", null, options),
  post: <T>(path: string, data: unknown, options?: HttpRequestOptions) =>
    request<T>(path, "POST", JSON.stringify(data), options),
  patch: <T>(path: string, data: unknown, options?: HttpRequestOptions) =>
    request<T>(path, "PATCH", JSON.stringify(data), options),
  delete: <T>(path: string, options?: HttpRequestOptions) => request<T>(path, "DELETE", null, options),
  postFormData: <T>(path: string, data: FormData, options?: HttpRequestOptions) =>
    request<T>(path, "POST", data, options),
  patchFormData: <T>(path: string, data: FormData, options?: HttpRequestOptions) =>
    request<T>(path, "PATCH", data, options),
  postBlob: (path: string, data: unknown, options?: HttpRequestOptions) =>
    requestBlob(path, "POST", JSON.stringify(data), options),
};

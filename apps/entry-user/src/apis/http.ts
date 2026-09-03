import type { ApiResponse } from "./types";
import { getAccessToken } from "../utils/token";

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

const createHeaders = (body: BodyInit | null | undefined, options: HttpRequestOptions) => {
  const headers = new Headers(options.headers);
  const token = options.auth === false ? null : getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body !== undefined && body !== null && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
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

const request = async <T>(
  path: string,
  method: string,
  body?: BodyInit | null,
  options: HttpRequestOptions = {}
): Promise<T> => {
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}${createPath(path, options.params)}`, {
    ...createRequestOptions(options),
    method,
    body,
    headers: createHeaders(body, options),
  });

  const responseText = await response.text();
  const responseBody = responseText ? (JSON.parse(responseText) as ApiResponse<T>) : null;

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
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}${createPath(path, options.params)}`, {
    ...createRequestOptions(options),
    method,
    body,
    headers: createHeaders(body, options),
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
  postFormData: <T>(path: string, data: FormData, options?: HttpRequestOptions) =>
    request<T>(path, "POST", data, options),
  patchFormData: <T>(path: string, data: FormData, options?: HttpRequestOptions) =>
    request<T>(path, "PATCH", data, options),
  postBlob: (path: string, data: unknown, options?: HttpRequestOptions) =>
    requestBlob(path, "POST", JSON.stringify(data), options),
};

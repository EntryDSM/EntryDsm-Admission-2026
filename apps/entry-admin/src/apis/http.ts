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

/**
 * 파일 본문을 그대로 내려주는 응답(ZIP 스트리밍 등)을 받은 결과.
 * `fileName` 은 `Content-Disposition` 에서 읽는데, 게이트웨이 CORS 가 그 헤더를 노출하지 않으면(exposedHeaders 에 없음) null 이다.
 */
export interface DownloadedFile {
  blob: Blob;
  fileName: string | null;
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * `Content-Disposition: attachment; filename="…"; filename*=UTF-8''…` 에서 파일명을 읽는다.
 * Spring 은 한글 파일명을 quoted-printable `filename` 과 RFC 5987 `filename*` 둘 다로 쓰므로 `filename*` 을 우선한다.
 */
const parseContentDispositionFileName = (header: string | null): string | null => {
  if (!header) {
    return null;
  }

  const extended = /filename\*\s*=\s*utf-8''([^;]+)/i.exec(header);
  if (extended) {
    try {
      return decodeURIComponent(extended[1].trim()) || null;
    } catch {
      // 잘못 인코딩된 값이면 아래의 일반 filename 으로 넘어간다.
    }
  }

  const plain = /filename\s*=\s*(?:"([^"]*)"|([^;]+))/i.exec(header);
  const fileName = (plain?.[1] ?? plain?.[2])?.trim();
  return fileName ? fileName : null;
};

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

/**
 * 파일 본문을 그대로 받는 요청(예: ZIP 스트리밍). 성공하면 Blob 과 `Content-Disposition` 파일명을 돌려주고,
 * 실패는 JSON 에러 봉투를 읽어 `HttpError` 로 던진다.
 * 본문을 다 받을 때까지 기다리므로 큰 파일은 공용 타임아웃(30초)에 걸릴 수 있다 — 호출자가 `signal` 로 넉넉히 준다.
 */
const requestFile = async (path: string, options: RequestInit = {}): Promise<DownloadedFile> => {
  const response = await send(path, options);

  if (!response.ok) {
    throw await toHttpError(response);
  }

  return {
    blob: await response.blob(),
    fileName: parseContentDispositionFileName(response.headers.get("content-disposition")),
  };
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
  /** 파일 본문을 직접 내려주는 GET(ZIP 등). JSON 봉투를 벗기지 않고 Blob 으로 돌려준다. */
  getFile: (path: string, options?: RequestInit) => requestFile(path, { ...options, method: "GET" }),
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const ACCESS_TOKEN_COOKIE_KEY = "accessToken";

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
  error?: string | { code?: string; message?: string };
}

interface ApiEnvelope<T> extends ErrorBody {
  success: boolean;
  data: T | null;
}

const getAccessToken = () => {
  const match = document.cookie.split("; ").find(row => row.startsWith(`${ACCESS_TOKEN_COOKIE_KEY}=`));
  return match ? decodeURIComponent(match.slice(ACCESS_TOKEN_COOKIE_KEY.length + 1)) : undefined;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const body = isJson ? await response.json().catch(() => null) : null;
  const error = (body as ErrorBody | null)?.error;
  const errorInfo = typeof error === "string" ? { message: error } : error;

  if (!response.ok) {
    throw new HttpError(response.status, errorInfo?.message ?? response.statusText, errorInfo?.code);
  }

  if (body && typeof body === "object" && "success" in body && "data" in body) {
    const envelope = body as ApiEnvelope<T>;

    if (!envelope.success || envelope.data === null) {
      throw new HttpError(response.status, errorInfo?.message ?? "응답 데이터가 없습니다.", errorInfo?.code);
    }

    return envelope.data;
  }

  return body as T;
};

export const http = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "GET" }),
};

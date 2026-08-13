const API_BASE_URL = import.meta.env.VITE_IDENTITY_API_URL?.replace(/\/$/, "") ?? "";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: unknown;
}

export interface PassInfo {
  phone: string;
  name: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  role: string;
  status: string;
}

export type SignupType = "SELF" | "PARENT";

export interface SignupRequest extends PassInfo {
  password: string;
  birthdate: string;
  signupType: SignupType;
}

export interface SignupResponse {
  userId: string;
  role: string;
  status: string;
  profile: PassInfo & {
    birthdate: string;
    signupType: SignupType;
    applicantStatus: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class IdentityApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "IdentityApiError";
    this.status = status;
    this.code = code;
  }
}

const getErrorDetails = (body: unknown) => {
  if (!body || typeof body !== "object") return {};

  const error = (body as { error?: unknown }).error;
  if (typeof error === "string") return { message: error };
  if (!error || typeof error !== "object") return {};

  const detail = error as { code?: unknown; message?: unknown };
  return {
    code: typeof detail.code === "string" ? detail.code : undefined,
    message: typeof detail.message === "string" ? detail.message : undefined,
  };
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
  });
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const { code, message } = getErrorDetails(body);
    throw new IdentityApiError(response.status, message ?? `요청에 실패했습니다. (${response.status})`, code);
  }

  if (body && typeof body === "object" && "success" in body) {
    const envelope = body as ApiEnvelope<T>;
    if (!envelope.success) {
      const { code, message } = getErrorDetails(envelope);
      throw new IdentityApiError(response.status, message ?? "요청에 실패했습니다.", code);
    }
    return envelope.data;
  }

  return body as T;
};

export const createPassPopup = async (redirectUrl: string) =>
  request<string>("/api/identity/v11/auth/pass/popup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirectUrl }),
  });

export const getPassInfo = (modelToken: string) =>
  request<PassInfo>(`/api/identity/v11/auth/pass/info?mdl_tkn=${encodeURIComponent(modelToken)}`);

export const signup = (payload: SignupRequest) =>
  request<SignupResponse>("/api/identity/v11/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const login = (payload: LoginRequest) =>
  request<LoginResponse>("/api/identity/v11/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

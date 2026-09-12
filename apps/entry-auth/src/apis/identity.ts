import { resolveRequiredUrl } from "@entry/utils";

const API_BASE_URL = resolveRequiredUrl(
  "VITE_IDENTITY_API_URL",
  import.meta.env.VITE_IDENTITY_API_URL as string | undefined,
  import.meta.env.PROD
);

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

export interface CsrfResponse {
  token: string;
}

export interface PasswordResetRequest {
  loginId: string;
  name: string;
  birthdate: string;
  newPassword: string;
}

export type SignupType = "SELF" | "PARENT";

export interface SignupRequest extends PassInfo {
  password: string;
  birthdate: string;
  signupType: SignupType;
  is_sensitive_agree: boolean;
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

export const getPassInfo = async (modelToken: string): Promise<PassInfo> => {
  const data = await request<{ name?: unknown; phoneNumber?: unknown; phone?: unknown } | null>(
    `/api/identity/v11/auth/pass/info?mdl_tkn=${encodeURIComponent(modelToken)}`
  );
  const phoneNumber = typeof data?.phoneNumber === "string" ? data.phoneNumber.replace(/\D/g, "") : "";
  const phone = phoneNumber || (typeof data?.phone === "string" ? data.phone.replace(/\D/g, "") : "");
  const name = typeof data?.name === "string" ? data.name.trim() : "";

  if (!name || !/^01\d{8,9}$/.test(phone)) {
    throw new IdentityApiError(
      422,
      "PASS 인증 결과에 이름 또는 전화번호가 없습니다. 인증을 다시 진행해 주세요.",
      "INVALID_PASS_INFO"
    );
  }

  return { name, phone };
};

export const getCsrfToken = async (): Promise<CsrfResponse> => {
  const data = await request<{ token?: unknown } | null>("/api/identity/v11/auth/csrf");
  const token = typeof data?.token === "string" ? data.token.trim() : "";

  if (!token) {
    throw new IdentityApiError(
      422,
      "보안 토큰을 발급받지 못했습니다. 잠시 후 다시 시도해 주세요.",
      "INVALID_CSRF_TOKEN"
    );
  }

  return { token };
};

export const signup = async (payload: SignupRequest) => {
  const { token } = await getCsrfToken();

  return request<SignupResponse>("/api/identity/v11/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
    body: JSON.stringify(payload),
  });
};

export const login = async (payload: LoginRequest) => {
  const { token } = await getCsrfToken();

  return request<LoginResponse>("/api/identity/v11/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
    body: JSON.stringify(payload),
  });
};

export const refreshToken = () =>
  request<null>("/api/identity/v11/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

export const resetPassword = async (payload: PasswordResetRequest) => {
  const { token } = await getCsrfToken();

  return request<null>("/api/identity/v11/auth/password-reset", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
    body: JSON.stringify(payload),
  });
};

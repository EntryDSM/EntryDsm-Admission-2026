const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

export const createRequestSignal = (signal?: AbortSignal | null): AbortSignal =>
  signal ?? AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS);

export class CsrfTokenError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(status: number, body: unknown) {
    super("보안 토큰을 발급받지 못했습니다. 잠시 후 다시 시도해 주세요.");
    this.name = "CsrfTokenError";
    this.status = status;
    this.body = body;
  }
}

// 토큰 재사용 계약이 없으므로 캐시하거나 실패한 변경 요청을 자동 재전송하지 않습니다.
export const getCsrfToken = async (baseUrl: string, signal?: AbortSignal | null): Promise<string> => {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/identity/v11/auth/csrf`, {
    credentials: "include",
    signal: createRequestSignal(signal),
  });
  const text = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new CsrfTokenError(response.ok ? 422 : response.status, text);
  }
  if (!response.ok || (body && typeof body === "object" && "success" in body && !body.success)) {
    throw new CsrfTokenError(response.status, body);
  }
  const data = body && typeof body === "object" && "data" in body ? body.data : body;
  const token =
    data && typeof data === "object" && "token" in data && typeof data.token === "string" ? data.token.trim() : "";
  if (!token) throw new CsrfTokenError(422, body);
  return token;
};

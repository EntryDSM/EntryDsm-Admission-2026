const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

/**
 * 파일 업로드(multipart) 제한시간. 증명사진(5MB)·공지 첨부(20MB)를 느린 회선에서도 끝까지 보내도록 넉넉히 둔다
 * (0.5Mbps 면 20MB 에 약 5분). 게이트웨이의 응답 제한시간은 본문을 다 보낸 뒤부터 재므로 업로드 시간에는 걸리지 않는다.
 */
export const UPLOAD_REQUEST_TIMEOUT_MS = 10 * 60_000;

/**
 * 호출자가 준 signal 이 없으면 제한시간 signal 을 만든다. 일반 요청은 30초, 업로드 본문(FormData)은 10분이다.
 * 30초로 일괄 끊으면 느린 회선에서 사진·첨부 업로드가 중간에 끊긴다.
 */
export const createRequestSignal = (signal?: AbortSignal | null, body?: unknown): AbortSignal =>
  signal ??
  AbortSignal.timeout(
    typeof FormData !== "undefined" && body instanceof FormData ? UPLOAD_REQUEST_TIMEOUT_MS : DEFAULT_REQUEST_TIMEOUT_MS
  );

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

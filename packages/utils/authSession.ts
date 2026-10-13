import { createRequestSignal, getCsrfToken } from "./csrf.ts";

const REFRESH_PATH = "/api/identity/v11/auth/token";
let refreshInFlight: Promise<boolean> | null = null;

/** Refresh the HttpOnly auth cookie through the identity API. */
export const refreshToken = (baseUrl: string): Promise<boolean> => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const signal = createRequestSignal();
      const csrfToken = await getCsrfToken(baseUrl, signal);
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}${REFRESH_PATH}`, {
        method: "POST",
        credentials: "include",
        signal,
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) return false;
      if (response.headers.get("content-type")?.includes("application/json")) {
        const body: unknown = await response.json().catch(() => null);
        if (body && typeof body === "object" && "success" in body && !(body as { success: unknown }).success) {
          return false;
        }
      }
      return true;
    } catch {
      // A failed refresh leaves the original API 401 intact.
      return false;
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

/**
 * 401 응답이면 토큰을 한 번 갱신한 뒤 원래 요청을 한 번 재시도합니다.
 * `request`가 두 번 호출될 수 있으므로 요청 본문은 재사용할 수 있어야 합니다. JSON 문자열과 FormData는 지원하지만,
 * 첫 fetch에서 소비될 수 있는 `ReadableStream` 본문은 지원하지 않습니다.
 */
export const fetchWithAuthRefresh = async (
  baseUrl: string,
  request: () => Promise<Response>,
  enabled = true
): Promise<Response> => {
  const response = await request();
  if (!enabled || response.status !== 401) return response;
  return (await refreshToken(baseUrl)) ? request() : response;
};

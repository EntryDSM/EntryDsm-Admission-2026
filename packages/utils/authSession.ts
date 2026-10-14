import { readApiError } from "./apiError.ts";
import { createRequestSignal, getCsrfToken } from "./csrf.ts";

const REFRESH_PATH = "/api/identity/v11/auth/token";
let refreshInFlight: Promise<boolean> | null = null;
// 갱신이 거절되면(비로그인 등) 인증 요청이 다시 성공할 때까지 401 마다 갱신을 반복하지 않는다.
let isRefreshRejected = false;

const postRefresh = async (baseUrl: string) => {
  const signal = createRequestSignal();
  const csrfToken = await getCsrfToken(baseUrl, signal);
  return fetch(`${baseUrl.replace(/\/$/, "")}${REFRESH_PATH}`, {
    method: "POST",
    credentials: "include",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": csrfToken,
    },
    body: JSON.stringify({}),
  });
};

const readErrorCode = async (response: Response) => {
  if (response.ok) return undefined;
  try {
    return readApiError(await response.clone().json()).code;
  } catch {
    return undefined;
  }
};

/** Refresh the HttpOnly auth cookie through the identity API. */
export const refreshToken = (baseUrl: string): Promise<boolean> => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      let response = await postRefresh(baseUrl);
      // CSRF 쿠키가 없을 때(브라우저 재시작 직후) 다른 요청과 동시에 토큰을 받으면 나중 쿠키만 남아 토큰이 어긋난다.
      if ((await readErrorCode(response)) === "CSRF_INVALID") {
        response = await postRefresh(baseUrl);
      }

      if (response.status === 401 || (response.status === 403 && (await readErrorCode(response)) !== "CSRF_INVALID")) {
        isRefreshRejected = true;
        return false;
      }
      if (!response.ok) return false;
      if (response.headers.get("content-type")?.includes("application/json")) {
        const body: unknown = await response.json().catch(() => null);
        if (body && typeof body === "object" && "success" in body && !(body as { success: unknown }).success) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

/**
 * 401 응답이면 토큰을 한 번 갱신한 뒤 원래 요청을 한 번 재시도합니다.
 * 갱신 토큰은 한 번만 쓸 수 있어 다른 탭·앱이 먼저 갱신하면 여기서는 거절되므로, 갱신에 실패해도 바뀐 쿠키로 한 번 더 보냅니다.
 * `request`가 두 번 호출될 수 있으므로 요청 본문은 재사용할 수 있어야 합니다. JSON 문자열과 FormData는 지원하지만,
 * 첫 fetch에서 소비될 수 있는 `ReadableStream` 본문은 지원하지 않습니다.
 */
export const fetchWithAuthRefresh = async (
  baseUrl: string,
  request: () => Promise<Response>,
  enabled = true
): Promise<Response> => {
  const response = await request();
  if (!enabled) return response;
  if (response.status !== 401) {
    if (response.ok) isRefreshRejected = false;
    return response;
  }
  if (isRefreshRejected) return response;
  if (await refreshToken(baseUrl)) return request();

  const retried = await request();
  if (retried.ok) isRefreshRejected = false;
  return retried;
};

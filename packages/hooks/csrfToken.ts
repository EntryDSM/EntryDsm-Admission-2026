import { getCsrfToken } from "@entry/utils";

// 게이트웨이는 로그인 쿠키(access_token)가 실린 변경 요청에 XSRF-TOKEN 쿠키와 X-XSRF-TOKEN 헤더의
// 일치(더블서브밋)만 검사하고, 같은 쿠키에는 같은 토큰을 돌려주며 회전하지 않습니다.
// 모니터링은 15초 하트비트로 반복 호출되고 페이지 이탈 시점에는 재발급 왕복이 불가능하므로,
// 매 요청 발급하는 앱 API 레이어와 달리 토큰을 모듈 수준에서 캐시해 재사용합니다.
let cachedToken: string | null = null;
let pendingToken: Promise<string | null> | null = null;

export const ensureCsrfToken = (apiBaseUrl: string): Promise<string | null> => {
  if (cachedToken) return Promise.resolve(cachedToken);
  pendingToken ??= getCsrfToken(apiBaseUrl)
    .then(token => {
      cachedToken = token;
      return token;
    })
    // 모니터링은 사용자 흐름을 방해하지 않아야 하므로 발급 실패는 토큰 없음으로 처리합니다.
    .catch(() => null)
    .finally(() => {
      pendingToken = null;
    });
  return pendingToken;
};

export const getCachedCsrfToken = (): string | null => cachedToken;

// 403(CSRF_INVALID)은 캐시 토큰이 쿠키와 어긋난 경우이므로 무효화해 다음 요청에서 재발급합니다.
export const invalidateCsrfToken = () => {
  cachedToken = null;
};

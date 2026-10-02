// 앱의 TypeScript 빌드는 hooks 소스를 직접 검사하므로 워크스페이스 별칭 대신 소스 경로를 사용합니다.
import { getCsrfToken } from "../utils/csrf.ts";

// 모니터링 변경 요청은 로그인 여부와 무관하게 CSRF 토큰을 확보한 뒤 전송합니다.
// 모니터링은 15초 하트비트로 반복 호출되고 페이지 이탈 시점에는 재발급 왕복이 불가능하므로,
// 매 요청 발급하는 앱 API 레이어와 달리 토큰을 모듈 수준에서 캐시해 재사용합니다.
let cachedToken: string | null = null;
let pendingToken: Promise<string | null> | null = null;

export const ensureCsrfToken = (apiBaseUrl: string): Promise<string | null> => {
  if (cachedToken) return Promise.resolve(cachedToken);

  if (pendingToken) return pendingToken;

  const tokenPromise = getCsrfToken(apiBaseUrl)
    .then(token => {
      cachedToken = token;
      return token;
    })
    // 모니터링은 사용자 흐름을 방해하지 않아야 하므로 발급 실패는 토큰 없음으로 처리합니다.
    .catch(() => null)
    .finally(() => {
      pendingToken = null;
    });
  pendingToken = tokenPromise;
  return tokenPromise;
};

export const getCachedCsrfToken = (): string | null => cachedToken;

// 403(CSRF_INVALID)은 캐시 토큰이 쿠키와 어긋난 경우이므로 무효화해 다음 요청에서 재발급합니다.
export const invalidateCsrfToken = () => {
  cachedToken = null;
};

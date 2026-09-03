const DEFAULT_API_BASE_URL = "http://localhost:3000";

/**
 * API 서버 origin 을 결정한다.
 * Vite 는 `VITE_` 접두사가 붙은 환경 변수만 클라이언트에 노출한다.
 * - 값이 있으면 그대로 사용한다.
 * - 프로덕션 빌드(`import.meta.env.PROD`)에서 값이 없으면 조용한 오작동 대신 즉시 실패시킨다.
 * - 그 외(개발 등)에서는 로컬 개발 서버로 폴백한다.
 */
const resolveApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (configured) {
    return configured;
  }

  if (import.meta.env.PROD) {
    throw new Error(
      "환경 변수 VITE_API_BASE_URL 이 설정되지 않았습니다. 프로덕션 빌드에는 API origin 설정이 필요합니다."
    );
  }

  return DEFAULT_API_BASE_URL;
};

export const API_BASE_URL = resolveApiBaseUrl();

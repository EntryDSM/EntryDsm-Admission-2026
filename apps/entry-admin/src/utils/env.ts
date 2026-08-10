const DEFAULT_API_BASE_URL = "http://localhost:3000";

/**
 * API 서버 origin. Vite 는 `VITE_` 접두사가 붙은 환경 변수만 클라이언트에 노출하므로
 * `.env` 에 `VITE_API_BASE_URL` 을 정의한다. 값이 없으면 로컬 개발 서버로 폴백한다.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL;

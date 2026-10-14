const DEFAULT_API_BASE_URL = "http://localhost:3000";

/** 프로덕션 빌드에서 값이 없으면 바로 실패시키고, 개발에서는 로컬 서버로 폴백한다. */
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

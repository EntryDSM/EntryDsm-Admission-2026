import { resolveRequiredUrl } from "@entry/utils";

// 앱 간 이동 링크는 배포 환경(prod/stag)마다 도메인이 다르므로 빌드 타임 env 로 주입받는다.
// 값 목록과 주입 방법은 docs/DEPLOYMENT.md 7-4 참고.
export const USER_APP_URL = resolveRequiredUrl(
  "VITE_USER_APP_URL",
  import.meta.env.VITE_USER_APP_URL as string | undefined,
  import.meta.env.PROD
);

export const AUTH_APP_URL = resolveRequiredUrl(
  "VITE_AUTH_APP_URL",
  import.meta.env.VITE_AUTH_APP_URL as string | undefined,
  import.meta.env.PROD
);

export const AWS_CONSOLE_URL = resolveRequiredUrl(
  "VITE_AWS_CONSOLE_URL",
  import.meta.env.VITE_AWS_CONSOLE_URL as string | undefined,
  import.meta.env.PROD
);

import { resolveRequiredUrl } from "@entry/utils";

// entry-user 에서만 쓰는 외부 링크. 공용 링크(USER/AUTH)는 @entry/ui 의 env 를 사용한다.
export const ADMISSION_APP_URL = resolveRequiredUrl(
  "VITE_ADMISSION_APP_URL",
  import.meta.env.VITE_ADMISSION_APP_URL as string | undefined,
  import.meta.env.PROD
);

export const SCHOOL_HOMEPAGE_URL = resolveRequiredUrl(
  "VITE_SCHOOL_HOMEPAGE_URL",
  import.meta.env.VITE_SCHOOL_HOMEPAGE_URL as string | undefined,
  import.meta.env.PROD
);

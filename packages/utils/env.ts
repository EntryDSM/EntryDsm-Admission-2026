/**
 * 빌드 타임에 주입되는 URL 환경 변수를 해석한다.
 * Vite 는 `VITE_` 접두사가 붙은 환경 변수만 클라이언트에 노출한다.
 * - 값이 있으면 끝의 `/` 를 제거해 사용한다.
 * - 프로덕션 빌드에서 값이 없으면 조용한 오작동 대신 즉시 실패시킨다.
 * - 그 외(개발 등)에서는 경고 후 빈 문자열을 반환해 현재 origin 기준으로 동작한다.
 *
 * 이 패키지는 Vite 밖(테스트 등)에서도 쓰일 수 있으므로 `import.meta.env` 를
 * 직접 읽지 않고 호출부에서 값과 PROD 여부를 넘겨받는다.
 */
export const resolveRequiredUrl = (name: string, value: string | undefined, isProd: boolean): string => {
  if (value) {
    return value.replace(/\/$/, "");
  }

  if (isProd) {
    throw new Error(`환경 변수 ${name} 이(가) 설정되지 않았습니다. 프로덕션 빌드에는 필수입니다.`);
  }

  console.warn(`[env] ${name} 이(가) 설정되지 않아 빈 문자열로 동작합니다. .env 파일을 확인하세요.`);
  return "";
};

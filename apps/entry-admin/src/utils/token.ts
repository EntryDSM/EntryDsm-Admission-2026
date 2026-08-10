/** 관리자 액세스 토큰이 저장되는 쿠키 키. 인증 방식이 바뀌면 이 상수만 교체하면 된다. */
export const ACCESS_TOKEN_COOKIE_KEY = "accessToken";

/** 브라우저 쿠키에서 값을 읽는다. SSR 등 document 가 없으면 undefined. */
const readCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const match = document.cookie.split("; ").find(row => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
};

export const getAccessToken = () => readCookie(ACCESS_TOKEN_COOKIE_KEY);

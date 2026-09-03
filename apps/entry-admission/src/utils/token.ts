// API Authorization 헤더에 사용할 토큰의 쿠키 이름입니다.
const ACCESS_TOKEN_KEY = "accessToken";
// access token 재발급에 사용할 refresh token의 쿠키 이름입니다.
const REFRESH_TOKEN_KEY = "refreshToken";

// 브라우저 쿠키에서 토큰을 읽고 URL 인코딩을 되돌립니다.
const readCookie = (name: string) => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie.split("; ").find(row => row.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

// 토큰이 모든 원서 경로에서 공유되도록 Path=/와 SameSite=Lax로 저장합니다.
const writeCookie = (name: string, value: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
};

// 같은 Path/SameSite 설정으로 만료 쿠키를 써서 토큰을 삭제합니다.
const removeCookie = (name: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

// Http 클라이언트가 Authorization 헤더를 만들 때 사용합니다.
export const getAccessToken = () => readCookie(ACCESS_TOKEN_KEY);

// 로그인 또는 토큰 재발급 성공 후 access token을 갱신합니다.
export const setAccessToken = (token: string) => {
  writeCookie(ACCESS_TOKEN_KEY, token);
};

// 로그아웃 또는 인증 만료 처리에서 access token을 제거합니다.
export const removeAccessToken = () => {
  removeCookie(ACCESS_TOKEN_KEY);
};

// refresh token은 재발급 흐름에서만 직접 읽고 갱신합니다.
export const getRefreshToken = () => readCookie(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string) => {
  writeCookie(REFRESH_TOKEN_KEY, token);
};

export const removeRefreshToken = () => {
  removeCookie(REFRESH_TOKEN_KEY);
};

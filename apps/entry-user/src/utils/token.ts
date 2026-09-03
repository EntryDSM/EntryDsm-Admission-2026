const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const readCookie = (name: string) => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie.split("; ").find(row => row.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

const writeCookie = (name: string, value: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
};

const removeCookie = (name: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const getAccessToken = () => readCookie(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string) => {
  writeCookie(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = () => {
  removeCookie(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => readCookie(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string) => {
  writeCookie(REFRESH_TOKEN_KEY, token);
};

export const removeRefreshToken = () => {
  removeCookie(REFRESH_TOKEN_KEY);
};

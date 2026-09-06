const ACCESS_TOKEN_KEY = "accessToken";

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

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Secure`;
};

const removeCookie = (name: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
};

export const getAccessToken = () => readCookie(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string) => {
  writeCookie(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = () => {
  removeCookie(ACCESS_TOKEN_KEY);
};

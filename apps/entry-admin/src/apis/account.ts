import { http } from "./http";
import type { MyAccount } from "./types";

export const getMyAccount = () => http.get<MyAccount>("/api/identity/v11/accounts/me");

/** HttpOnly 세션 쿠키는 JS 로 지울 수 없어 서버가 만료시킨다. */
export const logout = () => http.post<null>("/api/identity/v11/auth/logout", {});

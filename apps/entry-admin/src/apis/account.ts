import { http } from "./http";
import type { MyAccount } from "./types";

/** 내 계정 조회. identity 도메인이라 admin 엔드포인트(`/api/v11/admin`)와 경로 체계가 다르다. */
export const getMyAccount = () => http.get<MyAccount>("/api/identity/v11/accounts/me");

/** 로그아웃. HttpOnly 세션 쿠키는 JS 로 지울 수 없으므로 서버가 만료시킨다(entry-user 와 동일 엔드포인트). */
export const logout = () => http.post<null>("/api/identity/v11/auth/logout", {});

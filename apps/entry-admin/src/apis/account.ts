import { http } from "./http";
import type { MyAccount } from "./types";

/** 내 계정 조회. identity 도메인이라 admin 엔드포인트(`/api/v11/admin`)와 경로 체계가 다르다. */
export const getMyAccount = () => http.get<MyAccount>("/api/identity/v11/accounts/me");

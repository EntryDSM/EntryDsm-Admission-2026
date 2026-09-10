import { http } from "./http";

interface MyAccount {
  role: string;
}

export const getMyAccount = () => http.get<MyAccount>("/api/identity/v11/accounts/me");

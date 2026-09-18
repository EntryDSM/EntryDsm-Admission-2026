import { http } from "./http";

export interface MyAccount {
  userId: string;
  name: string;
  role: string;
}

export const getMyAccount = () => http.get<MyAccount>("/api/identity/v11/accounts/me");

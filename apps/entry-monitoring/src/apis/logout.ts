import { http } from "./http";

export const logout = () => http.post("/api/identity/v11/auth/logout", {});

import { useState } from "react";
import { toast } from "react-toastify";
import { IdentityApiError, login } from "../apis";
import type { LoginRequest } from "../apis";

const USER_APP_URL = import.meta.env.VITE_USER_APP_URL?.replace(/\/$/, "") ?? "https://entrydsm.kr";

const getLoginErrorMessage = (error: unknown) => {
  if (!(error instanceof IdentityApiError)) {
    return "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  switch (error.code) {
    case "INVALID_REQUEST_BODY":
      return "전화번호와 비밀번호를 올바르게 입력해 주세요.";
    case "INVALID_CREDENTIALS":
      return "전화번호 또는 비밀번호가 일치하지 않습니다.";
    case "ACCOUNT_INACTIVE":
      return "비활성화된 계정입니다.";
    default:
      if (error.status === 401) return "전화번호 또는 비밀번호가 일치하지 않습니다.";
      if (error.status === 403) return "비활성화된 계정입니다.";
      return error.message;
  }
};

export const useLogin = () => {
  const [isPending, setIsPending] = useState(false);

  const submitLogin = async (payload: LoginRequest) => {
    if (isPending) return;

    setIsPending(true);
    try {
      await login(payload);
      toast.success("로그인되었습니다.");
      window.location.assign(`${USER_APP_URL}/mypage`);
    } catch (error) {
      toast.error(getLoginErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  return { submitLogin, isPending };
};

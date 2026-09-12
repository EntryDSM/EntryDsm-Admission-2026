import { useState } from "react";
import { toast } from "react-toastify";
import { USER_APP_URL } from "@entry/ui";
import { resolveRequiredUrl } from "@entry/utils";
import { IdentityApiError, login } from "../apis";
import type { LoginRequest } from "../apis";

const ADMIN_APP_URL = resolveRequiredUrl(
  "VITE_ADMIN_APP_URL",
  import.meta.env.VITE_ADMIN_APP_URL as string | undefined,
  import.meta.env.PROD
);

const MONITORING_APP_URL = resolveRequiredUrl(
  "VITE_MONITORING_APP_URL",
  import.meta.env.VITE_MONITORING_APP_URL as string | undefined,
  import.meta.env.PROD
);

const getLoginRedirectUrl = (role: string) => {
  switch (role) {
    case "ADMIN":
      return `${ADMIN_APP_URL}/`;
    case "MONITOR":
      return `${MONITORING_APP_URL}/`;
    case "STUDENT":
      return `${USER_APP_URL}/`;
    default:
      return null;
  }
};

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
      const { role } = await login(payload);
      const redirectUrl = getLoginRedirectUrl(role);
      if (!redirectUrl) {
        toast.error("지원하지 않는 사용자 권한입니다. 관리자에게 문의해 주세요.");
        return;
      }
      toast.success("로그인되었습니다.");
      window.location.assign(redirectUrl);
    } catch (error) {
      toast.error(getLoginErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  return { submitLogin, isPending };
};

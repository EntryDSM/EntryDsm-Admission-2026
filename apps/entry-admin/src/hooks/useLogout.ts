import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { USER_APP_URL } from "@entry/ui";

import { HttpError, logout } from "../apis";

/** 성공하면 유저 앱으로 전체 페이지를 옮겨 어드민 캐시도 함께 비운다. */
export const useLogout = () => {
  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      window.location.href = USER_APP_URL;
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "로그아웃에 실패했습니다.";
      toast.error(message);
    },
  });

  return {
    logout: mutation.mutate,
    isLoggingOut: mutation.isPending,
  };
};

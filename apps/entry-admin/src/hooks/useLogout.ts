import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { USER_APP_URL } from "@entry/ui";

import { HttpError, logout } from "../apis";

/**
 * 로그아웃 훅. 세션 만료는 서버(로그아웃 API)가 담당하고, 성공하면 유저 앱으로 전체 페이지 이동해
 * 어드민 쪽 쿼리 캐시를 함께 비운다. 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로
 * 여기서 직접 토스트한다.
 */
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

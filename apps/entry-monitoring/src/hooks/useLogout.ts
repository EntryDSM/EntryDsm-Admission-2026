import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { AUTH_APP_URL } from "@entry/ui";
import { toast } from "react-toastify";
import { logout } from "../apis";

export const useLogout = () => {
  const inFlight = useRef(false);
  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      window.location.replace(AUTH_APP_URL);
    },
    onError: () => {
      inFlight.current = false;
      toast.error("로그아웃에 실패했습니다. 다시 시도해 주세요.");
    },
  });

  return {
    logout: () => {
      if (inFlight.current) return;
      inFlight.current = true;
      mutation.mutate();
    },
    isLoggingOut: mutation.isPending,
  };
};

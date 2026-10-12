import { useEffect } from "react";
import { Navigate } from "react-router";
import { toast } from "react-toastify";

/** 준비 중 페이지. 들어오면 안내 토스트를 띄우고 홈으로 보낸다(페이지 컴포넌트는 남겨 둔다). */
export const UnderConstructionRedirect = ({ pageName }: { pageName: string }) => {
  useEffect(() => {
    // StrictMode 이중 실행으로 토스트가 겹치지 않게 toastId 로 묶는다.
    toast.error(`${pageName} 페이지는 준비 중입니다.`, { toastId: "under-construction" });
  }, [pageName]);

  return <Navigate to="/" replace />;
};

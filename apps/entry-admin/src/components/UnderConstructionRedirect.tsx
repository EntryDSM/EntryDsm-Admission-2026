import { useEffect } from "react";
import { Navigate } from "react-router";
import { toast } from "react-toastify";

/**
 * 준비 중 페이지 접근 차단.
 * URL 직접 진입 등으로 라우트에 도달하면 에러 토스트를 띄우고 홈으로 돌려보낸다.
 * (페이지 컴포넌트 자체는 삭제하지 않고, 라우트에서만 임시로 이 컴포넌트로 대체한다.)
 */
export const UnderConstructionRedirect = ({ pageName }: { pageName: string }) => {
  useEffect(() => {
    // StrictMode 의 이중 이펙트로 토스트가 중복되지 않도록 toastId 로 묶는다.
    toast.error(`${pageName} 페이지는 준비 중입니다.`, { toastId: "under-construction" });
  }, [pageName]);

  return <Navigate to="/" replace />;
};

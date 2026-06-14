import { useEffect } from "react";

export const useBlockBack = () => {
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 뒤로가기를 누르면 history를 다시 앞으로 보냅니다.
      window.history.pushState(null, document.title, window.location.href);
    };

    // 페이지가 로드되면 히스토리 상태를 하나 추가합니다.
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
};

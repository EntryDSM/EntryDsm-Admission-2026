import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { HttpError } from "./http";

const getErrorMessage = (error: unknown) => {
  if (error instanceof HttpError) {
    switch (error.status) {
      case 401:
        return "인증이 만료되었어요. 다시 로그인해 주세요.";
      case 403:
        return "접근 권한이 없습니다.";
      case 404:
        return "요청한 데이터를 찾을 수 없습니다.";
      default:
        return error.message || "요청 처리 중 오류가 발생했습니다.";
    }
  }

  return "네트워크 오류가 발생했습니다.";
};

/** 앱 전역 QueryClient. 쿼리 에러는 이곳에서 일괄 토스트 처리한다. */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: error => toast.error(getErrorMessage(error)),
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

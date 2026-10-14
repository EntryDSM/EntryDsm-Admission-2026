import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getSentryIgnoreStatuses, reportApiError } from "@entry/observability";

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

/** 쿼리 에러는 여기서 토스트하고, 쿼리·뮤테이션 에러는 모두 Sentry 로 보고한다. */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 정상 흐름인 상태 코드는 meta.sentryIgnoreStatuses 로 보고에서 뺀다.
      reportApiError(error, {
        source: "query",
        target: query.queryKey,
        ignoreStatuses: getSentryIgnoreStatuses(query.meta),
      });

      // 자체 에러 화면이 있는 쿼리(접근 가드 등)는 전역 토스트를 끈다.
      if (query.meta?.suppressGlobalErrorToast) {
        return;
      }

      toast.error(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    // 뮤테이션 에러 토스트는 각 훅이 띄운다.
    onError: (error, _variables, _context, mutation) => {
      reportApiError(error, {
        source: "mutation",
        target: mutation.options.mutationKey,
        ignoreStatuses: getSentryIgnoreStatuses(mutation.options.meta),
      });
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

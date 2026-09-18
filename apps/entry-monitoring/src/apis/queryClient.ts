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

/** 앱 전역 QueryClient. 쿼리 에러는 이곳에서 일괄 토스트 처리하고, 쿼리·뮤테이션 에러는 모두 Sentry 로 보고한다. */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 토스트 여부와 무관하게 보고한다 (4xx 는 warning 레벨 — docs/OBSERVABILITY.md 3절).
      // 정상 흐름인 상태 코드는 쿼리의 meta.sentryIgnoreStatuses 로 제외한다.
      reportApiError(error, {
        source: "query",
        target: query.queryKey,
        ignoreStatuses: getSentryIgnoreStatuses(query.meta),
      });

      // 자체 에러 화면을 가진 쿼리(예: 접근 가드)는 meta 로 전역 토스트를 끈다.
      if (query.meta?.suppressGlobalErrorToast) {
        return;
      }

      toast.error(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    // 뮤테이션의 화면 처리는 각 훅이 직접 하므로(관례) 여기서는 보고만 한다.
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

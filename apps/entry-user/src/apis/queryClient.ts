import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { getSentryIgnoreStatuses, reportApiError } from "@entry/observability";

/**
 * 앱 전역 QueryClient. 쿼리·뮤테이션 에러를 Sentry 로 보고한다 (4xx 포함, docs/OBSERVABILITY.md 3절).
 * 화면 처리(토스트·에러 화면)는 기존대로 각 호출부가 담당하고, 기본 옵션도 바꾸지 않는다.
 * 정상 흐름인 상태 코드(예: 비로그인 401)는 쿼리의 meta.sentryIgnoreStatuses 로 제외한다.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      reportApiError(error, {
        source: "query",
        target: query.queryKey,
        ignoreStatuses: getSentryIgnoreStatuses(query.meta),
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      reportApiError(error, {
        source: "mutation",
        target: mutation.options.mutationKey,
        ignoreStatuses: getSentryIgnoreStatuses(mutation.options.meta),
      });
    },
  }),
});

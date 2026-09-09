import { useQuery } from "@tanstack/react-query";

import { getMyAccount } from "../apis/account";
import { QueryKeys } from "../apis/query";
/**
 * 내 계정(권한) 조회 훅. 어드민 접근 가드 전용이라 캐시를 신선하게 유지하지 않고(staleTime 0),
 * 재시도 없이 즉시 성공/실패를 판정해 차단 지연을 줄인다.
 * 재확인은 라우트 이동 시의 invalidate 로만 일어나도록 포커스/재접속 자동 refetch 는 끈다.
 */
export const useMyAccount = () => {
  const query = useQuery({
    queryKey: QueryKeys.account.me,
    queryFn: getMyAccount,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // 가드가 전용 화면으로 에러를 직접 처리하므로 전역 에러 토스트와 중복되지 않게 한다.
    meta: { suppressGlobalErrorToast: true },
  });

  return {
    account: query.data,
    accountError: query.error,
    /** 초기 조회·재검증 포함, 권한 확인 요청이 진행 중인지 */
    isCheckingAccount: query.isFetching,
    refetchAccount: query.refetch,
  };
};

import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getMyAccount } from "../apis";

/** 접근 가드 전용. 재시도 없이 바로 판정하고, 재확인은 라우트를 옮길 때만 한다. */
export const useMyAccount = () => {
  const query = useQuery({
    queryKey: adminQueryKeys.account.me,
    queryFn: getMyAccount,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // 가드가 자체 화면으로 에러를 보여 준다.
    meta: { suppressGlobalErrorToast: true },
  });

  return {
    account: query.data,
    accountError: query.error,
    isCheckingAccount: query.isFetching,
    refetchAccount: query.refetch,
  };
};

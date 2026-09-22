import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { USER_APP_URL } from "@entry/ui";
import { useSentryUser } from "@entry/observability";
import { QueryKeys } from "../apis/query";
import { HttpError } from "../apis/http";
import { useMyAccount } from "../hooks/useMyAccount";
import { GuardButton, GuardLink, GuardScreen } from "./GuardScreen";

/**
 * 어드미션 접근 가드 라우트. 내 계정 조회(GET /api/identity/v11/accounts/me)로 로그인을 확인한다
 * - 미인증(401): 로그인(auth 앱)으로 보낸다.
 * - 네트워크 등 그 외 실패: 페이지를 막고(fail-closed) 재시도 화면을 띄운다.
 * 라우트 이동마다 캐시를 무효화하고, 확인이 끝날 때까지 페이지를 렌더링하지 않는다.
 */
export const RequireAuth = () => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const previousPathname = useRef(pathname);
  const { account, accountError, isCheckingAccount, refetchAccount } = useMyAccount();

  // 로그인 사용자의 내부 userId 만 Sentry user.id 로 붙인다 (docs/OBSERVABILITY.md 5절).
  useSentryUser(account?.userId);

  // 첫 마운트는 쿼리 자체가 조회하므로, 실제로 경로가 바뀌었을 때만 다시 확인한다.
  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;
    queryClient.invalidateQueries({ queryKey: QueryKeys.account.me });
  }, [pathname, queryClient]);

  const isUnauthorized = accountError instanceof HttpError && accountError.status === 401;

  useEffect(() => {
    if (isUnauthorized) {
      window.location.replace(USER_APP_URL);
    }
  }, [isUnauthorized]);

  if (isUnauthorized) {
    return <GuardScreen>로그인이 필요합니다. 유저 페이지로 이동합니다.</GuardScreen>;
  }

  if (isCheckingAccount) {
    return <GuardScreen>로그인 확인 중...</GuardScreen>;
  }

  if (accountError) {
    return (
      <GuardScreen>
        로그인 확인 중 오류가 발생했습니다.
        <GuardButton type="button" onClick={() => refetchAccount()}>
          다시 시도
        </GuardButton>
      </GuardScreen>
    );
  }

  <GuardScreen>
    로그인이 안되어있습니다.
    <GuardLink href={USER_APP_URL}>유저 페이지로 이동</GuardLink>
  </GuardScreen>;

  return <Outlet />;
};

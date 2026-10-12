import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { Outlet, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { colors } from "@entry/design";
import { AUTH_APP_URL, ErrorPage } from "@entry/ui";
import { useSentryUser } from "@entry/observability";

import { adminQueryKeys, HttpError } from "../apis";
import { useMyAccount } from "../hooks";

/**
 * 접근 가드. 내 계정의 role 이 ADMIN 일 때만 하위 페이지를 그린다.
 * 401 이면 로그인으로 보내고, 다른 권한은 403, 그 밖의 실패는 재시도 화면을 보인다.
 * 라우트를 옮길 때마다 다시 확인한다.
 */
export const RequireAdmin = () => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const previousPathname = useRef(pathname);
  const { account, accountError, isCheckingAccount, refetchAccount } = useMyAccount();

  // Sentry 에는 내부 userId 만 붙인다.
  useSentryUser(account?.userId);

  // 첫 마운트는 쿼리가 조회하므로 경로가 바뀔 때만 다시 확인한다.
  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.account.me });
  }, [pathname, queryClient]);

  const isUnauthorized = accountError instanceof HttpError && accountError.status === 401;

  useEffect(() => {
    if (isUnauthorized) {
      window.location.replace(AUTH_APP_URL);
    }
  }, [isUnauthorized]);

  if (isUnauthorized) {
    return <GuardScreen>로그인이 필요합니다. 로그인 페이지로 이동합니다.</GuardScreen>;
  }

  if (isCheckingAccount) {
    return <GuardScreen>관리자 권한 확인 중...</GuardScreen>;
  }

  if (accountError) {
    return (
      <GuardScreen>
        권한 확인 중 오류가 발생했습니다.
        <RetryButton type="button" onClick={() => refetchAccount()}>
          다시 시도
        </RetryButton>
      </GuardScreen>
    );
  }

  if (account?.role !== "ADMIN") {
    return <ErrorPage status={403} />;
  }

  return <Outlet />;
};

const GuardScreen = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: ${colors.gray[400]};
  font-size: 18px;
  font-weight: 500;
`;

const guardActionStyle = `
  padding: 10px 20px;
  border-radius: 8px;
  background-color: ${colors.green[400]};
  color: ${colors.gray[50]};
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background-color: ${colors.green[500]};
  }
`;

const RetryButton = styled.button`
  ${guardActionStyle}
  border: none;
`;

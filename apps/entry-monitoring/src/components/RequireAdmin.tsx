import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { Outlet, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { colors } from "@entry/design";
import { AUTH_APP_URL } from "@entry/ui";

import { monitoringQueryKeys, HttpError } from "../apis";
import { useMyAccount } from "../hooks";

/**
 * 모니터링 접근 가드 라우트. 내 계정 조회(GET /api/identity/v11/accounts/me)로 권한을 확인해
 * `role === "ADMIN"` 일 때만 하위 페이지를 렌더링한다.
 * - 미인증(401): 로그인(auth 앱)으로 보낸다.
 * - ADMIN 이 아닌 권한: 접근 거부 화면을 띄운다.
 * - 네트워크 등 그 외 실패: 페이지를 막고(fail-closed) 재시도 화면을 띄운다.
 * 라우트 이동마다 캐시를 무효화하고, 확인이 끝날 때까지 페이지를 렌더링하지 않는다.
 */
export const RequireAdmin = () => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const previousPathname = useRef(pathname);
  const { account, accountError, isCheckingAccount, refetchAccount } = useMyAccount();

  // 첫 마운트는 쿼리 자체가 조회하므로, 실제로 경로가 바뀌었을 때만 다시 확인한다.
  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;
    queryClient.invalidateQueries({ queryKey: monitoringQueryKeys.account.me });
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
    return (
      <GuardScreen>
        관리자 권한이 없습니다.
        <LoginLink href={AUTH_APP_URL}>로그인 페이지로 이동</LoginLink>
      </GuardScreen>
    );
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

const LoginLink = styled.a`
  ${guardActionStyle}
`;

const RetryButton = styled.button`
  ${guardActionStyle}
  border: none;
`;

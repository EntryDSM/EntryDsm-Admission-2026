import styled from "@emotion/styled";
import { Outlet, useLocation } from "react-router";
import { CommonHeader, Footer } from "@entry/ui";
import { useQuery } from "@tanstack/react-query";
import { useSentryUser } from "@entry/observability";
import { getMyAccount } from "../apis";
import { useEffect } from "react";
import { CalculationDataProvider } from "../contexts";

export const AppLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const {
    data: account,
    isSuccess: isLoggedIn,
    isPending: isLoading,
  } = useQuery({
    queryKey: ["myAccount"],
    queryFn: getMyAccount,
    retry: false,
    // 비로그인 방문자의 401 은 정상 흐름이라 Sentry 에 보내지 않는다 (docs/OBSERVABILITY.md 2절).
    meta: { sentryIgnoreStatuses: [401] },
  });

  // 로그인 사용자의 내부 userId 만 Sentry user.id 로 붙인다 (docs/OBSERVABILITY.md 5절).
  useSentryUser(account?.userId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <CalculationDataProvider>
      <CommonHeader transparent={isHome} isLoggedIn={isLoggedIn} isLoading={isLoading} />
      <Main isHome={isHome}>
        <Outlet />
      </Main>
      <Footer />
    </CalculationDataProvider>
  );
};

const Main = styled.main<{ isHome?: boolean }>`
  width: 100%;
  margin-top: ${({ isHome }) => (isHome ? "0" : "70px")};
`;

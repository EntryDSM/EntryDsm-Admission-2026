import styled from "@emotion/styled";
import { Outlet, useLocation } from "react-router";
import { CommonHeader, Footer } from "@entry/ui";
import { useQuery } from "@tanstack/react-query";
import { getMyAccount } from "../apis";
import { useEffect } from "react";
import { CalculationDataProvider } from "../contexts";

export const AppLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const { isSuccess: isLoggedIn, isPending: isLoading } = useQuery({
    queryKey: ["myAccount"],
    queryFn: getMyAccount,
    retry: false,
  });

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

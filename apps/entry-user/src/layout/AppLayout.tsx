import styled from "@emotion/styled";
import { Outlet, useLocation } from "react-router";
import { CommonHeader, Footer } from "@entry/ui";
import { useEffect } from "react";
import { CalculationDataProvider } from "../contexts";

export const AppLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <CalculationDataProvider>
      <CommonHeader transparent={isHome} />
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

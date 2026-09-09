import styled from "@emotion/styled";
import { Outlet, useLocation } from "react-router";
import { CommonHeader, Footer } from "@entry/ui";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyAccount } from "../apis";
import { CalculationDataProvider } from "../contexts";

export const AppLayout = () => {
  const { pathname } = useLocation();
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
      <CommonHeader isLoggedIn={isLoggedIn} isLoading={isLoading} />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </CalculationDataProvider>
  );
};

const Main = styled.main`
  width: 100%;
  margin-top: 70px;
`;

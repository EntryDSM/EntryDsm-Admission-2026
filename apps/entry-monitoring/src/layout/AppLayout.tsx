import styled from "@emotion/styled";
import { Outlet, useOutletContext } from "react-router";
import { MonitoringHeader } from "@entry/ui";
import type { MyAccount } from "../apis";
import { useLogout } from "../hooks";

export const AppLayout = () => {
  const account = useOutletContext<MyAccount>();
  const { logout, isLoggingOut } = useLogout();
  return (
    <>
      <MonitoringHeader name={account.name} onLogout={logout} isLoggingOut={isLoggingOut} />
      <Main>
        <Outlet />
      </Main>
    </>
  );
};

const Main = styled.main`
  width: 100%;
  margin-top: 70px;
`;

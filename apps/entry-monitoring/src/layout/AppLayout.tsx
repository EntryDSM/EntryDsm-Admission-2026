import styled from "@emotion/styled";
import { Outlet } from "react-router";
import { MonitoringHeader } from "@entry/ui";

export const AppLayout = () => {
  return (
    <>
      <MonitoringHeader />
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

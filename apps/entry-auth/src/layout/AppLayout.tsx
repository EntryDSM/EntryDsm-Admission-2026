import styled from "@emotion/styled";
import { Outlet } from "react-router";
import { NoPathHeader } from "@entry/ui";

export const AppLayout = () => {
  return (
    <>
      <NoPathHeader />
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

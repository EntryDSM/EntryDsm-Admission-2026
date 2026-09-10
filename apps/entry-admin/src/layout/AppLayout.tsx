import styled from "@emotion/styled";
import { Outlet } from "react-router";
import { AdminHeader } from "@entry/ui";
import { toast } from "react-toastify";
import { useLogout } from "../hooks";

// 준비 중 페이지 — 헤더 메뉴 클릭을 막고 안내 토스트만 띄운다. (URL 직접 진입은 라우터에서 차단)
const UNDER_CONSTRUCTION_PATHS = ["/admissions-quota", "/formula-calculator"];

export const AppLayout = () => {
  const { logout } = useLogout();

  return (
    <>
      <AdminHeader
        disabledPaths={UNDER_CONSTRUCTION_PATHS}
        onDisabledNavClick={name => toast.error(`${name} 페이지는 준비 중입니다.`, { toastId: "under-construction" })}
        onLogout={() => logout()}
      />
      <Main>
        <Outlet />
      </Main>
    </>
  );
};

const Main = styled.main`
  width: 100%;
  margin-top: 70px;
  padding: 50px 100px;
`;

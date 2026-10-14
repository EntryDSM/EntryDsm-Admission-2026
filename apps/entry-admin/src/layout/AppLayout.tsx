import { useRef } from "react";
import styled from "@emotion/styled";
import { Outlet } from "react-router";
import { AdminHeader } from "@entry/ui";
import { toast, type Id } from "react-toastify";
import { useLogout } from "../hooks";

// 준비 중 페이지. 헤더 메뉴는 막고 토스트만 띄운다(주소로 직접 들어오면 라우터가 막는다).
const UNDER_CONSTRUCTION_PATHS = ["/formula-calculator"];

export const AppLayout = () => {
  const { logout } = useLogout();
  // 고정 toastId 를 쓰면 토스트가 떠 있는 동안 다른 메뉴 안내가 무시돼, 직전 토스트를 지우고 새로 띄운다.
  const underConstructionToastId = useRef<Id | null>(null);

  const handleDisabledNavClick = (name: string) => {
    if (underConstructionToastId.current !== null) {
      toast.dismiss(underConstructionToastId.current);
    }
    underConstructionToastId.current = toast.error(`${name} 페이지는 준비 중입니다.`);
  };

  return (
    <>
      <AdminHeader
        disabledPaths={UNDER_CONSTRUCTION_PATHS}
        onDisabledNavClick={handleDisabledNavClick}
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

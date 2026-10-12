import { useRef } from "react";
import styled from "@emotion/styled";
import { Outlet } from "react-router";
import { AdminHeader } from "@entry/ui";
import { toast, type Id } from "react-toastify";
import { useLogout } from "../hooks";

// 준비 중 페이지 — 헤더 메뉴 클릭을 막고 안내 토스트만 띄운다. (URL 직접 진입은 라우터에서 차단)
const UNDER_CONSTRUCTION_PATHS = ["/admissions-quota", "/formula-calculator"];

export const AppLayout = () => {
  const { logout } = useLogout();
  // 직전 준비-중 토스트 id. 고정 toastId 로 묶으면 토스트가 떠 있는 동안 재호출이 무시돼
  // (정원 수정은 한 번만 뜨고 이어서 누른 계산식 수정은 아예 안 뜨는 문제),
  // 클릭할 때마다 직전 것을 지우고 새 토스트를 띄워 매번 피드백이 보이게 한다.
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

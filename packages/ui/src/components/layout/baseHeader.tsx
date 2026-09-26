import styled from "@emotion/styled";
import { useNavigate, useLocation, Link } from "react-router";
import { useEffect, useState } from "react";

import { colors, Flex, Text } from "@entry/design";
import { EntryLogo, SideBarBtnIcon } from "../../assets";
import { Btn } from "../primitives/btn";
import { Logout } from "../../assets";
import { AUTH_APP_URL, USER_APP_URL, AWS_CONSOLE_URL } from "../../utils/env";

export const NoPathHeader = () => {
  return (
    <NoPathHeaderContainer>
      <Flex
        gap={12}
        alignItems="center"
        height="fit-content"
        width="fit-content"
        onClick={() => {
          window.location.href = USER_APP_URL;
        }}
      >
        <EntryLogo />
        <Text fontSize={24} fontWeight={600} color={colors.gray[500]}>
          EntryDSM
        </Text>
      </Flex>
    </NoPathHeaderContainer>
  );
};

type AdminHeaderProps = {
  /** 이동을 막을 경로 목록 (예: 준비 중 페이지) */
  disabledPaths?: string[];
  /** 막힌 메뉴 클릭 시 호출된다 (토스트 안내 등은 앱에서 처리) */
  onDisabledNavClick?: (name: string, path: string) => void;
  /** 로그아웃 버튼 클릭 시 호출된다 (세션 만료 API 호출·이동은 앱에서 처리) */
  onLogout?: () => void;
};

export const AdminHeader = ({ disabledPaths, onDisabledNavClick, onLogout }: AdminHeaderProps = {}) => {
  const [isSideClick, setIsSideClick] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // const [datas] = useState<{ name: string }>({ name: '홍길동' });

  const navData = [
    { name: "일정 수정", path: "/admissions-schedule" },
    { name: "정원 수정", path: "/admissions-quota" },
    { name: "계산식 수정", path: "/formula-calculator" },
    { name: "지원자 조회", path: "/applicants-list" },
    { name: "공지사항", path: "/notice" },
  ];

  const navClick = (name: string, path: string) => {
    setIsSideClick(false);

    if (disabledPaths?.includes(path)) {
      onDisabledNavClick?.(name, path);
      return;
    }

    navigate(path);
  };

  const handleLogout = () => {
    // HttpOnly 세션 쿠키는 서버만 만료시킬 수 있으므로 로그아웃 API 호출은 앱이 담당한다.
    if (onLogout) {
      onLogout();
      return;
    }

    window.location.href = USER_APP_URL;
  };

  return (
    <HeaderContainer>
      <AdminHeaderLogoSection to="/" aria-label="EntryAdmin 홈으로 이동">
        <EntryLogo isAdmin={true} />
        <Text fontSize={24} fontWeight={600} color={colors.gray[500]}>
          EntryAdmin
        </Text>
      </AdminHeaderLogoSection>
      <Flex gap={52} alignItems="center" height="fit-content" width="fit-content">
        <Flex width="fit-content" height="fit-content" gap={8} alignItems="center">
          {navData.map(data => (
            <NavContent
              key={data.path}
              isPath={pathname.includes(data.path)}
              onClick={() => navClick(data.name, data.path)}
            >
              {data.name}
            </NavContent>
          ))}
        </Flex>
        <Btn onClick={handleLogout}>로그아웃</Btn>
        <SideBarBtnIcon onClick={() => setIsSideClick(!isSideClick)} />
      </Flex>
      {isSideClick && (
        <SideNavContainer>
          {navData.map(data => (
            <SideNavContent key={data.path} onClick={() => navClick(data.name, data.path)}>
              {data.name}
            </SideNavContent>
          ))}
        </SideNavContainer>
      )}
    </HeaderContainer>
  );
};

type CommonHeaderProps = {
  /** 스크롤 최상단에서 배경을 투명하게 표시한다 (예: 홈 히어로 위) */
  transparent?: boolean;
  isLoggedIn?: boolean;
  isLoading?: boolean;
};

export const CommonHeader = ({ transparent = false, isLoggedIn = false, isLoading = false }: CommonHeaderProps) => {
  const [isSideClick, setIsSideClick] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!transparent) return;

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

  useEffect(() => {
    setIsSideClick(false);
  }, [pathname]);

  const isTransparent = transparent && !isScrolled;

  const navData = [
    { name: "공지사항", path: "/notice" },
    { name: "자주 묻는 질문", path: "/faq" },
    { name: "모의 성적", path: "/calculate" },
    { name: "전형 요강", path: "/admission-overview" },
    { name: "학교 소개", path: "/landing" },
  ];

  const navClick = (path: string) => {
    setIsSideClick(false);
    navigate(path);
  };

  const handleLoginClick = () => {
    window.location.href = AUTH_APP_URL;
  };

  return (
    <HeaderContainer isTransparent={isTransparent}>
      <CommonHeaderLogoSection onClick={() => navigate("/")}>
        <EntryLogo />
        <CommonHeaderLogoText isTransparent={isTransparent}>EntryDSM</CommonHeaderLogoText>
      </CommonHeaderLogoSection>
      <CommonHeaderActionSection>
        <Flex width="fit-content" height="fit-content" gap={28} alignItems="center">
          {navData.map(data => (
            <NavContent
              key={data.name}
              isPath={pathname.includes(data.path)}
              isTransparent={isTransparent}
              onClick={() => navClick(data.path)}
            >
              {data.name}
            </NavContent>
          ))}
        </Flex>
        {isLoading ? (
          <Flex gap={20} alignItems="center" width="fit-content" height="fit-content">
            {/* <SkeletonBox width="90px" height="22px" />
            <SkeletonBox width="80px" height="22px" /> */}
          </Flex>
        ) : isLoggedIn ? (
          <Flex gap={20} alignItems="center" width="fit-content" height="fit-content">
            <NavContent
              onClick={() => navClick("/mypage")}
              isPath={pathname.startsWith("/mypage")}
              isTransparent={isTransparent}
            >
              마이페이지
            </NavContent>
            {/* TODO: userInfo 연동 후 사용자 이름 표시 복구 */}
            {/* <Text isSpan fontSize={18} fontWeight={500} color={colors.gray[500]}>
              {userInfo?.name || "사용자"}
              <Text isSpan fontSize={18} fontWeight={400} color={colors.gray[500]}>
                님
              </Text>
            </Text> */}
          </Flex>
        ) : (
          <Btn
            width="100px"
            backgroundColor={colors.orange[800]}
            hoverBackgroundColor={colors.orange[850]}
            onClick={handleLoginClick}
          >
            로그인
          </Btn>
        )}
        <CommonMenuButton
          type="button"
          aria-label={isSideClick ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isSideClick}
          aria-controls="common-header-menu"
          onClick={() => setIsSideClick(prev => !prev)}
        >
          <SideBarBtnIcon color={isTransparent ? colors.extra.realWhite : colors.gray[500]} />
        </CommonMenuButton>
      </CommonHeaderActionSection>
      {isSideClick && (
        <CommonSideNavContainer id="common-header-menu" aria-label="주요 메뉴">
          {navData.map(data => (
            <CommonSideNavContent key={data.name} type="button" onClick={() => navClick(data.path)}>
              {data.name}
            </CommonSideNavContent>
          ))}
          {isLoggedIn && (
            <CommonSideNavContent type="button" onClick={() => navClick("/mypage")}>
              마이페이지
            </CommonSideNavContent>
          )}
        </CommonSideNavContainer>
      )}
    </HeaderContainer>
  );
};

export const AuthHeader = () => {
  return (
    <AuthHeaderContainer>
      <LogoContainer href={USER_APP_URL} aria-label="EntryDSM 홈으로 이동">
        <EntryLogo />
        <Text fontSize={24} fontWeight={600} color={colors.gray[500]}>
          EntryDSM
        </Text>
      </LogoContainer>
    </AuthHeaderContainer>
  );
};

interface MonitoringHeaderProps {
  name: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export const MonitoringHeader = ({ name, onLogout, isLoggingOut = false }: MonitoringHeaderProps) => {
  const navigate = useNavigate();

  return (
    <MonitoringActionSection>
      <Flex gap={12} alignItems="center" height="fit-content" width="fit-content" onClick={() => navigate("/")}>
        <EntryLogo isMonitoring={true} />
        <Text fontSize={24} fontWeight={600} color={colors.gray[500]}>
          EntryMonitor
        </Text>
      </Flex>
      <Flex gap={20} alignItems="center" height="fit-content" width="fit-content">
        <Btn
          onClick={() => window.open(USER_APP_URL, "_blank", "noopener,noreferrer")}
          aria-label="EntryDSM 홈으로 이동"
          backgroundColor={"#6668F1"}
          hoverBackgroundColor={"#6668F1"}
        >
          EntryDSM 지원자 페이지
        </Btn>
        <Btn
          onClick={() => window.open(AWS_CONSOLE_URL, "_blank", "noopener,noreferrer")}
          aria-label="EntryDSM 홈으로 이동"
          backgroundColor={"#6668F1"}
          hoverBackgroundColor={"#6668F1"}
        >
          Aws 콘솔 페이지
        </Btn>
        <ButtonName type="button" onClick={onLogout} disabled={isLoggingOut} aria-label={`${name} 로그아웃`}>
          {name} <img src={Logout} alt="" />
        </ButtonName>
      </Flex>
    </MonitoringActionSection>
  );
};

const LogoContainer = styled.a`
  display: flex;
  gap: 12px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
`;

const AdminHeaderLogoSection = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  height: fit-content;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
`;

const CommonHeaderLogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  height: fit-content;
  cursor: pointer;

  @media (max-width: 1200px) {
    flex: 1;
    min-width: 0;
    justify-content: flex-start;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const CommonHeaderLogoText = styled.div<{ isTransparent?: boolean }>`
  width: fit-content;
  font-size: 24px;
  font-weight: 600;
  color: ${({ isTransparent }) => (isTransparent ? colors.extra.realWhite : colors.gray[500])};
  transition: color 0.3s ease-in-out;

  @media (max-width: 480px) {
    font-size: 20px;
  }

  @media (max-width: 360px) {
    font-size: 18px;
  }
`;

const CommonHeaderActionSection = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  height: fit-content;
  gap: 52px;

  @media (max-width: 1200px) {
    gap: 12px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    gap: 8px;

    > button:not(:last-child) {
      width: 84px;
      min-width: 0;
      height: 40px;
      padding: 8px 12px;
      font-size: 14px;
    }
  }
`;

const CommonMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: transparent;
  cursor: pointer;

  @media (max-width: 1200px) {
    display: flex;
  }

  &:focus-visible {
    outline: 2px solid ${colors.orange[800]};
    border-radius: 8px;
  }
`;

const CommonSideNavContainer = styled.nav`
  position: absolute;
  top: 70px;
  left: 0;
  width: 100%;
  max-height: calc(100dvh - 70px);
  overflow-y: auto;
  padding: 8px 16px 16px;
  background-color: ${colors.extra.realWhite};
  border-bottom: 1px solid ${colors.gray[200]};
  box-shadow: 0 8px 16px rgb(0 0 0 / 8%);

  @media (min-width: 1201px) {
    display: none;
  }
`;

const CommonSideNavContent = styled.button`
  display: block;
  width: 100%;
  padding: 14px 12px;
  border-radius: 8px;
  background: transparent;
  color: ${colors.gray[500]};
  text-align: left;
  font-size: 16px;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background-color: ${colors.gray[100]};
  }
`;

const AuthHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-self: start;
  position: fixed;
  border-bottom: 1px solid ${colors.gray[200]};
  top: 0;
  left: 0;
  width: 100vw;
  height: 70px;
  z-index: 10;
  padding-left: 10%;
  background-color: ${colors.extra.realWhite};
`;

const SideNavContainer = styled.button`
  width: 100%;
  height: auto;
  position: absolute;
  top: 70px;
  left: 0;

  @media (min-width: 1200px) {
    display: none;
  }
`;

const SideNavContent = styled.nav`
  transition: 0.2s ease-in;
  width: 100%;
  height: 52px;
  background-color: ${colors.extra.realWhite};
  padding-left: 20px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: ${colors.gray[100]};
  }
`;

const HeaderContainer = styled.header<{ isTransparent?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: space-between;
  padding: 0 120px;
  align-items: center;
  background-color: ${({ isTransparent }) => (isTransparent ? "transparent" : colors.extra.realWhite)};
  border-bottom: 1px solid ${({ isTransparent }) => (isTransparent ? "transparent" : colors.gray[200])};
  transition:
    background-color 0.3s ease-in-out,
    border-bottom-color 0.3s ease-in-out;
  z-index: 100;

  @media (max-width: 1200px) {
    padding: 0 20px;
  }

  @media (max-width: 480px) {
    padding: 0 12px;
  }
`;

const NoPathHeaderContainer = styled(HeaderContainer)`
  justify-content: flex-start;
`;

const NavContent = styled.button<{ isPath?: boolean; isTransparent?: boolean }>`
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ isPath }) => (isPath ? colors.gray[100] : "transparent")};
  font-size: 18px;
  font-weight: 400;
  color: ${({ isTransparent }) => (isTransparent ? colors.extra.realWhite : colors.gray[500])};
  transition: color 0.3s ease-in-out;
  cursor: pointer;
  &:hover {
    background-color: ${({ isTransparent }) => (isTransparent ? "rgba(255, 255, 255, 0.2)" : colors.gray[100])};
    transition: 0.4s ease-in-out;
  }

  @media (max-width: 1200px) {
    display: none;
  }
`;

const MonitoringActionSection = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${colors.gray[200]};
  background-color: ${colors.extra.realWhite};
  padding: 0 120px;
  gap: 20px;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  height: 70px;
  transition: 0.4s ease-in-out;
  z-index: 100;

  @media (max-width: 1200px) {
    padding: 0 20px;
  }

  @media (max-width: 480px) {
    padding: 0 12px;
  }
`;

const ButtonName = styled.button`
  display: flex;
  gap: 5px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 22px;
`;

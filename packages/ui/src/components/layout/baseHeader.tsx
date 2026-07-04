import styled from "@emotion/styled";
import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";

import { colors, Flex, Text } from "@entry/design";
import { EntryLogo, SideBarBtnIcon } from "../../assets";
import { Btn } from "../primitives/btn";

// 공통 스크롤 감지 훅
const useScrollY = () => {
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // mount 시 초기 스크롤 감지

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
};

export const NoPathHeader = () => {
  const scrollPosition = useScrollY();
  const navigate = useNavigate();

  return (
    <NoPathHeaderContainer scrollPosition={scrollPosition}>
      <Flex gap={12} alignItems="center" height="fit-content" width="fit-content" onClick={() => navigate("/")}>
        <EntryLogo />
        <Text fontSize={24} fontWeight={600} color={colors.gray[500]}>
          EntryDSM
        </Text>
      </Flex>
    </NoPathHeaderContainer>
  );
};

export const AdminHeader = () => {
  const scrollPosition = useScrollY();
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

  const navClick = (path: string) => {
    setIsSideClick(false);
    navigate(path);
  };

  const handleLogout = () => {
    // 로그아웃 로직 (예: 토큰 삭제)
    window.location.href = "https://entrydsm.kr/";
  };

  return (
    <HeaderContainer scrollPosition={scrollPosition}>
      <Flex gap={12} alignItems="center" height="fit-content" width="fit-content" onClick={() => navigate("/")}>
        <EntryLogo isAdmin={true} />
        <Text fontSize={24} fontWeight={600} color={colors.gray[500]}>
          EntryAdmin
        </Text>
      </Flex>
      <Flex gap={52} alignItems="center" height="fit-content" width="fit-content">
        <Flex width="fit-content" height="fit-content" gap={8} alignItems="center">
          {navData.map(data => (
            <NavContent key={data.path} isPath={pathname.includes(data.path)} onClick={() => navClick(data.path)}>
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
            <SideNavContent key={data.path} onClick={() => navClick(data.path)}>
              {data.name}
            </SideNavContent>
          ))}
        </SideNavContainer>
      )}
    </HeaderContainer>
  );
};

export const CommonHeader = () => {
  const scrollPosition = useScrollY();
  const [isSideClick, setIsSideClick] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navData = [
    { name: "공지사항", path: "/notice" },
    { name: "자주 묻는 질문", path: "/faq" },
    { name: "성적 산출", path: "/calculate" },
    { name: "전형 요강", path: "/admission-overview" },
    { name: "학교 소개", path: "/landing" },
  ];

  const navClick = (path: string) => {
    setIsSideClick(false);
    navigate(path);
  };

  // const handleLoginClick = () => {
  //   window.location.href = "https://auth.entrydsm.kr";
  // };

  // const isLoggedIn = accessToken && userInfo && !isError;
  // const isLoading = accessToken && isPending;

  return (
    <HeaderContainer scrollPosition={scrollPosition}>
      <CommonHeaderLogoSection onClick={() => navigate("/")}>
        <EntryLogo />
        <CommonHeaderLogoText>EntryDSM</CommonHeaderLogoText>
      </CommonHeaderLogoSection>
      <CommonHeaderActionSection>
        {/* <Flex width="fit-content" height="fit-content" gap={28} alignItems="center"> */}
        {navData.map(data => (
          <NavContent key={data.name} isPath={pathname.includes(data.path)} onClick={() => navClick(data.path)}>
            {data.name}
          </NavContent>
        ))}
        {/* </Flex>
        {isLoading ? (
          <Flex gap={20} alignItems="center" width="fit-content" height="fit-content">
            <SkeletonBox width="90px" height="22px" />
            <SkeletonBox width="80px" height="22px" />
          </Flex>
        ) : isLoggedIn ? (
          <Flex gap={20} alignItems="center" width="fit-content" height="fit-content">
            <NavContent onClick={() => navClick("/mypage")} isPath={pathname === "/mypage"}>
              마이페이지
            </NavContent>
            <Text isSpan fontSize={18} fontWeight={500} color={colors.gray[500]}>
              {userInfo?.name || "사용자"}
              <Text isSpan fontSize={18} fontWeight={400} color={colors.gray[500]}>
                님
              </Text>
            </Text>
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
        )} */}
        <SideBarBtnIcon onClick={() => setIsSideClick(!isSideClick)} />
      </CommonHeaderActionSection>
      {isSideClick && (
        <SideNavContainer>
          {navData.map(data => (
            <SideNavContent key={data.name} onClick={() => navClick(data.path)}>
              {data.name}
            </SideNavContent>
          ))}
          {/* {isLoggedIn && <SideNavContent onClick={() => navClick("/mypage")}>마이페이지</SideNavContent>} */}
        </SideNavContainer>
      )}
    </HeaderContainer>
  );
};

export const AuthHeader = () => {
  return (
    <AuthHeaderContainer>
      <LogoContainer href="https://entrydsm.kr/" aria-label="EntryDSM 홈으로 이동">
        <EntryLogo />
        <Text fontSize={24} fontWeight={600} color={colors.gray[500]}>
          EntryDSM
        </Text>
      </LogoContainer>
    </AuthHeaderContainer>
  );
};

export const MonitoringHeader = () => {
  const navigate = useNavigate();

  return (
    <MonitoringActionSection>
      <Flex gap={12} alignItems="center" height="fit-content" width="fit-content" onClick={() => navigate("/")}>
        <EntryLogo isMonitoring={true} />
        <Text fontSize={24} fontWeight={600} color={colors.gray[500]}>
          EntryMonitoring
        </Text>
      </Flex>
      <Flex gap={20} alignItems="center" height="fit-content" width="fit-content">
        <Btn backgroundColor={"#6668F1"} hoverBackgroundColor={"#6668F1"}>
          EntryDSM 지원자 페이지
        </Btn>
        <Btn backgroundColor={"#6668F1"} hoverBackgroundColor={"#6668F1"}>
          Aws 콘솔 페이지
        </Btn>
      </Flex>
    </MonitoringActionSection>
  );
};

// const HeaderBtn = styled.button`
//   padding: 8px 20px;
//   border-radius: 12px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   background-color: ${colors.green[400]};
//   font-size: 16px;
//   font-weight: 400;
//   color: ${colors.extra.realWhite};
//   cursor: pointer;
//   &:hover {
//     background-color: ${colors.green[500]};
//     transition: 0.35s ease-in-out;
//   }
// `;

const LogoContainer = styled.a`
  display: flex;
  gap: 12px;
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
`;

const CommonHeaderLogoText = styled.div`
  width: fit-content;
  font-size: 24px;
  font-weight: 600;
  color: ${colors.gray[500]};

  @media (max-width: 480px) {
    display: none;
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
`;

const AuthHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-self: start;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 70px;
  z-index: 10;
  padding-left: 10%;
  background-color: ${colors.extra.realWhite};
`;

const SideNavContainer = styled.nav`
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

const HeaderContainer = styled.header<{ scrollPosition?: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: space-between;
  padding: 0 120px;
  align-items: center;
  background-color: ${({ scrollPosition }) => (scrollPosition ? colors.extra.realWhite : "transparent")};
  border-bottom: 1px solid ${({ scrollPosition }) => (scrollPosition ? colors.gray[200] : "transparent")};
  transition: 0.4s ease-in-out;
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

const NavContent = styled.nav<{ isPath?: boolean }>`
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ isPath }) => (isPath ? colors.gray[100] : "transparent")};
  font-size: 18px;
  font-weight: 400;
  color: ${colors.gray[500]};
  cursor: pointer;
  &:hover {
    background-color: ${colors.gray[100]};
    transition: 0.4s ease-in-out;
  }

  @media (max-width: 1200px) {
    display: none;
  }
`;

// const SkeletonBox = styled(Skeleton)<{ width: string; height: string }>`
//   width: ${({ width }) => width};
//   height: ${({ height }) => height};
//   border-radius: 8px;
// `;

const MonitoringActionSection = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

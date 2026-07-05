import styled from "@emotion/styled";
import { canProceedToNext, usePageData, useApplicationData } from "@entry/ui";
import { Outlet, useLocation, useNavigate } from "react-router";
import { ApplicationNav } from "../components";

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [datas] = usePageData("applicationClassification");
  const { state } = useApplicationData(); // 전체 상태 가져오기
  const pageGraduateRoutes = [
    { path: "/application-classification", step: 0 },
    { path: "/applicant-info", step: 1 },
    { path: "/guardian-info", step: 2 },
    { path: "/middle-school-info", step: 3 },
    { path: "/personal-statements", step: 4 },
    { path: "/statement-of-purpose", step: 4 },
    { path: "/first-graduate", step: 5 },
    { path: "/second-graduate", step: 5 },
    { path: "/third-graduate", step: 5 },
    { path: "/fourth-graduate", step: 5 },
    { path: "/activity-graduate", step: 5 },
    { path: "/application-preview", step: 6 },
    { path: "/submit-check", step: 7 },
  ];

  const pageProspectiveGraduateRoutes = [
    { path: "/application-classification", step: 0 },
    { path: "/applicant-info", step: 1 },
    { path: "/guardian-info", step: 2 },
    { path: "/middle-school-info", step: 3 },
    { path: "/personal-statements", step: 4 },
    { path: "/statement-of-purpose", step: 4 },
    { path: "/first-graduate", step: 5 },
    { path: "/second-graduate", step: 5 },
    { path: "/third-graduate", step: 5 },
    { path: "/activity-graduate", step: 5 },
    { path: "/application-preview", step: 6 },
    { path: "/submit-check", step: 7 },
  ];

  const gedPageRoutes = [
    { path: "/application-classification", step: 0 },
    { path: "/applicant-info", step: 1 },
    { path: "/guardian-info", step: 2 },
    { path: "/personal-statements", step: 3 },
    { path: "/statement-of-purpose", step: 3 },
    { path: "/ged/score", step: 4 },
    { path: "/ged/attendance-volunteer", step: 4 },
    { path: "/application-preview", step: 5 },
    { path: "/submit-check", step: 6 },
  ];

  const schoolApplicantSteps = 8;
  const gedSteps = 7;

  const graduationType = datas?.graduationType;

  const { routesConfig, progressSteps } = (() => {
    if (graduationType === "검정고시(중학교 졸업 학력)") {
      return { routesConfig: gedPageRoutes, progressSteps: gedSteps };
    }
    if (graduationType === "졸업 예정") {
      return { routesConfig: pageProspectiveGraduateRoutes, progressSteps: schoolApplicantSteps };
    }
    if (graduationType === "졸업") {
      return { routesConfig: pageGraduateRoutes, progressSteps: schoolApplicantSteps };
    }
    return { routesConfig: gedPageRoutes, progressSteps: gedSteps };
  })();

  const routes = routesConfig.map(item => item.path);

  const currentPath = location.pathname;
  const currentIndex = routes.findIndex(path => currentPath.includes(path));
  const currentPage = currentIndex >= 0 ? currentIndex + 1 : 1;
  const currentStep = routesConfig[currentPage - 1]?.step ?? 0;

  const setCurrentPage = (page: number) => {
    const path = routes[page - 1];
    if (path && !currentPath.includes(path)) {
      navigate(path);
    }
  };

  // 페이지 유효성 검사
  const validateCurrentPage = () => {
    const currentRoute = routes[currentPage - 1];
    if (!currentRoute) return { canProceed: true };
    return canProceedToNext(state, currentRoute);
  };

  const shouldRemoveTopPadding = currentPath.includes("/application-preview") || currentPath.includes("/submit-check");

  return (
    <Main $removeTopPadding={shouldRemoveTopPadding}>
      <Outlet />
      <ApplicationNav
        totalPage={routesConfig.length}
        currentStep={currentStep}
        currentPage={currentPage}
        progressSteps={progressSteps}
        setCurrentPage={setCurrentPage}
        graduationType={graduationType}
        validateCurrentPage={validateCurrentPage}
      />
    </Main>
  );
};

const Main = styled.div<{ $removeTopPadding?: boolean }>`
  width: 100vw;
  padding: ${props => (props.$removeTopPadding ? "0 160px 40px" : "40px 160px")};
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
`;

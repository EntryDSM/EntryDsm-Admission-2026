import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { colors, Text } from "@entry/design";
import { ScorePageNav, TabSection, Btn } from "@entry/ui";
import { ScoreResultModal } from "../components";
import { useCalculationData } from "../contexts";
import { canProceedToNextCalculationStep } from "../utils/calculationValidation";

type CalculationType = "primary" | "graduated" | "qe";

const CALCULATION_TYPES = [
  {
    key: "primary" as const,
    label: "졸업 예정자",
    basePath: "/calculate/primary",
  },
  {
    key: "graduated" as const,
    label: "졸업자",
    basePath: "/calculate/graduated",
  },
  {
    key: "qe" as const,
    label: "검정고시",
    basePath: "/calculate/qe",
  },
];

const SCORE_PAGES: Record<CalculationType, Array<{ path: string; name: string }>> = {
  primary: [
    { path: "/first-graduate", name: "3학년 1학기" },
    { path: "/second-graduate", name: "직전 학기" },
    { path: "/third-graduate", name: "직전 전 학기" },
    { path: "/activity", name: "출결 및 봉사" },
  ],
  graduated: [
    { path: "/third2", name: "3학년 2학기" },
    { path: "/third1", name: "3학년 1학기" },
    { path: "/second2", name: "2학년 2학기" },
    { path: "/second1", name: "2학년 1학기" },
    { path: "/activity", name: "출결 및 봉사" },
  ],
  qe: [
    { path: "/score", name: "검정고시 점수" },
    { path: "/activity", name: "출결 및 봉사" },
  ],
};

const DEFAULT_EXPLANATION = "관련 과목이 없는 경우 X로 기입해주세요.";

const STEP_EXPLANATIONS: Record<CalculationType, Record<string, string>> = {
  primary: {
    "/activity": "결석, 지각, 조퇴 등이 없는 경우에는 0을 입력해 주세요.",
  },
  graduated: {
    "/activity": "결석, 지각, 조퇴 등이 없는 경우에는 0을 입력해 주세요.",
  },
  qe: {
    "/score": "검정고시 점수를 입력해 주세요.",
    "/activity": "자격증 보유 여부를 기입해 주세요.",
  },
};

const isCalculationType = (type: string): type is CalculationType =>
  CALCULATION_TYPES.some(option => option.key === type);

export const CalculateLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showResultModal, setShowResultModal] = useState(false);
  const { state } = useCalculationData();

  const getCurrentType = (): CalculationType => {
    if (location.pathname.includes("/calculate/primary")) return "primary";
    if (location.pathname.includes("/calculate/graduated")) return "graduated";
    if (location.pathname.includes("/calculate/qe")) return "qe";
    return "primary";
  };

  const activeType = getCurrentType();

  const basePath = CALCULATION_TYPES.find(t => t.key === activeType)?.basePath;
  const scoreNavData = SCORE_PAGES[activeType].map(data => ({
    ...data,
    path: `${basePath}${data.path}`,
  }));

  useEffect(() => {
    const routes = SCORE_PAGES[activeType].map(data => `${basePath}${data.path}`);
    const currentRouteIndex = routes.indexOf(location.pathname);

    if (currentRouteIndex <= 0) return;

    const firstBlockedRoute = routes
      .slice(0, currentRouteIndex)
      .find(route => !canProceedToNextCalculationStep(state, route).canProceed);

    if (firstBlockedRoute) {
      navigate(firstBlockedRoute, { replace: true });
    }
  }, [activeType, basePath, location.pathname, navigate, state]);

  const currentData = SCORE_PAGES[activeType].find(data => location.pathname.includes(data.path));
  const currentExplanation = (currentData && STEP_EXPLANATIONS[activeType][currentData.path]) || DEFAULT_EXPLANATION;

  const getCurrentStep = () => {
    return SCORE_PAGES[activeType].findIndex(data => location.pathname.includes(data.path));
  };

  const currentStep = getCurrentStep();
  const totalSteps = SCORE_PAGES[activeType].length;
  const isLastStep = currentStep === totalSteps - 1;
  const validationResult = canProceedToNextCalculationStep(state, location.pathname);
  const isCurrentStepValid = validationResult.canProceed;

  const handleTypeChange = (type: string) => {
    if (!isCalculationType(type)) return;

    const firstPage = SCORE_PAGES[type][0];
    const basePath = CALCULATION_TYPES.find(t => t.key === type)?.basePath;

    navigate(`${basePath}${firstPage.path}`);
  };

  const handleNext = () => {
    if (!isCurrentStepValid) return;

    if (currentStep < totalSteps - 1) {
      const nextPage = SCORE_PAGES[activeType][currentStep + 1];
      const basePath = CALCULATION_TYPES.find(t => t.key === activeType)?.basePath;
      navigate(`${basePath}${nextPage.path}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevPage = SCORE_PAGES[activeType][currentStep - 1];
      const basePath = CALCULATION_TYPES.find(t => t.key === activeType)?.basePath;
      navigate(`${basePath}${prevPage.path}`);
    }
  };

  const handleComplete = () => {
    setShowResultModal(true);
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <ContentContainer>
          <TabSection options={CALCULATION_TYPES} activeType={activeType} onTypeChange={handleTypeChange} />

          <HeaderSection>
            <TitleSection>
              <Text fontSize={32} fontWeight={600}>
                {currentData ? currentData.name : "Error"}
              </Text>
              <Text isOverFlow={true} fontSize={16} fontWeight={400} color={colors.gray[400]}>
                {currentExplanation}
              </Text>
            </TitleSection>
            <NavigationSection>
              <ScorePageNav datas={scoreNavData} />
            </NavigationSection>
          </HeaderSection>

          <Main>
            <Outlet />
          </Main>

          <ButtonContainer>
            <Btn
              onClick={handlePrevious}
              backgroundColor={currentStep === 0 ? colors.gray[100] : "transparent"}
              hoverBackgroundColor={currentStep === 0 ? colors.gray[100] : "transparent"}
              color={currentStep === 0 ? colors.gray[300] : colors.orange[800]}
              borderColor={currentStep === 0 ? colors.gray[300] : colors.orange[800]}
              isBlocked={currentStep === 0}
            >
              이전
            </Btn>

            <ButtonGroup>
              {isLastStep ? (
                <Btn onClick={handleComplete} isBlocked={!isCurrentStepValid}>
                  완료
                </Btn>
              ) : (
                <Btn onClick={handleNext} isBlocked={!isCurrentStepValid}>
                  다음
                </Btn>
              )}
            </ButtonGroup>
          </ButtonContainer>

          <ScoreResultModal
            isOpen={showResultModal}
            onClose={() => {
              setShowResultModal(false);
            }}
          />
        </ContentContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  width: 100%;
  background-color: white;
  display: flex;
  justify-content: center;
  padding-bottom: 120px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1280px;
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 40px 24px 0;
`;

const HeaderSection = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 36px 20px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NavigationSection = styled.div`
  display: flex;
  flex: 1;
  min-width: min(100%, 620px);

  @media (max-width: 960px) {
    min-width: 100%;
  }
`;

const Main = styled.main`
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
`;

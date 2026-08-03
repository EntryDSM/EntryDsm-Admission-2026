import styled from "@emotion/styled";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { colors, Text } from "@entry/design";
import { ScorePageNav, TabSection, Btn } from "@entry/ui";
import { ScoreResultModal } from "../components";

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

const isCalculationType = (type: string): type is CalculationType =>
  CALCULATION_TYPES.some(option => option.key === type);

export const CalculateLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showResultModal, setShowResultModal] = useState(false);

  const getCurrentType = (): CalculationType => {
    if (location.pathname.includes("/calculate/primary")) return "primary";
    if (location.pathname.includes("/calculate/graduated")) return "graduated";
    if (location.pathname.includes("/calculate/qe")) return "qe";
    return "primary";
  };

  const [activeType, setActiveType] = useState<CalculationType>(getCurrentType());

  const getScoreNavData = () => {
    const basePath = CALCULATION_TYPES.find(t => t.key === activeType)?.basePath;

    return SCORE_PAGES[activeType].map(data => ({
      ...data,
      path: `${basePath}${data.path}`,
    }));
  };

  const currentData = SCORE_PAGES[activeType].find(data => location.pathname.includes(data.path));

  const getCurrentStep = () => {
    return SCORE_PAGES[activeType].findIndex(data => location.pathname.includes(data.path));
  };

  const currentStep = getCurrentStep();
  const totalSteps = SCORE_PAGES[activeType].length;
  const isLastStep = currentStep === totalSteps - 1;

  const handleTypeChange = (type: string) => {
    if (!isCalculationType(type)) return;

    setActiveType(type);
    const firstPage = SCORE_PAGES[type][0];
    const basePath = CALCULATION_TYPES.find(t => t.key === type)?.basePath;

    navigate(`${basePath}${firstPage.path}`);
  };

  const handleNext = () => {
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
        <MainContainer>
          <ContentContainer>
            <TabSection options={CALCULATION_TYPES} activeType={activeType} onTypeChange={handleTypeChange} />

            <TitleContainer>
              <TitleSection>
                <Text fontSize={32} fontWeight={600}>
                  {currentData ? currentData.name : "Error"}
                </Text>
                <Text isOverFlow={true} fontSize={16} fontWeight={400} color={colors.gray[400]}>
                  관련 과목이 없는 경우 0으로 기입해주세요
                </Text>
              </TitleSection>
              <ScorePageNav datas={getScoreNavData()} />
            </TitleContainer>

            <Main>
              <Outlet />
            </Main>

            <ButtonContainer>
              <Btn
                onClick={handlePrevious}
                backgroundColor={currentStep === 0 ? "#E5E5E5" : "transparent"}
                hoverBackgroundColor={currentStep === 0 ? "#E5E5E5" : "transparent"}
                color={currentStep === 0 ? "#999" : colors.orange[800]}
                borderColor={currentStep === 0 ? "#999" : colors.orange[800]}
                isBlocked={currentStep === 0}
              >
                이전
              </Btn>

              {isLastStep ? <Btn onClick={handleComplete}>완료</Btn> : <Btn onClick={handleNext}>다음</Btn>}
            </ButtonContainer>

            <ScoreResultModal
              isOpen={showResultModal}
              onClose={() => {
                setShowResultModal(false);
              }}
            />
          </ContentContainer>
        </MainContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 70px);
  background-color: white;
  display: flex;
  justify-content: center;
  padding: 0;
  padding-bottom: 200px;
`;

const ContentWrapper = styled.div`
  width: 1540px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
`;

const MainContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  padding: 40px;
`;

const TitleSection = styled.div`
  width: fit-content;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 44px;
  width: 100%;
  height: auto;
`;

const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80px;
  flex-wrap: wrap;
  gap: 36px 0;

  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const Main = styled.main`
  width: 100%;
  margin: 40px 0 44px 0;
  flex: 1;
`;

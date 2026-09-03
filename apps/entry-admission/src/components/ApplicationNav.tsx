import { colors, Flex } from "@entry/design";
import styled from "@emotion/styled";
import { PreviousBtn } from "@entry/ui";

interface IApplicationNavType {
  totalPage: number;
  currentStep: number;
  currentPage: number;
  progressSteps: number;
  setCurrentPage: (page: number) => void;
  graduationType?: string;
  validateCurrentPage?: (page: number) => {
    canProceed: boolean;
    message?: string;
  };
}

export const ApplicationNav = ({
  totalPage,
  currentStep,
  currentPage,
  progressSteps,
  setCurrentPage,
  graduationType,
  validateCurrentPage,
}: IApplicationNavType) => {
  const isGraduationTypeSelected = Boolean(graduationType && graduationType.trim());

  const handlePrevious = () => {
    if (currentPage <= 1) return;
    setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage >= totalPage) return;

    const validationResult = validateCurrentPage?.(currentPage);
    if (validationResult && !validationResult.canProceed) return;

    setCurrentPage(currentPage + 1);
  };

  return (
    <Flex
      paddingTop="44px"
      paddingBottom="44px"
      height="fit-content"
      alignItems="end"
      gap={20}
      width="100%"
      justifyContent="space-between"
    >
      <NavButton
        backgroundColor={colors.gray[50]}
        color={colors.orange[800]}
        borderColor={colors.orange[800]}
        isBlocked={currentPage <= 1}
        hoverBackgroundColor={colors.gray[50]}
        onClick={handlePrevious}
      >
        이전
      </NavButton>

      <Flex width="fit-content" height="fit-content">
        {renderPageIndicators(currentStep, progressSteps)}
      </Flex>

      {currentPage === totalPage ? (
        isGraduationTypeSelected ? (
          <NavButton isBlocked={true}>제출</NavButton>
        ) : (
          <NavButton isBlocked={true}>다음</NavButton>
        )
      ) : (
        <NavButton onClick={handleNext}>다음</NavButton>
      )}
    </Flex>
  );
};

function renderPageIndicators(currentStep: number, progressSteps: number) {
  return Array.from({ length: progressSteps }, (_, index) => {
    return <PageIndicator key={index} isActive={currentStep === index} />;
  });
}

const PageIndicator = styled.nav<{ isActive: boolean }>`
  width: 54px;
  height: 4px;
  background-color: ${({ isActive }) => (isActive ? colors.orange[800] : colors.gray[200])};
  border-radius: ${({ isActive }) => (isActive ? "10px" : "0px")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease-in-out;
`;

const NavButton = styled(PreviousBtn)<{ isBlocked?: boolean }>`
  opacity: ${({ isBlocked }) => (isBlocked ? 0.5 : 1)};
  pointer-events: ${({ isBlocked }) => (isBlocked ? "none" : "auto")};
`;

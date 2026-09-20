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
  onNext?: () => Promise<boolean>;
  isSaving?: boolean;
  validateCurrentPage?: (page: number) => {
    canProceed: boolean;
    message?: string;
  };
}
//TODO: 나중에 오류 토스트로 표시하기
export const ApplicationNav = ({
  totalPage,
  currentStep,
  currentPage,
  progressSteps,
  setCurrentPage,
  graduationType,
  onNext,
  isSaving = false,
  validateCurrentPage,
}: IApplicationNavType) => {
  const isGraduationTypeSelected = Boolean(graduationType && graduationType.trim());
  const isLastPage = currentPage >= totalPage;
  // 현재 페이지의 필수 입력이 모두 채워졌는지 렌더링마다 확인해 다음 버튼의 활성 여부를 정한다.
  const canProceed = validateCurrentPage?.(currentPage).canProceed ?? true;
  // 마지막 페이지(제출 확인)에서는 기존처럼 항상 비활성이고, 저장 중이거나 필수 입력이 비어 있으면 비활성화한다.
  const isNextBlocked = isLastPage || isSaving || !canProceed;
  const nextLabel = (() => {
    if (isLastPage && isGraduationTypeSelected) return "제출";
    if (isSaving) return "저장 중";
    return "다음";
  })();

  const handlePrevious = () => {
    if (currentPage <= 1) return;
    setCurrentPage(currentPage - 1);
  };

  const handleNext = async () => {
    if (currentPage >= totalPage) return;

    const validationResult = validateCurrentPage?.(currentPage);
    if (validationResult && !validationResult.canProceed) return;

    const shouldProceed = (await onNext?.()) ?? true;
    if (shouldProceed) {
      setCurrentPage(currentPage + 1);
    }
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

      <NextButton isBlocked={isNextBlocked} onClick={() => void handleNext()}>
        {nextLabel}
      </NextButton>
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

// 다음(제출) 버튼은 비활성화 시 흐리게 하는 대신 연한 주황(colors.orange[500], #FFC19D)으로 채운다.
const NextButton = styled(NavButton)`
  opacity: 1;
  background-color: ${({ isBlocked }) => (isBlocked ? colors.orange[500] : colors.orange[800])};
`;

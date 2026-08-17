import { useState } from "react";
import { Flex, Text } from "@entry/design";
import { Btn } from "@entry/ui";
import { ScoreFirst, ScoreThird, ScoreSecond, ScoreFourth, Activity } from "./";
import { useCalculationData } from "../../contexts";
import { ADMISSION_TYPE_LABEL, ADMISSION_TYPE_MAX_SCORE_GED, type AdmissionType } from "../../constants/admissionType";

// API 연동 비활성화
// import { calculateScore } from '../../apis/calculator';
// import { transformCalculationDataToAPI } from '../../utils/apiDataTransformer';
// import { CalculatorScoreResponse } from '../../apis/calculator/types';

type LocalCalculatorScoreResponse = {
  totalScore: number;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "점수 계산 중 오류가 발생했습니다. 입력값을 다시 확인해주세요.";
};

const STEPS = [
  { key: "third2", label: "3학년 2학기" },
  { key: "third1", label: "3학년 1학기" },
  { key: "second2", label: "2학년 2학기" },
  { key: "second1", label: "2학년 1학기" },
  { key: "activity", label: "출결 및 봉사" },
];

export const GraduatedCalculationPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [results, setResults] = useState<
    {
      name: string;
      type: AdmissionType;
      data: LocalCalculatorScoreResponse;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state } = useCalculationData();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateLocalGraduatedScore = (type: AdmissionType) => {
    const scorePages = [state.graduatedThird2, state.graduatedThird1, state.graduatedSecond2, state.graduatedSecond1];

    const numericScores = scorePages.flatMap(page =>
      Object.values(page)
        .map(value => Number(value))
        .filter(value => Number.isFinite(value) && value > 0)
    );

    const averageScore = numericScores.length
      ? numericScores.reduce((sum, value) => sum + value, 0) / numericScores.length
      : 0;

    const activity = state.graduatedActivity;
    const volunteerHours = Number(activity.volunteerHours) || 0;
    const attendancePenalty =
      (Number(activity.absences) || 0) +
      (Number(activity.earlyLeaves) || 0) * 0.5 +
      (Number(activity.lateArrivals) || 0) * 0.5 +
      (Number(activity.resultMissing) || 0);
    const certificateBonus = (activity.dsmAlgorithm === "O" ? 1.5 : 0) + (activity.infoProcessing === "O" ? 1.5 : 0);

    const maxScore = ADMISSION_TYPE_MAX_SCORE_GED[type];
    const academicScore = (averageScore / 5) * (maxScore * 0.85);
    const activityScore = Math.min(volunteerHours, 20) * 0.3;
    const totalScore = Math.max(
      0,
      Math.min(maxScore, academicScore + activityScore + certificateBonus - attendancePenalty)
    );

    return { totalScore: Number(totalScore.toFixed(3)) };
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const commonResponse = calculateLocalGraduatedScore("COMMON");
      const socialResponse = calculateLocalGraduatedScore("SOCIAL");
      const meisterResponse = calculateLocalGraduatedScore("MEISTER");

      setResults([
        {
          name: ADMISSION_TYPE_LABEL.COMMON,
          type: "COMMON",
          data: commonResponse,
        },
        {
          name: ADMISSION_TYPE_LABEL.SOCIAL,
          type: "SOCIAL",
          data: socialResponse,
        },
        {
          name: ADMISSION_TYPE_LABEL.MEISTER,
          type: "MEISTER",
          data: meisterResponse,
        },
      ]);
      setShowResultModal(true);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ScoreThird pageKey="graduatedThird2" />;
      case 1:
        return <ScoreSecond pageKey="graduatedThird1" />;
      case 2:
        return <ScoreFirst pageKey="graduatedSecond2" />;
      case 3:
        return <ScoreFourth pageKey="graduatedSecond1" />;
      case 4:
        return <Activity pageKey="graduatedActivity" />;
      default:
        return null;
    }
  };

  return (
    <Flex isColumn={true} width="100%" height="100%" padding="40px">
      <Flex isColumn={true} gap={32}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize={28} fontWeight={700}>
            {STEPS[currentStep].label}
          </Text>
          <Text fontSize={14} color="#666">
            전체 학기의 성적을 X로 기입해주세요
          </Text>
        </Flex>

        <Flex gap={12} flexWrap="wrap">
          {STEPS.map((step, index) => (
            <Flex key={step.key} alignItems="center" gap={8}>
              <Flex
                width="32px"
                height="32px"
                borderRadius="50%"
                backgroundColor={index <= currentStep ? "#FF6B35" : "#E5E5E5"}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={14} fontWeight={600} color={index <= currentStep ? "#FFFFFF" : "#999"}>
                  {index + 1}
                </Text>
              </Flex>
              <Text fontSize={14} fontWeight={index === currentStep ? 600 : 400}>
                {step.label}
              </Text>
              {index < STEPS.length - 1 && <Flex width="30px" height="2px" backgroundColor="#E5E5E5" />}
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Flex flex="1" paddingTop="40px" width="100%">
        {renderStepContent()}
      </Flex>

      <Flex justifyContent="space-between">
        <Btn
          onClick={handlePrevious}
          backgroundColor={currentStep === 0 ? "#E5E5E5" : "transparent"}
          color={currentStep === 0 ? "#999" : "#666"}
          borderColor="#E5E5E5"
          isBlocked={currentStep === 0}
        >
          이전
        </Btn>

        {currentStep === STEPS.length - 1 ? (
          <Btn onClick={handleComplete} isBlocked={isLoading}>
            {isLoading ? "계산 중..." : "완료"}
          </Btn>
        ) : (
          <Btn onClick={handleNext}>다음</Btn>
        )}
      </Flex>

      {showResultModal && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          justifyContent="center"
          alignItems="center"
          zIndex={1000}
        >
          <Flex backgroundColor="white" borderRadius="12px" padding="32px" width="500px" isColumn={true} gap={24}>
            <Text fontSize={20} fontWeight={600}>
              성적 산출 결과
            </Text>

            {error && (
              <Text color="#FF0000" fontSize={14}>
                {error}
              </Text>
            )}

            <Flex isColumn={true} gap={16}>
              {results.map((result, index) => (
                <Flex key={index} justifyContent="space-between">
                  <Text>{result.name}</Text>
                  <Text color="#FF6B35" fontWeight={600}>
                    {result.data.totalScore.toFixed(3)} / {ADMISSION_TYPE_MAX_SCORE_GED[result.type]}
                  </Text>
                </Flex>
              ))}
            </Flex>

            <Btn onClick={() => setShowResultModal(false)}>닫기</Btn>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

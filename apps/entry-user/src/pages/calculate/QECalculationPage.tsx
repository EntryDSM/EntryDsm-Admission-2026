import { useState } from "react";
import { Flex, Text } from "@entry/design";
import { Btn } from "@entry/ui";
import { QEDScore, Activity } from "./";
import { useCalculationPageData } from "../../contexts";
import { ADMISSION_TYPE_MAX_SCORE_GED, ADMISSION_TYPE_LABEL, type AdmissionType } from "../../constants/admissionType";

// API 연동 비활성화
// import {
//   CalculatorScoreRequest,
//   CalculatorScoreResponse,
//   calculateScore,
// } from '../../apis';

type LocalCalculatorScoreResponse = {
  totalScore: number;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "점수 계산 중 오류가 발생했습니다.";
};

const STEPS = [
  { key: "qeScore", label: "검정고시 점수" },
  { key: "activity", label: "출결 및 봉사" },
];

export const QECalculationPage = () => {
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

  useCalculationPageData("primaryThird");

  const [qeScoreData] = useCalculationPageData("qeScore");
  const [qeActivityData] = useCalculationPageData("qeActivity");

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

  const calculateLocalQEScore = (type: AdmissionType) => {
    const scoreValues = Object.values(qeScoreData)
      .map(value => Number(value))
      .filter(value => Number.isFinite(value) && value > 0);

    const averageScore = scoreValues.length
      ? scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length
      : 0;

    const volunteerHours = Number(qeActivityData?.volunteerHours) || 0;
    const attendancePenalty =
      (Number(qeActivityData?.absences) || 0) +
      (Number(qeActivityData?.earlyLeaves) || 0) * 0.5 +
      (Number(qeActivityData?.lateArrivals) || 0) * 0.5 +
      (Number(qeActivityData?.resultMissing) || 0);
    const certificateBonus =
      (qeActivityData?.dsmAlgorithm === "O" ? 1.5 : 0) + (qeActivityData?.infoProcessing === "O" ? 1.5 : 0);

    const maxScore = ADMISSION_TYPE_MAX_SCORE_GED[type];
    const academicScore = (averageScore / 100) * (maxScore * 0.85);
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
      const commonResponse = calculateLocalQEScore("COMMON");
      const socialResponse = calculateLocalQEScore("SOCIAL");
      const meisterResponse = calculateLocalQEScore("MEISTER");

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
        return <QEDScore />;
      case 1:
        return <Activity pageKey="qeActivity" />;
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
          {currentStep === 0 && (
            <Text fontSize={14} color="#666">
              검정고시 점수를 입력해주세요
            </Text>
          )}
          {currentStep === 1 && (
            <Text fontSize={14} color="#666">
              과목에 해당하지 않는 경우 X로 기입해주세요
            </Text>
          )}
        </Flex>

        <Flex gap={16}>
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
              {index < STEPS.length - 1 && <Flex width="80px" height="2px" backgroundColor="#E5E5E5" />}
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

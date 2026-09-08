import styled from "@emotion/styled";
import { useEffect } from "react";

import { Text } from "@entry/design";
import { Btn } from "@entry/ui";
import { ADMISSION_TYPE_LABEL, type AdmissionType } from "../constants/admissionType";
import type { AdmissionScoreResult } from "../utils/admissionScoreCalculator";

interface ScoreResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: AdmissionScoreResult[] | null;
  errorMessage?: string;
}

const formatScore = (score: number) => score.toFixed(3).replace(/\.?0+$/, "");

export const ScoreResultModal = ({ isOpen, onClose, results, errorMessage }: ScoreResultModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Title>성적 산출 결과</Title>

        {errorMessage && (
          <ResultList>
            <Text fontSize={20} fontWeight={400} color="#FF0000">
              {errorMessage}
            </Text>
          </ResultList>
        )}

        {!errorMessage && results && (
          <ResultList>
            {results.map(result => (
              <ResultItem key={result.admissionType}>
                <Text fontSize={24} fontWeight={500}>
                  {ADMISSION_TYPE_LABEL[result.admissionType as AdmissionType]}
                </Text>
                <ScoreText>
                  <Text fontSize={24} fontWeight={600} color="#FF6B35">
                    {formatScore(result.totalScore)}
                  </Text>
                  <Text fontSize={24} fontWeight={400} color="#999999">
                    {" / "}
                  </Text>
                  <Text fontSize={24} fontWeight={400} color="#999999">
                    {result.maxScore}
                  </Text>
                </ScoreText>
              </ResultItem>
            ))}
          </ResultList>
        )}

        <ButtonWrapper>
          <Btn onClick={onClose}>닫기</Btn>
        </ButtonWrapper>
      </ModalContainer>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 24px;
  padding: 32px 36px;
  width: 970px;
  min-height: 429px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: 600;
  text-align: left;
  margin: 0;
  color: #333;
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  flex: 1;
  justify-content: center;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ScoreText = styled.div`
  display: flex;
  align-items: center;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

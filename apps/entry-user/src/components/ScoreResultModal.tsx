import { media } from "../styles/breakpoints";
import styled from "@emotion/styled";
import { useEffect } from "react";

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
            <ErrorText>{errorMessage}</ErrorText>
          </ResultList>
        )}

        {!errorMessage && results && (
          <ResultList>
            {results.map(result => (
              <ResultItem key={result.admissionType}>
                <ResultLabel>{ADMISSION_TYPE_LABEL[result.admissionType as AdmissionType]}</ResultLabel>
                <ScoreText>
                  <TotalScore>{formatScore(result.totalScore)}</TotalScore>
                  <MaxScore> / {result.maxScore}</MaxScore>
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
  padding: 16px;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 24px;
  padding: 32px 36px;
  width: min(970px, 100%);
  min-height: 429px;
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${media.tablet} {
    min-height: 0;
    padding: 24px;
    gap: 32px;
  }
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: 600;
  text-align: left;
  margin: 0;
  color: #333;

  ${media.tablet} {
    font-size: 24px;
  }
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  flex: 1;
  justify-content: center;

  ${media.tablet} {
    gap: 24px;
  }
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 20px;
  color: #ff0000;

  ${media.medium} {
    font-size: 16px;
  }
`;

const ResultLabel = styled.span`
  font-size: 24px;
  font-weight: 500;

  ${media.medium} {
    font-size: 18px;
  }
`;

const TotalScore = styled.span`
  font-size: 24px;
  font-weight: 600;
  color: #ff6b35;

  ${media.medium} {
    font-size: 18px;
  }
`;

const MaxScore = styled.span`
  font-size: 24px;
  color: #999999;

  ${media.medium} {
    font-size: 18px;
  }
`;

const ScoreText = styled.div`
  display: flex;
  align-items: center;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

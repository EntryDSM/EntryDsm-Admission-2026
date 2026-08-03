import styled from "@emotion/styled";
import { Text } from "@entry/design";
import { Btn } from "@entry/ui";

interface ScoreResultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScoreResult {
  name: string;
  score: string;
  total: string;
}

const MOCK_RESULTS: ScoreResult[] = [{ name: "졸업 예정자", score: "100", total: "200" }];

export const ScoreResultModal = ({ isOpen, onClose }: ScoreResultModalProps) => {
  const loading = false;
  const error = null;

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Title>성적 산출 결과</Title>

        {loading && (
          <ResultList>
            <Text fontSize={20} fontWeight={400}>
              성적을 계산하고 있습니다...
            </Text>
          </ResultList>
        )}

        {error && (
          <ResultList>
            <Text fontSize={20} fontWeight={400} color="#FF0000">
              {error}
            </Text>
          </ResultList>
        )}

        {!loading && !error && (
          <ResultList>
            {MOCK_RESULTS.map((result, index) => (
              <ResultItem key={index}>
                <Text fontSize={24} fontWeight={400}>
                  {result.name}
                </Text>
                <ScoreText>
                  <Text fontSize={24} fontWeight={600} color="#FF6B35">
                    {result.score}
                  </Text>
                  <Text fontSize={24} fontWeight={400} color="#999999">
                    {" / "}
                  </Text>
                  <Text fontSize={24} fontWeight={400} color="#999999">
                    {result.total}
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
  height: 429px;
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

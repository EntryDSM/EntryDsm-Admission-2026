import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { Modal } from "./Modal";

interface PassAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  userType: "student" | "parent";
  isLoading: boolean;
  error: string | null;
}

export const PassAuthModal = ({ isOpen, onClose, onRetry, userType, isLoading, error }: PassAuthModalProps) => {
  const title = userType === "student" ? "학생 명의 본인인증" : "부모 명의 본인인증";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <StatusContainer>
        <StatusTitle>{title}</StatusTitle>
        <StatusDescription role={error ? "alert" : undefined} $isError={Boolean(error)}>
          {error ?? (isLoading ? "열린 PASS 창에서 본인인증을 완료해 주세요." : "PASS 인증을 준비하고 있습니다.")}
        </StatusDescription>
        <ButtonRow>
          <CancelButton type="button" onClick={onClose}>
            취소
          </CancelButton>
          {error && (
            <RetryButton type="button" onClick={onRetry}>
              다시 시도
            </RetryButton>
          )}
        </ButtonRow>
      </StatusContainer>
    </Modal>
  );
};

const StatusContainer = styled.div`
  padding: 32px 28px 28px;
`;

const StatusTitle = styled.h3`
  color: ${colors.gray[500]};
  font-size: 20px;
  font-weight: 700;
`;

const StatusDescription = styled.p<{ $isError: boolean }>`
  min-height: 44px;
  margin-top: 12px;
  color: ${({ $isError }) => ($isError ? colors.extra.error : colors.gray[400])};
  font-size: 14px;
  line-height: 1.6;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 28px;
`;

const BaseButton = styled.button`
  padding: 11px 20px;
  border: 0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
`;

const CancelButton = styled(BaseButton)`
  background: ${colors.gray[100]};
  color: ${colors.gray[400]};
`;

const RetryButton = styled(BaseButton)`
  background: ${colors.orange[800]};
  color: ${colors.extra.realWhite};
`;

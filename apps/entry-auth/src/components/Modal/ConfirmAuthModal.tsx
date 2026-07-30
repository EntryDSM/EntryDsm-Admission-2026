import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { Modal } from "./Modal";

interface IConfirmAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userType: "student" | "parent";
}

export const ConfirmAuthModal = ({ isOpen, onClose, onConfirm }: IConfirmAuthModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ConfirmContainer>
        <ConfirmTitle>회원가입을 위한 본인확인</ConfirmTitle>
        <ConfirmDescription>인증하기 버튼을 눌러 PASS 인증을 완료하세요</ConfirmDescription>
        <ButtonRow>
          <ConfirmButton type="button" onClick={onConfirm}>
            인증하기
          </ConfirmButton>
        </ButtonRow>
      </ConfirmContainer>
    </Modal>
  );
};

const ConfirmContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 32px 28px 28px;
`;

const ConfirmTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.gray[500]};
  margin-bottom: 10px;
`;

const ConfirmDescription = styled.p`
  font-size: 14px;
  color: ${colors.gray[400]};
  margin-bottom: 48px;
`;

const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: ${colors.orange?.[500] ?? "#FF7A1A"};
  color: ${colors.extra.realWhite};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

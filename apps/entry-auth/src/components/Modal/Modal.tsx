import { useEffect } from "react";
import { createPortal } from "react-dom";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: IModalProps) => {
  // esc로 닫기 + 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <Backdrop onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalBody>{children}</ModalBody>
      </ModalContainer>
    </Backdrop>,
    document.body
  );
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${colors.extra.realWhite};
  border-radius: 12px;
  width: 420px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
`;

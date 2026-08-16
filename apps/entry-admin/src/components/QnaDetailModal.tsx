import { type KeyboardEvent, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

import { useQnaDetail } from "../hooks";
import { formatDotDate } from "../utils";
import { cancel } from "../assets";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

interface IQnaDetailModalType {
  faqId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const QnaDetailModal = ({ faqId, isOpen, onClose }: IQnaDetailModalType) => {
  const { qna, isLoading, isError } = useQnaDetail(faqId, isOpen);
  const scrollPositionRef = useRef(0);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    scrollPositionRef.current = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollPositionRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscapeKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    modalContentRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleModalKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      modalContentRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      modalContentRef.current?.focus();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    if (
      event.shiftKey &&
      (document.activeElement === firstFocusableElement || document.activeElement === modalContentRef.current)
    ) {
      event.preventDefault();
      lastFocusableElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent
        ref={modalContentRef}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qna-detail-modal-title"
        aria-busy={isLoading}
        tabIndex={-1}
      >
        {isLoading && <LoadingOverlay role="status">Q&A 정보를 불러오는 중...</LoadingOverlay>}

        <CloseButton type="button" onClick={onClose} aria-label="닫기">
          <img src={cancel} alt="" aria-hidden="true" />
        </CloseButton>

        <ModalTitle id="qna-detail-modal-title">Q&A 상세 정보</ModalTitle>

        {isError ? (
          <ErrorMessage>Q&A 정보를 불러오지 못했습니다.</ErrorMessage>
        ) : (
          <>
            <ModalHeader>
              <CategoryBadge>{qna?.category ?? "-"}</CategoryBadge>
              <QuestionTitle>{qna?.question ?? "-"}</QuestionTitle>
              <MetaRow>
                <MetaItem>조회수 {qna?.viewCount ?? "-"}</MetaItem>
                <MetaItem>작성일 {formatDotDate(qna?.createdAt) ?? "-"}</MetaItem>
                <MetaItem>수정일 {formatDotDate(qna?.updatedAt) ?? "-"}</MetaItem>
              </MetaRow>
            </ModalHeader>

            <ModalSection>
              <SectionTitle>답변</SectionTitle>
              <SectionContent>{qna?.answer ?? "-"}</SectionContent>
            </ModalSection>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.28);
  z-index: 1000;
  animation: modalOverlayFadeIn 0.36s cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes modalOverlayFadeIn {
    from {
      background-color: rgba(0, 0, 0, 0);
    }

    to {
      background-color: rgba(0, 0, 0, 0.28);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ModalContent = styled.div`
  background: white;
  width: 40%;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  box-shadow: -8px 0 20px rgba(0, 0, 0, 0.08);
  will-change: transform, opacity;
  animation: modalSlideIn 0.52s cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes modalSlideIn {
    from {
      transform: translateX(36px);
      opacity: 0;
    }

    60% {
      opacity: 1;
    }

    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 1024px) {
    width: 60%;
  }

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  color: ${colors.gray[400]};
  font-size: 18px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: ${colors.gray[400]};
  z-index: 10;
  padding: 4px;

  &:hover {
    color: ${colors.gray[500]};
  }
`;

const ModalTitle = styled.h2`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  color: ${colors.gray[400]};
  font-size: 16px;
  font-weight: 500;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 60px 32px 24px 32px;
  border-bottom: 1px solid ${colors.gray[200]};

  @media (max-width: 768px) {
    padding: 60px 20px 20px 20px;
  }
`;

const CategoryBadge = styled.span`
  align-self: flex-start;
  padding: 4px 10px;
  background-color: ${colors.gray[50]};
  border: 1px solid ${colors.gray[300]};
  border-radius: 4px;
  color: ${colors.gray[500]};
  font-size: 13px;
  font-weight: 600;
`;

const QuestionTitle = styled.h3`
  color: ${colors.gray[500]};
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  word-break: keep-all;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  color: ${colors.gray[400]};
  font-size: 14px;
`;

const ModalSection = styled.div`
  padding: 24px 32px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 500;
  color: ${colors.gray[500]};
  margin-bottom: 16px;
`;

const SectionContent = styled.div`
  line-height: 1.6;
  color: ${colors.gray[400]};
  font-size: 16px;
  white-space: pre-line;
  word-break: keep-all;
`;

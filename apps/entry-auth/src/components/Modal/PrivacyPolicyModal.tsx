import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { Modal } from "./Modal";
import { consentDocuments } from "./consentDocuments";

import { consentTitles } from "./consentTypes";
import type { ConsentType } from "./consentTypes";

interface PrivacyPolicyModalProps {
  document: ConsentType | null;
  onClose: () => void;
}

export const PrivacyPolicyModal = ({ document, onClose }: PrivacyPolicyModalProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!document) return;
    const previous = window.document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [document]);
  return (
    <Modal isOpen={document !== null} onClose={onClose} size="large">
      <Container role="dialog" aria-modal="true" aria-label={document ? consentTitles[document] : undefined}>
        <Content tabIndex={0}>{document && consentDocuments[document]}</Content>
        <CloseButton
          ref={closeRef}
          type="button"
          onClick={onClose}
          onKeyDown={event => {
            if (event.key === "Tab") {
              event.preventDefault();
              (event.currentTarget.previousElementSibling as HTMLElement)?.focus();
            }
          }}
        >
          닫기
        </CloseButton>
      </Container>
    </Modal>
  );
};

const Container = styled.div`
  padding: 28px;
  display: flex;
  flex-direction: column;
  height: min(760px, 85dvh);
  box-sizing: border-box;
  gap: 20px;
  @media (max-width: 640px) {
    padding: 20px;
  }
`;
const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  color: ${colors.gray[500]};
  font-size: 16px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  p {
    margin: 12px 0;
  }
  h2 {
    font-size: 24px;
    color: ${colors.extra.realBlack};
  }
  h3 {
    margin: 24px 0 12px;
    font-size: 18px;
    color: ${colors.extra.realBlack};
  }
  hr {
    border: 0;
    border-top: 1px solid ${colors.gray[300]};
    margin: 20px 0;
  }
  .retention {
    font-size: 1.2em;
    font-weight: 700;
    border-left: 3px solid ${colors.orange[800]};
    padding: 12px;
    color: ${colors.extra.realBlack};
  }
`;
const CloseButton = styled.button`
  align-self: flex-end;
  padding: 12px 24px;
  border: 0;
  border-radius: 10px;
  background: ${colors.orange[800]};
  color: ${colors.extra.realWhite};
  cursor: pointer;
`;

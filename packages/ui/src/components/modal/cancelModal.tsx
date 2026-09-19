import { useRef, useState } from "react";
import styled from "@emotion/styled";

import { colors, Flex, media, Text } from "@entry/design";
import { InputContent } from "../form/inputContent";
import { PreviousBtn } from "../primitives/previousBtn";

interface IModalType {
  title: string;
  content: string;
  btnText: string;
  onClick: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen?: boolean;
  /**
   * 지정하면 이 문구를 정확히 입력해야 확인 버튼이 활성화된다.
   * 원서 최종 제출(SubmitCheck)의 "확인했습니다" 입력 확인과 같은 방식이다.
   */
  confirmText?: string;
  /** 입력 안내 문구. 기본값: `계속하려면 "{confirmText}"를 입력해주세요.` */
  confirmDescription?: string;
  /** 요청 진행 중이면 확인 버튼을 막고 "처리 중..."을 표시한다. */
  isLoading?: boolean;
}

// 열릴 때마다 본문을 새로 마운트해서 입력한 확인 문구가 닫힘과 함께 초기화되도록 한다.
export const CancelModal = ({ isOpen, ...props }: IModalType) => (isOpen ? <CancelModalBody {...props} /> : null);

const CancelModalBody = ({
  title,
  content,
  btnText,
  onClick,
  setIsOpen,
  confirmText,
  confirmDescription,
  isLoading = false,
}: Omit<IModalType, "isOpen">) => {
  const backRef = useRef(null);
  const [typedText, setTypedText] = useState("");

  const requiresConfirm = confirmText !== undefined;
  const isConfirmed = !requiresConfirm || typedText === confirmText;
  const isBlocked = !isConfirmed || isLoading;

  const handleClose = () => setIsOpen(false);

  const backClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (backRef.current === e.target) handleClose();
  };

  const handleConfirm = () => {
    if (isBlocked) return;
    onClick();
  };

  return (
    <Back ref={backRef} onClick={backClick}>
      <Modal hasInput={requiresConfirm}>
        <Flex width="100%" height="fit-content" isColumn={true} gap={16} alignItems="center">
          <Text fontSize={28} fontWeight={700} width="100%" textAlign="center">
            {title}
          </Text>
          <Text fontSize={20} fontWeight={400} color={colors.gray[400]} width="100%" textAlign="center">
            {content}
          </Text>
          {requiresConfirm && (
            <>
              <Text fontSize={18} fontWeight={400} color={colors.gray[400]} width="100%" textAlign="center">
                {confirmDescription ?? `계속하려면 "${confirmText}"를 입력해주세요.`}
              </Text>
              <InputWrapper>
                <InputContent
                  width="100%"
                  value={typedText}
                  onChange={e => setTypedText(e.target.value)}
                  placeholder={`"${confirmText}"를 입력하세요`}
                  readonly={isLoading}
                />
              </InputWrapper>
            </>
          )}
        </Flex>
        <Flex gap={16} width="fit-content" height="fit-content">
          <PreviousBtn
            backgroundColor={colors.extra.realWhite}
            color={colors.gray[500]}
            borderColor={colors.gray[300]}
            hoverBackgroundColor="none"
            onClick={handleClose}
          >
            이전
          </PreviousBtn>
          <PreviousBtn
            backgroundColor={colors.extra.error}
            hoverBackgroundColor="none"
            onClick={handleConfirm}
            isBlocked={isBlocked}
          >
            {isLoading ? "처리 중..." : btnText}
          </PreviousBtn>
        </Flex>
      </Modal>
    </Back>
  );
};

const Modal = styled.div<{ hasInput: boolean }>`
  box-sizing: border-box;
  width: ${({ hasInput }) => (hasInput ? "min(520px, calc(100vw - 48px))" : "auto")};
  padding: 44px 60px;
  border-radius: 24px;
  background-color: ${colors.extra.realWhite};
  display: flex;
  flex-direction: column;
  gap: ${({ hasInput }) => (hasInput ? "40px" : "80px")};
  align-items: center;

  ${media.medium} {
    padding: 32px 24px;
  }
`;

const InputWrapper = styled.div`
  width: 100%;
  margin-top: 16px;
`;

const Back = styled.div`
  z-index: 120;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(0, 0, 0, 0.2);
`;

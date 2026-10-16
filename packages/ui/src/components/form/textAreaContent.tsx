import styled from "@emotion/styled";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { colors, Flex, Text } from "@entry/design";

const MAX_LENGTH = 1600;
/** 입력칸을 이만큼(px, 16px 글자 세 줄 남짓)까지 넘치는 건 알리지 않습니다. */
const OVERFLOW_TOLERANCE = 72;

type ITextAreaType = {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export const TextAreaContent = ({ onChange, placeholder, value }: ITextAreaType) => {
  const inputCount = value?.length ?? 0;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const isOverflowingRef = useRef<boolean | null>(null);

  // 원서 PDF 는 입력칸 높이 정도만 담기므로, 줄바꿈이 많아 입력칸을 넘치면 원서에서 잘릴 수 있습니다.
  // 세 줄 남짓 넘친 정도는 넘어가고, 그보다 더 넘치는 순간에만 토스트로 알립니다(처음 불러온 내용으로는 알리지 않음).
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    const isOverflowing = el.scrollHeight - el.clientHeight > OVERFLOW_TOLERANCE;
    if (isOverflowing && isOverflowingRef.current === false) {
      toast.warn("줄바꿈이 많아 원서에서 내용이 잘릴 수 있습니다. 제출 전 원서 미리보기에서 검토한 뒤 제출해 주세요.", {
        toastId: "textarea-overflow",
      });
    }
    isOverflowingRef.current = isOverflowing;
  }, [value]);

  // 붙여넣은 내용이 maxLength 를 넘으면 브라우저가 말없이 잘라내므로, 잘린 글자 수를 토스트로 알립니다.
  const onPasteHandler = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd, value: current } = e.currentTarget;
    // 클립보드의 CRLF 는 textarea 에 들어가면 \n 한 글자가 되므로 같은 기준으로 셉니다.
    const pasted = e.clipboardData.getData("text").replace(/\r\n?/g, "\n");
    const overflow = current.length - (selectionEnd - selectionStart) + pasted.length - MAX_LENGTH;
    if (overflow > 0) {
      toast.warn(
        `최대 ${MAX_LENGTH.toLocaleString()}자까지 입력할 수 있어 붙여넣은 내용 중 ${overflow.toLocaleString()}자가 잘렸습니다.`
      );
    }
  };

  return (
    <Flex width="100%" height="fit-content" isColumn={true} gap={4} alignItems="flex-end">
      <TextArea
        ref={textAreaRef}
        maxLength={MAX_LENGTH}
        onChange={onChange}
        onPaste={onPasteHandler}
        value={value ?? undefined}
        placeholder={placeholder}
      />
      <Text fontSize={12} color={colors.gray[400]}>
        {inputCount}/{MAX_LENGTH}
      </Text>
    </Flex>
  );
};

const TextArea = styled.textarea`
  width: 100%;
  height: 440px;
  border-radius: 6px;
  border: 1px solid ${colors.gray[300]};
  padding: 12px 24px;
  color: ${colors.gray[500]};
  font-size: 16px;
  background-color: ${colors.extra.realWhite};
  &::placeholder {
    color: ${colors.gray[300]};
  }
  resize: none;
`;

import styled from "@emotion/styled";
import { toast } from "react-toastify";

import { colors, Flex, Text } from "@entry/design";

const MAX_LENGTH = 1600;

type ITextAreaType = {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export const TextAreaContent = ({ onChange, placeholder, value }: ITextAreaType) => {
  const inputCount = value?.length ?? 0;

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

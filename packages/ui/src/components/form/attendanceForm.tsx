import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

import { colors, Text } from "@entry/design";
import { Check } from "../../assets";

interface IAttendanceFormType {
  title: string;
  text: string;
  value: string | number | null;
  onChange: (value: string) => void;
  defaultCount?: number;
  width?: string;
  fontSize?: number;
  fontWeight?: number;
  prefix?: string;
  layout?: "column" | "row";
  maxLength?: number;
  maxScore?: number;
  minScore?: number;
  inputWidth?: string;
}

export const AttendanceForm: React.FC<IAttendanceFormType> = ({
  title,
  text,
  value,
  onChange,
  width = "100%",
  fontSize = 16,
  fontWeight = 400,
  prefix,
  layout = "column",
  maxScore,
  minScore = 0,
  inputWidth = "100%",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState<boolean>(false);

  useEffect(() => {
    setIsFilled(!!value || value === 0);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: rawValue } = e.target;

    // 숫자만 추출 (마이너스 기호 제거)
    const numOnlyRegEx = /[^0-9]/g;
    const onlyNums = rawValue.replace(numOnlyRegEx, "");

    // 빈 값 처리
    if (onlyNums === "") {
      onChange("");
      return;
    }

    const numValue = Number(onlyNums);

    // 0 이상인지 체크
    if (numValue < minScore) {
      return;
    }

    // 최댓값이 설정되어 있으면 최댓값 체크
    if (maxScore !== undefined && numValue > maxScore) {
      return;
    }

    // 숫자로 변환 후 다시 문자열로 저장 (선행 0 자동 제거)
    onChange(String(numValue));
  };

  return (
    <Container width={width} layout={layout}>
      <HeaderRow>
        <CheckMark hasValue={!!value}>
          <Check />
        </CheckMark>
        <Text fontSize={fontSize} fontWeight={fontWeight}>
          {prefix ? `${prefix} ` : ""}
          {title}
        </Text>
      </HeaderRow>
      <InputWrapper layout={layout} inputWidth={inputWidth}>
        <StyledInput
          type="text"
          placeholder={text}
          value={value ?? ""}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          hasValue={!!value}
          isFocused={isFocused}
        />
      </InputWrapper>
    </Container>
  );
};

const Container = styled.div<{ width: string; layout: "column" | "row" }>`
  width: ${({ width }) => width};
  margin-bottom: 16px;
  display: flex;
  flex-direction: ${({ layout }) => (layout === "row" ? "row" : "column")};
  justify-content: ${({ layout }) => (layout === "row" ? "space-between" : "flex-start")};
  gap: 10px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const InputWrapper = styled.div<{ layout: "column" | "row"; inputWidth: string }>`
  position: relative;
  width: ${({ layout, inputWidth }) => (layout === "row" ? inputWidth : "100%")};
`;

const StyledInput = styled.input<{
  hasValue: boolean;
  isFocused: boolean;
}>`
  width: 100%;
  height: 48px;
  border: 2px solid
    ${props =>
      props.isFocused
        ? props.hasValue
          ? colors.orange[800]
          : colors.gray[200]
        : props.hasValue
          ? colors.orange[800]
          : colors.gray[200]};
  border-radius: 12px;
  padding: 18px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  &::placeholder {
    color: ${colors.gray[300]};
  }
`;

const CheckMark = styled.span<{ hasValue: boolean }>`
  color: ${props => (props.hasValue ? colors.orange[800] : colors.gray[300])};
  transition: color 0.2s;

  svg {
    fill: currentColor !important;
    color: inherit !important;
  }

  * {
    fill: currentColor !important;
    stroke: currentColor !important;
  }
`;

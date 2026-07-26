import React, { useState } from "react";
import styled from "@emotion/styled";

import { colors, Text } from "@entry/design";
import { Check } from "../../assets";

interface IAttendanceFormType {
  title: string;
  text?: string;
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
  suffix?: string;
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
  suffix,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== null && value !== undefined && value !== "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: rawValue } = e.target;

    const numOnlyRegEx = /[^0-9]/g;
    const onlyNums = rawValue.replace(numOnlyRegEx, "");

    if (onlyNums === "") {
      onChange("");
      return;
    }

    const numValue = Number(onlyNums);

    if (numValue < minScore) {
      return;
    }

    if (maxScore !== undefined && numValue > maxScore) {
      return;
    }

    onChange(String(numValue));
  };

  return (
    <Container width={width} layout={layout}>
      <HeaderRow>
        <CheckMark hasValue={hasValue}>
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
          hasValue={hasValue}
          isFocused={isFocused}
        />
        {suffix && <Suffix>{suffix}</Suffix>}
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
  padding: 18px 48px 18px 18px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: ${colors.gray[300]};
  }
`;

const Suffix = styled.span`
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translateY(-50%);
  color: ${colors.gray[500]};
  pointer-events: none;
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

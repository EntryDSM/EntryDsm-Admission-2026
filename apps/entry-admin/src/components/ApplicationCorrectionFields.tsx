import { type ReactNode, useId } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

import {
  type CorrectionChangeKey,
  type CorrectionErrorKey,
  type CorrectionErrors,
  type CorrectionFormValues,
  type CorrectionSection,
  sanitizeCountInput,
} from "../utils";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardTitleGroup,
  FieldError,
  FieldHelper,
  focusRing,
  RequiredMark,
  TextInput,
} from "./applicationCorrectionStyles";

/** 입력값은 정정 모달이 갖고, 묶음은 그리기와 변경 요청만 맡는다. */
export interface ICorrectionSectionProps {
  values: CorrectionFormValues;
  /** 정정 전 값("현재" 표시와 되돌리기에 쓴다) */
  initial: CorrectionFormValues;
  /** 지금 보여 줄 오류만 */
  errors: CorrectionErrors;
  changedKeys: ReadonlySet<CorrectionChangeKey>;
  /** 저장을 눌러 빈 필수 칸까지 표시할지 */
  showAllErrors: boolean;
  onChange: (patch: Partial<CorrectionFormValues>) => void;
  /** 글자 칸을 벗어나면 그 칸의 오류를 보이기 시작한다 */
  onTouch: (key: CorrectionErrorKey) => void;
  onReset: (section: CorrectionSection) => void;
}

export interface IChoiceOption<T extends string> {
  value: T;
  label: string;
  isDisabled?: boolean;
}

interface ISectionCardType {
  title: string;
  description?: ReactNode;
  isChanged: boolean;
  onReset: () => void;
  children: ReactNode;
}

export const SectionCard = ({ title, description, isChanged, onReset, children }: ISectionCardType) => {
  const titleId = useId();

  return (
    <Card aria-labelledby={titleId}>
      <CardHeader>
        <CardTitleGroup>
          <CardTitle id={titleId}>{title}</CardTitle>
          {isChanged && <ChangedBadge>변경됨</ChangedBadge>}
        </CardTitleGroup>
        {isChanged && (
          <ResetButton type="button" onClick={onReset}>
            되돌리기
          </ResetButton>
        )}
      </CardHeader>
      {description && <CardDescription>{description}</CardDescription>}
      <CardBody>{children}</CardBody>
    </Card>
  );
};

interface IFieldType {
  label: string;
  /** 입력칸이면 그 id 를, 칩 묶음이면 비우고 `labelId` 를 쓴다. */
  htmlFor?: string;
  labelId?: string;
  isChanged?: boolean;
  isRequired?: boolean;
  helper?: ReactNode;
  error?: string;
  children: ReactNode;
}

export const Field = ({ label, htmlFor, labelId, isChanged, isRequired, helper, error, children }: IFieldType) => (
  <FieldRow>
    <FieldLabel as={htmlFor ? "label" : "span"} htmlFor={htmlFor} id={labelId}>
      {isChanged && <ChangedDot role="img" aria-label="변경됨" />}
      {label}
      {isRequired && <RequiredMark aria-hidden="true">*</RequiredMark>}
    </FieldLabel>
    <FieldControl>
      {children}
      {error ? <FieldError role="alert">{error}</FieldError> : helper && <FieldHelper>{helper}</FieldHelper>}
    </FieldControl>
  </FieldRow>
);

interface IChoiceChipsType<T extends string> {
  name: string;
  labelledBy: string;
  options: ReadonlyArray<IChoiceOption<T>>;
  value: T;
  /** 이 값의 선택지에 "현재" 를 붙인다. */
  currentValue?: T;
  isInvalid?: boolean;
  onChange: (value: T) => void;
}

/** 칩 모양 라디오 묶음. 키보드 동작은 기본 라디오 그대로다. */
export const ChoiceChips = <T extends string>({
  name,
  labelledBy,
  options,
  value,
  currentValue,
  isInvalid,
  onChange,
}: IChoiceChipsType<T>) => (
  <ChipGroup role="radiogroup" aria-labelledby={labelledBy} aria-invalid={isInvalid || undefined}>
    {options.map(option => {
      const isSelected = option.value === value;

      return (
        <Chip key={option.value || "keep"} $isSelected={isSelected} $isDisabled={!!option.isDisabled}>
          <ChipInput
            type="radio"
            name={name}
            value={option.value}
            checked={isSelected}
            disabled={option.isDisabled}
            onChange={() => onChange(option.value)}
          />
          {option.label}
          {currentValue && option.value === currentValue && <CurrentTag $isSelected={isSelected}>현재</CurrentTag>}
        </Chip>
      );
    })}
  </ChipGroup>
);

interface ICountInputType {
  id: string;
  label: string;
  suffix: string;
  value: string;
  isInvalid: boolean;
  onChange: (value: string) => void;
}

export const CountInput = ({ id, label, suffix, value, isInvalid, onChange }: ICountInputType) => (
  <CountField>
    <CountLabel htmlFor={id}>{label}</CountLabel>
    <SuffixInputWrapper>
      <TextInput
        id={id}
        inputMode="numeric"
        placeholder="0"
        value={value}
        aria-invalid={isInvalid}
        $hasSuffix={true}
        onChange={event => onChange(sanitizeCountInput(event.target.value))}
      />
      <InputSuffix aria-hidden="true">{suffix}</InputSuffix>
    </SuffixInputWrapper>
  </CountField>
);

const ChangedBadge = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  background-color: ${colors.green[50]};
  color: ${colors.green[600]};
  font-size: 12px;
  font-weight: 600;
`;

const ResetButton = styled.button`
  padding: 4px 6px;
  border-radius: 6px;
  background: none;
  color: ${colors.gray[400]};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    color: ${colors.gray[500]};
    background-color: ${colors.gray[100]};
  }
`;

const CardBody = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
`;

const FieldRow = styled.div`
  padding: 14px 0;
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: start;
  gap: 16px;
  border-top: 1px solid ${colors.gray[100]};

  &:first-of-type {
    border-top: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const FieldLabel = styled.label`
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${colors.gray[500]};
  font-size: 15px;
  font-weight: 500;
  cursor: default;

  @media (max-width: 768px) {
    min-height: auto;
  }
`;

const ChangedDot = styled.span`
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: ${colors.green[500]};
`;

const FieldControl = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.label<{ $isSelected: boolean; $isDisabled: boolean }>`
  height: 40px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${({ $isSelected }) => ($isSelected ? colors.green[400] : colors.gray[300])};
  border-radius: 8px;
  background-color: ${({ $isSelected }) => ($isSelected ? colors.green[50] : colors.extra.realWhite)};
  color: ${({ $isSelected }) => ($isSelected ? colors.green[700] : colors.gray[500])};
  font-size: 15px;
  font-weight: ${({ $isSelected }) => ($isSelected ? 600 : 500)};
  white-space: nowrap;
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.4 : 1)};
  cursor: ${({ $isDisabled }) => ($isDisabled ? "not-allowed" : "pointer")};
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    border-color: ${({ $isSelected, $isDisabled }) =>
      $isSelected ? colors.green[400] : $isDisabled ? colors.gray[300] : colors.gray[400]};
  }

  &:has(input:focus-visible) {
    ${focusRing}
  }

  [aria-invalid="true"] > & {
    border-color: ${colors.extra.error};
  }
`;

// 보이지 않게 숨기되 키보드·보조기기에는 라디오로 남긴다.
const ChipInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

const CurrentTag = styled.span<{ $isSelected: boolean }>`
  padding: 1px 6px;
  border-radius: 4px;
  background-color: ${({ $isSelected }) => ($isSelected ? colors.extra.realWhite : colors.gray[100])};
  color: ${({ $isSelected }) => ($isSelected ? colors.green[600] : colors.gray[400])};
  font-size: 11px;
  font-weight: 600;
`;

const CountField = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CountLabel = styled.label`
  color: ${colors.gray[400]};
  font-size: 13px;
  font-weight: 500;
`;

const SuffixInputWrapper = styled.div`
  position: relative;
`;

const InputSuffix = styled.span`
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  color: ${colors.gray[400]};
  font-size: 14px;
  pointer-events: none;
`;

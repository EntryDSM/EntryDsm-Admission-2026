import { memo, useState, type ChangeEvent, type FocusEvent } from "react";
import { colors, Text } from "@entry/design";
import styled from "@emotion/styled";

interface IDropDownSectionType {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
}

type DateTimePart = "year" | "month" | "day" | "hour" | "minute";
type DateSelectPart = Extract<DateTimePart, "year" | "month" | "day">;
type DateTimeFields = Record<DateTimePart, string>;

const year = new Date().getFullYear();
const YEAR_OPTIONS = [String(year), String(year + 1)];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

const parseDateTime = (value?: string): DateTimeFields => {
  const [date = "", time = ""] = value?.split("T") ?? [];
  const [year = "", month = "", day = ""] = date.split("-");
  const [hour = "", minute = ""] = time.split(":");

  return { year, month, day, hour, minute };
};

const getDaysInMonth = (year: string, month: string) => {
  const selectedYear = Number(year || YEAR_OPTIONS[0]);
  const selectedMonth = Number(month || "01");

  return new Date(selectedYear, selectedMonth, 0).getDate();
};

const getDayOptions = (year: string, month: string) =>
  Array.from({ length: getDaysInMonth(year, month) }, (_, index) => String(index + 1).padStart(2, "0"));

const formatDateTime = ({ year, month, day, hour, minute }: DateTimeFields) =>
  `${year}-${month}-${day}T${hour}:${minute}`;

const formatNumberValue = (value: string, max: number) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "00";
  }

  const clampedValue = Math.min(Math.max(Math.trunc(numberValue), 0), max);

  return String(clampedValue).padStart(2, "0");
};

interface DateSelectProps {
  ariaLabel: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const DateSelect = ({ ariaLabel, options, value, onChange }: DateSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    const nextFocus = e.relatedTarget as Node | null;

    if (!e.currentTarget.contains(nextFocus)) {
      setIsOpen(false);
    }
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <SelectWrapper onBlur={handleBlur}>
      <SelectButton
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
      >
        {value || "--"}
        <SelectArrow $isOpen={isOpen} aria-hidden="true" />
      </SelectButton>
      {isOpen && (
        <OptionList role="listbox" aria-label={ariaLabel}>
          {options.map(option => (
            <OptionButton
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              $isSelected={value === option}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </OptionButton>
          ))}
        </OptionList>
      )}
    </SelectWrapper>
  );
};

export const DropDownSection = memo(({ value, onChange, label }: IDropDownSectionType) => {
  const selectedDateTime = parseDateTime(value);
  const dayOptions = getDayOptions(selectedDateTime.year, selectedDateTime.month);

  const handleDateTimeChange = (part: DateTimePart, value: string) => {
    const nextDateTime = {
      year: selectedDateTime.year || YEAR_OPTIONS[0],
      month: selectedDateTime.month || "01",
      day: selectedDateTime.day || "01",
      hour: selectedDateTime.hour || "00",
      minute: selectedDateTime.minute || "00",
      [part]: value,
    };

    const maxDay = getDaysInMonth(nextDateTime.year, nextDateTime.month);

    if (Number(nextDateTime.day) > maxDay) {
      nextDateTime.day = String(maxDay).padStart(2, "0");
    }

    onChange?.(formatDateTime(nextDateTime));
  };

  const handleSelectChange = (part: DateSelectPart) => (value: string) => {
    handleDateTimeChange(part, value);
  };

  const handleNumberChange = (part: "hour" | "minute", max: number) => (e: ChangeEvent<HTMLInputElement>) => {
    handleDateTimeChange(part, formatNumberValue(e.target.value, max));
  };

  return (
    <FormContainer>
      <Text fontSize={20} width="170px">
        {label}
      </Text>
      <SelectGroup>
        <DateTimeField>
          <DateSelect
            value={selectedDateTime.year}
            onChange={handleSelectChange("year")}
            options={YEAR_OPTIONS}
            ariaLabel={`${label} 연도`}
          />
          <UnitText>년</UnitText>
        </DateTimeField>
        <DateTimeField>
          <DateSelect
            value={selectedDateTime.month}
            onChange={handleSelectChange("month")}
            options={MONTH_OPTIONS}
            ariaLabel={`${label} 월`}
          />
          <UnitText>월</UnitText>
        </DateTimeField>
        <DateTimeField>
          <DateSelect
            value={selectedDateTime.day}
            onChange={handleSelectChange("day")}
            options={dayOptions}
            ariaLabel={`${label} 일`}
          />
          <UnitText>일</UnitText>
        </DateTimeField>
        <DateTimeField>
          <NumberInput
            value={selectedDateTime.hour}
            onChange={handleNumberChange("hour", 23)}
            aria-label={`${label} 시`}
            type="number"
            min={0}
            max={23}
            step={1}
            placeholder="00"
          />
          <UnitText>시</UnitText>
        </DateTimeField>
        <DateTimeField>
          <NumberInput
            value={selectedDateTime.minute}
            onChange={handleNumberChange("minute", 59)}
            aria-label={`${label} 분`}
            type="number"
            min={0}
            max={59}
            step={1}
            placeholder="00"
          />
          <UnitText>분</UnitText>
        </DateTimeField>
      </SelectGroup>
    </FormContainer>
  );
});

const FormContainer = styled.div`
  width: 100%;
  padding: 10px 0;
  display: flex;
  gap: 20px;
  align-items: center;
  border-bottom: 1px solid ${colors.gray[200]};
`;

const SelectGroup = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const DateTimeField = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const SelectButton = styled.button`
  min-width: 83px;
  height: 43px;
  padding: 0 13px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  background-color: ${colors.gray[50]};
  color: ${colors.gray[500]};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  &:focus {
    outline: none;
    border-color: ${colors.green[500]};
  }
`;

const SelectArrow = styled.span<{ $isOpen: boolean }>`
  width: 7px;
  height: 7px;
  border-right: 1.5px solid ${colors.gray[400]};
  border-bottom: 1.5px solid ${colors.gray[400]};
  color: ${colors.gray[400]};
  flex: 0 0 auto;
  transform: rotate(${({ $isOpen }) => ($isOpen ? "225deg" : "45deg")});
  transform-origin: center;
  transition: transform 0.12s ease;
`;

const OptionList = styled.div`
  position: absolute;
  top: 49px;
  left: 0;
  z-index: 20;
  width: 83px;
  max-height: 172px;
  overflow-y: auto;
  padding: 6px;
  border: 1px solid ${colors.gray[200]};
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 8px 20px rgb(0 0 0 / 8%);
`;

const OptionButton = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  height: 32px;
  border: none;
  border-radius: 6px;
  background-color: ${({ $isSelected }) => ($isSelected ? colors.green[50] : "transparent")};
  color: ${({ $isSelected }) => ($isSelected ? colors.green[600] : colors.gray[500])};
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: ${colors.gray[50]};
  }
`;

const NumberInput = styled.input`
  width: 78px;
  height: 48px;
  padding: 0 12px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  background-color: ${colors.gray[50]};
  color: ${colors.gray[500]};
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${colors.green[500]};
  }
`;

const UnitText = styled.span`
  font-size: 16px;
  color: ${colors.gray[500]};
  white-space: nowrap;
`;

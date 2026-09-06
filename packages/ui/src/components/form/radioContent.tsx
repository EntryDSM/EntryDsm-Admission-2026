import styled from "@emotion/styled";

import { colors, Flex, Text } from "@entry/design";
import { Check } from "../../assets";

interface IRadioType {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  groupName: string;
  disabled?: boolean;
}

export const RadioContent = ({ label, isSelected, onSelect, groupName, disabled = false }: IRadioType) => (
  <RadioLabel $disabled={disabled}>
    <Flex width="fit-content" height="fit-content" gap={8} alignItems="center">
      <Radio
        type="radio"
        name={groupName}
        value={label}
        checked={isSelected}
        onChange={onSelect}
        aria-label={label}
        disabled={disabled}
      />
      <RadioIndicator isClick={isSelected}>
        <Check color={isSelected ? colors.extra.realWhite : "transparent"} />
      </RadioIndicator>
      <Text fontSize={20}>{label}</Text>
    </Flex>
  </RadioLabel>
);

const RadioLabel = styled.label<{ $disabled: boolean }>`
  display: inline-flex;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  position: relative;

  &:has(input:focus-visible) span {
    outline: 2px solid ${colors.orange[800]};
    outline-offset: 3px;
  }
`;

const Radio = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

const RadioIndicator = styled.span<{ isClick: boolean }>`
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 14px;
  border: 3px solid ${({ isClick }) => (isClick ? colors.orange[800] : colors.gray[200])};
  background-color: ${({ isClick }) => (isClick ? colors.orange[800] : "transparent")};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: inherit;
`;

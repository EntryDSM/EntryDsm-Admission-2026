import styled from "@emotion/styled";

import { colors, Flex, Text } from "@entry/design";
import { Check } from "../../assets";

interface IRadioType {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  groupName: string;
}

export const RadioContent = ({ label, isSelected, onSelect, groupName }: IRadioType) => (
  <RadioLabel>
    <Flex width="fit-content" height="fit-content" gap={8} alignItems="center">
      <Radio type="radio" name={groupName} value={label} checked={isSelected} onChange={onSelect} aria-label={label} />
      <RadioIndicator isClick={isSelected}>
        <Check color={isSelected ? colors.extra.realWhite : "transparent"} />
      </RadioIndicator>
      <Text fontSize={20}>{label}</Text>
    </Flex>
  </RadioLabel>
);

const RadioLabel = styled.label`
  display: inline-flex;
  cursor: pointer;
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
  cursor: pointer;
`;

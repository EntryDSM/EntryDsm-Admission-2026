import styled from "@emotion/styled";

import { colors } from "@entry/design";
import { Cancel } from "../../../assets";

interface IGradeType {
  grade?: string;
  isCancel?: boolean;
  isSelected: boolean;
  onSelect?: () => void;
  width?: string;
  height?: string;
  fontSize?: string;
  gap?: string;
  groupName?: string;
}

export const Grade = ({ grade, isCancel, isSelected, onSelect, width, height, fontSize, groupName }: IGradeType) => {
  const value = isCancel ? "x" : (grade ?? "");

  return (
    <GradeContainer
      $width={width || "45px"}
      $height={height || "45px"}
      $fontSize={fontSize || "22px"}
      $isClick={isSelected}
    >
      <Radio
        $isClick={isSelected}
        type="radio"
        name={groupName}
        value={value}
        checked={isSelected}
        onChange={onSelect}
      />
      <CancelContent>{isCancel ? <Cancel isClicked={isSelected} /> : grade}</CancelContent>
    </GradeContainer>
  );
};

const Radio = styled.input<{
  $isClick?: boolean;
}>`
  width: 100%;
  height: 100%;

  opacity: 0;
  position: relative;
  cursor: pointer;
`;

const CancelContent = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
`;

const GradeContainer = styled.label<{
  $isClick?: boolean;
  $width: string;
  $height: string;
  $fontSize: string;
}>`
  width: ${props => props.$width};
  height: ${props => props.$height};
  color: ${props => (props.$isClick ? colors.extra.realWhite : colors.orange[800])};
  background-color: ${props => (props.$isClick ? colors.orange[800] : "none")};
  border: 2px solid ${colors.orange[800]};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.$fontSize};
  font-weight: 450;
  transition: all 0.2s ease;
  position: relative;

  &:has(input:focus-visible) {
    outline: 3px solid ${colors.orange[800]};
    outline-offset: 3px;
  }
`;

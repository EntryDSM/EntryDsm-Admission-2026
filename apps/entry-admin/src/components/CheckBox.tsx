import styled from "@emotion/styled";
import { colors } from "@entry/design";

interface ICheckBoxType {
  isChecked: boolean;
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CheckBox = ({ isChecked, label, onChange }: ICheckBoxType) => {
  return (
    <Container>
      <Label>
        <input type="checkbox" checked={isChecked} onChange={onChange} />
        {label}
      </Label>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;

  input[type="checkbox"] {
    width: 14px;
    height: 14px;
    margin: 0 8px 0 0;
    accent-color: ${colors.green[400]};
  }
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.gray[400]};
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

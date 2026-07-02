import styled from "@emotion/styled";
import { colors } from "@entry/design";

import { getApplicationTypeLabel, getEducationalStatusLabel } from "./applicantLabelModel";

type IApplicationComponentType = {
  receiptCode?: number;
  applicantName?: string;
  examinationNumber?: string;
  applicationType?: string;
  educationalStatus?: string;
  isDaejeon?: boolean;
  isArrived?: boolean;
  onClick: () => void;
  onRegisterClick?: () => void;
};

export const Applicant = ({
  receiptCode,
  applicantName,
  examinationNumber,
  applicationType,
  educationalStatus,
  isDaejeon,
  isArrived,
  onClick,
  onRegisterClick,
}: IApplicationComponentType) => {
  const regionLabel = isDaejeon === undefined ? "-" : isDaejeon ? "대전" : "전국";
  const statusLabel = isArrived ? "원서 도착" : "-";

  const handleRegisterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRegisterClick?.();
  };

  return (
    <Container role="row" onClick={onClick}>
      <Cell role="cell">{receiptCode ?? "-"}</Cell>
      <Cell role="cell">{applicantName || "-"}</Cell>
      <Cell role="cell">{regionLabel}</Cell>
      <Cell role="cell">{getApplicationTypeLabel(applicationType)}</Cell>
      <Cell role="cell">{getEducationalStatusLabel(educationalStatus)}</Cell>
      <Cell role="cell">{examinationNumber ?? "-"}</Cell>
      <CheckboxCell role="cell">
        <StyledCheckbox type="checkbox" checked={!!isArrived} onClick={event => event.stopPropagation()} readOnly />
      </CheckboxCell>
      <Cell role="cell">{statusLabel}</Cell>
      <RegisterCell role="cell">
        <RegisterButton type="button" onClick={handleRegisterClick}>
          합격자 등록
        </RegisterButton>
      </RegisterCell>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 83px;
  display: grid;
  grid-template-columns: 0.8fr 1.2fr 0.7fr 1.4fr 0.9fr 0.9fr 1.3fr 1fr 1.2fr;
  column-gap: clamp(8px, 2.6vw, 50px);
  align-items: center;
  background-color: ${colors.extra.realWhite};
  cursor: pointer;

  &:hover {
    background-color: ${colors.gray[50]};
  }
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0 4px;
  color: ${colors.gray[400]};
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const CheckboxCell = styled(Cell)`
  padding: 0;
`;

const RegisterCell = styled(Cell)`
  padding: 0;
`;

const StyledCheckbox = styled.input`
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: ${colors.green[400]};
  cursor: pointer;
`;

const RegisterButton = styled.button`
  height: 37px;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${colors.green[400]};
  color: ${colors.gray[50]};
  font-size: 18px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: ${colors.green[500]};
  }

  @media (max-width: 768px) {
    height: 34px;
    padding: 8px;
    font-size: 14px;
  }
`;

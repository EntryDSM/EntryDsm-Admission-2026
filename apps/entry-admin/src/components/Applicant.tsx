import styled from "@emotion/styled";
import { colors } from "@entry/design";

import {
  type ApplicantActionMode,
  getApplicantActionLabel,
  getApplicationTypeLabel,
  getArrivalStatusLabel,
  getEducationalStatusLabel,
} from "./applicantLabelModel";

type IApplicationComponentType = {
  receiptCode?: string;
  applicantName?: string;
  examinationNumber?: string;
  applicationType?: string;
  educationalStatus?: string;
  isDaejeon?: boolean;
  isArrived?: boolean;
  /** 마지막 열 버튼의 역할. 원서 접수 기간에는 "접수 취소", 접수가 끝나면 "2차 합격자 등록". */
  actionMode: ApplicantActionMode;
  onClick: () => void;
  /** 마지막 열 버튼 클릭. 역할(actionMode)에 따라 접수 취소 또는 2차 합격자 등록을 시작한다. */
  onActionClick?: () => void;
  onArrivalClick?: () => void;
};

export const Applicant = ({
  receiptCode,
  applicantName,
  examinationNumber,
  applicationType,
  educationalStatus,
  isDaejeon,
  isArrived,
  actionMode,
  onClick,
  onActionClick,
  onArrivalClick,
}: IApplicationComponentType) => {
  const regionLabel = isDaejeon === undefined ? "-" : isDaejeon ? "대전" : "전국";
  const statusLabel = getArrivalStatusLabel(isArrived);

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onActionClick?.();
  };

  const handleArrivalClick = (event: React.MouseEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onArrivalClick?.();
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
        <StyledCheckbox type="checkbox" checked={!!isArrived} onClick={handleArrivalClick} readOnly />
      </CheckboxCell>
      <Cell role="cell">{statusLabel}</Cell>
      <ActionCell role="cell">
        <ActionButton type="button" actionMode={actionMode} onClick={handleActionClick}>
          {getApplicantActionLabel(actionMode)}
        </ActionButton>
      </ActionCell>
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

const ActionCell = styled(Cell)`
  padding: 0;
`;

const StyledCheckbox = styled.input`
  width: 24px;
  height: 24px;
  margin: 0;
  accent-color: ${colors.green[400]};
  cursor: pointer;

  @media (max-width: 768px) {
    width: 22px;
    height: 22px;
  }
`;

/** 접수 취소는 되돌릴 수 없는 삭제라 경고색으로, 2차 합격자 등록은 기존 초록색으로 구분한다. */
const ActionButton = styled.button<{ actionMode: ApplicantActionMode }>`
  height: 37px;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${({ actionMode }) => (actionMode === "cancel" ? colors.extra.error : colors.green[400])};
  color: ${colors.gray[50]};
  font-size: 18px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    ${({ actionMode }) =>
      actionMode === "cancel" ? "filter: brightness(0.92);" : `background-color: ${colors.green[500]};`}
  }

  @media (max-width: 768px) {
    height: 34px;
    padding: 8px;
    font-size: 14px;
  }
`;

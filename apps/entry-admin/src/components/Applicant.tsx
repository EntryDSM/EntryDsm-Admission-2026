import styled from "@emotion/styled";
import { colors } from "@entry/design";

import { ApplicantActionMenu } from "./ApplicantActionMenu";
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
  /** 마지막 열 버튼의 역할. 1차 합격자 산출 전에는 "원서 정정"(정정·접수 취소 메뉴), 산출 결과를 받으면 "2차 합격자 등록". */
  actionMode: ApplicantActionMode;
  /** 원서 접수 기간이라 원서 정정 메뉴에서 접수 취소를 할 수 있는지 */
  isCancelAvailable?: boolean;
  onClick: () => void;
  /** "2차 합격자 등록" 버튼 클릭 */
  onRegisterClick?: () => void;
  /** 원서 정정 메뉴의 "원서 정정" */
  onCorrectClick?: () => void;
  /** 원서 정정 메뉴의 "원서 접수 취소" */
  onCancelClick?: () => void;
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
  isCancelAvailable = false,
  onClick,
  onRegisterClick,
  onCorrectClick,
  onCancelClick,
  onArrivalClick,
}: IApplicationComponentType) => {
  const regionLabel = isDaejeon === undefined ? "-" : isDaejeon ? "대전" : "전국";
  const statusLabel = getArrivalStatusLabel(isArrived);

  const handleRegisterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRegisterClick?.();
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
        {actionMode === "correct" ? (
          <ApplicantActionMenu
            isCancelAvailable={isCancelAvailable}
            onCorrect={() => onCorrectClick?.()}
            onCancel={() => onCancelClick?.()}
          />
        ) : (
          <ActionButton type="button" onClick={handleRegisterClick}>
            {getApplicantActionLabel(actionMode)}
          </ActionButton>
        )}
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

// 원서 정정 메뉴가 칸 밖(아래 행 위)으로 펼쳐지므로 잘라내지 않는다.
const ActionCell = styled(Cell)`
  padding: 0;
  overflow: visible;
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

const ActionButton = styled.button`
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

import styled from "@emotion/styled";

import { colors, media } from "@entry/design";
import { GradeSelector } from "./gradeSelector";

interface IAllSubjectSelectorType {
  selected: string | null;
  onSelect: (grade: string | null) => void;
}

export const AllSubjectSelector = ({ selected, onSelect }: IAllSubjectSelectorType) => {
  return (
    <Container>
      <Title>전체 선택</Title>
      <GradeSelector selected={selected} onSelect={onSelect} size="small" groupName={"all-subject"} />
    </Container>
  );
};

const Container = styled.div`
  width: min(100%, 400px);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
  margin-left: auto;
  height: 30px;

  ${media.tablet} {
    width: 100%;
  }

  ${media.medium} {
    height: auto;
    justify-content: space-between;
    gap: 8px;
  }
`;

const Title = styled.div`
  font-size: 14px;
  color: ${colors.gray[400]};
  flex-shrink: 0;
  white-space: nowrap;
`;

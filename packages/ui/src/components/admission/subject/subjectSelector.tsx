import styled from "@emotion/styled";

import { colors, media } from "@entry/design";
import { GradeSelector } from "./gradeSelector";

interface ISubjectSelector {
  subjectName: string;
  selectedGrade: string | null;
  onSelectGrade: (grade: string | null) => void;
}

export const SubjectSelector = ({ subjectName, selectedGrade, onSelectGrade }: ISubjectSelector) => {
  const handleSelect = (grade: string | null) => {
    onSelectGrade(grade);
  };

  return (
    <Container>
      <Label>
        <Subject>{subjectName}</Subject>
      </Label>
      <GradeSelector selected={selectedGrade} onSelect={handleSelect} groupName={`subject-${subjectName}`} />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 80px;
  border-top: 1px solid ${colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.tablet} {
    height: auto;
    gap: 12px;
    padding: 16px 0;
  }

  ${media.medium} {
    gap: 8px;
  }
`;

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  flex-shrink: 0;
`;

const Subject = styled.div`
  font-size: 22px;
  font-weight: 450;

  ${media.tablet} {
    font-size: 18px;
  }

  ${media.medium} {
    font-size: 15px;
    white-space: nowrap;
  }
`;

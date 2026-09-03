import styled from "@emotion/styled";

import { Grade } from "./grade";

interface IGradeSelectorType {
  selected: string | null;
  onSelect: (grade: string | null) => void;
  size?: "large" | "small";
  groupName: string;
}

export const GradeSelector = ({ selected, onSelect, size = "large", groupName }: IGradeSelectorType) => {
  const isSmall = size === "small";
  const grades = ["A", "B", "C", "D", "E"];

  const handleSelect = (grade: string | null) => {
    onSelect(selected === grade ? null : grade);
  };

  return (
    <GradeSelectorContainer $gap={isSmall ? "10px" : "20px"}>
      {grades.map(grade => (
        <Grade
          key={grade}
          grade={grade}
          isSelected={selected === grade}
          groupName={groupName}
          onSelect={() => handleSelect(grade)}
          width={isSmall ? "30px" : "45px"}
          height={isSmall ? "30px" : "45px"}
          fontSize={isSmall ? "15px" : "22px"}
        />
      ))}
      <Grade
        isCancel={true}
        isSelected={selected === "x"}
        groupName={groupName}
        onSelect={() => handleSelect("x")}
        width={isSmall ? "30px" : "45px"}
        height={isSmall ? "30px" : "45px"}
      />
    </GradeSelectorContainer>
  );
};

const GradeSelectorContainer = styled.div<{ $gap: string }>`
  display: flex;
  align-items: center;
  gap: ${props => props.$gap};
`;

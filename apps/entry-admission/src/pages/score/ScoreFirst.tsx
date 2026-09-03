import { useState } from "react";
import { Flex } from "@entry/design";
import { GradeManager, usePageData } from "@entry/ui";

interface ScorePagePropsType {
  pageKey: "firstGraduate" | "firstGraduateProspective";
}

export const ScoreFirst = ({ pageKey }: ScorePagePropsType) => {
  const subjects = ["국어", "사회", "역사", "수학", "과학", "기술·가정", "영어"];
  const [globalGrade, setGlobalGrade] = useState<string | null>(null);

  const [subjectGrades, setSubjectGrades] = usePageData(pageKey);

  return (
    <Flex width="100%" height="100%" isColumn={true}>
      <GradeManager
        subjects={subjects}
        globalGrade={globalGrade}
        subjectGrades={subjectGrades}
        setGlobalGrade={setGlobalGrade}
        setSubjectGrades={setSubjectGrades}
      />
    </Flex>
  );
};

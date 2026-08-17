import { useState } from "react";
import { Flex } from "@entry/design";
import { GradeManager } from "@entry/ui";
import { useCalculationPageData } from "../../contexts";

interface IScoreType {
  kor: string | null;
  soc: string | null;
  his: string | null;
  math: string | null;
  sci: string | null;
  tech: string | null;
  eng: string | null;
  [key: string]: string | null;
}

interface ScorePageProps {
  pageKey: "graduatedSecond1";
}

export const ScoreFourth = ({ pageKey }: ScorePageProps) => {
  const subjects = ["국어", "사회", "역사", "수학", "과학", "기술 · 가정", "영어"];
  const [globalGrade, setGlobalGrade] = useState<string | null>(null);
  const [subjectGrades, setSubjectGrades] = useCalculationPageData(pageKey);

  const safeSubjectGrades: Record<string, string | null> = subjectGrades || {};

  const handleSetSubjectGrades = (value: React.SetStateAction<Record<string, string | null>>) => {
    if (typeof value === "function") {
      const result = value(subjectGrades || {});
      setSubjectGrades(result as IScoreType);
    } else {
      setSubjectGrades(value as IScoreType);
    }
  };

  return (
    <Flex width="100%" height="100%" isColumn={true}>
      <GradeManager
        subjects={subjects}
        globalGrade={globalGrade}
        subjectGrades={safeSubjectGrades}
        setGlobalGrade={setGlobalGrade}
        setSubjectGrades={handleSetSubjectGrades}
      />
    </Flex>
  );
};

import { AllSubjectSelector } from "./allSubjectSelector";
import { SubjectSelector } from "./subjectSelector";

interface IGradeManagerProps {
  subjects: string[];
  globalGrade: string | null;
  subjectGrades: Record<string, string | null>;
  setGlobalGrade: React.Dispatch<React.SetStateAction<string | null>>;
  setSubjectGrades: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
}

export const GradeManager = ({
  subjects,
  globalGrade,
  subjectGrades,
  setGlobalGrade,
  setSubjectGrades,
}: IGradeManagerProps) => {
  const defaultSubjectKeys = ["kor", "soc", "his", "math", "sci", "tech", "eng"];
  const subjectKeyMap: Record<string, string> = {
    국어: "kor",
    사회: "soc",
    역사: "his",
    수학: "math",
    과학: "sci",
    "기술·가정": "tech",
    기술ㆍ가정: "tech",
    영어: "eng",
  };

  const getSubjectKey = (subject: string, index?: number) =>
    subjectKeyMap[subject] ?? defaultSubjectKeys[index ?? -1] ?? subject;

  const handleGlobalGradeChange = (grade: string | null) => {
    setGlobalGrade(grade);
    const updatedGrades: Record<string, string | null> = {};
    subjects.forEach((subject, index) => {
      const key = getSubjectKey(subject, index);
      updatedGrades[key] = grade;
    });
    setSubjectGrades(updatedGrades);
  };

  const handleSubjectGradeChange = (subject: string, grade: string | null) => {
    const key = getSubjectKey(subject);
    const updatedGrades = {
      ...subjectGrades,
      [key]: grade,
    };

    setSubjectGrades(updatedGrades);

    // 모든 과목이 같은 성적인지 확인
    const subjectKeys = subjects.map((subj, index) => getSubjectKey(subj, index));
    const allSameGrade = subjectKeys.every(subjKey => updatedGrades[subjKey] === grade);

    if (allSameGrade && subjectKeys.every(subjKey => subjKey in updatedGrades)) {
      setGlobalGrade(grade);
    } else if (globalGrade !== null) {
      setGlobalGrade(null);
    }
  };

  return (
    <>
      <AllSubjectSelector selected={globalGrade} onSelect={handleGlobalGradeChange} />
      {subjects.map((subject, index) => {
        const key = getSubjectKey(subject, index);
        return (
          <SubjectSelector
            key={subject}
            subjectName={subject}
            selectedGrade={subjectGrades[key] ?? null}
            onSelectGrade={grade => handleSubjectGradeChange(subject, grade)}
          />
        );
      })}
    </>
  );
};

import { useMemo, useState, type ChangeEvent } from "react";
import styled from "@emotion/styled";

import { colors, Flex, Text } from "@entry/design";
import { Btn, TabSection } from "@entry/ui";

import {
  FormulaEditorPanel,
  FormulaScoreCards,
  FormulaVariableDictionary,
  type FormulaDraftValue,
  type FormulaTextField,
  type FormulaVariableGroup,
} from "../components";

type AdmissionType = "GENERAL" | "MEISTER" | "SOCIAL";

type FormulaConfig = FormulaDraftValue & {
  id: string;
  admissionType: AdmissionType;
};

type FormulaDraft = Omit<FormulaConfig, "id" | "admissionType">;

const ADMISSION_TABS = [
  { key: "GENERAL", label: "일반전형" },
  { key: "MEISTER", label: "마이스터 인재" },
  { key: "SOCIAL", label: "사회통합" },
];

const DEFAULT_FORMULAS: FormulaConfig[] = [
  {
    id: "general-subject-base",
    admissionType: "GENERAL",
    phase: "공통 산출",
    name: "졸업예정자 교과 기준점수",
    resultVariable: "subjectBaseScore",
    maxScore: 80,
    formula: "round((grade31Average * 8) + (previousSemesterAverage * 4) + (beforePreviousSemesterAverage * 4), 3)",
    variables: ["grade31Average", "previousSemesterAverage", "beforePreviousSemesterAverage"],
  },
  {
    id: "general-subject-score",
    admissionType: "GENERAL",
    phase: "1차 전형",
    name: "일반전형 교과 성적",
    resultVariable: "subjectScore",
    maxScore: 140,
    formula: "round(subjectBaseScore * 1.75, 3)",
    variables: ["subjectBaseScore"],
  },
  {
    id: "general-attendance-score",
    admissionType: "GENERAL",
    phase: "1차 전형",
    name: "일반전형 출석 점수",
    resultVariable: "attendanceScore",
    maxScore: 15,
    formula: "max(15 - floor(absenceDays + ((lateCount + earlyLeaveCount + resultCount) / 3)), 0)",
    variables: ["absenceDays", "lateCount", "earlyLeaveCount", "resultCount"],
  },
  {
    id: "general-volunteer-score",
    admissionType: "GENERAL",
    phase: "1차 전형",
    name: "일반전형 봉사활동 점수",
    resultVariable: "volunteerScore",
    maxScore: 15,
    formula: "min(volunteerHours, 15)",
    variables: ["volunteerHours"],
  },
  {
    id: "general-bonus-score",
    admissionType: "GENERAL",
    phase: "1차 전형",
    name: "일반전형 가산점",
    resultVariable: "bonusScore",
    maxScore: 3,
    formula: "algorithmContestBonus",
    variables: ["algorithmContestBonus"],
  },
  {
    id: "general-first-round",
    admissionType: "GENERAL",
    phase: "1차 전형",
    name: "일반전형 1차 합계",
    resultVariable: "firstRoundScore",
    maxScore: 173,
    formula: "subjectScore + attendanceScore + volunteerScore + bonusScore",
    variables: ["subjectScore", "attendanceScore", "volunteerScore", "bonusScore"],
  },
  {
    id: "meister-subject-base",
    admissionType: "MEISTER",
    phase: "공통 산출",
    name: "졸업자 교과 기준점수",
    resultVariable: "subjectBaseScore",
    maxScore: 80,
    formula:
      "round((grade32Average * 4) + (grade31Average * 4) + (previousSemesterAverage * 4) + (beforePreviousSemesterAverage * 4), 3)",
    variables: ["grade32Average", "grade31Average", "previousSemesterAverage", "beforePreviousSemesterAverage"],
  },
  {
    id: "meister-subject-score",
    admissionType: "MEISTER",
    phase: "1차 전형",
    name: "마이스터 인재 교과 성적",
    resultVariable: "subjectScore",
    maxScore: 80,
    formula: "subjectBaseScore",
    variables: ["subjectBaseScore"],
  },
  {
    id: "meister-attendance-score",
    admissionType: "MEISTER",
    phase: "1차 전형",
    name: "마이스터 인재 출석 점수",
    resultVariable: "attendanceScore",
    maxScore: 15,
    formula: "max(15 - floor(absenceDays + ((lateCount + earlyLeaveCount + resultCount) / 3)), 0)",
    variables: ["absenceDays", "lateCount", "earlyLeaveCount", "resultCount"],
  },
  {
    id: "meister-volunteer-score",
    admissionType: "MEISTER",
    phase: "1차 전형",
    name: "마이스터 인재 봉사활동 점수",
    resultVariable: "volunteerScore",
    maxScore: 15,
    formula: "min(volunteerHours, 15)",
    variables: ["volunteerHours"],
  },
  {
    id: "meister-bonus-score",
    admissionType: "MEISTER",
    phase: "1차 전형",
    name: "마이스터 인재 가산점",
    resultVariable: "bonusScore",
    maxScore: 9,
    formula: "algorithmContestBonus + certificateBonus",
    variables: ["algorithmContestBonus", "certificateBonus"],
  },
  {
    id: "meister-first-round",
    admissionType: "MEISTER",
    phase: "1차 전형",
    name: "마이스터 인재 1차 합계",
    resultVariable: "firstRoundScore",
    maxScore: 119,
    formula: "subjectScore + attendanceScore + volunteerScore + bonusScore",
    variables: ["subjectScore", "attendanceScore", "volunteerScore", "bonusScore"],
  },
  {
    id: "social-subject-score",
    admissionType: "SOCIAL",
    phase: "1차 전형",
    name: "사회통합 교과 성적",
    resultVariable: "subjectScore",
    maxScore: 80,
    formula: "subjectBaseScore",
    variables: ["subjectBaseScore"],
  },
  {
    id: "social-attendance-score",
    admissionType: "SOCIAL",
    phase: "1차 전형",
    name: "사회통합 출석 점수",
    resultVariable: "attendanceScore",
    maxScore: 15,
    formula: "max(15 - floor(absenceDays + ((lateCount + earlyLeaveCount + resultCount) / 3)), 0)",
    variables: ["absenceDays", "lateCount", "earlyLeaveCount", "resultCount"],
  },
  {
    id: "social-volunteer-score",
    admissionType: "SOCIAL",
    phase: "1차 전형",
    name: "사회통합 봉사활동 점수",
    resultVariable: "volunteerScore",
    maxScore: 15,
    formula: "min(volunteerHours, 15)",
    variables: ["volunteerHours"],
  },
  {
    id: "social-bonus-score",
    admissionType: "SOCIAL",
    phase: "1차 전형",
    name: "사회통합 가산점",
    resultVariable: "bonusScore",
    maxScore: 9,
    formula: "algorithmContestBonus + certificateBonus",
    variables: ["algorithmContestBonus", "certificateBonus"],
  },
  {
    id: "social-first-round",
    admissionType: "SOCIAL",
    phase: "1차 전형",
    name: "사회통합 1차 합계",
    resultVariable: "firstRoundScore",
    maxScore: 119,
    formula: "subjectScore + attendanceScore + volunteerScore + bonusScore",
    variables: ["subjectScore", "attendanceScore", "volunteerScore", "bonusScore"],
  },
];

const VARIABLE_GROUPS: FormulaVariableGroup[] = [
  {
    title: "교과 성적",
    variables: [
      { key: "grade32Average", label: "3-2 평균평점" },
      { key: "grade31Average", label: "3-1 평균평점" },
      { key: "previousSemesterAverage", label: "직전학기 평균평점" },
      { key: "beforePreviousSemesterAverage", label: "직전전학기 평균평점" },
      { key: "subjectBaseScore", label: "교과 기준점수" },
      { key: "subjectScore", label: "교과 환산점수" },
    ],
  },
  {
    title: "출석 점수",
    variables: [
      { key: "absenceDays", label: "미인정 결석" },
      { key: "lateCount", label: "미인정 지각" },
      { key: "earlyLeaveCount", label: "미인정 조퇴" },
      { key: "resultCount", label: "미인정 결과" },
      { key: "attendanceScore", label: "출석 점수" },
    ],
  },
  {
    title: "봉사, 가산점, 합계",
    variables: [
      { key: "volunteerHours", label: "봉사 시간" },
      { key: "volunteerScore", label: "봉사활동 점수" },
      { key: "algorithmContestBonus", label: "알고리즘대회 가산점" },
      { key: "certificateBonus", label: "정보처리기능사 가산점" },
      { key: "bonusScore", label: "가산점" },
      { key: "firstRoundScore", label: "1차 합계" },
    ],
  },
];

const getInitialDraft = (formula: FormulaConfig): FormulaDraft => ({
  phase: formula.phase,
  name: formula.name,
  resultVariable: formula.resultVariable,
  maxScore: formula.maxScore,
  formula: formula.formula,
  variables: formula.variables,
});

export const FormulaCalculator = () => {
  const [activeTab, setActiveTab] = useState<AdmissionType>("GENERAL");
  const [formulaRows, setFormulaRows] = useState<FormulaConfig[]>(DEFAULT_FORMULAS);
  const [selectedFormulaId, setSelectedFormulaId] = useState(DEFAULT_FORMULAS[0].id);
  const [draft, setDraft] = useState<FormulaDraft>(getInitialDraft(DEFAULT_FORMULAS[0]));

  const activeFormulas = useMemo(
    () => formulaRows.filter(formula => formula.admissionType === activeTab),
    [activeTab, formulaRows]
  );
  const selectedFormula = useMemo(
    () => formulaRows.find(formula => formula.id === selectedFormulaId),
    [formulaRows, selectedFormulaId]
  );
  const usedVariables = useMemo(
    () => VARIABLE_GROUPS.flatMap(group => group.variables).filter(variable => draft.variables.includes(variable.key)),
    [draft.variables]
  );

  const handleTabChange = (tab: string) => {
    const nextTab = tab as AdmissionType;
    const nextFormula = formulaRows.find(formula => formula.admissionType === nextTab);

    setActiveTab(nextTab);
    setSelectedFormulaId(nextFormula?.id ?? "");
    if (nextFormula) {
      setDraft(getInitialDraft(nextFormula));
    }
  };

  const handleFormulaSelect = (formulaId: string) => {
    const nextFormula = formulaRows.find(formula => formula.id === formulaId);

    setSelectedFormulaId(formulaId);
    if (nextFormula) {
      setDraft(getInitialDraft(nextFormula));
    }
  };

  const handleTextFieldChange =
    (field: FormulaTextField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setDraft(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleMaxScoreChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft(prev => ({ ...prev, maxScore: Number(e.target.value) || 0 }));
  };

  const handleVariableClick = (variableKey: string) => {
    setDraft(prev => ({
      ...prev,
      formula: prev.formula ? `${prev.formula} {${variableKey}}` : `{${variableKey}}`,
      variables: prev.variables.includes(variableKey) ? prev.variables : [...prev.variables, variableKey],
    }));
  };

  const handleDraftSave = () => {
    setFormulaRows(prev =>
      prev.map(formula =>
        formula.id === selectedFormulaId
          ? {
              ...formula,
              ...draft,
            }
          : formula
      )
    );
  };

  const handleDraftReset = () => {
    if (selectedFormula) {
      setDraft(getInitialDraft(selectedFormula));
    }
  };

  return (
    <Container>
      <HeaderSection>
        <Text fontSize={32} fontWeight={700} color={colors.gray[500]}>
          계산식 수정
        </Text>
        <Flex width="fit-content" height="fit-content" gap={12}>
          <Btn onClick={handleDraftSave} backgroundColor={colors.green[500]} hoverBackgroundColor={colors.green[600]}>
            저장
          </Btn>
          <Btn
            onClick={handleDraftReset}
            backgroundColor={colors.gray[50]}
            hoverBackgroundColor={colors.gray[100]}
            borderColor={colors.gray[200]}
            color={colors.gray[500]}
          >
            취소
          </Btn>
        </Flex>
      </HeaderSection>

      <TabSection isAdmin={true} activeType={activeTab} onTypeChange={handleTabChange} options={ADMISSION_TABS} />

      <FormulaScoreCards
        formulas={activeFormulas}
        selectedFormulaId={selectedFormulaId}
        onSelect={handleFormulaSelect}
      />

      <WorkArea>
        <FormulaEditorPanel
          draft={draft}
          usedVariables={usedVariables}
          onTextFieldChange={handleTextFieldChange}
          onMaxScoreChange={handleMaxScoreChange}
        />
        <FormulaVariableDictionary groups={VARIABLE_GROUPS} onVariableClick={handleVariableClick} />
      </WorkArea>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderSection = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 860px) {
    flex-direction: column;
  }
`;

const WorkArea = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(320px, 0.88fr);
  gap: 20px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

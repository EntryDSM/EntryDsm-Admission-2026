import { useMemo, useState, type ChangeEvent } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

export type FormulaPhase = "공통 산출" | "1차 전형";

export type FormulaDraftValue = {
  phase: FormulaPhase;
  name: string;
  resultVariable: string;
  maxScore: number;
  formula: string;
  variables: string[];
};

export type FormulaTextField = keyof Pick<FormulaDraftValue, "phase" | "name" | "resultVariable" | "formula">;

export type FormulaVariable = {
  key: string;
  label: string;
};

export type FormulaVariableGroup = {
  title: string;
  variables: FormulaVariable[];
};

type FormulaSummaryItem = {
  id: string;
  name: string;
  maxScore: number;
};

type FormulaScoreCardsProps = {
  formulas: FormulaSummaryItem[];
  selectedFormulaId: string;
  onSelect: (formulaId: string) => void;
};

type FormulaEditorPanelProps = {
  draft: FormulaDraftValue;
  usedVariables: FormulaVariable[];
  onTextFieldChange: (
    field: FormulaTextField
  ) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onMaxScoreChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

type FormulaVariableDictionaryProps = {
  groups: FormulaVariableGroup[];
  onVariableClick: (variableKey: string) => void;
};

export const FormulaScoreCards = ({ formulas, selectedFormulaId, onSelect }: FormulaScoreCardsProps) => (
  <SummaryGrid>
    {formulas.map(formula => (
      <SummaryCard
        key={formula.id}
        type="button"
        isSelected={formula.id === selectedFormulaId}
        onClick={() => onSelect(formula.id)}
      >
        <SummaryName>{formula.name}</SummaryName>
        <SummaryValue>{formula.maxScore}점</SummaryValue>
      </SummaryCard>
    ))}
  </SummaryGrid>
);

export const FormulaEditorPanel = ({
  draft,
  usedVariables,
  onTextFieldChange,
  onMaxScoreChange,
}: FormulaEditorPanelProps) => (
  <EditorPanel>
    <PanelHeader>
      <SectionTitle>계산식 편집</SectionTitle>
    </PanelHeader>

    <FieldGrid>
      <Field>
        <Label>계산식 이름</Label>
        <TextInput value={draft.name} onChange={onTextFieldChange("name")} placeholder="계산식 이름" />
      </Field>
      <Field>
        <Label>적용 단계</Label>
        <SelectInput value={draft.phase} onChange={onTextFieldChange("phase")}>
          <option value="공통 산출">공통 산출</option>
          <option value="1차 전형">1차 전형</option>
        </SelectInput>
      </Field>
      <Field>
        <Label>결과 변수</Label>
        <TextInput
          value={draft.resultVariable}
          onChange={onTextFieldChange("resultVariable")}
          placeholder="resultVariable"
        />
      </Field>
      <Field>
        <Label>만점</Label>
        <TextInput type="number" value={draft.maxScore} onChange={onMaxScoreChange} placeholder="0" />
      </Field>
    </FieldGrid>

    <Field>
      <Label>계산식</Label>
      <FormulaTextarea value={draft.formula} onChange={onTextFieldChange("formula")} spellCheck={false} />
    </Field>

    <UsedVariableBox>
      <Label>사용 변수</Label>
      <ChipList>
        {usedVariables.map(variable => (
          <VariableChip key={variable.key}>{variable.label}</VariableChip>
        ))}
      </ChipList>
    </UsedVariableBox>
  </EditorPanel>
);

export const FormulaVariableDictionary = ({ groups, onVariableClick }: FormulaVariableDictionaryProps) => {
  const [activeVariableGroupTitle, setActiveVariableGroupTitle] = useState(groups[0]?.title ?? "");
  const activeVariableGroup = useMemo(
    () => groups.find(group => group.title === activeVariableGroupTitle) ?? groups[0],
    [activeVariableGroupTitle, groups]
  );

  return (
    <VariableLibrary>
      <SectionTitle>변수 사전</SectionTitle>
      <VariableTabList>
        {groups.map(group => (
          <VariableTabButton
            key={group.title}
            type="button"
            isSelected={group.title === activeVariableGroupTitle}
            onClick={() => setActiveVariableGroupTitle(group.title)}
          >
            {group.title}
          </VariableTabButton>
        ))}
      </VariableTabList>
      <VariableList>
        {activeVariableGroup?.variables.map(variable => (
          <VariableButton key={variable.key} type="button" onClick={() => onVariableClick(variable.key)}>
            <VariableKey>{variable.key}</VariableKey>
            <VariableLabel>{variable.label}</VariableLabel>
          </VariableButton>
        ))}
      </VariableList>
    </VariableLibrary>
  );
};

const SummaryGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.button<{ isSelected: boolean }>`
  min-height: 132px;
  padding: 18px 20px;
  border: 1px solid ${({ isSelected }) => (isSelected ? colors.green[400] : colors.gray[200])};
  border-radius: 8px;
  background-color: ${({ isSelected }) => (isSelected ? colors.green[50] : colors.extra.realWhite)};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  text-align: left;

  &:hover {
    border-color: ${colors.green[300]};
  }
`;

const SummaryName = styled.strong`
  min-height: 44px;
  color: ${colors.gray[500]};
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
`;

const SummaryValue = styled.span`
  color: ${colors.gray[500]};
  font-size: 28px;
  font-weight: 700;
`;

const EditorPanel = styled.section`
  width: 100%;
  padding: 24px;
  border: 1px solid ${colors.gray[200]};
  border-radius: 8px;
  background-color: ${colors.extra.realWhite};
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${colors.gray[500]};
`;

const PanelHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const FieldGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${colors.gray[500]};
`;

const textFieldStyle = `
  width: 100%;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  background-color: ${colors.extra.realWhite};
  color: ${colors.gray[500]};
  font-size: 15px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${colors.green[500]};
  }

  &::placeholder {
    color: ${colors.gray[300]};
  }
`;

const TextInput = styled.input`
  ${textFieldStyle}
  height: 48px;
  padding: 0 14px;
`;

const SelectInput = styled.select`
  ${textFieldStyle}
  height: 48px;
  padding: 0 14px;
`;

const FormulaTextarea = styled.textarea`
  ${textFieldStyle}
  min-height: 132px;
  padding: 14px;
  line-height: 1.6;
  resize: vertical;
  font-family: "Consolas", "Courier New", monospace;
`;

const UsedVariableBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const VariableChip = styled.span`
  padding: 6px 10px;
  border-radius: 100px;
  border: 1px solid ${colors.green[500]};
  background-color: #1db95414;
  color: ${colors.green[600]};
  font-size: 12px;
  font-weight: 600;
`;

const VariableLibrary = styled.section`
  width: 100%;
  padding: 24px;
  border: 1px solid ${colors.gray[200]};
  border-radius: 8px;
  background-color: ${colors.extra.realWhite};
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const VariableTabList = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const VariableTabButton = styled.button<{ isSelected: boolean }>`
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid ${({ isSelected }) => (isSelected ? colors.green[500] : colors.gray[200])};
  border-radius: 8px;
  background-color: ${({ isSelected }) => (isSelected ? colors.green[50] : colors.extra.realWhite)};
  color: ${({ isSelected }) => (isSelected ? colors.green[700] : colors.gray[500])};
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;

  &:hover {
    border-color: ${colors.green[400]};
  }
`;

const VariableList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(176px, 1fr));
  gap: 8px;
`;

const VariableButton = styled.button`
  width: 100%;
  min-height: 46px;
  padding: 8px 10px;
  border: 1px solid ${colors.gray[200]};
  border-radius: 8px;
  background-color: ${colors.gray[50]};
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  &:hover {
    border-color: ${colors.green[400]};
    background-color: ${colors.extra.realWhite};
  }
`;

const VariableKey = styled.code`
  min-width: 0;
  color: ${colors.green[700]};
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const VariableLabel = styled.span`
  flex-shrink: 0;
  color: ${colors.gray[400]};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

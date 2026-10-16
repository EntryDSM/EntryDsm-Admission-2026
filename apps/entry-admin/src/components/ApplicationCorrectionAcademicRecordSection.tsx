import { useId } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

import type { SubjectGrade } from "../apis";
import {
  type AcademicRecordFormValues,
  CORRECTION_GED_SUBJECTS,
  CORRECTION_SUBJECTS,
  type CorrectionSemester,
  type CorrectionSubject,
  getCorrectionSemesters,
  getEffectiveGraduationType,
  SUBJECT_GRADES,
} from "../utils";
import {
  ChoiceChips,
  CountInput,
  type IChoiceOption,
  type ICorrectionSectionProps,
  SectionCard,
} from "./ApplicationCorrectionFields";
import { FieldError, Select } from "./applicationCorrectionStyles";

/** 빈 값은 아직 고르지 않은 것 */
type BonusChoice = "" | "true" | "false";

const BONUS_OPTIONS: ReadonlyArray<IChoiceOption<BonusChoice>> = [
  { value: "true", label: "있음" },
  { value: "false", label: "없음" },
];

const toBonusChoice = (value: boolean | null): BonusChoice => (value === null ? "" : value ? "true" : "false");

const ATTENDANCE_FIELDS = [
  { key: "absentCount", label: "미인정 결석", suffix: "일" },
  { key: "lateCount", label: "미인정 지각", suffix: "회" },
  { key: "earlyLeaveCount", label: "미인정 조퇴", suffix: "회" },
  { key: "classAbsenceCount", label: "미인정 결과", suffix: "회" },
] as const;

interface ICorrectionAcademicRecordSectionType extends ICorrectionSectionProps {
  /** 졸업 구분을 바꿔 성적을 꼭 보내야 하는지 */
  isRequired: boolean;
}

/** 성적은 일부만 보낼 수 없어, 한 칸만 바뀌어도 성적 전체를 보낸다. 학기는 정정 후 졸업 구분을 따른다. */
export const CorrectionAcademicRecordSection = ({
  isRequired,
  values,
  initial,
  errors,
  changedKeys,
  showAllErrors,
  onChange,
  onReset,
}: ICorrectionAcademicRecordSectionType) => {
  const id = useId();
  const record = values.academicRecord;
  // 보내지 않는 성적의 빈 칸은 표시하지 않는다.
  const showEmpty = showAllErrors && changedKeys.has("academicRecord");
  const graduationType = getEffectiveGraduationType(values, initial);
  const semesters = getCorrectionSemesters(graduationType);

  const updateRecord = (patch: Partial<AcademicRecordFormValues>) =>
    onChange({ academicRecord: { ...record, ...patch } });

  const updateGrade = (semester: CorrectionSemester, subject: CorrectionSubject, grade: SubjectGrade | "") =>
    updateRecord({
      subjectGrades: { ...record.subjectGrades, [semester]: { ...record.subjectGrades[semester], [subject]: grade } },
    });

  // "일괄" 로 한 학기의 모든 과목을 같은 성적으로 채운다.
  const fillSemester = (semester: CorrectionSemester, grade: SubjectGrade | "") =>
    updateRecord({
      subjectGrades: {
        ...record.subjectGrades,
        [semester]: Object.fromEntries(CORRECTION_SUBJECTS.map(({ key }) => [key, grade])) as Record<
          CorrectionSubject,
          SubjectGrade | ""
        >,
      },
    });

  return (
    <SectionCard
      title="성적"
      description={
        isRequired
          ? "졸업 구분을 바꿔 성적도 함께 저장합니다. 바뀐 졸업 구분에 맞게 확인해 주세요."
          : "한 칸만 고쳐도 출결·봉사·가산점·교과 성적 전체를 함께 저장합니다."
      }
      isChanged={changedKeys.has("academicRecord")}
      onReset={() => onReset("academicRecord")}
    >
      <RecordBody>
        <RecordBlock aria-labelledby={`${id}-attendance`}>
          <RecordBlockTitle id={`${id}-attendance`}>출결</RecordBlockTitle>
          <CountGrid>
            {ATTENDANCE_FIELDS.map(({ key, label, suffix }) => (
              <CountInput
                key={key}
                id={`${id}-${key}`}
                label={label}
                suffix={suffix}
                value={record[key]}
                isInvalid={showEmpty && record[key] === ""}
                onChange={value => onChange({ academicRecord: { ...record, [key]: value } })}
              />
            ))}
          </CountGrid>
          {errors.attendance && <FieldError role="alert">{errors.attendance}</FieldError>}
        </RecordBlock>

        <RecordBlock aria-labelledby={`${id}-volunteer`}>
          <RecordBlockTitle id={`${id}-volunteer`}>봉사</RecordBlockTitle>
          <CountGrid>
            <CountInput
              id={`${id}-volunteerTime`}
              label="봉사 시간"
              suffix="시간"
              value={record.volunteerTime}
              isInvalid={showEmpty && record.volunteerTime === ""}
              onChange={volunteerTime => updateRecord({ volunteerTime })}
            />
          </CountGrid>
          {errors.volunteerTime && <FieldError role="alert">{errors.volunteerTime}</FieldError>}
        </RecordBlock>

        <RecordBlock aria-labelledby={`${id}-bonus`}>
          <RecordBlockTitle id={`${id}-bonus`}>가산점</RecordBlockTitle>
          <BonusRow>
            <BonusLabel id={`${id}-algorithm`}>DSM 알고리즘 대회 입상</BonusLabel>
            <ChoiceChips
              name={`${id}-algorithm-choice`}
              labelledBy={`${id}-algorithm`}
              options={BONUS_OPTIONS}
              value={toBonusChoice(record.dsmAlgorithmAwarded)}
              isInvalid={showEmpty && record.dsmAlgorithmAwarded === null}
              onChange={choice => updateRecord({ dsmAlgorithmAwarded: choice === "true" })}
            />
          </BonusRow>
          <BonusRow>
            <BonusLabel id={`${id}-certificate`}>
              프로그래밍 기능사 자격증
              <BonusHint>특별전형만 가산점</BonusHint>
            </BonusLabel>
            <ChoiceChips
              name={`${id}-certificate-choice`}
              labelledBy={`${id}-certificate`}
              options={BONUS_OPTIONS}
              value={toBonusChoice(record.programmingCertified)}
              isInvalid={showEmpty && record.programmingCertified === null}
              onChange={choice => updateRecord({ programmingCertified: choice === "true" })}
            />
          </BonusRow>
          {errors.bonus && <FieldError role="alert">{errors.bonus}</FieldError>}
        </RecordBlock>

        {graduationType === "GED" ? (
          <RecordBlock aria-labelledby={`${id}-ged`}>
            <RecordBlockTitle id={`${id}-ged`}>검정고시 점수</RecordBlockTitle>
            <CountGrid>
              {CORRECTION_GED_SUBJECTS.map(({ key, label, isOptional }) => {
                const score = record.gedScores[key];

                return (
                  <CountInput
                    key={key}
                    id={`${id}-ged-${key}`}
                    label={isOptional ? `${label}(선택)` : label}
                    suffix="점"
                    value={score}
                    isInvalid={showEmpty && ((!isOptional && score === "") || Number(score) > 100)}
                    onChange={nextScore => updateRecord({ gedScores: { ...record.gedScores, [key]: nextScore } })}
                  />
                );
              })}
            </CountGrid>
            {errors.gedScores && <FieldError role="alert">{errors.gedScores}</FieldError>}
          </RecordBlock>
        ) : (
          <RecordBlock aria-labelledby={`${id}-grades`}>
            <RecordBlockTitle id={`${id}-grades`}>교과 성적</RecordBlockTitle>
            <RecordBlockHint>
              X는 미이수(자유학기 등) 과목입니다.
              {graduationType === "PROSPECTIVE" && " 졸업 예정자는 3학년 2학기 성적을 넣지 않습니다."}
            </RecordBlockHint>
            <GradeTable role="table" aria-labelledby={`${id}-grades`} $columns={semesters.length}>
              <GradeRow role="row">
                <GradeHeaderCell role="columnheader" $isSubject={true}>
                  과목
                </GradeHeaderCell>
                {semesters.map(({ key, label }) => (
                  <GradeHeaderCell key={key} role="columnheader">
                    {label}
                    <Select
                      aria-label={`${label} 모든 과목을 같은 성적으로 채우기`}
                      value=""
                      $size="small"
                      onChange={event => fillSemester(key, event.target.value as SubjectGrade | "")}
                    >
                      <option value="">일괄</option>
                      {SUBJECT_GRADES.map(grade => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </Select>
                  </GradeHeaderCell>
                ))}
              </GradeRow>
              {CORRECTION_SUBJECTS.map(subject => (
                <GradeRow key={subject.key} role="row">
                  <GradeSubject role="rowheader">{subject.label}</GradeSubject>
                  {semesters.map(semester => {
                    const grade = record.subjectGrades[semester.key][subject.key];

                    return (
                      <div key={semester.key} role="cell">
                        <Select
                          aria-label={`${semester.label} ${subject.label}`}
                          value={grade}
                          aria-invalid={showEmpty && grade === ""}
                          $isGrade={true}
                          onChange={event =>
                            updateGrade(semester.key, subject.key, event.target.value as SubjectGrade | "")
                          }
                        >
                          <option value="">선택</option>
                          {SUBJECT_GRADES.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      </div>
                    );
                  })}
                </GradeRow>
              ))}
            </GradeTable>
            {errors.subjectGrades && <FieldError role="alert">{errors.subjectGrades}</FieldError>}
          </RecordBlock>
        )}
      </RecordBody>
    </SectionCard>
  );
};

const RecordBody = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RecordBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RecordBlockTitle = styled.h4`
  color: ${colors.gray[500]};
  font-size: 15px;
  font-weight: 600;
`;

const RecordBlockHint = styled.p`
  margin-top: -4px;
  color: ${colors.gray[400]};
  font-size: 13px;
  word-break: keep-all;
`;

const CountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const BonusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
`;

const BonusLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${colors.gray[500]};
  font-size: 15px;
  font-weight: 500;
`;

const BonusHint = styled.span`
  color: ${colors.gray[400]};
  font-size: 12px;
  font-weight: 400;
`;

const GradeTable = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: 88px repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
`;

const GradeHeaderCell = styled.div<{ $isSubject?: boolean }>`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  align-self: ${({ $isSubject }) => ($isSubject ? "end" : "auto")};
  padding-bottom: ${({ $isSubject }) => ($isSubject ? "6px" : "0")};
  color: ${colors.gray[400]};
  font-size: 13px;
  font-weight: 600;
  text-align: ${({ $isSubject }) => ($isSubject ? "left" : "center")};
`;

const GradeRow = styled.div`
  display: contents;
`;

const GradeSubject = styled.div`
  color: ${colors.gray[500]};
  font-size: 15px;
  font-weight: 500;
`;

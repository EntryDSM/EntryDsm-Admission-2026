import { useId, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { type Address, DaumPostcodeEmbed } from "react-daum-postcode";

import type { AdmissionType, CorrectionGraduationType, Gender, Region, SpecialAdmissionType } from "../apis";
import {
  CORRECTION_LIMITS,
  formatPhoneNumberInput,
  getEffectiveGraduationType,
  getGraduationYearOptions,
  GRADUATION_MONTH_OPTIONS,
  type GuardianRelationChoice,
  hasCorrectionSectionChanges,
} from "../utils";
import {
  ChoiceChips,
  Field,
  type IChoiceOption,
  type ICorrectionSectionProps,
  SectionCard,
} from "./ApplicationCorrectionFields";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardTitleGroup,
  Counter,
  FieldError,
  InlineGroup,
  RequiredMark,
  SecondaryButton,
  Select,
  TextArea,
  TextAreaField,
  TextAreaFooter,
  TextButton,
  TextInput,
} from "./applicationCorrectionStyles";

/** 현재 값을 모르는 항목의 "바꾸지 않음" 선택지 */
const KEEP_OPTION = { value: "", label: "그대로" } as const;

const ADMISSION_TYPE_OPTIONS: ReadonlyArray<IChoiceOption<AdmissionType>> = [
  { value: "GENERAL", label: "일반" },
  { value: "MEISTER", label: "마이스터 인재" },
  { value: "SOCIAL", label: "사회통합" },
];

const REGION_OPTIONS: ReadonlyArray<IChoiceOption<Region>> = [
  { value: "DAEJEON", label: "대전" },
  { value: "NATIONWIDE", label: "전국" },
];

const SPECIAL_ADMISSION_OPTIONS: ReadonlyArray<IChoiceOption<SpecialAdmissionType | "">> = [
  KEEP_OPTION,
  { value: "NONE", label: "해당 없음" },
  { value: "NATIONAL_MERIT", label: "국가유공자" },
  { value: "SPECIAL_ADMISSION", label: "특례입학 대상자" },
];

const GENDER_OPTIONS: ReadonlyArray<IChoiceOption<Gender | "">> = [
  KEEP_OPTION,
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

const RELATION_OPTIONS: ReadonlyArray<IChoiceOption<GuardianRelationChoice | "">> = [
  KEEP_OPTION,
  { value: "부", label: "부" },
  { value: "모", label: "모" },
  { value: "기타", label: "기타" },
];

/* ───────────────────────────── 안내 ───────────────────────────── */

export const CorrectionNotice = () => (
  <Notice>
    <NoticeTitle>정정하기 전에 확인해 주세요</NoticeTitle>
    <NoticeList>
      <li>바꿀 항목만 고치면 됩니다. 손대지 않은 항목은 그대로 유지됩니다.</li>
      <li>
        성별·특기 사항·졸업 연월·보호자·주소·성적은 현재 값을 불러올 수 없어 바꿀 때만 입력합니다. 원서 PDF로 확인해
        주세요.
      </li>
      <li>전형·졸업 구분·성적을 바꾸면 총점을 다시 계산합니다. 발급된 수험번호는 바뀌지 않습니다.</li>
      <li>연락처·증명사진·중학교 정보는 이 화면에서 정정할 수 없습니다.</li>
    </NoticeList>
  </Notice>
);

/* ───────────────────────────── 전형 정보 ───────────────────────────── */

export const CorrectionTypeSection = ({
  values,
  initial,
  errors,
  changedKeys,
  editableKeys,
  onChange,
  onReset,
}: ICorrectionSectionProps) => {
  const id = useId();
  const graduationType = getEffectiveGraduationType(values, initial);
  const isGedApplicant = initial.graduationType === "GED";
  const isGraduationTypeChanged = changedKeys.has("graduationType");

  // 검정고시 지원자는 중학교 정보가 없어 졸업(예정)으로 바꿀 수 없다.
  const graduationTypeOptions: ReadonlyArray<IChoiceOption<CorrectionGraduationType>> = [
    { value: "PROSPECTIVE", label: "졸업 예정", isDisabled: isGedApplicant },
    { value: "GRADUATED", label: "졸업", isDisabled: isGedApplicant },
    { value: "GED", label: "검정고시" },
  ];

  const handleGraduationTypeChange = (nextGraduationType: CorrectionGraduationType | "") => {
    if (!nextGraduationType) {
      return;
    }

    // 새 졸업 구분에 맞지 않는 졸업 연월은 비운다.
    const keepsYear =
      nextGraduationType !== "GED" &&
      getGraduationYearOptions(nextGraduationType).includes(Number(values.graduationYear));

    onChange({
      graduationType: nextGraduationType,
      graduationYear: keepsYear ? values.graduationYear : "",
      graduationMonth: nextGraduationType === "GED" ? "" : values.graduationMonth,
    });
  };

  const graduationTypeHelper = isGedApplicant
    ? "검정고시 지원자는 중학교 정보가 없어 이 화면에서 졸업(예정)으로 바꿀 수 없습니다."
    : isGraduationTypeChanged
      ? "졸업 구분을 바꾸면 졸업 연월과 성적을 다시 입력해야 합니다."
      : undefined;

  return (
    <SectionCard
      title="전형 정보"
      isChanged={hasCorrectionSectionChanges(changedKeys, "type")}
      onReset={() => onReset("type")}
    >
      {editableKeys.has("admissionType") && (
        <Field
          label="전형"
          labelId={`${id}-admission`}
          isChanged={changedKeys.has("admissionType")}
          helper={changedKeys.has("admissionType") ? "전형을 바꾸면 총점을 다시 계산합니다." : undefined}
        >
          <ChoiceChips
            name={`${id}-admission-choice`}
            labelledBy={`${id}-admission`}
            options={ADMISSION_TYPE_OPTIONS}
            value={values.admissionType}
            currentValue={initial.admissionType}
            onChange={admissionType => onChange({ admissionType })}
          />
        </Field>
      )}

      {editableKeys.has("region") && (
        <Field label="지역" labelId={`${id}-region`} isChanged={changedKeys.has("region")}>
          <ChoiceChips
            name={`${id}-region-choice`}
            labelledBy={`${id}-region`}
            options={REGION_OPTIONS}
            value={values.region}
            currentValue={initial.region}
            onChange={region => onChange({ region })}
          />
        </Field>
      )}

      {editableKeys.has("graduationType") && (
        <Field
          label="졸업 구분"
          labelId={`${id}-graduation`}
          isChanged={isGraduationTypeChanged}
          error={errors.graduationType}
          helper={graduationTypeHelper}
        >
          <ChoiceChips
            name={`${id}-graduation-choice`}
            labelledBy={`${id}-graduation`}
            options={graduationTypeOptions}
            value={values.graduationType}
            currentValue={initial.graduationType}
            isInvalid={!!errors.graduationType}
            onChange={handleGraduationTypeChange}
          />
        </Field>
      )}

      {editableKeys.has("graduationDate") && graduationType !== "GED" && (
        <Field
          label={graduationType === "PROSPECTIVE" ? "졸업 예정 연월" : "졸업 연월"}
          labelId={`${id}-graduation-date`}
          isChanged={changedKeys.has("graduationDate")}
          isRequired={isGraduationTypeChanged}
          error={errors.graduationDate}
          helper="현재 값을 불러올 수 없어 바꿀 때만 고릅니다."
        >
          <InlineGroup role="group" aria-labelledby={`${id}-graduation-date`}>
            <Select
              aria-label="졸업 연도"
              value={values.graduationYear}
              aria-invalid={!!errors.graduationDate && !values.graduationYear}
              $width="132px"
              onChange={event => onChange({ graduationYear: event.target.value })}
            >
              <option value="">연도</option>
              {getGraduationYearOptions(graduationType).map(year => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </Select>
            <Select
              aria-label="졸업 월"
              value={values.graduationMonth}
              aria-invalid={!!errors.graduationDate && !values.graduationMonth}
              $width="104px"
              onChange={event => onChange({ graduationMonth: event.target.value })}
            >
              <option value="">월</option>
              {GRADUATION_MONTH_OPTIONS.map(month => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </Select>
          </InlineGroup>
        </Field>
      )}

      {editableKeys.has("specialAdmissionType") && (
        <Field
          label="특기 사항"
          labelId={`${id}-special`}
          isChanged={changedKeys.has("specialAdmissionType")}
          error={errors.specialAdmissionType}
          helper="국가유공자·특례입학 대상자는 일반 전형으로만 지원할 수 있습니다."
        >
          <ChoiceChips
            name={`${id}-special-choice`}
            labelledBy={`${id}-special`}
            options={SPECIAL_ADMISSION_OPTIONS}
            value={values.specialAdmissionType}
            isInvalid={!!errors.specialAdmissionType}
            onChange={specialAdmissionType => onChange({ specialAdmissionType })}
          />
        </Field>
      )}
    </SectionCard>
  );
};

/* ───────────────────────────── 인적사항 ───────────────────────────── */

export const CorrectionPersonalSection = ({
  values,
  errors,
  changedKeys,
  editableKeys,
  onChange,
  onTouch,
  onReset,
}: ICorrectionSectionProps) => {
  const id = useId();

  return (
    <SectionCard
      title="인적사항"
      isChanged={hasCorrectionSectionChanges(changedKeys, "personal")}
      onReset={() => onReset("personal")}
    >
      {editableKeys.has("name") && (
        <Field label="이름" htmlFor={`${id}-name`} isChanged={changedKeys.has("name")} error={errors.name}>
          <TextInput
            id={`${id}-name`}
            value={values.name}
            maxLength={CORRECTION_LIMITS.name}
            aria-invalid={!!errors.name}
            $width="240px"
            onChange={event => onChange({ name: event.target.value })}
            onBlur={() => onTouch("name")}
          />
        </Field>
      )}

      {editableKeys.has("birthdate") && (
        <Field
          label="생년월일"
          htmlFor={`${id}-birthdate`}
          isChanged={changedKeys.has("birthdate")}
          error={errors.birthdate}
        >
          <TextInput
            id={`${id}-birthdate`}
            type="date"
            value={values.birthdate}
            aria-invalid={!!errors.birthdate}
            $width="240px"
            onChange={event => onChange({ birthdate: event.target.value })}
            onBlur={() => onTouch("birthdate")}
          />
        </Field>
      )}

      {editableKeys.has("gender") && (
        <Field label="성별" labelId={`${id}-gender`} isChanged={changedKeys.has("gender")}>
          <ChoiceChips
            name={`${id}-gender-choice`}
            labelledBy={`${id}-gender`}
            options={GENDER_OPTIONS}
            value={values.gender}
            onChange={gender => onChange({ gender })}
          />
        </Field>
      )}
    </SectionCard>
  );
};

/* ───────────────────────────── 보호자·주소 ───────────────────────────── */

export const CorrectionGuardianSection = ({
  values,
  errors,
  changedKeys,
  editableKeys,
  onChange,
  onTouch,
  onReset,
}: ICorrectionSectionProps) => {
  const id = useId();
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // 도로명 주소가 없을 때만 지번 주소를 쓴다.
  const handleAddressComplete = (address: Address) => {
    onChange({ zipCode: address.zonecode, addressBase: address.roadAddress || address.address });
    setIsSearchingAddress(false);
  };

  const isAddressSelected = values.zipCode !== "" && values.addressBase !== "";

  return (
    <SectionCard
      title="보호자 · 주소"
      description="현재 값을 불러올 수 없어 바꿀 항목만 입력합니다. 비워 둔 항목은 그대로 유지됩니다."
      isChanged={hasCorrectionSectionChanges(changedKeys, "guardian")}
      onReset={() => {
        setIsSearchingAddress(false);
        onReset("guardian");
      }}
    >
      {editableKeys.has("guardianName") && (
        <Field
          label="보호자 성명"
          htmlFor={`${id}-guardian-name`}
          isChanged={changedKeys.has("guardianName")}
          error={errors.guardianName}
        >
          <TextInput
            id={`${id}-guardian-name`}
            value={values.guardianName}
            placeholder="바꿀 때만 입력"
            maxLength={CORRECTION_LIMITS.guardianName}
            aria-invalid={!!errors.guardianName}
            $width="240px"
            onChange={event => onChange({ guardianName: event.target.value })}
            onBlur={() => onTouch("guardianName")}
          />
        </Field>
      )}

      {editableKeys.has("guardianPhoneNumber") && (
        <Field
          label="보호자 연락처"
          htmlFor={`${id}-guardian-phone`}
          isChanged={changedKeys.has("guardianPhoneNumber")}
          error={errors.guardianPhoneNumber}
        >
          <TextInput
            id={`${id}-guardian-phone`}
            type="tel"
            inputMode="numeric"
            value={values.guardianPhoneNumber}
            placeholder="010-0000-0000"
            aria-invalid={!!errors.guardianPhoneNumber}
            $width="240px"
            onChange={event => onChange({ guardianPhoneNumber: formatPhoneNumberInput(event.target.value) })}
            onBlur={() => onTouch("guardianPhoneNumber")}
          />
        </Field>
      )}

      {editableKeys.has("guardianGender") && (
        <Field label="보호자 성별" labelId={`${id}-guardian-gender`} isChanged={changedKeys.has("guardianGender")}>
          <ChoiceChips
            name={`${id}-guardian-gender-choice`}
            labelledBy={`${id}-guardian-gender`}
            options={GENDER_OPTIONS}
            value={values.guardianGender}
            onChange={guardianGender => onChange({ guardianGender })}
          />
        </Field>
      )}

      {editableKeys.has("guardianRelation") && (
        <Field
          label="지원자와의 관계"
          labelId={`${id}-relation`}
          isChanged={changedKeys.has("guardianRelation")}
          error={errors.guardianRelation}
        >
          <ChoiceChips
            name={`${id}-relation-choice`}
            labelledBy={`${id}-relation`}
            options={RELATION_OPTIONS}
            value={values.guardianRelation}
            onChange={guardianRelation => onChange({ guardianRelation })}
          />
          {values.guardianRelation === "기타" && (
            <TextInput
              aria-label="지원자와의 관계 직접 입력"
              value={values.guardianRelationOther}
              placeholder="관계를 입력하세요 (예: 조부)"
              maxLength={CORRECTION_LIMITS.guardianRelation}
              aria-invalid={!!errors.guardianRelation}
              $width="240px"
              onChange={event => onChange({ guardianRelationOther: event.target.value })}
              onBlur={() => onTouch("guardianRelation")}
            />
          )}
        </Field>
      )}

      {editableKeys.has("address") && (
        <Field label="주소" labelId={`${id}-address`} isChanged={changedKeys.has("address")}>
          <InlineGroup role="group" aria-labelledby={`${id}-address`}>
            <TextInput aria-label="우편번호" value={values.zipCode} placeholder="우편번호" readOnly $width="112px" />
            <TextInput aria-label="기본 주소" value={values.addressBase} placeholder="주소 검색으로 입력" readOnly />
            <SecondaryButton type="button" onClick={() => setIsSearchingAddress(prev => !prev)}>
              {isSearchingAddress ? "검색 닫기" : "주소 검색"}
            </SecondaryButton>
          </InlineGroup>
          {isAddressSelected && !isSearchingAddress && (
            <TextButton type="button" onClick={() => onChange({ zipCode: "", addressBase: "" })}>
              검색한 주소 지우기
            </TextButton>
          )}
          {isSearchingAddress && (
            <PostcodeFrame>
              <DaumPostcodeEmbed onComplete={handleAddressComplete} autoClose={false} style={{ height: "440px" }} />
            </PostcodeFrame>
          )}
        </Field>
      )}

      {editableKeys.has("addressDetail") && (
        <Field
          label="상세 주소"
          htmlFor={`${id}-address-detail`}
          isChanged={changedKeys.has("addressDetail")}
          isRequired={isAddressSelected}
          error={errors.addressDetail}
        >
          <TextInput
            id={`${id}-address-detail`}
            value={values.addressDetail}
            placeholder="바꿀 때만 입력"
            maxLength={CORRECTION_LIMITS.addressDetail}
            aria-invalid={!!errors.addressDetail}
            onChange={event => onChange({ addressDetail: event.target.value })}
            onBlur={() => onTouch("addressDetail")}
          />
        </Field>
      )}
    </SectionCard>
  );
};

/* ───────────────────────────── 자기소개서·학업계획서 ───────────────────────────── */

interface ICorrectionEssaySectionType extends ICorrectionSectionProps {
  field: "introduction" | "studyPlan";
  title: string;
}

export const CorrectionEssaySection = ({
  field,
  title,
  values,
  errors,
  changedKeys,
  onChange,
  onTouch,
  onReset,
}: ICorrectionEssaySectionType) => {
  const value = values[field];

  return (
    <SectionCard title={title} isChanged={changedKeys.has(field)} onReset={() => onReset(field)}>
      <TextAreaField>
        <TextArea
          aria-label={title}
          value={value}
          maxLength={CORRECTION_LIMITS.essay}
          aria-invalid={!!errors[field]}
          onChange={event =>
            onChange(
              field === "introduction" ? { introduction: event.target.value } : { studyPlan: event.target.value }
            )
          }
          onBlur={() => onTouch(field)}
        />
        <TextAreaFooter>
          {errors[field] ? <FieldError role="alert">{errors[field]}</FieldError> : <span />}
          <Counter>
            {value.length.toLocaleString()} / {CORRECTION_LIMITS.essay.toLocaleString()}
          </Counter>
        </TextAreaFooter>
      </TextAreaField>
    </SectionCard>
  );
};

/* ───────────────────────────── 정정 사유 ───────────────────────────── */

export const CorrectionReasonSection = ({
  values,
  errors,
  onChange,
  onTouch,
}: Pick<ICorrectionSectionProps, "values" | "errors" | "onChange" | "onTouch">) => {
  const id = useId();

  return (
    <Card aria-labelledby={`${id}-title`}>
      <CardHeader>
        <CardTitleGroup>
          <CardTitle id={`${id}-title`}>
            정정 사유
            <RequiredMark aria-hidden="true">*</RequiredMark>
          </CardTitle>
        </CardTitleGroup>
      </CardHeader>
      <CardDescription>정정 기록에 함께 남습니다. 지원자의 요청 내용이나 확인한 서류를 적어 주세요.</CardDescription>
      <TextAreaField>
        <TextArea
          aria-labelledby={`${id}-title`}
          aria-required="true"
          value={values.reason}
          placeholder="예: 지원자 요청으로 보호자 연락처 오기재 정정 (원서 원본 확인)"
          maxLength={CORRECTION_LIMITS.reason}
          aria-invalid={!!errors.reason}
          $minHeight="112px"
          onChange={event => onChange({ reason: event.target.value })}
          onBlur={() => onTouch("reason")}
        />
        <TextAreaFooter>
          {errors.reason ? <FieldError role="alert">{errors.reason}</FieldError> : <span />}
          <Counter>
            {values.reason.length} / {CORRECTION_LIMITS.reason}
          </Counter>
        </TextAreaFooter>
      </TextAreaField>
    </Card>
  );
};

const Notice = styled.div`
  padding: 16px 20px;
  border-radius: 12px;
  background-color: ${colors.gray[100]};
`;

const NoticeTitle = styled.p`
  margin-bottom: 6px;
  color: ${colors.gray[500]};
  font-size: 14px;
  font-weight: 600;
`;

const NoticeList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;

  li {
    position: relative;
    padding-left: 12px;
    color: ${colors.gray[400]};
    font-size: 14px;
    line-height: 1.6;
    word-break: keep-all;
  }

  li::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 2px;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: ${colors.gray[400]};
  }
`;

const PostcodeFrame = styled.div`
  width: 100%;
  overflow: hidden;
  border: 1px solid ${colors.gray[200]};
  border-radius: 12px;
`;

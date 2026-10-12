import type {
  AcademicRecordCorrection,
  AdmissionType,
  ApplicationFormChanges,
  CorrectionGraduationType,
  Gender,
  GraduationStatus,
  Region,
  SchoolSemester,
  SpecialAdmissionType,
  SubjectGrade,
  SubjectGradesCorrection,
} from "../apis/types";
import type { ApplicantDetailView } from "./applicantMapper";

/**
 * 원서 정정 화면의 상태·검증·요청 본문.
 * 서버는 검증에 실패해도 어느 항목인지 알려주지 않아(400) 서버 규칙을 화면에서 먼저 확인한다.
 * 길이 제한은 지원자 원서 작성 화면에 맞춘다.
 */

export const CORRECTION_LIMITS = {
  name: 20,
  guardianName: 20,
  guardianRelation: 10,
  addressDetail: 100,
  essay: 1600,
  reason: 500,
} as const;

export type CorrectionSubject = keyof SubjectGradesCorrection;

/** 지원자 원서 작성 화면(학기별 성적)과 같은 순서 */
export const CORRECTION_SUBJECTS: ReadonlyArray<{ key: CorrectionSubject; label: string }> = [
  { key: "korean", label: "국어" },
  { key: "society", label: "사회" },
  { key: "history", label: "역사" },
  { key: "math", label: "수학" },
  { key: "science", label: "과학" },
  { key: "technology", label: "기술·가정" },
  { key: "english", label: "영어" },
];

/** 지원자 원서 작성 화면(검정고시 성적)과 같은 순서 */
export const CORRECTION_GED_SUBJECTS: ReadonlyArray<{ key: CorrectionSubject; label: string }> = [
  { key: "korean", label: "국어" },
  { key: "society", label: "사회" },
  { key: "history", label: "역사" },
  { key: "science", label: "과학" },
  { key: "technology", label: "기술·가정" },
  { key: "math", label: "수학" },
  { key: "english", label: "영어" },
];

export type CorrectionSemester = Extract<
  SchoolSemester,
  | "SECOND_GRADE_FIRST_SEMESTER"
  | "SECOND_GRADE_SECOND_SEMESTER"
  | "THIRD_GRADE_FIRST_SEMESTER"
  | "THIRD_GRADE_SECOND_SEMESTER"
>;

const CORRECTION_SEMESTERS: ReadonlyArray<{ key: CorrectionSemester; label: string }> = [
  { key: "SECOND_GRADE_FIRST_SEMESTER", label: "2학년 1학기" },
  { key: "SECOND_GRADE_SECOND_SEMESTER", label: "2학년 2학기" },
  { key: "THIRD_GRADE_FIRST_SEMESTER", label: "3학년 1학기" },
  { key: "THIRD_GRADE_SECOND_SEMESTER", label: "3학년 2학기" },
];

/** 졸업 예정자는 3학년 2학기가 없다. */
export const getCorrectionSemesters = (graduationType: CorrectionGraduationType | "") =>
  graduationType === "PROSPECTIVE" ? CORRECTION_SEMESTERS.slice(0, 3) : CORRECTION_SEMESTERS;

export const SUBJECT_GRADES: readonly SubjectGrade[] = ["A", "B", "C", "D", "E", "X"];

/** 서버가 받는 졸업 예정 연도 */
const PROSPECTIVE_GRADUATION_YEARS = [2027, 2026];

/** 지원자 원서 작성 화면과 같은 범위 */
const GRADUATED_YEARS = Array.from({ length: 81 }, (_, index) => 2030 - index);

export const getGraduationYearOptions = (graduationType: CorrectionGraduationType | "") =>
  graduationType === "PROSPECTIVE" ? PROSPECTIVE_GRADUATION_YEARS : GRADUATED_YEARS;

export const GRADUATION_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

export type GuardianRelationChoice = "부" | "모" | "기타";

/** 숫자 칸은 입력 중 빈 값을 다루려고 문자열로 둔다. */
export interface AcademicRecordFormValues {
  absentCount: string;
  lateCount: string;
  earlyLeaveCount: string;
  classAbsenceCount: string;
  volunteerTime: string;
  /** 고르기 전에는 null. 성적 전체를 교체하므로 있음/없음을 반드시 고르게 한다. */
  dsmAlgorithmAwarded: boolean | null;
  programmingCertified: boolean | null;
  subjectGrades: Record<CorrectionSemester, Record<CorrectionSubject, SubjectGrade | "">>;
  gedScores: Record<CorrectionSubject, string>;
}

/** 빈 문자열은 "바꾸지 않음" 이다. 상세 조회에 있는 항목만 현재 값으로 채운다. */
export interface CorrectionFormValues {
  admissionType: AdmissionType | "";
  region: Region | "";
  graduationType: CorrectionGraduationType | "";
  /** 연도와 월을 모두 고르면 `YYYY-MM` 으로 보낸다. */
  graduationYear: string;
  graduationMonth: string;
  specialAdmissionType: SpecialAdmissionType | "";
  name: string;
  birthdate: string;
  gender: Gender | "";
  guardianName: string;
  guardianPhoneNumber: string;
  guardianGender: Gender | "";
  guardianRelation: GuardianRelationChoice | "";
  /** 관계가 "기타" 일 때 직접 입력한 값 */
  guardianRelationOther: string;
  /** 우편번호·기본 주소는 주소 검색으로만 채운다. */
  zipCode: string;
  addressBase: string;
  addressDetail: string;
  introduction: string;
  studyPlan: string;
  /** 졸업 구분을 바꾸면 끌 수 없다. */
  isAcademicRecordEnabled: boolean;
  academicRecord: AcademicRecordFormValues;
  reason: string;
}

const GRADUATION_TYPE_BY_STATUS: Record<GraduationStatus, CorrectionGraduationType> = {
  EXPECTED: "PROSPECTIVE",
  GRADUATED: "GRADUATED",
  GED: "GED",
};

const createSubjectValues = <T>(value: T) =>
  Object.fromEntries(CORRECTION_SUBJECTS.map(({ key }) => [key, value])) as Record<CorrectionSubject, T>;

const createEmptyAcademicRecord = (): AcademicRecordFormValues => ({
  absentCount: "",
  lateCount: "",
  earlyLeaveCount: "",
  classAbsenceCount: "",
  volunteerTime: "",
  dsmAlgorithmAwarded: null,
  programmingCertified: null,
  subjectGrades: Object.fromEntries(
    CORRECTION_SEMESTERS.map(({ key }) => [key, createSubjectValues<SubjectGrade | "">("")])
  ) as AcademicRecordFormValues["subjectGrades"],
  gedScores: createSubjectValues(""),
});

export const toCorrectionFormValues = (detail: ApplicantDetailView): CorrectionFormValues => ({
  admissionType: detail.applicationType ?? "",
  region: detail.region ?? "",
  graduationType: detail.educationalStatus ? GRADUATION_TYPE_BY_STATUS[detail.educationalStatus] : "",
  graduationYear: "",
  graduationMonth: "",
  specialAdmissionType: "",
  name: detail.name ?? "",
  birthdate: detail.birthDate ?? "",
  gender: "",
  guardianName: "",
  guardianPhoneNumber: "",
  guardianGender: "",
  guardianRelation: "",
  guardianRelationOther: "",
  zipCode: "",
  addressBase: "",
  addressDetail: "",
  introduction: detail.introduction ?? "",
  studyPlan: detail.studyPlan ?? "",
  isAcademicRecordEnabled: false,
  academicRecord: createEmptyAcademicRecord(),
  reason: "",
});

export type CorrectionSection = "type" | "personal" | "guardian" | "introduction" | "studyPlan" | "academicRecord";

const SECTION_FIELDS: Record<CorrectionSection, ReadonlyArray<keyof CorrectionFormValues>> = {
  type: ["admissionType", "region", "graduationType", "graduationYear", "graduationMonth", "specialAdmissionType"],
  personal: ["name", "birthdate", "gender"],
  guardian: [
    "guardianName",
    "guardianPhoneNumber",
    "guardianGender",
    "guardianRelation",
    "guardianRelationOther",
    "zipCode",
    "addressBase",
    "addressDetail",
  ],
  introduction: ["introduction"],
  studyPlan: ["studyPlan"],
  academicRecord: ["isAcademicRecordEnabled", "academicRecord"],
};

export const resetCorrectionSection = (
  values: CorrectionFormValues,
  initial: CorrectionFormValues,
  section: CorrectionSection
): CorrectionFormValues => ({
  ...values,
  ...Object.fromEntries(SECTION_FIELDS[section].map(field => [field, initial[field]])),
});

export type CorrectionChangeKey =
  | "admissionType"
  | "region"
  | "graduationType"
  | "graduationDate"
  | "specialAdmissionType"
  | "name"
  | "birthdate"
  | "gender"
  | "guardianName"
  | "guardianPhoneNumber"
  | "guardianGender"
  | "guardianRelation"
  | "address"
  | "addressDetail"
  | "introduction"
  | "studyPlan"
  | "academicRecord";

const CHANGE_LABELS: Record<CorrectionChangeKey, string> = {
  admissionType: "전형",
  region: "지역",
  graduationType: "졸업 구분",
  graduationDate: "졸업 연월",
  specialAdmissionType: "특기 사항",
  name: "이름",
  birthdate: "생년월일",
  gender: "성별",
  guardianName: "보호자 성명",
  guardianPhoneNumber: "보호자 연락처",
  guardianGender: "보호자 성별",
  guardianRelation: "지원자와의 관계",
  address: "주소",
  addressDetail: "상세 주소",
  introduction: "자기소개서",
  studyPlan: "학업계획서",
  academicRecord: "성적",
};

export const getCorrectionChangeLabel = (key: CorrectionChangeKey) => CHANGE_LABELS[key];

const SECTION_CHANGES: Record<CorrectionSection, ReadonlyArray<CorrectionChangeKey>> = {
  type: ["admissionType", "region", "graduationType", "graduationDate", "specialAdmissionType"],
  personal: ["name", "birthdate", "gender"],
  guardian: ["guardianName", "guardianPhoneNumber", "guardianGender", "guardianRelation", "address", "addressDetail"],
  introduction: ["introduction"],
  studyPlan: ["studyPlan"],
  academicRecord: ["academicRecord"],
};

export const hasCorrectionSectionChanges = (
  changedKeys: ReadonlySet<CorrectionChangeKey>,
  section: CorrectionSection
) => SECTION_CHANGES[section].some(key => changedKeys.has(key));

export type CorrectionErrorKey =
  | "graduationType"
  | "graduationDate"
  | "specialAdmissionType"
  | "name"
  | "birthdate"
  | "guardianName"
  | "guardianPhoneNumber"
  | "guardianRelation"
  | "addressDetail"
  | "introduction"
  | "studyPlan"
  | "attendance"
  | "volunteerTime"
  | "bonus"
  | "subjectGrades"
  | "gedScores"
  | "reason";

export type CorrectionErrors = Partial<Record<CorrectionErrorKey, string>>;

export interface CorrectionDraft {
  changes: ApplicationFormChanges;
  changedKeys: CorrectionChangeKey[];
  /** 하나라도 있으면 정정을 보내지 않는다. */
  errors: CorrectionErrors;
  /** 졸업 구분을 바꿔 성적을 함께 보내야 하는지 */
  requiresAcademicRecord: boolean;
  /** 서버가 총점을 다시 계산하는 정정인지(전형·졸업 구분·성적) */
  recalculatesScore: boolean;
}

const PHONE_NUMBER_PATTERN = /^010-\d{4}-\d{4}$/;
const COUNT_PATTERN = /^\d{1,3}$/;

const isCount = (value: string) => COUNT_PATTERN.test(value);

const isGedScore = (value: string) => COUNT_PATTERN.test(value) && Number(value) <= 100;

/** 2월 31일처럼 달력에 없는 날을 거른다. */
const isCalendarDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  return year >= 1900 && date.getMonth() === month - 1 && date.getDate() === day;
};

/** 숫자만 남겨 `010-0000-0000` 꼴로 하이픈을 넣는다. */
export const formatPhoneNumberInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

/** 숫자만 세 자리까지 */
export const sanitizeCountInput = (value: string) => value.replace(/\D/g, "").slice(0, 3);

/** 정정 후의 졸업 구분. 바꾸지 않았으면 현재 값이다. */
export const getEffectiveGraduationType = (values: CorrectionFormValues, initial: CorrectionFormValues) =>
  values.graduationType || initial.graduationType;

const toAcademicRecordCorrection = (
  record: AcademicRecordFormValues,
  graduationType: CorrectionGraduationType | ""
): AcademicRecordCorrection => {
  const isGed = graduationType === "GED";

  return {
    absentCount: Number(record.absentCount),
    lateCount: Number(record.lateCount),
    earlyLeaveCount: Number(record.earlyLeaveCount),
    classAbsenceCount: Number(record.classAbsenceCount),
    volunteerTime: Number(record.volunteerTime),
    dsmAlgorithmAwarded: record.dsmAlgorithmAwarded === true,
    programmingCertified: record.programmingCertified === true,
    subjectGrades: isGed
      ? {}
      : Object.fromEntries(
          getCorrectionSemesters(graduationType).map(({ key }) => [
            key,
            record.subjectGrades[key] as SubjectGradesCorrection,
          ])
        ),
    gedScores: isGed
      ? (Object.fromEntries(
          CORRECTION_SUBJECTS.map(({ key }) => [key, Number(record.gedScores[key])])
        ) as AcademicRecordCorrection["gedScores"])
      : null,
  };
};

/** 입력값으로 요청 본문의 `changes`, 바뀐 항목, 남은 오류를 만든다. */
export const buildCorrectionDraft = (values: CorrectionFormValues, initial: CorrectionFormValues): CorrectionDraft => {
  const changes: ApplicationFormChanges = {};
  const changedKeys: CorrectionChangeKey[] = [];
  const errors: CorrectionErrors = {};

  /* ── 전형 정보 ── */
  if (values.admissionType && values.admissionType !== initial.admissionType) {
    changes.admissionType = values.admissionType;
    changedKeys.push("admissionType");
  }

  if (values.region && values.region !== initial.region) {
    changes.region = values.region;
    changedKeys.push("region");
  }

  const isGraduationTypeChanged = values.graduationType !== "" && values.graduationType !== initial.graduationType;
  if (values.graduationType && isGraduationTypeChanged) {
    changes.graduationType = values.graduationType;
    changedKeys.push("graduationType");

    // 검정고시 → 졸업(예정)은 중학교 정보가 필요해 이 화면에서 할 수 없다.
    if (initial.graduationType === "GED") {
      errors.graduationType = "검정고시 지원자는 중학교 정보가 없어 이 화면에서 졸업(예정)으로 바꿀 수 없습니다.";
    }
  }

  const graduationType = getEffectiveGraduationType(values, initial);

  // 검정고시는 졸업 연월이 없다. 졸업 구분을 바꾸면 연월도 새로 받는다.
  if (graduationType !== "GED") {
    const { graduationYear, graduationMonth } = values;

    if (graduationYear || graduationMonth) {
      changedKeys.push("graduationDate");

      if (!graduationYear || !graduationMonth) {
        errors.graduationDate = "졸업 연도와 월을 모두 골라 주세요.";
      } else {
        changes.graduationDate = `${graduationYear}-${graduationMonth.padStart(2, "0")}`;

        if (graduationType === "PROSPECTIVE" && !PROSPECTIVE_GRADUATION_YEARS.includes(Number(graduationYear))) {
          errors.graduationDate = "졸업 예정 연도는 2026년 또는 2027년이어야 합니다.";
        }
      }
    } else if (isGraduationTypeChanged) {
      errors.graduationDate = "졸업 구분을 바꾸면 졸업 연월도 골라야 합니다.";
    }
  }

  if (values.specialAdmissionType) {
    changes.specialAdmissionType = values.specialAdmissionType;
    changedKeys.push("specialAdmissionType");

    const admissionType = values.admissionType || initial.admissionType;
    if (values.specialAdmissionType !== "NONE" && admissionType !== "GENERAL") {
      errors.specialAdmissionType = "국가유공자·특례입학 대상자는 일반 전형으로만 지원할 수 있습니다.";
    }
  }

  /* ── 인적사항 ── */
  const name = values.name.trim();
  if (name !== initial.name.trim()) {
    changes.name = name;
    changedKeys.push("name");

    if (!name) {
      errors.name = "이름을 입력해 주세요.";
    } else if (name.length > CORRECTION_LIMITS.name) {
      errors.name = `이름은 ${CORRECTION_LIMITS.name}자까지 입력할 수 있습니다.`;
    }
  }

  if (values.birthdate !== initial.birthdate) {
    changes.birthdate = values.birthdate;
    changedKeys.push("birthdate");

    if (!isCalendarDate(values.birthdate)) {
      errors.birthdate = "생년월일을 다시 확인해 주세요.";
    }
  }

  if (values.gender) {
    changes.gender = values.gender;
    changedKeys.push("gender");
  }

  /* ── 보호자·주소: 현재 값을 모르므로 입력한 항목만 보낸다 ── */
  const guardianName = values.guardianName.trim();
  if (guardianName) {
    changes.guardianName = guardianName;
    changedKeys.push("guardianName");

    if (guardianName.length > CORRECTION_LIMITS.guardianName) {
      errors.guardianName = `보호자 성명은 ${CORRECTION_LIMITS.guardianName}자까지 입력할 수 있습니다.`;
    }
  }

  if (values.guardianPhoneNumber) {
    changes.guardianPhoneNumber = values.guardianPhoneNumber;
    changedKeys.push("guardianPhoneNumber");

    if (!PHONE_NUMBER_PATTERN.test(values.guardianPhoneNumber)) {
      errors.guardianPhoneNumber = "보호자 연락처를 010-0000-0000 형식으로 입력해 주세요.";
    }
  }

  if (values.guardianGender) {
    changes.guardianGender = values.guardianGender;
    changedKeys.push("guardianGender");
  }

  if (values.guardianRelation) {
    const relation = values.guardianRelation === "기타" ? values.guardianRelationOther.trim() : values.guardianRelation;
    changes.guardianRelation = relation;
    changedKeys.push("guardianRelation");

    if (!relation) {
      errors.guardianRelation = "지원자와의 관계를 입력해 주세요.";
    } else if (relation.length > CORRECTION_LIMITS.guardianRelation) {
      errors.guardianRelation = `지원자와의 관계는 ${CORRECTION_LIMITS.guardianRelation}자까지 입력할 수 있습니다.`;
    }
  }

  if (values.zipCode && values.addressBase) {
    changes.zipCode = values.zipCode;
    changes.addressBase = values.addressBase;
    changedKeys.push("address");
  }

  const addressDetail = values.addressDetail.trim();
  if (addressDetail) {
    changes.addressDetail = addressDetail;
    changedKeys.push("addressDetail");

    if (addressDetail.length > CORRECTION_LIMITS.addressDetail) {
      errors.addressDetail = `상세 주소는 ${CORRECTION_LIMITS.addressDetail}자까지 입력할 수 있습니다.`;
    }
  } else if (changes.addressBase) {
    // 기본 주소만 바꾸면 옛 상세 주소가 새 주소에 붙어 남는다.
    errors.addressDetail = "주소를 바꾸면 상세 주소도 입력해 주세요.";
  }

  /* ── 자기소개서·학업계획서: 줄바꿈을 살리려고 다듬지 않고 보낸다 ── */
  const essays = [
    { key: "introduction", label: "자기소개서" },
    { key: "studyPlan", label: "학업계획서" },
  ] as const;

  essays.forEach(({ key, label }) => {
    if (values[key] === initial[key]) {
      return;
    }

    changes[key] = values[key];
    changedKeys.push(key);

    if (!values[key].trim()) {
      errors[key] = `${label}를 입력해 주세요.`;
    } else if (values[key].length > CORRECTION_LIMITS.essay) {
      errors[key] = `${label}는 ${CORRECTION_LIMITS.essay.toLocaleString()}자까지 입력할 수 있습니다.`;
    }
  });

  /* ── 성적: 일부만 보낼 수 없어 전체를 다시 입력받는다 ── */
  const requiresAcademicRecord = isGraduationTypeChanged;
  if (values.isAcademicRecordEnabled || requiresAcademicRecord) {
    const record = values.academicRecord;
    changes.academicRecord = toAcademicRecordCorrection(record, graduationType);
    changedKeys.push("academicRecord");

    if (![record.absentCount, record.lateCount, record.earlyLeaveCount, record.classAbsenceCount].every(isCount)) {
      errors.attendance = "출결 네 항목을 모두 입력해 주세요.";
    }

    if (!isCount(record.volunteerTime)) {
      errors.volunteerTime = "봉사 시간을 입력해 주세요.";
    }

    if (record.dsmAlgorithmAwarded === null || record.programmingCertified === null) {
      errors.bonus = "가산점 항목을 모두 골라 주세요.";
    }

    if (graduationType === "GED") {
      if (!CORRECTION_SUBJECTS.every(({ key }) => isGedScore(record.gedScores[key]))) {
        errors.gedScores = "검정고시 일곱 과목 점수를 0~100 사이로 모두 입력해 주세요.";
      }
    } else if (
      !getCorrectionSemesters(graduationType).every(({ key }) =>
        CORRECTION_SUBJECTS.every(subject => record.subjectGrades[key][subject.key] !== "")
      )
    ) {
      errors.subjectGrades = "모든 학기의 과목 성적을 골라 주세요.";
    } else if (CORRECTION_SUBJECTS.every(({ key }) => record.subjectGrades.THIRD_GRADE_FIRST_SEMESTER[key] === "X")) {
      errors.subjectGrades = "3학년 1학기는 모든 과목을 X로 둘 수 없습니다.";
    }
  }

  /* ── 정정 사유 ── */
  const reason = values.reason.trim();
  if (!reason) {
    errors.reason = "정정 사유를 입력해 주세요.";
  } else if (reason.length > CORRECTION_LIMITS.reason) {
    errors.reason = `정정 사유는 ${CORRECTION_LIMITS.reason}자까지 입력할 수 있습니다.`;
  }

  return {
    changes,
    changedKeys,
    errors,
    requiresAcademicRecord,
    recalculatesScore: Boolean(changes.admissionType || changes.graduationType || changes.academicRecord),
  };
};

/**
 * 칩·선택 항목의 오류는 고르는 즉시 보인다(오류 → 이 오류를 띄우는 바뀐 항목).
 * 글자 칸은 칸을 벗어난 뒤에, 성적·사유처럼 처음부터 비어 있는 칸은 저장을 누른 뒤에 보인다.
 */
const IMMEDIATE_ERROR_TRIGGERS: Partial<Record<CorrectionErrorKey, ReadonlyArray<CorrectionChangeKey>>> = {
  graduationType: ["graduationType"],
  graduationDate: ["graduationType", "graduationDate"],
  specialAdmissionType: ["specialAdmissionType", "admissionType"],
  addressDetail: ["address"],
};

export const getVisibleCorrectionErrors = (
  draft: CorrectionDraft,
  touched: ReadonlySet<CorrectionErrorKey>,
  showAllErrors: boolean
): CorrectionErrors => {
  if (showAllErrors) {
    return draft.errors;
  }

  return Object.fromEntries(
    (Object.entries(draft.errors) as [CorrectionErrorKey, string][]).filter(
      ([key]) => touched.has(key) || IMMEDIATE_ERROR_TRIGGERS[key]?.some(trigger => draft.changedKeys.includes(trigger))
    )
  );
};

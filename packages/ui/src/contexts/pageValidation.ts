import { createRequiredFieldsValidator, getObjectFieldValue, isEmptyValue, validateRouteData } from "@entry/utils";
import type { ApplicationState } from "./ApplicationDataContext";

const validateApplicationClassificationPage = (data: unknown) => {
  const missingFields: string[] = [];

  ["typeSelection", "regionSelection", "graduationType"].forEach(field => {
    if (isEmptyValue(getObjectFieldValue(data, field))) {
      missingFields.push(field);
    }
  });

  const graduationType = getObjectFieldValue(data, "graduationType");
  if (graduationType && graduationType !== "검정고시(중학교 졸업 학력)") {
    if (isEmptyValue(getObjectFieldValue(data, "graduationDate"))) {
      missingFields.push("graduationDate");
    }
  }

  return missingFields;
};

const validateMiddleSchoolInfoPage = (data: unknown) => {
  const missingFields: string[] = [];

  ["schoolName", "studentId", "schoolPhone", "teacherName"].forEach(field => {
    if (isEmptyValue(getObjectFieldValue(data, field))) {
      missingFields.push(field);
    }
  });

  const studentId = getObjectFieldValue(data, "studentId");
  if (studentId !== null && studentId !== undefined) {
    const studentIdStr = String(studentId);
    if (studentIdStr.length !== 5) {
      missingFields.push("studentId_invalid");
    }
  }

  return missingFields;
};

const validateGuardianInfoPage = (data: unknown) => {
  const missingFields = createRequiredFieldsValidator([
    "guardianName",
    "guardianNumber",
    "relationship",
    "postalCode",
    "address",
    "addressDetail",
  ])(data);

  const relationship = getObjectFieldValue(data, "relationship");
  const selectedRelationship = Array.isArray(relationship) ? relationship[0] : undefined;

  if (selectedRelationship === "기타" && isEmptyValue(getObjectFieldValue(data, "otherRelationship"))) {
    missingFields.push("otherRelationship");
  }

  return missingFields;
};

const scoreFields = ["kor", "soc", "his", "math", "sci", "tech", "eng"];
const activityFields = ["earlyLeave", "tardiness", "classExit", "absence", "volunteer", "dsmAlgorithm", "certificate"];

const pageValidations: Record<string, (data: unknown) => string[]> = {
  "/application-classification": validateApplicationClassificationPage,
  "/applicant-info": createRequiredFieldsValidator([
    "idPhoto",
    "applicantName",
    "applicantNumber",
    "dateOfBirth",
    "gender",
    "specialNotes",
  ]),
  "/guardian-info": validateGuardianInfoPage,
  "/middle-school-info": validateMiddleSchoolInfoPage,
  "/personal-statements": createRequiredFieldsValidator(["personalStmt"]),
  "/statement-of-purpose": createRequiredFieldsValidator(["studyPlan"]),
  "/first-graduate": createRequiredFieldsValidator(scoreFields),
  "/second-graduate": createRequiredFieldsValidator(scoreFields),
  "/third-graduate": createRequiredFieldsValidator(scoreFields),
  "/fourth-graduate": createRequiredFieldsValidator(scoreFields),
  "/activity-graduate": createRequiredFieldsValidator(activityFields),
  "/first-prospective-graduate": createRequiredFieldsValidator(scoreFields),
  "/second-prospective-graduate": createRequiredFieldsValidator(scoreFields),
  "/third-prospective-graduate": createRequiredFieldsValidator(scoreFields),
  "/activity-prospective-graduate": createRequiredFieldsValidator(activityFields),
  "/ged/score": createRequiredFieldsValidator(["kor", "soc", "his", "sci", "math", "eng"]),
  "/ged/attendance-volunteer": createRequiredFieldsValidator(["dsmAlgorithm", "certificate"]),
};

const routeToStateKey = {
  "/application-classification": "applicationClassification",
  "/applicant-info": "applicantInfo",
  "/guardian-info": "guardianInfo",
  "/middle-school-info": "middleSchoolInfo",
  "/personal-statements": "personalStatements",
  "/statement-of-purpose": "statementOfPurpose",
  "/first-graduate": "firstGraduate",
  "/second-graduate": "secondGraduate",
  "/third-graduate": "thirdGraduate",
  "/fourth-graduate": "fourthGraduate",
  "/activity-graduate": "activityGraduate",
  "/first-prospective-graduate": "firstGraduateProspective",
  "/second-prospective-graduate": "secondGraduateProspective",
  "/third-prospective-graduate": "thirdGraduateProspective",
  "/activity-prospective-graduate": "activityGraduateProspective",
  "/ged/score": "gedScore",
  "/ged/attendance-volunteer": "attendanceVolunteer",
} as const satisfies Record<string, keyof ApplicationState>;

const fieldNameMap: Record<string, string> = {
  typeSelection: "유형 선택",
  regionSelection: "지역 선택",
  graduationType: "졸업 구분",
  graduationDate: "졸업 연월",
  idPhoto: "증명 사진",
  specialNotes: "특기 사항",
  applicantName: "지원자 성명",
  applicantNumber: "지원자 연락처",
  dateOfBirth: "생년월일",
  gender: "성별",
  guardianName: "보호자 성명",
  guardianNumber: "보호자 연락처",
  relationship: "지원자와의 관계",
  otherRelationship: "지원자와의 관계(기타)",
  postalCode: "우편번호",
  address: "주소",
  addressDetail: "상세 주소",
  schoolName: "중학교 이름",
  studentId: "중학교 학번",
  studentId_invalid: "중학교 학번 (5자리 필수)",
  schoolPhone: "중학교 전화번호",
  teacherName: "중학교 교사 성명",
  personalStmt: "자기소개서",
  studyPlan: "학업계획서",
  kor: "국어 성적",
  soc: "사회 성적",
  his: "역사 성적",
  math: "수학 성적",
  sci: "과학 성적",
  tech: "기술·가정 성적",
  eng: "영어 성적",
  earlyLeave: "미인정 조퇴",
  tardiness: "미인정 지각",
  classExit: "미인정 결과",
  absence: "미인정 결석",
  volunteer: "봉사시간",
  dsmAlgorithm: "DSM 알고리즘 대회 입상",
  certificate: "정보처리기능사 자격증 취득",
};

export const validatePageData = (state: ApplicationState, route: string) => {
  return validateRouteData({
    state,
    route,
    pageValidations,
    routeToStateKey,
  });
};

export const canProceedToNext = (state: ApplicationState, currentRoute: string) => {
  const { isValid, missingFields } = validatePageData(state, currentRoute);
  if (!isValid) {
    if (missingFields.includes("studentId_invalid")) {
      return { canProceed: false, msg: "학번은 5자리로 입력해주세요." };
    }

    const missingFieldsKR = missingFields.map(field => fieldNameMap[field] || field);
    return {
      canProceed: false,
      msg: `필수 항목이 누락되었습니다. ${missingFieldsKR.join(", ")}`,
    };
  }

  return { canProceed: true };
};

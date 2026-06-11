import type { ApplicationState } from "./applicationDataContext";

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

const getFieldValue = (obj: unknown, field: string) =>
  obj && typeof obj === "object" ? (obj as Record<string, unknown>)[field] : undefined;

const validateApplicationClassificationPage = (data: unknown) => {
  const missingFields: string[] = [];

  ["typeSelection", "regionSelection", "graduationType"].forEach(field => {
    if (isEmpty(getFieldValue(data, field))) {
      missingFields.push(field);
    }
  });

  const graduationType = getFieldValue(data, "graduationType");
  if (graduationType && graduationType !== "검정고시(중학교 졸업 학력)") {
    if (isEmpty(getFieldValue(data, "graduationDate"))) {
      missingFields.push("graduationDate");
    }
  }

  return missingFields;
};

const validateMiddleSchoolInfoPage = (data: unknown) => {
  const missingFields: string[] = [];

  ["schoolName", "studentId", "schoolPhone", "teacherName"].forEach(field => {
    if (isEmpty(getFieldValue(data, field))) {
      missingFields.push(field);
    }
  });

  const studentId = getFieldValue(data, "studentId");
  if (studentId !== null && studentId !== undefined) {
    const studentIdStr = String(studentId);
    if (studentIdStr.length !== 5) {
      missingFields.push("studentId_invalid");
    }
  }

  return missingFields;
};

const requiredFields = (fields: string[]) => (data: unknown) =>
  fields.filter(field => isEmpty(getFieldValue(data, field)));

const scoreFields = ["kor", "soc", "his", "math", "sci", "tech", "eng"];
const activityFields = ["earlyLeave", "tardiness", "classExit", "absence", "volunteer", "dsmAlgorithm", "certificate"];

const pageValidations: Record<string, (data: unknown) => string[]> = {
  "/application-classification": validateApplicationClassificationPage,
  "/applicant-info": requiredFields([
    "idPhoto",
    "applicantName",
    "applicantNumber",
    "dateOfBirth",
    "gender",
    "specialNotes",
  ]),
  "/guardian-info": requiredFields([
    "guardianName",
    "guardianNumber",
    "gender",
    "relationship",
    "postalCode",
    "address",
    "addressDetail",
  ]),
  "/middle-school-info": validateMiddleSchoolInfoPage,
  "/personal-statements": requiredFields(["personalStmt", "studyPlan"]),
  "/first-graduate": requiredFields(scoreFields),
  "/second-graduate": requiredFields(scoreFields),
  "/third-graduate": requiredFields(scoreFields),
  "/fourth-graduate": requiredFields(scoreFields),
  "/activity-graduate": requiredFields(activityFields),
  "/first-prospective-graduate": requiredFields(scoreFields),
  "/second-prospective-graduate": requiredFields(scoreFields),
  "/third-prospective-graduate": requiredFields(scoreFields),
  "/activity-prospective-graduate": requiredFields(activityFields),
  "/ged/score": requiredFields(["kor", "soc", "his", "sci", "math", "eng"]),
  "/ged/attendance-volunteer": requiredFields(["dsmAlgorithm", "certificate"]),
};

const fieldNameMap: Record<string, string> = {
  typeSelection: "전형 선택",
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
  const validator = pageValidations[route];
  if (!validator) return { isValid: true, missingFields: [] };

  let data: unknown = {};
  switch (route) {
    case "/application-classification":
      data = state.applicationClassification;
      break;
    case "/applicant-info":
      data = state.applicantInfo;
      break;
    case "/guardian-info":
      data = state.guardianInfo;
      break;
    case "/middle-school-info":
      data = state.middleSchoolInfo;
      break;
    case "/personal-statements":
      data = state.personalStatements;
      break;
    case "/first-graduate":
      data = state.firstGraduate;
      break;
    case "/second-graduate":
      data = state.secondGraduate;
      break;
    case "/third-graduate":
      data = state.thirdGraduate;
      break;
    case "/fourth-graduate":
      data = state.fourthGraduate;
      break;
    case "/activity-graduate":
      data = state.activityGraduate;
      break;
    case "/first-prospective-graduate":
      data = state.firstGraduateProspective;
      break;
    case "/second-prospective-graduate":
      data = state.secondGraduateProspective;
      break;
    case "/third-prospective-graduate":
      data = state.thirdGraduateProspective;
      break;
    case "/activity-prospective-graduate":
      data = state.activityGraduateProspective;
      break;
    case "/ged/score":
      data = state.gedScore;
      break;
    case "/ged/attendance-volunteer":
      data = state.attendanceVolunteer;
      break;
    default:
      return { isValid: true, missingFields: [] };
  }

  const missingFields = validator(data);
  return { isValid: missingFields.length === 0, missingFields };
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
      msg: `필수 항목이 누락되었습니다: ${missingFieldsKR.join(", ")}`,
    };
  }

  return { canProceed: true };
};

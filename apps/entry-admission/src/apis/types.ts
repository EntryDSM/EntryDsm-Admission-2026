export interface IAdmissionRequest {
  applicantInfo: IApplicantInfo;
  addressInfo: IAddressInfo;
  applicationInfo: IApplicationInfo;
  schoolInfo: ISchoolInfo;
  gradeInfo: IGradeInfo;
  attendanceInfo: IAttendanceInfo;
  awardAndCertificateInfo: IAwardAndCertificateInfo;
}

interface IApplicantInfo {
  applicantName: string;
  applicantTel: string;
  birthDate: string;
  applicantGender: string;
  parentName: string;
  parentTel: string;
  parentRelation: string;
}

interface IAddressInfo {
  isDaejeon: boolean;
  streetAddress: string;
  detailAddress: string;
  postalCode: string;
}

interface IApplicationInfo {
  applicationType: string | null;
  educationalStatus: string | null;
  studentNumber: string | null;
  graduationDate: string | null;
  studyPlan: string;
  selfIntroduce: string;
  applicationRemark: string;
}

interface ISchoolInfo {
  schoolCode: string | null;
  schoolName: string | null;
  schoolPhone: string | null;
  teacherName: string | null;
}

interface IGradeInfo {
  koreanGrade: string | null;
  socialGrade: string | null;
  historyGrade: string | null;
  mathGrade: string | null;
  scienceGrade: string | null;
  englishGrade: string | null;
  techAndHomeGrade: string | null;
  gedKorean: number | null;
  gedSocial: number | null;
  gedMath: number | null;
  gedScience: number | null;
  gedEnglish: number | null;
  gedHistory: number | null;
}

interface IAttendanceInfo {
  absence: number | null;
  tardiness: number | null;
  earlyLeave: number | null;
  classExit: number | null;
  volunteer: number | null;
}

interface IAwardAndCertificateInfo {
  algorithmAward: boolean;
  infoProcessingCert: boolean;
}

export interface IPdfPreviewSuccessRequest {
  sessionId: string;
  fileSize: number;
  generationTime: number;
}

export interface IPdfPreviewFailedRequest {
  sessionId: string;
  errorMessage: string;
}

export type IPdfPreviewRequest = IAdmissionRequest;

export interface IUpdateScheduleRequest {
  schedules: { type: string; date: string }[];
}

interface IProspectiveGraduateRequest {
  applicationType: string;
  educationalStatus: string;
  scoreData: IProspectiveGraduateScoreData;
}

interface IProspectiveGraduateScoreData {
  kor3_1: number;
  soc3_1: number;
  his3_1: number;
  sci3_1: number;
  tech3_1: number;
  math3_1: number;
  eng3_1: number;
  kor2_2: number;
  soc2_2: number;
  his2_2: number;
  sci2_2: number;
  tech2_2: number;
  math2_2: number;
  eng2_2: number;
  kor2_1: number;
  soc2_1: number;
  his2_1: number;
  sci2_1: number;
  tech2_1: number;
  math2_1: number;
  eng2_1: number;
  earlyLeave: number;
  tardiness: number;
  classExit: number;
  absence: number;
  dsmAlgorithm: "O" | "X";
  certificate: "O" | "X";
  volunteer: number;
  unexcused: number;
}

interface IGraduateRequest {
  applicationType: string;
  educationalStatus: string;
  scores: IGraduateScoreData;
}

interface IGraduateScoreData extends IProspectiveGraduateScoreData {
  kor3_2: number;
  soc3_2: number;
  his3_2: number;
  sci3_2: number;
  tech3_2: number;
  math3_2: number;
  eng3_2: number;
}

interface IGedRequest {
  applicationType: string;
  educationalStatus: string;
  scores: {
    gedKor: number;
    gedSoc: number;
    gedHis: number;
    gedSci: number;
    gedTech: number;
    gedMath: number;
    gedEng: number;
    dsmAlgorithm: "O" | "X";
    certificate: "O" | "X";
  };
}

export type IValidateRequest = IProspectiveGraduateRequest | IGraduateRequest | IGedRequest;

export const expectedGradeSemesters = ["2-1", "2-2", "3-1"] as const;

export type ExpectedGradeSemester = (typeof expectedGradeSemesters)[number];
export type Grade = "A" | "B" | "C" | "D" | "E" | "X";

export interface ExpectedGradeFormValues {
  kor: string | null;
  soc: string | null;
  eng: string | null;
  his: string | null;
  math: string | null;
  sci: string | null;
  tech: string | null;
}

export interface SubmitExpectedGradesRequest {
  schoolSemester: ExpectedGradeSemester;
  subjects: {
    koreanGrade: Grade;
    societyGrade: Grade;
    englishGrade: Grade;
    historyGrade: Grade;
    mathGrade: Grade;
    scienceGrade: Grade;
    technologyGrade: Grade;
  };
}

export interface SubmitExpectedGradesVariables {
  formValues: ExpectedGradeFormValues;
  schoolSemester: ExpectedGradeSemester;
}

export const gradeSemesters = ["2-1", "2-2", "3-1", "3-2"] as const;

export type GradeSemester = (typeof gradeSemesters)[number];

export interface SubmitGradesRequest {
  schoolSemester: GradeSemester;
  subjects: {
    koreanGrade: Grade;
    societyGrade: Grade;
    englishGrade: Grade;
    historyGrade: Grade;
    mathGrade: Grade;
    scienceGrade: Grade;
    technologyGrade: Grade;
  };
}

export interface SubmitGradesVariables {
  formValues: ExpectedGradeFormValues;
  schoolSemester: GradeSemester;
}

export interface GedScoreFormValues {
  kor: number;
  soc: number;
  eng: number;
  his: number;
  math: number;
  sci: number;
  tech: number;
}

export interface SubmitGedScoresRequest {
  koreanScore: number;
  societyScore: number;
  englishScore: number;
  historyScore: number;
  mathScore: number;
  scienceScore: number;
  technologyScore: number;
}

export interface SubmitGedScoresVariables {
  formValues: GedScoreFormValues;
}

export interface AcademicRecordFormValues {
  absence: number;
  earlyLeave: number;
  tardiness: number;
  classExit: number;
  volunteer: number;
}

export interface SubmitAcademicRecordsRequest {
  absentCount: number;
  earlyLeaveCount: number;
  lateCount: number;
  classAbsenceCount: number;
  volunteerTime: number;
}

export interface SubmitAcademicRecordsVariables {
  formValues: AcademicRecordFormValues;
}

export interface CertificateFormValues {
  dsmAlgorithmAwarded: boolean;
  programmingCertified: boolean;
}

export interface SubmitCertificatesRequest {
  isDsmAlgorithmAwarded: boolean;
  isProgrammingCertified: boolean;
}

export interface SubmitCertificatesVariables {
  formValues: CertificateFormValues;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: unknown;
}

export interface StartApplicationResponse {
  applicantId: number;
}

export type AdmissionType = "REGULAR" | "MEISTER" | "SOCIAL";

export type ApplicationRegion = "DAEJEON" | "NATIONAL";

export type GraduationType = "PROSPECTIVE" | "GRADUATED" | "GED";

export interface UpdateApplicationClassificationRequest {
  applicantId: number;
  admissionType: AdmissionType;
  region: ApplicationRegion;
  graduationType: GraduationType;
  graduationDate: string | null;
}

export type UpdateApplicationClassificationResponse = null;

export type ApplicantGender = "MALE" | "FEMALE";

export type SpecialAdmissionType = "NATIONAL_MERIT" | "PRIVILEGED_ADMISSION" | "NOTHING";

export interface UpdateApplicantPersonalInformationRequest {
  applicantId: number;
  profileImage: File;
  name: string;
  phoneNumber: string;
  gender: ApplicantGender;
  birthdate: string;
  specialAdmissionType: SpecialAdmissionType;
}

export type UpdateApplicantPersonalInformationResponse = null;

export type GuardianRelation = "FATHER" | "MOTHER" | "OTHER";

export interface UpdateGuardianPersonalInformationRequest {
  applicantId: number;
  guardianName: string;
  guardianPhoneNumber: string;
  guardianGender: ApplicantGender;
  guardianRelation: GuardianRelation;
  address: {
    zipCode: string;
    addressBase: string;
    addressDetail: string;
  };
}

export type UpdateGuardianPersonalInformationResponse = null;

export interface UpdateMiddleSchoolInformationRequest {
  applicantId: number;
  schoolName: string;
  studentNumber: string;
  schoolPhone: string;
  teacherName: string;
}

export type UpdateMiddleSchoolInformationResponse = null;

export interface UpdateSelfIntroductionRequest {
  applicantId: number;
  introduction: string;
}

export type UpdateSelfIntroductionResponse = null;

export interface UpdateStudyPlanRequest {
  applicantId: number;
  studyPlan: string;
}

export type UpdateStudyPlanResponse = null;

export type SubmitApplicationResponse = null;

export interface ApplicationData {
  entranceYear: string;
  receiptCode: string;
  schoolCode: string;
  userName: string;
  applicantTel: string;
  birthday: string;
  schoolRegion: string;
  gender: string;
  schoolName: string;
  educationalStatus: string;
  address: string;
  detailAddress: string;
  parentName: string;
  parentRelation: string;
  parentTel: string;
  region: string;
  applicationType: string;
  applicationRemark: string;
  imageUrl: string;
  absenceDayCount: string;
  latenessCount: string;
  earlyLeaveCount: string;
  lectureAbsenceCount: string;
  volunteerTime: string;
  koreanThirdGradeSecondSemester: string;
  koreanThirdGradeFirstSemester: string;
  koreanSecondGradeSecondSemester: string;
  koreanSecondGradeFirstSemester: string;
  socialThirdGradeSecondSemester: string;
  socialThirdGradeFirstSemester: string;
  socialSecondGradeSecondSemester: string;
  socialSecondGradeFirstSemester: string;
  historyThirdGradeSecondSemester: string;
  historyThirdGradeFirstSemester: string;
  historySecondGradeSecondSemester: string;
  historySecondGradeFirstSemester: string;
  mathThirdGradeSecondSemester: string;
  mathThirdGradeFirstSemester: string;
  mathSecondGradeSecondSemester: string;
  mathSecondGradeFirstSemester: string;
  scienceThirdGradeSecondSemester: string;
  scienceThirdGradeFirstSemester: string;
  scienceSecondGradeSecondSemester: string;
  scienceSecondGradeFirstSemester: string;
  applicationCase: string;
  techAndHomeThirdGradeSecondSemester: string;
  techAndHomeThirdGradeFirstSemester: string;
  techAndHomeSecondGradeSecondSemester: string;
  techAndHomeSecondGradeFirstSemester: string;
  englishThirdGradeSecondSemester: string;
  englishThirdGradeFirstSemester: string;
  englishSecondGradeSecondSemester: string;
  englishSecondGradeFirstSemester: string;
  hasCompetitionPrize: string;
  hasCertificate: string;
  year: string;
  month: string;
  day: string;
  veteransNumber: string;
  teacherName: string;
  teacherTel: string;
  examCode: string;
  selfIntroduction: string;
  studyPlan: string;
}

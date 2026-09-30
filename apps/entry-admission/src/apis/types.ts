export interface IUpdateScheduleRequest {
  schedules: { type: string; date: string }[];
}

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
  admissionType: AdmissionType;
  region: ApplicationRegion;
  graduationType: GraduationType;
  graduationDate: string | null;
}

export type UpdateApplicationClassificationResponse = null;

export type ApplicantGender = "MALE" | "FEMALE";

export type SpecialAdmissionType = "NONE" | "NATIONAL_MERIT" | "SPECIAL_ADMISSION";

export interface UpdateApplicantPersonalProfileRequest {
  file: File;
}

/** 증명사진 업로드 응답(configuration `FileResponse`). `id` 는 `photo_…` 형태의 공개 ID 다. */
export interface UpdateApplicantPersonalProfileResponse {
  id: string;
  fileName: string;
  size: number;
  downloadUrl: string;
  expiresIn: number;
}

export interface UpdateApplicantPersonalInformationRequest {
  /** 증명사진 업로드 응답의 `id`(`photo_…`) */
  photoFileId: string;
  name: string;
  phoneNumber: string;
  gender: ApplicantGender;
  birthdate: string;
  specialAdmissionType: SpecialAdmissionType;
}

export type UpdateApplicantPersonalInformationResponse = null;

export interface UpdateGuardianPersonalInformationRequest {
  guardianName: string;
  guardianPhoneNumber: string;
  guardianGender: ApplicantGender;
  guardianRelation: string;
  address: {
    zipCode: string;
    addressBase: string;
    addressDetail: string;
  };
}

export type UpdateGuardianPersonalInformationResponse = null;

export interface UpdateMiddleSchoolInformationRequest {
  schoolName: string;
  schoolCode: string;
  studentNumber: string;
  schoolPhone: string;
  teacherName: string;
}

export type UpdateMiddleSchoolInformationResponse = null;

export interface UpdateSelfIntroductionRequest {
  introduction: string;
}

export type UpdateSelfIntroductionResponse = null;

export interface UpdateStudyPlanRequest {
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

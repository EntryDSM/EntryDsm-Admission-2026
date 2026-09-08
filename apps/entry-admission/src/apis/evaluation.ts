import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Http } from "./http";
import type {
  AcademicRecordFormValues,
  CertificateFormValues,
  ExpectedGradeFormValues,
  GedScoreFormValues,
  Grade,
  SubmitGedScoresRequest,
  SubmitGedScoresVariables,
  SubmitAcademicRecordsRequest,
  SubmitAcademicRecordsVariables,
  SubmitCertificatesRequest,
  SubmitCertificatesVariables,
  SubmitExpectedGradesRequest,
  SubmitExpectedGradesVariables,
  SubmitGradesRequest,
  SubmitGradesVariables,
} from "./types";

export type {
  AcademicRecordFormValues,
  CertificateFormValues,
  ExpectedGradeFormValues,
  ExpectedGradeSemester,
  GedScoreFormValues,
  Grade,
  SubmitGedScoresVariables,
  SubmitAcademicRecordsVariables,
  SubmitCertificatesVariables,
  SubmitExpectedGradesVariables,
  SubmitGradesVariables,
} from "./types";

// 졸업 예정자의 학기별 성취도 성적 저장 API입니다.
const expectedGradesPath = "/api/evaluation/v11/evaluations/grades/expected";

// 화면 성적값이 서버가 허용하는 A~E 또는 X인지 확인합니다.
const isGrade = (value: string | null): value is Grade =>
  value === "A" || value === "B" || value === "C" || value === "D" || value === "E" || value === "X";

const requireGrade = (value: string | null): Grade => {
  if (!isGrade(value)) {
    throw new Error("모든 과목의 성적을 A~E 또는 X로 입력해 주세요.");
  }

  return value;
};

// 화면의 짧은 과목 키를 서버 요청의 영문 필드명으로 변환합니다.
const expectedGradesRequest = (
  formValues: ExpectedGradeFormValues,
  schoolSemester: SubmitExpectedGradesRequest["schoolSemester"]
): SubmitExpectedGradesRequest => {
  const { kor, soc, eng, his, math, sci, tech } = formValues;

  return {
    schoolSemester,
    subjects: {
      koreanGrade: requireGrade(kor),
      societyGrade: requireGrade(soc),
      englishGrade: requireGrade(eng),
      historyGrade: requireGrade(his),
      mathGrade: requireGrade(math),
      scienceGrade: requireGrade(sci),
      technologyGrade: requireGrade(tech),
    },
  };
};

export const submitExpectedGrades = async (
  formValues: ExpectedGradeFormValues,
  schoolSemester: SubmitExpectedGradesRequest["schoolSemester"]
) => Http.post<void>(expectedGradesPath, expectedGradesRequest(formValues, schoolSemester));

export const useSubmitExpectedGrades = () =>
  useMutation({
    mutationFn: ({ formValues, schoolSemester }: SubmitExpectedGradesVariables) =>
      submitExpectedGrades(formValues, schoolSemester),
    onSuccess: () => {
      toast.success("성적이 저장되었습니다.");
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "성적 저장에 실패했습니다.");
    },
  });

// 졸업자의 2-1~3-2 학기 성적 저장 API입니다.
const gradesPath = "/api/evaluation/v11/evaluations/grades/graduated";

const gradesRequest = (
  formValues: ExpectedGradeFormValues,
  schoolSemester: SubmitGradesRequest["schoolSemester"]
): SubmitGradesRequest => {
  const { kor, soc, eng, his, math, sci, tech } = formValues;

  return {
    schoolSemester,
    subjects: {
      koreanGrade: requireGrade(kor),
      societyGrade: requireGrade(soc),
      englishGrade: requireGrade(eng),
      historyGrade: requireGrade(his),
      mathGrade: requireGrade(math),
      scienceGrade: requireGrade(sci),
      technologyGrade: requireGrade(tech),
    },
  };
};

export const submitGrades = async (
  formValues: ExpectedGradeFormValues,
  schoolSemester: SubmitGradesRequest["schoolSemester"]
) => Http.post<void>(gradesPath, gradesRequest(formValues, schoolSemester));

export const useSubmitGrades = () =>
  useMutation({
    mutationFn: ({ formValues, schoolSemester }: SubmitGradesVariables) => submitGrades(formValues, schoolSemester),
    onSuccess: () => {
      toast.success("성적이 저장되었습니다.");
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "성적 저장에 실패했습니다.");
    },
  });

// 검정고시 점수 저장 API입니다.
const gedScoresPath = "/api/evaluation/v11/evaluations/ged-scores";

// 검정고시 점수는 0~100 범위만 서버에 전송합니다.
const requireScore = (value: number): number => {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error("모든 과목의 점수를 0~100 사이로 입력해 주세요.");
  }

  return value;
};

const gedScoresRequest = (formValues: GedScoreFormValues): SubmitGedScoresRequest => ({
  koreanScore: requireScore(formValues.kor),
  societyScore: requireScore(formValues.soc),
  englishScore: requireScore(formValues.eng),
  historyScore: requireScore(formValues.his),
  mathScore: requireScore(formValues.math),
  scienceScore: requireScore(formValues.sci),
  technologyScore: requireScore(formValues.tech),
});

export const submitGedScores = async (formValues: GedScoreFormValues) =>
  Http.post<void>(gedScoresPath, gedScoresRequest(formValues));

export const useSubmitGedScores = () =>
  useMutation({
    mutationFn: ({ formValues }: SubmitGedScoresVariables) => submitGedScores(formValues),
    onSuccess: () => {
      toast.success("검정고시 성적이 저장되었습니다.");
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "검정고시 성적 저장에 실패했습니다.");
    },
  });

// 출결 횟수와 봉사 시간을 저장하는 API입니다.
const academicRecordsPath = "/api/evaluation/v11/evaluations/academic-records";

const requireNonNegativeNumber = (value: number): number => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("출석 및 봉사 시간은 0 이상의 숫자로 입력해 주세요.");
  }

  return value;
};

const academicRecordsRequest = (formValues: AcademicRecordFormValues): SubmitAcademicRecordsRequest => ({
  absentCount: requireNonNegativeNumber(formValues.absence),
  earlyLeaveCount: requireNonNegativeNumber(formValues.earlyLeave),
  lateCount: requireNonNegativeNumber(formValues.tardiness),
  classAbsenceCount: requireNonNegativeNumber(formValues.classExit),
  volunteerTime: requireNonNegativeNumber(formValues.volunteer),
});

export const submitAcademicRecords = async (formValues: AcademicRecordFormValues) =>
  Http.post<void>(academicRecordsPath, academicRecordsRequest(formValues));

export const useSubmitAcademicRecords = () =>
  useMutation({
    mutationFn: ({ formValues }: SubmitAcademicRecordsVariables) => submitAcademicRecords(formValues),
    onSuccess: () => {
      toast.success("출석 및 봉사 정보가 저장되었습니다.");
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "출석 및 봉사 정보 저장에 실패했습니다.");
    },
  });

// DSM 알고리즘 입상 및 프로그래밍 자격증 여부를 저장하는 API입니다.
const certificatesPath = "/api/evaluation/v11/evaluations/certificates";

const certificatesRequest = (formValues: CertificateFormValues): SubmitCertificatesRequest => ({
  isDsmAlgorithmAwarded: formValues.dsmAlgorithmAwarded,
  isProgrammingCertified: formValues.programmingCertified,
});

export const submitCertificates = async (formValues: CertificateFormValues) =>
  Http.post<void>(certificatesPath, certificatesRequest(formValues));

export const useSubmitCertificates = () =>
  useMutation({
    mutationFn: ({ formValues }: SubmitCertificatesVariables) => submitCertificates(formValues),
    onSuccess: () => {
      toast.success("자격증 취득 정보가 저장되었습니다.");
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "자격증 취득 정보 저장에 실패했습니다.");
    },
  });

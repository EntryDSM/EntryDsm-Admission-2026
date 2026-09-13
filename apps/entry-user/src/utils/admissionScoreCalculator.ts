import type { CalculationState } from "../contexts";
import { ADMISSION_TYPE_MAX_SCORE_GED, type AdmissionType } from "../constants/admissionType";

type SchoolRecordType = "primary" | "graduated" | "qe";
type Grade = "A" | "B" | "C" | "D" | "E" | "X";
type SemesterGrades = CalculationState["primaryFirst"];
type Activity = CalculationState["primaryActivity"];

export interface AdmissionScoreResult {
  admissionType: AdmissionType;
  courseScore: number;
  attendanceScore: number;
  volunteerScore: number;
  additionalScore: number;
  totalScore: number;
  maxScore: number;
}

const GRADE_POINTS: Record<Grade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  X: 0,
};

const roundToThirdDecimal = (value: number) => Math.round((value + Number.EPSILON) * 1000) / 1000;

const toNonNegativeNumber = (value: string) => Math.max(0, Number(value) || 0);

const calculateQeConvertedPoint = (score: number) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  if (normalizedScore >= 98) return 5;
  if (normalizedScore >= 94) return 4;
  if (normalizedScore >= 90) return 3;
  if (normalizedScore >= 86) return 2;
  return 1;
};

const calculateSemesterScore = (grades: SemesterGrades, maximumScore: number) => {
  const applicableGrades = Object.values(grades).filter(
    (grade): grade is Exclude<Grade, "X"> => grade !== null && grade !== "X" && grade in GRADE_POINTS
  );

  if (applicableGrades.length === 0) {
    return 0;
  }

  const gradePointSum = applicableGrades.reduce((sum, grade) => sum + GRADE_POINTS[grade], 0);
  return maximumScore * (gradePointSum / applicableGrades.length / GRADE_POINTS.A);
};

const calculateCourseScore = (state: CalculationState, recordType: SchoolRecordType) => {
  if (recordType === "qe") {
    const scores = Object.values(state.qeScore)
      .map(value => Number(value))
      .filter(score => Number.isFinite(score));

    if (scores.length === 0) {
      return 0;
    }

    const convertedPointSum = scores.reduce((sum, score) => sum + calculateQeConvertedPoint(score), 0);
    return convertedPointSum / scores.length;
  }

  const rawCourseScore =
    recordType === "primary"
      ? calculateSemesterScore(state.primaryFirst, 40) +
        calculateSemesterScore(state.primarySecond, 20) +
        calculateSemesterScore(state.primaryThird, 20)
      : calculateSemesterScore(state.graduatedThird2, 20) +
        calculateSemesterScore(state.graduatedThird1, 20) +
        calculateSemesterScore(state.graduatedSecond2, 20) +
        calculateSemesterScore(state.graduatedSecond1, 20);

  return rawCourseScore;
};

const calculateAttendanceScore = (activity: Activity) => {
  const convertedAbsence = Math.floor(
    toNonNegativeNumber(activity.absences) +
      (toNonNegativeNumber(activity.lateArrivals) +
        toNonNegativeNumber(activity.earlyLeaves) +
        toNonNegativeNumber(activity.resultMissing)) /
        3
  );

  return Math.max(0, 15 - convertedAbsence);
};

const calculateVolunteerScore = (activity: Activity) => Math.min(15, toNonNegativeNumber(activity.volunteerHours));

const calculateAdditionalScore = (activity: Activity, admissionType: AdmissionType, recordType: SchoolRecordType) => {
  const algorithmScore = activity.dsmAlgorithm === "O" ? 3 : 0;
  const certificateScore =
    activity.infoProcessing === "O" && (recordType === "qe" || admissionType !== "COMMON") ? 6 : 0;

  return algorithmScore + certificateScore;
};

const getActivity = (state: CalculationState, recordType: SchoolRecordType) =>
  recordType === "primary"
    ? state.primaryActivity
    : recordType === "graduated"
      ? state.graduatedActivity
      : state.qeActivity;

const getCourseMultiplier = (admissionType: AdmissionType) => (admissionType === "COMMON" ? 1.75 : 1);

const getQeCourseMultiplier = (admissionType: AdmissionType) => (admissionType === "COMMON" ? 34 : 22);

const getMaximumScore = (recordType: SchoolRecordType, admissionType: AdmissionType) => {
  if (recordType === "qe") {
    // 검정고시는 전형별 교과 만점에 알고리즘 대회(3점)와 자격증(6점)을 더한 값입니다.
    return ADMISSION_TYPE_MAX_SCORE_GED[admissionType] + 9;
  }

  return admissionType === "COMMON" ? 173 : 119;
};

export const calculateAdmissionScores = (
  state: CalculationState,
  recordType: SchoolRecordType
): AdmissionScoreResult[] => {
  const activity = getActivity(state, recordType);
  const rawCourseScore = calculateCourseScore(state, recordType);
  const attendanceScore = recordType === "qe" ? 0 : calculateAttendanceScore(activity);
  const volunteerScore = recordType === "qe" ? 0 : calculateVolunteerScore(activity);

  return (["COMMON", "MEISTER", "SOCIAL"] as const).map(admissionType => {
    const multiplier = recordType === "qe" ? getQeCourseMultiplier(admissionType) : getCourseMultiplier(admissionType);
    const courseScore = roundToThirdDecimal(rawCourseScore * multiplier);
    const additionalScore = calculateAdditionalScore(activity, admissionType, recordType);
    const maxScore = getMaximumScore(recordType, admissionType);

    return {
      admissionType,
      courseScore,
      attendanceScore,
      volunteerScore,
      additionalScore,
      totalScore: roundToThirdDecimal(courseScore + attendanceScore + volunteerScore + additionalScore),
      maxScore,
    };
  });
};

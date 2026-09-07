import type { CalculationState } from "../contexts";
import type { AdmissionType } from "../constants/admissionType";

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

    const averageScore = scores.reduce((sum, score) => sum + Math.min(100, Math.max(0, score)), 0) / scores.length;
    return averageScore * 0.8;
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

const calculateAdditionalScore = (activity: Activity, admissionType: AdmissionType) => {
  const algorithmScore = activity.dsmAlgorithm === "O" ? 3 : 0;
  const certificateScore = admissionType === "COMMON" || activity.infoProcessing !== "O" ? 0 : 6;

  return algorithmScore + certificateScore;
};

const getActivity = (state: CalculationState, recordType: SchoolRecordType) =>
  recordType === "primary"
    ? state.primaryActivity
    : recordType === "graduated"
      ? state.graduatedActivity
      : state.qeActivity;

const getCourseMultiplier = (admissionType: AdmissionType) => (admissionType === "COMMON" ? 1.75 : 1);

export const calculateAdmissionScores = (
  state: CalculationState,
  recordType: SchoolRecordType
): AdmissionScoreResult[] => {
  const activity = getActivity(state, recordType);
  const rawCourseScore = calculateCourseScore(state, recordType);
  const attendanceScore = calculateAttendanceScore(activity);
  const volunteerScore = calculateVolunteerScore(activity);

  return (["COMMON", "MEISTER", "SOCIAL"] as const).map(admissionType => {
    const courseScore = roundToThirdDecimal(rawCourseScore * getCourseMultiplier(admissionType));
    const additionalScore = calculateAdditionalScore(activity, admissionType);
    const maxScore = admissionType === "COMMON" ? 173 : 119;

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

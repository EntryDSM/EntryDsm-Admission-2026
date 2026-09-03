import styled from "@emotion/styled";
import { canProceedToNext, GRADUATION_TYPES, type GraduationType, useApplicationData, usePageData } from "@entry/ui";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  getApplicationStorageKey,
  getStartedApplicantId,
  updateApplicantPersonalInformation,
  updateApplicationClassification,
  updateGuardianPersonalInformation,
  updateMiddleSchoolInformation,
  updateSelfIntroduction,
  updateStudyPlan,
  submitAcademicRecords,
  submitCertificates,
  submitExpectedGrades,
  submitGedScores,
  submitGrades,
} from "../apis";
import { ApplicationNav } from "../components";

const admissionTypes = {
  일반: "REGULAR",
  "마이스터 인재": "MEISTER",
  사회통합: "SOCIAL",
} as const;

const regions = {
  대전: "DAEJEON",
  전국: "NATIONAL",
} as const;

const graduationTypes = {
  "검정고시(중학교 졸업 학력)": "GED",
  "졸업 예정": "PROSPECTIVE",
  졸업: "GRADUATED",
} as const;

const genders = {
  남성: "MALE",
  여성: "FEMALE",
} as const;

const specialAdmissionTypes = {
  국가유공자: "NATIONAL_MERIT",
  "특례입학 대상자": "PRIVILEGED_ADMISSION",
  "특례 입학 대상": "PRIVILEGED_ADMISSION",
  "해당 없음": "NOTHING",
} as const;

const guardianRelations = {
  부: "FATHER",
  모: "MOTHER",
  기타: "OTHER",
} as const;

const getRequiredValue = <T,>(value: T | null | undefined, fieldName: string): T => {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} 값을 확인해 주세요.`);
  }

  return value;
};

const getMappedValue = <T extends Record<string, string>>(values: T, key: string, fieldName: string): T[keyof T] => {
  if (!(key in values)) {
    throw new Error(`${fieldName} 값을 확인해 주세요.`);
  }

  return values[key as keyof T];
};

const formatYearMonth = (date: (string | number)[]) => {
  const [year, month] = date;
  if (!year || !month) {
    throw new Error("날짜 값을 확인해 주세요.");
  }

  return `${year}-${String(month).padStart(2, "0")}`;
};

const formatBirthdate = (date: (string | number)[]) => {
  const [year, month, day] = date;
  if (!year || !month || !day) {
    throw new Error("생년월일을 확인해 주세요.");
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const getRequiredNumber = (value: string | number | null, fieldName: string) => {
  const numberValue = Number(value);
  if (value === null || !Number.isFinite(numberValue)) {
    throw new Error(`${fieldName} 값을 확인해 주세요.`);
  }

  return numberValue;
};

const getRequiredBoolean = (value: "O" | "X" | null, fieldName: string) => {
  if (value === null) {
    throw new Error(`${fieldName} 값을 확인해 주세요.`);
  }

  return value === "O";
};

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [classificationData] = usePageData("applicationClassification");
  const { state, loadedStorageKey, loadFromStorage, saveToStorage } = useApplicationData();
  const [isSaving, setIsSaving] = useState(false);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const applicantId = getStartedApplicantId();
  const storageKey = applicantId === null ? null : getApplicationStorageKey(applicantId);

  useEffect(() => {
    let isMounted = true;

    if (!storageKey) {
      setIsStorageLoaded(true);
      return () => {
        isMounted = false;
      };
    }

    if (loadedStorageKey === storageKey) {
      setIsStorageLoaded(true);
      return () => {
        isMounted = false;
      };
    }

    setIsStorageLoaded(false);

    const restoreApplicationData = async () => {
      await loadFromStorage(storageKey);
      if (isMounted) {
        setIsStorageLoaded(true);
      }
    };

    void restoreApplicationData();

    return () => {
      isMounted = false;
    };
  }, [loadFromStorage, loadedStorageKey, storageKey]);

  useEffect(() => {
    if (!isStorageLoaded || !storageKey || loadedStorageKey !== storageKey) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveToStorage(storageKey);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isStorageLoaded, loadedStorageKey, saveToStorage, state, storageKey]);
  const pageGraduateRoutes = [
    { path: "/application-classification", step: 0 },
    { path: "/applicant-info", step: 1 },
    { path: "/guardian-info", step: 2 },
    { path: "/middle-school-info", step: 3 },
    { path: "/personal-statements", step: 4 },
    { path: "/statement-of-purpose", step: 4 },
    { path: "/first-graduate", step: 5 },
    { path: "/second-graduate", step: 5 },
    { path: "/third-graduate", step: 5 },
    { path: "/fourth-graduate", step: 5 },
    { path: "/activity-graduate", step: 5 },
    { path: "/application-preview", step: 6 },
    { path: "/submit-check", step: 7 },
  ];
  const pageProspectiveGraduateRoutes = [
    { path: "/application-classification", step: 0 },
    { path: "/applicant-info", step: 1 },
    { path: "/guardian-info", step: 2 },
    { path: "/middle-school-info", step: 3 },
    { path: "/personal-statements", step: 4 },
    { path: "/statement-of-purpose", step: 4 },
    { path: "/first-prospective-graduate", step: 5 },
    { path: "/second-prospective-graduate", step: 5 },
    { path: "/third-prospective-graduate", step: 5 },
    { path: "/activity-prospective-graduate", step: 5 },
    { path: "/application-preview", step: 6 },
    { path: "/submit-check", step: 7 },
  ];
  const gedPageRoutes = [
    { path: "/application-classification", step: 0 },
    { path: "/applicant-info", step: 1 },
    { path: "/guardian-info", step: 2 },
    { path: "/personal-statements", step: 3 },
    { path: "/statement-of-purpose", step: 3 },
    { path: "/ged/score", step: 4 },
    { path: "/ged/attendance-volunteer", step: 4 },
    { path: "/application-preview", step: 5 },
    { path: "/submit-check", step: 6 },
  ];
  const graduationType = classificationData?.graduationType as GraduationType | undefined;
  const { routesConfig, progressSteps } = (() => {
    if (GRADUATION_TYPES[0] === graduationType) return { routesConfig: gedPageRoutes, progressSteps: 7 };
    if (GRADUATION_TYPES[1] === graduationType)
      return { routesConfig: pageProspectiveGraduateRoutes, progressSteps: 8 };
    if (GRADUATION_TYPES[2] === graduationType) return { routesConfig: pageGraduateRoutes, progressSteps: 8 };
    return { routesConfig: gedPageRoutes, progressSteps: 7 };
  })();
  const routes = routesConfig.map(item => item.path);
  const currentPath = location.pathname;
  const currentIndex = routes.findIndex(path => currentPath.includes(path));
  const currentPage = currentIndex >= 0 ? currentIndex + 1 : 1;
  const currentStep = routesConfig[currentPage - 1]?.step ?? 0;

  useEffect(() => {
    if (!isStorageLoaded) {
      return;
    }

    if (applicantId === null) {
      navigate("/", { replace: true });
      return;
    }

    if (currentIndex < 0) {
      navigate("/application-classification", { replace: true });
      return;
    }

    const firstIncompleteRoute = routes.find(
      (route, index) => index < currentIndex && !canProceedToNext(state, route).canProceed
    );

    if (firstIncompleteRoute) {
      navigate(firstIncompleteRoute, { replace: true });
    }
  }, [applicantId, currentIndex, isStorageLoaded, navigate, routes, state]);

  const setCurrentPage = (page: number) => {
    const path = routes[page - 1];
    if (path && !currentPath.includes(path)) navigate(path);
  };

  const validateCurrentPage = () => {
    const currentRoute = routes[currentPage - 1];
    return currentRoute ? canProceedToNext(state, currentRoute) : { canProceed: true };
  };

  const saveCurrentPage = async (): Promise<boolean> => {
    const applicantId = getStartedApplicantId();
    if (applicantId === null) {
      toast.error("원서 작성 정보를 찾을 수 없습니다. 처음부터 다시 시작해 주세요.");
      return false;
    }

    setIsSaving(true);
    try {
      switch (currentPath) {
        case "/application-classification": {
          const graduationTypeValue = getMappedValue(
            graduationTypes,
            state.applicationClassification.graduationType,
            "졸업 구분"
          );
          await updateApplicationClassification({
            applicantId,
            admissionType: getMappedValue(admissionTypes, state.applicationClassification.typeSelection, "전형"),
            region: getMappedValue(regions, state.applicationClassification.regionSelection, "지역"),
            graduationType: graduationTypeValue,
            graduationDate:
              graduationTypeValue === "GED" ? null : formatYearMonth(state.applicationClassification.graduationDate),
          });
          break;
        }
        case "/applicant-info": {
          const { idPhoto, applicantName, applicantNumber, gender, dateOfBirth, specialNotes } = state.applicantInfo;

          await updateApplicantPersonalInformation({
            applicantId,
            profileImage: getRequiredValue(idPhoto, "증명사진"),
            name: applicantName,
            phoneNumber: applicantNumber,
            gender: getMappedValue(genders, gender, "성별"),
            birthdate: formatBirthdate(dateOfBirth),
            specialAdmissionType: getMappedValue(specialAdmissionTypes, specialNotes, "특기 사항"),
          });
          break;
        }
        case "/guardian-info": {
          const { guardianName, guardianNumber, guardianGender, relationship, postalCode, address, addressDetail } =
            state.guardianInfo;
          await updateGuardianPersonalInformation({
            applicantId,
            guardianName,
            guardianPhoneNumber: guardianNumber,
            guardianGender: getMappedValue(genders, guardianGender, "보호자 성별"),
            guardianRelation: getMappedValue(guardianRelations, String(relationship[0]), "보호자 관계"),
            address: { zipCode: postalCode, addressBase: address, addressDetail },
          });
          break;
        }
        case "/middle-school-info": {
          const { schoolName, studentId, schoolPhone, teacherName } = state.middleSchoolInfo;
          await updateMiddleSchoolInformation({
            applicantId,
            schoolName: getRequiredValue(schoolName ?? undefined, "중학교 이름"),
            studentNumber: String(getRequiredValue(studentId ?? undefined, "중학교 학번")),
            schoolPhone: getRequiredValue(schoolPhone ?? undefined, "중학교 전화번호"),
            teacherName: getRequiredValue(teacherName ?? undefined, "중학교 교사 성명"),
          });
          break;
        }
        case "/personal-statements":
          await updateSelfIntroduction({ applicantId, introduction: state.personalStatements.personalStmt });
          break;
        case "/statement-of-purpose":
          await updateStudyPlan({ applicantId, studyPlan: state.statementOfPurpose.studyPlan });
          break;
        case "/first-graduate":
          await submitGrades(state.firstGraduate, "3-2");
          break;
        case "/second-graduate":
          await submitGrades(state.secondGraduate, "3-1");
          break;
        case "/third-graduate":
          await submitGrades(state.thirdGraduate, "2-2");
          break;
        case "/fourth-graduate":
          await submitGrades(state.fourthGraduate, "2-1");
          break;
        case "/first-prospective-graduate":
          await submitExpectedGrades(state.firstGraduateProspective, "3-1");
          break;
        case "/second-prospective-graduate":
          await submitExpectedGrades(state.secondGraduateProspective, "2-2");
          break;
        case "/third-prospective-graduate":
          await submitExpectedGrades(state.thirdGraduateProspective, "2-1");
          break;
        case "/ged/score":
          await submitGedScores({
            kor: getRequiredNumber(state.gedScore.kor, "국어 성적"),
            soc: getRequiredNumber(state.gedScore.soc, "사회 성적"),
            eng: getRequiredNumber(state.gedScore.eng, "영어 성적"),
            his: getRequiredNumber(state.gedScore.his, "역사 성적"),
            math: getRequiredNumber(state.gedScore.math, "수학 성적"),
            sci: getRequiredNumber(state.gedScore.sci, "과학 성적"),
            tech: getRequiredNumber(state.gedScore.tech, "기술·가정 성적"),
          });
          break;
        case "/activity-graduate":
        case "/activity-prospective-graduate": {
          const activity =
            currentPath === "/activity-graduate" ? state.activityGraduate : state.activityGraduateProspective;

          await Promise.all([
            submitAcademicRecords({
              absence: getRequiredNumber(activity.absence, "미인정 결석"),
              earlyLeave: getRequiredNumber(activity.earlyLeave, "미인정 조퇴"),
              tardiness: getRequiredNumber(activity.tardiness, "미인정 지각"),
              classExit: getRequiredNumber(activity.classExit, "미인정 결과"),
              volunteer: getRequiredNumber(activity.volunteer, "봉사시간"),
            }),
            submitCertificates({
              dsmAlgorithmAwarded: getRequiredBoolean(activity.dsmAlgorithm, "DSM 알고리즘 대회 입상 여부"),
              programmingCertified: getRequiredBoolean(activity.certificate, "프로그래밍 기능사 자격증 여부"),
            }),
          ]);
          break;
        }
        case "/ged/attendance-volunteer":
          await submitCertificates({
            dsmAlgorithmAwarded: getRequiredBoolean(
              state.attendanceVolunteer.dsmAlgorithm,
              "DSM 알고리즘 대회 입상 여부"
            ),
            programmingCertified: getRequiredBoolean(
              state.attendanceVolunteer.certificate,
              "프로그래밍 기능사 자격증 여부"
            ),
          });
          break;
        default:
          break;
      }

      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const shouldRemoveTopPadding = currentPath.includes("/application-preview") || currentPath.includes("/submit-check");

  if (!isStorageLoaded || applicantId === null) {
    return <StorageLoadingMessage>원서 작성 정보를 불러오고 있습니다.</StorageLoadingMessage>;
  }

  return (
    <Main $removeTopPadding={shouldRemoveTopPadding}>
      <Outlet />
      <ApplicationNav
        totalPage={routesConfig.length}
        currentStep={currentStep}
        currentPage={currentPage}
        progressSteps={progressSteps}
        setCurrentPage={setCurrentPage}
        graduationType={graduationType}
        validateCurrentPage={validateCurrentPage}
        onNext={saveCurrentPage}
        isSaving={isSaving}
      />
    </Main>
  );
};

const Main = styled.div<{ $removeTopPadding?: boolean }>`
  width: 100vw;
  padding: ${props => (props.$removeTopPadding ? "0 160px 40px" : "40px 160px")};
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
`;

const StorageLoadingMessage = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

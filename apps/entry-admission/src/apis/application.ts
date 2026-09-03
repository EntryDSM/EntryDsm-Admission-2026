import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Http } from "./http";
import type {
  StartApplicationResponse,
  UpdateApplicationClassificationRequest,
  UpdateApplicationClassificationResponse,
  UpdateApplicantPersonalInformationRequest,
  UpdateApplicantPersonalInformationResponse,
  UpdateGuardianPersonalInformationRequest,
  UpdateGuardianPersonalInformationResponse,
  UpdateMiddleSchoolInformationRequest,
  UpdateMiddleSchoolInformationResponse,
  UpdateSelfIntroductionRequest,
  UpdateSelfIntroductionResponse,
  UpdateStudyPlanRequest,
  UpdateStudyPlanResponse,
  SubmitApplicationResponse,
} from "./types";

// 원서 작성 단계별 저장과 최종 제출에 공통으로 사용하는 API 경로입니다.
const APPLICATIONS_ENDPOINT = "/api/application/v11/applicants";
// 작성 중인 원서를 식별하는 applicantId를 브라우저 탭 재진입 후에도 유지합니다.
const STARTED_APPLICANT_ID_KEY = "entry-application-started-applicant-id";

// SSR 환경에서 localStorage 접근을 막기 위한 브라우저 실행 여부입니다.
const isBrowser = typeof window !== "undefined";

// 현재 작성 중인 원서의 applicantId를 localStorage에서 안전하게 읽습니다.
export const getStartedApplicantId = () => {
  if (!isBrowser) {
    return null;
  }

  const savedApplicantId = window.localStorage.getItem(STARTED_APPLICANT_ID_KEY);
  if (!savedApplicantId) {
    return null;
  }

  const applicantId = Number(savedApplicantId);
  return Number.isFinite(applicantId) ? applicantId : null;
};

export const setStartedApplicantId = (applicantId: number) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(STARTED_APPLICANT_ID_KEY, String(applicantId));
};

export const clearStartedApplicantId = () => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.removeItem(STARTED_APPLICANT_ID_KEY);
};

// IndexedDB에서 원서별 임시저장 데이터를 분리하는 고유 키입니다.
export const getApplicationStorageKey = (applicantId: number) => `applicationData:${applicantId}`;

// 빈 원서 레코드를 만들고 이후 단계 저장에 사용할 applicantId를 받습니다.
export const startApplication = async () => {
  return Http.post<StartApplicationResponse>(APPLICATIONS_ENDPOINT, {});
};

// 지원 유형, 지역, 졸업 구분을 작성 중인 원서에 저장합니다.
export const updateApplicationClassification = async ({
  applicantId,
  ...data
}: UpdateApplicationClassificationRequest) => {
  return Http.patch<UpdateApplicationClassificationResponse>(`${APPLICATIONS_ENDPOINT}/${applicantId}/type`, data);
};

// 증명사진을 포함하므로 JSON이 아닌 multipart/form-data로 지원자 정보를 저장합니다.
export const updateApplicantPersonalInformation = async ({
  applicantId,
  profileImage,
  name,
  phoneNumber,
  gender,
  birthdate,
  specialAdmissionType,
}: UpdateApplicantPersonalInformationRequest) => {
  const formData = new FormData();
  formData.append("profileImage", profileImage);
  formData.append("name", name);
  formData.append("phoneNumber", phoneNumber);
  formData.append("gender", gender);
  formData.append("birthdate", birthdate);
  formData.append("specialAdmissionType", specialAdmissionType);

  return Http.patchFormData<UpdateApplicantPersonalInformationResponse>(
    `${APPLICATIONS_ENDPOINT}/${applicantId}/personal`,
    formData
  );
};

// 보호자 연락처와 주소 정보를 저장합니다.
export const updateGuardianPersonalInformation = async ({
  applicantId,
  ...data
}: UpdateGuardianPersonalInformationRequest) => {
  return Http.patch<UpdateGuardianPersonalInformationResponse>(`${APPLICATIONS_ENDPOINT}/${applicantId}/family`, data);
};

// 중학교와 담임 교사 정보를 저장합니다.
export const updateMiddleSchoolInformation = async ({ applicantId, ...data }: UpdateMiddleSchoolInformationRequest) => {
  return Http.patch<UpdateMiddleSchoolInformationResponse>(
    `${APPLICATIONS_ENDPOINT}/${applicantId}/middle-school`,
    data
  );
};

// 자기소개서와 학업계획서는 각각 독립된 단계 API로 저장합니다.
export const updateSelfIntroduction = async ({ applicantId, ...data }: UpdateSelfIntroductionRequest) => {
  return Http.patch<UpdateSelfIntroductionResponse>(`${APPLICATIONS_ENDPOINT}/${applicantId}/self-introduction`, data);
};

export const updateStudyPlan = async ({ applicantId, ...data }: UpdateStudyPlanRequest) => {
  return Http.patch<UpdateStudyPlanResponse>(`${APPLICATIONS_ENDPOINT}/${applicantId}/study-plan`, data);
};

// 서버에 저장된 작성 내용을 최종 제출 상태로 전환합니다.
export const submitApplication = async () => {
  return Http.patch<SubmitApplicationResponse>(APPLICATIONS_ENDPOINT, {});
};

// 원서 시작 성공 시 받은 applicantId를 저장해 다음 화면의 PATCH 요청에서 재사용합니다.
export const useStartApplication = () =>
  useMutation({
    mutationFn: startApplication,
    onSuccess: response => {
      setStartedApplicantId(response.applicantId);
    },
    onError: () => {
      toast.error("원서 작성 시작 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    },
  });

const APPLICATION_TYPE_LABELS: Record<string, string> = {
  SOCIAL: "사회통합",
  MEISTER: "마이스터전형",
  COMMON: "일반",
};

const EDUCATIONAL_STATUS_LABELS: Record<string, string> = {
  PROSPECTIVE_GRADUATE: "졸업 예정",
  GRADUATE: "졸업",
  QUALIFICATION_EXAM: "검정고시",
};

export const getApplicationTypeLabel = (applicationType?: string) => {
  return applicationType ? (APPLICATION_TYPE_LABELS[applicationType] ?? applicationType) : "-";
};

export const getEducationalStatusLabel = (educationalStatus?: string) => {
  return educationalStatus ? (EDUCATIONAL_STATUS_LABELS[educationalStatus] ?? educationalStatus) : "-";
};

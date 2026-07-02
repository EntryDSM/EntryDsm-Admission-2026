import { useCallback, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { Btn, useModal } from "@entry/ui";
import { toast } from "react-toastify";

import { Applicant, ApplicantDetailModal, CheckBox, FindApplicantInput, PagiNation } from "../components";

type FilterGroupType = "region" | "admission" | "status" | "education";

const REGION_OPTIONS = [
  { key: "daejeon", label: "대전", isNationwide: false },
  { key: "nationwide", label: "전국", isNationwide: true },
] as const;

const ADMISSION_OPTIONS = [
  { key: "general", label: "일반 전형" },
  { key: "meister", label: "마이스터 인재 전형" },
  { key: "social", label: "사회통합 전형" },
] as const;

const STATUS_OPTIONS = [{ key: "received", label: "원서 도착" }] as const;

const EDUCATION_OPTIONS = [
  { key: "prospective", label: "졸업 예정" },
  { key: "graduate", label: "졸업" },
  { key: "exam", label: "검정고시" },
] as const;

const PRINT_ACTION_LABELS = [
  "수험번호 발급",
  "지원자 점검표 출력",
  "전형 자료 출력",
  "1차 합격자 명단 출력",
  "수험표 출력",
] as const;

const PRINT_ACTION_UNAVAILABLE_MESSAGE = "아직 지원하지 않는 기능입니다.";

const APPLICANT_TABLE_HEADERS = [
  "접수 번호",
  "이름",
  "지역",
  "전형",
  "구분",
  "수험번호",
  "원서 도착 여부",
  "상태",
  "최종 합격 등록",
] as const;

type RegionKey = (typeof REGION_OPTIONS)[number]["key"];
type AdmissionKey = (typeof ADMISSION_OPTIONS)[number]["key"];
type StatusKey = (typeof STATUS_OPTIONS)[number]["key"];
type EducationKey = (typeof EDUCATION_OPTIONS)[number]["key"];

type ApplicationType = {
  receiptCode: number;
  applicantName: string;
  birthDay?: string;
  gender?: string;
  phoneNumber?: string;
  examinationNumber?: string;
  applicationType: "COMMON" | "MEISTER" | "SOCIAL";
  educationalStatus: "PROSPECTIVE_GRADUATE" | "GRADUATE" | "QUALIFICATION_EXAM";
  isDaejeon: boolean;
  isArrived: boolean;
};

const MOCK_APPLICANTS: ApplicationType[] = [
  {
    receiptCode: 1,
    applicantName: "홍길동",
    birthDay: "2010.03.12",
    gender: "남자",
    phoneNumber: "010-1234-0001",
    examinationNumber: "260001",
    applicationType: "MEISTER",
    educationalStatus: "PROSPECTIVE_GRADUATE",
    isDaejeon: true,
    isArrived: true,
  },
];

export const ApplicantsList = () => {
  const APPLICANTS_PER_PAGE = 10;
  const applicantsList = MOCK_APPLICANTS;
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicationType | null>(null);
  const [filters, setFilters] = useState<{
    region: Record<RegionKey, boolean>;
    admission: Record<AdmissionKey, boolean>;
    status: Record<StatusKey, boolean>;
    education: Record<EducationKey, boolean>;
  }>({
    region: { daejeon: false, nationwide: false },
    admission: { general: false, meister: false, social: false },
    status: { received: false },
    education: { prospective: false, graduate: false, exam: false },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, open, close } = useModal();
  const isLoading = false;

  const handlePublishOnlyClick = () => {
    toast.info(PRINT_ACTION_UNAVAILABLE_MESSAGE);
  };

  const handleSearchChange = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  }, []);

  const handleCheckBoxChange = <G extends FilterGroupType, K extends keyof (typeof filters)[G]>(group: G, key: K) => {
    setFilters(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: !prev[group][key],
      },
    }));
    setCurrentPage(1);
  };

  const handleApplicantClick = (applicant: ApplicationType) => {
    if (!applicant.receiptCode) {
      return;
    }

    setSelectedApplicant(applicant);
    open();
  };

  const filteredApplicants = useMemo(() => {
    let filtered = applicantsList;

    const isDaejeonSelected = filters.region.daejeon;
    const isNationwideSelected = filters.region.nationwide;
    if (isDaejeonSelected !== isNationwideSelected) {
      filtered = filtered.filter(a => a.isDaejeon === isDaejeonSelected);
    }

    if (searchKeyword) {
      filtered = filtered.filter(a => a.applicantName.toLocaleLowerCase().includes(searchKeyword.toLocaleLowerCase()));
    }

    const selectedAdmissions = Object.entries(filters.admission)
      .filter(([, v]) => v)
      .map(([k]) => k as AdmissionKey);

    if (selectedAdmissions.length > 0) {
      const admissionMap: Record<AdmissionKey, string> = {
        general: "COMMON",
        meister: "MEISTER",
        social: "SOCIAL",
      };
      const allowedTypes = selectedAdmissions.map(k => admissionMap[k]);
      filtered = filtered.filter(a => allowedTypes.includes(a.applicationType));
    }

    const selectedEducation = Object.entries(filters.education)
      .filter(([, v]) => v)
      .map(([k]) => k as EducationKey);

    if (selectedEducation.length > 0) {
      const educationMap: Record<EducationKey, string> = {
        prospective: "PROSPECTIVE_GRADUATE",
        graduate: "GRADUATE",
        exam: "QUALIFICATION_EXAM",
      };
      const allowedEducation = selectedEducation.map(k => educationMap[k]);
      filtered = filtered.filter(a => allowedEducation.includes(a.educationalStatus));
    }

    if (filters.status.received) {
      filtered = filtered.filter(a => a.isArrived === true);
    }

    return [...filtered].sort((a, b) => a.receiptCode - b.receiptCode);
  }, [applicantsList, searchKeyword, filters]);

  const totalPage = Math.max(1, Math.ceil(filteredApplicants.length / APPLICANTS_PER_PAGE));

  const paginatedApplicants = useMemo(() => {
    const startIndex = (currentPage - 1) * APPLICANTS_PER_PAGE;
    const endIndex = startIndex + APPLICANTS_PER_PAGE;
    return filteredApplicants.slice(startIndex, endIndex);
  }, [filteredApplicants, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Container>
      <SearchSection>
        <FindApplicantInput onSearch={handleSearchChange} />
      </SearchSection>

      <Toolbar>
        <ButtonContainer>
          {PRINT_ACTION_LABELS.map(label => (
            <Btn
              key={label}
              color={colors.gray[50]}
              backgroundColor={colors.green[400]}
              hoverBackgroundColor={colors.green[500]}
              onClick={handlePublishOnlyClick}
            >
              {label}
            </Btn>
          ))}
        </ButtonContainer>

        <FilterControl>
          <FilterGroup>
            {REGION_OPTIONS.map(item => (
              <CheckBox
                key={item.key}
                label={item.label}
                isChecked={filters.region[item.key]}
                onChange={() => handleCheckBoxChange("region", item.key)}
              />
            ))}
          </FilterGroup>

          <FilterGroup>
            {ADMISSION_OPTIONS.map(item => (
              <CheckBox
                key={item.key}
                label={item.label}
                isChecked={filters.admission[item.key]}
                onChange={() => handleCheckBoxChange("admission", item.key)}
              />
            ))}
          </FilterGroup>

          <FilterGroup>
            {STATUS_OPTIONS.map(item => (
              <CheckBox
                key={item.key}
                label={item.label}
                isChecked={filters.status[item.key]}
                onChange={() => handleCheckBoxChange("status", item.key)}
              />
            ))}
          </FilterGroup>

          <FilterGroup>
            {EDUCATION_OPTIONS.map(item => (
              <CheckBox
                key={item.key}
                label={item.label}
                isChecked={filters.education[item.key]}
                onChange={() => handleCheckBoxChange("education", item.key)}
              />
            ))}
          </FilterGroup>
        </FilterControl>
      </Toolbar>

      <TableScroll>
        <ApplicantsTitle>
          {APPLICANT_TABLE_HEADERS.map(header => (
            <Title key={header}>{header}</Title>
          ))}
        </ApplicantsTitle>

        <ApplicantsAllList>
          {isLoading ? (
            <LoadingContent>지원자 조회 데이터 기다리는 중...</LoadingContent>
          ) : paginatedApplicants.length === 0 ? (
            <LoadingContent>지원자 내역이 없습니다.</LoadingContent>
          ) : (
            paginatedApplicants.map(applicant => (
              <Applicant
                key={applicant.receiptCode}
                receiptCode={applicant.receiptCode}
                applicationType={applicant.applicationType}
                applicantName={applicant.applicantName}
                educationalStatus={applicant.educationalStatus}
                isDaejeon={applicant.isDaejeon}
                isArrived={applicant.isArrived}
                onClick={() => handleApplicantClick(applicant)}
                onRegisterClick={handlePublishOnlyClick}
              />
            ))
          )}
        </ApplicantsAllList>
      </TableScroll>

      {selectedApplicant?.receiptCode && (
        <ApplicantDetailModal
          receiptCode={selectedApplicant.receiptCode}
          isOpen={isOpen}
          onClose={close}
          applicant={{
            name: selectedApplicant.applicantName,
            birthDay: selectedApplicant.birthDay,
            gender: selectedApplicant.gender,
            phoneNumber: selectedApplicant.phoneNumber,
            examinationNumber: selectedApplicant.examinationNumber,
            isDaejeon: selectedApplicant.isDaejeon,
            applicationType: selectedApplicant.applicationType,
            educationalStatus: selectedApplicant.educationalStatus,
          }}
        />
      )}

      <PagiNation currentPage={currentPage} totalPage={totalPage} onPageChange={handlePageChange} />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const SearchSection = styled.div`
  width: min(100%, 800px);
  display: flex;
  justify-content: center;
`;

const Toolbar = styled.section`
  width: 100%;
  max-width: 1540px;
  display: flex;
  flex-direction: column;
  gap: 19px;
  margin-top: 32px;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;

  button {
    height: 48px;
    border-radius: 12px;
    font-size: 20px;
    font-weight: 500;
  }
`;

const FilterControl = styled.div`
  width: 100%;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;

  @media (max-width: 1280px) {
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 16px;
  }

  @media (max-width: 640px) {
    justify-content: flex-start;
    gap: 14px 20px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 12px;
  }
`;

const TableScroll = styled.div`
  width: 100%;
  max-width: 1540px;
  margin-top: 28px;
`;

const ApplicantsTitle = styled.div`
  width: 100%;
  height: 40px;
  display: grid;
  grid-template-columns: 0.8fr 1.2fr 0.7fr 1.4fr 0.9fr 0.9fr 1.3fr 1fr 1.2fr;
  column-gap: clamp(8px, 2.6vw, 50px);
  align-items: center;
`;

const Title = styled.div`
  min-width: 0;
  color: #878079;
  font-size: 16px;
  font-weight: 500;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ApplicantsAllList = styled.div`
  width: 100%;
`;

const LoadingContent = styled.div`
  min-height: 332px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #878079;
  font-size: 16px;
  font-weight: 500;
`;

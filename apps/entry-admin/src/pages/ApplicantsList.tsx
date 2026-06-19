import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { Applicant, ApplicantDetailModal, CheckBox, FindApplicantInput, PagiNation } from "../components";
import { colors } from "@entry/design";
import { Btn, useModal } from "@entry/ui";

type FilterGroupType = "region" | "admission" | "status" | "education";

const regionOptions = [
  { key: "daejeon", label: "대전", isNationwide: false },
  { key: "nationwide", label: "전국", isNationwide: true },
] as const;

const admissionOptions = [
  { key: "general", label: "일반 전형" },
  { key: "meister", label: "마이스터 인재 전형" },
  { key: "social", label: "사회통합 전형" },
] as const;

const statusOptions = [{ key: "received", label: "원서 도착" }] as const;

const educationOptions = [
  { key: "prospective", label: "졸업 예정" },
  { key: "graduate", label: "졸업" },
  { key: "exam", label: "검정고시" },
] as const;

const PRINT_ACTION_LABELS = [
  "수험번호 업데이트",
  "지원서 점검표 출력",
  "전형 자료 출력",
  "1차 합격자 번호 목록 출력",
  "수험표 출력",
] as const;

const APPLICANT_TABLE_HEADERS = ["접수 번호", "이름", "지역", "전형", "학력", "원서 도착", "최종 제출"] as const;

type RegionKey = (typeof regionOptions)[number]["key"];
type AdmissionKey = (typeof admissionOptions)[number]["key"];
type StatusKey = (typeof statusOptions)[number]["key"];
type EducationKey = (typeof educationOptions)[number]["key"];

type ApplicationType = {
  receiptCode: number;
  applicantName: string;
  applicationType: "COMMON" | "MEISTER" | "SOCIAL";
  educationalStatus: "PROSPECTIVE_GRADUATE" | "GRADUATE" | "QUALIFICATION_EXAM";
  isDaejeon: boolean;
  isArrived: boolean;
};

const EMPTY_APPLICANTS: ApplicationType[] = [];

export const ApplicantsList = () => {
  const applicantsList = EMPTY_APPLICANTS;
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
  const handlePublishOnlyClick = () => undefined;

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

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
    if (!applicant.receiptCode) return;
    setSelectedApplicant(applicant);
    open();
  };

  // 클라이언트 사이드 필터링
  const filteredApplicants = useMemo(() => {
    let filtered = applicantsList;

    const isDaejeonSelected = filters.region.daejeon;
    const isNationwideSelected = filters.region.nationwide;
    if (isDaejeonSelected !== isNationwideSelected) {
      filtered = filtered.filter(a => a.isDaejeon === isDaejeonSelected);
    }

    // 검색어 필터
    if (searchKeyword) {
      filtered = filtered.filter(a => a.applicantName.toLocaleLowerCase().includes(searchKeyword.toLocaleLowerCase()));
    }

    // 전형 필터 (여러 개 선택 가능)
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

    // 학력 필터 (여러 개 선택 가능)
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

    // 원서 도착 필터
    if (filters.status.received) {
      filtered = filtered.filter(a => a.isArrived === true);
    }

    // 정렬
    return [...filtered].sort((a, b) => a.receiptCode - b.receiptCode);
  }, [applicantsList, searchKeyword, filters]);

  const totalPage = Math.max(1, Math.ceil(filteredApplicants.length / 20));

  const paginatedApplicants = useMemo(() => {
    const startIndex = (currentPage - 1) * 20;
    const endIndex = startIndex + 20;
    return filteredApplicants.slice(startIndex, endIndex);
  }, [filteredApplicants, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Container>
      <HeadContent>
        <FindApplicantInput onSearch={handleSearchChange} />
        <ButtonContainer>
          {PRINT_ACTION_LABELS.map(label => (
            <Btn
              key={label}
              color={colors.extra.realWhite}
              backgroundColor={colors.green[400]}
              hoverBackgroundColor={colors.green[500]}
              onClick={handlePublishOnlyClick}
            >
              {label}
            </Btn>
          ))}
        </ButtonContainer>
      </HeadContent>

      <FilterControl>
        <LabelContainer>
          <Section>
            {regionOptions.map(item => (
              <CheckBox
                key={item.key}
                label={item.label}
                isChecked={filters.region[item.key]}
                onChange={() => handleCheckBoxChange("region", item.key)}
              />
            ))}
          </Section>

          <Section id="admission">
            {admissionOptions.map(item => (
              <CheckBox
                key={item.key}
                label={item.label}
                isChecked={filters.admission[item.key]}
                onChange={() => handleCheckBoxChange("admission", item.key)}
              />
            ))}
          </Section>

          <Section>
            {statusOptions.map(item => (
              <CheckBox
                key={item.key}
                label={item.label}
                isChecked={filters.status[item.key]}
                onChange={() => handleCheckBoxChange("status", item.key)}
              />
            ))}
          </Section>

          <Section>
            {educationOptions.map(item => (
              <CheckBox
                key={item.key}
                label={item.label}
                isChecked={filters.education[item.key]}
                onChange={() => handleCheckBoxChange("education", item.key)}
              />
            ))}
          </Section>
        </LabelContainer>
      </FilterControl>

      <ApplicantsTitle>
        <LeftTitle>
          {APPLICANT_TABLE_HEADERS.map(header => (
            <Title key={header}>{header}</Title>
          ))}
        </LeftTitle>
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
            />
          ))
        )}
      </ApplicantsAllList>

      {selectedApplicant?.receiptCode && (
        <ApplicantDetailModal
          receiptCode={selectedApplicant.receiptCode}
          isOpen={isOpen}
          onClose={close}
          applicant={{
            name: selectedApplicant.applicantName,
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const HeadContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FilterControl = styled.div`
  width: 100%;
  height: 48px;
  max-width: 1540px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  gap: 19px;

  @media (max-width: 1024px) {
    flex-direction: column;
    height: auto;
    gap: 16px;
  }
`;

const LabelContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 1200px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  #admission {
    border-inline: none;
    padding: 0;
  }
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;

  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const ApplicantsTitle = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 30px;

  @media (max-width: 768px) {
    overflow-x: auto;
  }

  .mobile-hidden {
    @media (max-width: 600px) {
      display: none;
    }
  }

  .tablet-hidden {
    @media (max-width: 400px) {
      display: none;
    }
  }
`;

const LeftTitle = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  > div {
    text-align: center;
    flex-shrink: 0;
  }

  > div:nth-of-type(1) {
    width: 100px;
  }
  > div:nth-of-type(2) {
    width: 100px;
  }
  > div:nth-of-type(3) {
    width: 100px;
  }
  > div:nth-of-type(4) {
    width: 140px;
  }
  > div:nth-of-type(5) {
    width: 120px;
  }
  > div:nth-of-type(6) {
    width: 120px;
  }
  > div:nth-of-type(7) {
    width: 120px;
  }

  @media (max-width: 1200px) {
    > div:nth-of-type(1) {
      width: 90px;
    }
    > div:nth-of-type(2) {
      width: 90px;
    }
    > div:nth-of-type(3) {
      width: 90px;
    }
    > div:nth-of-type(4) {
      width: 120px;
    }
    > div:nth-of-type(5) {
      width: 100px;
    }
    > div:nth-of-type(6) {
      width: 100px;
    }
    > div:nth-of-type(7) {
      width: 100px;
    }
  }

  @media (max-width: 768px) {
    > div:nth-of-type(1) {
      width: 70px;
    }
    > div:nth-of-type(2) {
      width: 70px;
    }
    > div:nth-of-type(3) {
      width: 70px;
    }
    > div:nth-of-type(4) {
      width: 100px;
    }
    > div:nth-of-type(5) {
      width: 80px;
    }
    > div:nth-of-type(6) {
      width: 80px;
    }
    > div:nth-of-type(7) {
      width: 80px;
    }
  }

  @media (max-width: 600px) {
    > div:nth-of-type(1) {
      width: 60px;
    }
    > div:nth-of-type(2) {
      width: 60px;
    }
    > div:nth-of-type(3) {
      width: 60px;
    }
    > div:nth-of-type(4) {
      width: 80px;
    }
    > div:nth-of-type(5) {
      width: 70px;
    }
    > div:nth-of-type(6) {
      width: 70px;
    }
    > div:nth-of-type(7) {
      width: 70px;
    }
  }
`;

const Title = styled.div`
  font-size: 16px;
  color: ${colors.gray[400]};

  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const ApplicantsAllList = styled.div`
  width: 100%;
`;

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.gray[400]};
  margin-top: 80px;
`;

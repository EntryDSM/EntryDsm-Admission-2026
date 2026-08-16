import { useCallback, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { Btn, useModal } from "@entry/ui";
import { toast } from "react-toastify";

import type { AdmissionType, GetApplicantsParams, GraduationStatus, Region } from "../apis";
import {
  useApplicants,
  useFinalScreening,
  useFirstScreening,
  useUpdateApplicantArrival,
  useUpdateApplicantStatus,
} from "../hooks";
import type { ApplicantListItem } from "../utils";
import { Applicant, ApplicantDetailModal, CheckBox, FindApplicantInput, PagiNation } from "../components";

type FilterGroupType = "region" | "admission" | "status" | "education";

const APPLICANTS_PER_PAGE = 10;

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

// 필터 체크박스 키 → 백엔드 enum 파라미터 매핑
const REGION_PARAM: Record<RegionKey, Region> = { daejeon: "DAEJEON", nationwide: "NATIONWIDE" };
const ADMISSION_PARAM: Record<AdmissionKey, AdmissionType> = {
  general: "GENERAL",
  meister: "MEISTER",
  social: "SOCIAL",
};
const EDUCATION_PARAM: Record<EducationKey, GraduationStatus> = {
  prospective: "EXPECTED",
  graduate: "GRADUATED",
  exam: "GED",
};

/** `{ key: boolean }` 필터 상태에서 체크된 키만 뽑아낸다. */
const getSelectedKeys = <K extends string>(record: Record<K, boolean>) =>
  (Object.entries(record) as [K, boolean][]).filter(([, isChecked]) => isChecked).map(([key]) => key);

export const ApplicantsList = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantListItem | null>(null);
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

  const queryParams = useMemo<GetApplicantsParams>(() => {
    const regions = getSelectedKeys(filters.region).map(key => REGION_PARAM[key]);
    const admissionTypes = getSelectedKeys(filters.admission).map(key => ADMISSION_PARAM[key]);
    const graduationStatuses = getSelectedKeys(filters.education).map(key => EDUCATION_PARAM[key]);

    return {
      keyword: searchKeyword || undefined,
      regions: regions.length > 0 ? regions : undefined,
      admissionTypes: admissionTypes.length > 0 ? admissionTypes : undefined,
      graduationStatuses: graduationStatuses.length > 0 ? graduationStatuses : undefined,
      isSubmitted: filters.status.received ? true : undefined,
      page: currentPage,
      size: APPLICANTS_PER_PAGE,
    };
  }, [filters, searchKeyword, currentPage]);

  const { applicants, pageInfo, isLoading } = useApplicants(queryParams);
  const totalPage = Math.max(1, pageInfo?.totalPages ?? 1);

  const { updateArrival, isUpdatingArrival } = useUpdateApplicantArrival();
  const { updateStatus, isUpdatingStatus } = useUpdateApplicantStatus();
  const { runFirstScreening, isRunningFirstScreening } = useFirstScreening();
  const { runFinalScreening, isRunningFinalScreening } = useFinalScreening();

  const handleFirstScreeningClick = () => {
    if (isRunningFirstScreening) {
      return;
    }

    if (confirm("1차(서류) 합격자를 일괄 산출하시겠습니까?\n지원자 상태가 일괄 변경됩니다.")) {
      runFirstScreening(false);
    }
  };

  const handleFinalScreeningClick = () => {
    if (isRunningFinalScreening) {
      return;
    }

    if (confirm("최종 합격자를 일괄 산출하시겠습니까?\n지원자 상태가 일괄 변경됩니다.")) {
      runFinalScreening(false);
    }
  };

  const handlePublishOnlyClick = () => {
    toast.info(PRINT_ACTION_UNAVAILABLE_MESSAGE);
  };

  // "합격자 등록" 버튼 → 개별 상태 변경(정정) API 로 최종 합격 처리한다.
  const handleRegisterClick = (applicant: ApplicantListItem) => {
    if (isUpdatingStatus) {
      return;
    }

    const reason = prompt(
      `${applicant.applicantName} 지원자를 최종 합격(FINAL_PASS) 처리합니다.\n변경 사유를 입력하세요.`,
      "관리자 개별 상태 변경"
    );

    if (reason === null) {
      return;
    }

    updateStatus({
      applicantId: applicant.applicantId,
      payload: { status: "FINAL_PASS", force: false, reason: reason.trim() || "관리자 개별 상태 변경" },
    });
  };

  const handleArrivalClick = (applicant: ApplicantListItem) => {
    // 도착 취소 API 는 명세에 없어 이미 도착 처리된 원서는 되돌릴 수 없다.
    if (applicant.isArrived) {
      toast.info("이미 도착 처리된 원서입니다. (취소 미지원)");
      return;
    }

    if (isUpdatingArrival) {
      return;
    }

    if (confirm(`${applicant.applicantName} 지원자의 원서를 도착 처리하시겠습니까?`)) {
      updateArrival(applicant.applicantId);
    }
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

  const handleApplicantClick = (applicant: ApplicantListItem) => {
    setSelectedApplicant(applicant);
    open();
  };

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
          <Btn
            color={colors.gray[50]}
            backgroundColor={colors.green[400]}
            hoverBackgroundColor={colors.green[500]}
            onClick={handleFirstScreeningClick}
          >
            {isRunningFirstScreening ? "1차 합격자 산출 중..." : "1차 합격자 산출"}
          </Btn>
          <Btn
            color={colors.gray[50]}
            backgroundColor={colors.green[400]}
            hoverBackgroundColor={colors.green[500]}
            onClick={handleFinalScreeningClick}
          >
            {isRunningFinalScreening ? "최종 합격자 산출 중..." : "최종 합격자 산출"}
          </Btn>
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

      <TableScroll role="table" aria-label="지원자 목록" aria-colcount={APPLICANT_TABLE_HEADERS.length}>
        <ApplicantsTitle role="row">
          {APPLICANT_TABLE_HEADERS.map((header, index) => (
            <Title key={header} role="columnheader" aria-colindex={index + 1}>
              {header}
            </Title>
          ))}
        </ApplicantsTitle>

        <ApplicantsAllList role="rowgroup">
          {isLoading ? (
            <LoadingContent role="row">
              <LoadingMessage role="cell" aria-colspan={APPLICANT_TABLE_HEADERS.length}>
                지원자 조회 데이터 기다리는 중...
              </LoadingMessage>
            </LoadingContent>
          ) : applicants.length === 0 ? (
            <LoadingContent role="row">
              <LoadingMessage role="cell" aria-colspan={APPLICANT_TABLE_HEADERS.length}>
                지원자 내역이 없습니다.
              </LoadingMessage>
            </LoadingContent>
          ) : (
            applicants.map(applicant => (
              <Applicant
                key={applicant.applicantId}
                receiptCode={applicant.receiptCode}
                applicationType={applicant.applicationType}
                applicantName={applicant.applicantName}
                examinationNumber={applicant.examinationNumber}
                educationalStatus={applicant.educationalStatus}
                isDaejeon={applicant.isDaejeon}
                isArrived={applicant.isArrived}
                onClick={() => handleApplicantClick(applicant)}
                onRegisterClick={() => handleRegisterClick(applicant)}
                onArrivalClick={() => handleArrivalClick(applicant)}
              />
            ))
          )}
        </ApplicantsAllList>
      </TableScroll>

      {selectedApplicant && (
        <ApplicantDetailModal applicantId={selectedApplicant.applicantId} isOpen={isOpen} onClose={close} />
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
  color: ${colors.gray[400]};
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
  color: ${colors.gray[400]};
  font-size: 16px;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
`;

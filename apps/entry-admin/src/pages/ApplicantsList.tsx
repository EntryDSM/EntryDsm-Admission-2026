import { useCallback, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { Btn, CancelModal, useModal } from "@entry/ui";

import type { AdmissionType, GetApplicantsParams, GraduationStatus, Region } from "../apis";
import {
  useApplicants,
  useApplicationPeriod,
  useCancelApplication,
  useDownloadAdmissionFile,
  useDownloadAdmissionTickets,
  useDownloadChecklist,
  useDownloadEssays,
  useDownloadFirstPassList,
  useFirstScreening,
  useIssueExamineeNumbers,
  useRegisterFinalResult,
  useUpdateApplicantArrival,
  useVerifyApplicationPeriod,
} from "../hooks";
import { type ApplicantActionMode, type ApplicantListItem, getApplicantActionLabel, toExportFilter } from "../utils";
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

/** 마지막 열(지원자별 버튼) 제목은 원서 접수 기간에 따라 "접수 취소" ↔ "2차 합격자 등록" 으로 바뀌므로 렌더 시점에 붙인다. */
const APPLICANT_TABLE_FIXED_HEADERS = [
  "접수 번호",
  "이름",
  "지역",
  "전형",
  "구분",
  "수험번호",
  "원서 도착 여부",
  "상태",
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
      isArrived: filters.status.received ? true : undefined,
      page: currentPage,
      size: APPLICANTS_PER_PAGE,
    };
  }, [filters, searchKeyword, currentPage]);

  const { applicants, pageInfo, isLoading } = useApplicants(queryParams);
  const totalPage = Math.max(1, pageInfo?.totalPages ?? 1);

  // 출력물(점검표·수험표)은 화면의 검색어·필터 조건을 그대로 따른다. 조건이 없으면(undefined) 전체 지원자가 대상이다.
  const exportFilter = useMemo(() => toExportFilter(queryParams), [queryParams]);

  const { updateArrival, isUpdatingArrival } = useUpdateApplicantArrival();
  const { runFirstScreening, isRunningFirstScreening } = useFirstScreening();
  const { registerFinalResult, isRegisteringFinalResult } = useRegisterFinalResult();

  // 원서 접수 기간에는 지원자별 버튼이 "접수 취소", 접수가 끝나면(또는 기간 판정에 실패하면) 기존대로 "2차 합격자 등록" 이 된다.
  const { periodStatus, isCheckingPeriod } = useApplicationPeriod();
  const applicantActionMode: ApplicantActionMode = periodStatus === "open" ? "cancel" : "register";
  const tableHeaders = [...APPLICANT_TABLE_FIXED_HEADERS, getApplicantActionLabel(applicantActionMode)];

  const [cancelTarget, setCancelTarget] = useState<ApplicantListItem | null>(null);
  const [isVerifyingPeriod, setIsVerifyingPeriod] = useState(false);
  const verifyApplicationPeriod = useVerifyApplicationPeriod();
  const { cancelApplication, isCancelingApplication } = useCancelApplication();
  const isCancelInProgress = isVerifyingPeriod || isCancelingApplication;

  const handleFirstScreeningClick = () => {
    if (isRunningFirstScreening) {
      return;
    }

    if (confirm("1차(서류) 합격자를 일괄 산출하시겠습니까?\n지원자 상태가 일괄 변경됩니다.")) {
      runFirstScreening(false);
    }
  };

  const { downloadChecklist, isDownloadingChecklist } = useDownloadChecklist();
  const { downloadAdmissionTickets, isDownloadingAdmissionTickets } = useDownloadAdmissionTickets();
  const { downloadAdmissionFile, isDownloadingAdmissionFile } = useDownloadAdmissionFile();
  const { downloadFirstPassList, isDownloadingFirstPassList } = useDownloadFirstPassList();
  const { downloadEssays, isDownloadingEssays } = useDownloadEssays();

  const { issueExamineeNumbers, isIssuingExamineeNumbers } = useIssueExamineeNumbers();

  // "수험번호 발급" → 발급 대상 전체에 수험번호를 일괄 발급한다. 이미 발급된 지원자는 서버가 건너뛴다.
  const handleIssueExamineeNumbersClick = () => {
    if (isIssuingExamineeNumbers) {
      return;
    }

    if (confirm("발급 대상 지원자에게 수험번호를 일괄 발급하시겠습니까?")) {
      issueExamineeNumbers();
    }
  };

  // "지원자 점검표 출력" → 현재 검색 조건으로 지원자 목록 엑셀 내보내기 잡(APPLICANT_LIST)을 접수하고 완료되면 다운로드 링크를 연다.
  const handleChecklistClick = () => {
    if (isDownloadingChecklist) {
      return;
    }

    downloadChecklist({ filter: exportFilter });
  };

  // "수험표 출력" → 현재 검색 조건으로 수험표 PDF 내보내기 잡(ADMISSION_TICKET)을 접수하고 완료되면 다운로드 링크를 연다.
  const handleAdmissionTicketsClick = () => {
    if (isDownloadingAdmissionTickets) {
      return;
    }

    downloadAdmissionTickets({ filter: exportFilter });
  };

  // "전형 자료 출력" → GET /admission-file 로 전체 지원자 엑셀 잡(ADMISSION_FILE)을 접수하고 완료되면 다운로드 링크를 연다.
  // 이 API 는 조건을 받지 않으므로 화면 필터와 무관하게 항상 전체 지원자가 대상이다.
  const handleAdmissionFileClick = () => {
    if (isDownloadingAdmissionFile) {
      return;
    }

    downloadAdmissionFile();
  };

  // "1차 합격자 명단 출력" → GET /first-pass 가 명단 엑셀을 그 자리에서 만들어 서명 URL 을 돌려주면 연다(잡 폴링 없음, 조건 없음).
  const handleFirstPassListClick = () => {
    if (isDownloadingFirstPassList) {
      return;
    }

    downloadFirstPassList();
  };

  // "자기소개서·학업계획서 다운로드" → GET /essays 가 전체 지원자의 서식 3 PDF 를 ZIP 으로 스트리밍하면 Blob 으로 받아 저장한다.
  // 서명 URL·잡 폴링이 없고 조건도 받지 않으므로 화면 필터와 무관하게 항상 전체 지원자가 대상이다.
  const handleEssaysClick = () => {
    if (isDownloadingEssays) {
      return;
    }

    downloadEssays();
  };

  // 출력/다운로드 액션 모음. `isPending` 이 true 인 동안은 버튼 문구에 "중..." 을 붙여 진행 상태를 보여준다.
  const printActions = [
    { label: "수험번호 발급", onClick: handleIssueExamineeNumbersClick, isPending: isIssuingExamineeNumbers },
    { label: "점검표 출력", onClick: handleChecklistClick, isPending: isDownloadingChecklist },
    { label: "전형 자료 출력", onClick: handleAdmissionFileClick, isPending: isDownloadingAdmissionFile },
    { label: "1차 합격 명단 출력", onClick: handleFirstPassListClick, isPending: isDownloadingFirstPassList },
    { label: "수험표 출력", onClick: handleAdmissionTicketsClick, isPending: isDownloadingAdmissionTickets },
    { label: "자기소개서·학업계획서 출력", onClick: handleEssaysClick, isPending: isDownloadingEssays },
  ];

  // "2차 합격자 등록" 버튼 → 개별 등록 API 로 최종 합격 처리한다. 등록하지 않은 지원자는 최종 불합격 처리된다.
  const handleRegisterClick = (applicant: ApplicantListItem) => {
    if (isRegisteringFinalResult) {
      return;
    }

    if (confirm(`${applicant.applicantName} 지원자를 최종 합격자로 등록하시겠습니까?`)) {
      registerFinalResult({ applicantId: applicant.applicantId, applicantName: applicant.applicantName });
    }
  };

  // "접수 취소" 버튼 → 되돌릴 수 없는 삭제라 confirm 대신 "확인했습니다" 를 입력받는 모달(원서 최종 제출과 같은 방식)을 연다.
  const handleCancelClick = (applicant: ApplicantListItem) => {
    if (isCancelInProgress) {
      return;
    }

    setCancelTarget(applicant);
  };

  // 모달에서 "확인했습니다" 를 입력하고 접수 취소를 누르면, 서버 시각으로 접수 기간을 다시 확인한 뒤 삭제한다.
  // 접수 기간이 아니거나 확인에 실패하면 삭제하지 않고 모달을 닫는다(안내는 useVerifyApplicationPeriod 가 토스트).
  const handleCancelConfirm = async () => {
    if (!cancelTarget || isCancelInProgress) {
      return;
    }

    setIsVerifyingPeriod(true);
    let isOpenPeriod = false;
    try {
      isOpenPeriod = await verifyApplicationPeriod();
    } finally {
      setIsVerifyingPeriod(false);
    }

    if (!isOpenPeriod) {
      setCancelTarget(null);
      return;
    }

    // 결과(성공·실패)는 훅이 토스트하므로 요청이 끝나면 모달을 닫는다. 실패 시 다시 시도하려면 "확인했습니다" 부터 다시 입력한다.
    cancelApplication(
      { applicantId: cancelTarget.applicantId, applicantName: cancelTarget.applicantName },
      { onSettled: () => setCancelTarget(null) }
    );
  };

  // 요청이 진행 중일 때는 배경 클릭·이전 버튼으로 모달이 닫히지 않게 한다.
  const handleCancelModalClose = () => {
    if (isCancelInProgress) {
      return;
    }

    setCancelTarget(null);
  };

  // 지원자별 버튼은 접수 기간에 따라 역할이 바뀐다(접수 취소 ↔ 2차 합격자 등록).
  const handleActionClick = (applicant: ApplicantListItem) => {
    if (applicantActionMode === "cancel") {
      handleCancelClick(applicant);
      return;
    }

    handleRegisterClick(applicant);
  };

  const cancelModalContent = cancelTarget
    ? `${cancelTarget.applicantName || "해당"} 지원자(접수번호 ${cancelTarget.receiptCode})의 원서가 삭제되며, 삭제된 원서는 복구할 수 없습니다.`
    : "";

  const handleArrivalClick = (applicant: ApplicantListItem) => {
    if (isUpdatingArrival) {
      return;
    }

    // 백엔드가 도착 취소(isArrived: false)를 지원하므로 체크박스로 도착 ↔ 취소를 토글한다.
    const nextArrived = !applicant.isArrived;
    const message = nextArrived
      ? `${applicant.applicantName} 지원자의 원서를 도착 처리하시겠습니까?`
      : `${applicant.applicantName} 지원자의 원서 도착 처리를 취소하시겠습니까?`;

    if (confirm(message)) {
      updateArrival({ applicantId: applicant.applicantId, isArrived: nextArrived });
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
          {printActions.map(action => (
            <Btn
              key={action.label}
              color={colors.gray[50]}
              backgroundColor={colors.green[400]}
              hoverBackgroundColor={colors.green[500]}
              onClick={action.onClick}
            >
              {action.isPending ? `${action.label} 중...` : action.label}
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

      <TableScroll role="table" aria-label="지원자 목록" aria-colcount={tableHeaders.length}>
        <ApplicantsTitle role="row">
          {tableHeaders.map((header, index) => (
            <Title key={header} role="columnheader" aria-colindex={index + 1}>
              {header}
            </Title>
          ))}
        </ApplicantsTitle>

        <ApplicantsAllList role="rowgroup">
          {isLoading || isCheckingPeriod ? (
            <LoadingContent role="row">
              <LoadingMessage role="cell" aria-colspan={tableHeaders.length}>
                지원자 조회 데이터 기다리는 중...
              </LoadingMessage>
            </LoadingContent>
          ) : applicants.length === 0 ? (
            <LoadingContent role="row">
              <LoadingMessage role="cell" aria-colspan={tableHeaders.length}>
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
                actionMode={applicantActionMode}
                onClick={() => handleApplicantClick(applicant)}
                onActionClick={() => handleActionClick(applicant)}
                onArrivalClick={() => handleArrivalClick(applicant)}
              />
            ))
          )}
        </ApplicantsAllList>
      </TableScroll>

      {selectedApplicant && (
        <ApplicantDetailModal applicantId={selectedApplicant.applicantId} isOpen={isOpen} onClose={close} />
      )}

      <CancelModal
        isOpen={cancelTarget !== null}
        setIsOpen={handleCancelModalClose}
        title="원서 접수를 취소하시겠습니까?"
        content={cancelModalContent}
        confirmText="확인했습니다"
        confirmDescription='접수 취소를 위해서는 "확인했습니다"를 작성해주세요.'
        btnText="접수 취소"
        isLoading={isCancelInProgress}
        onClick={() => void handleCancelConfirm()}
      />

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

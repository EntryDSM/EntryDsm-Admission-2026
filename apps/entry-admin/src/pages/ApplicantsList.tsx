import { useCallback, useEffect, useMemo, useState } from "react";
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
  useFailFinalResult,
  useFirstScreening,
  useIssueExamineeNumbers,
  useRegisterFinalResult,
  useUpdateApplicantArrival,
  useUpdateFirstPass,
  useVerifyApplicationPeriod,
} from "../hooks";
import { type ApplicantListItem, getApplicantActionHeader, getApplicantActionMode } from "../utils";
import {
  Applicant,
  ApplicantDetailModal,
  ApplicationCorrectionModal,
  CheckBox,
  DownloadButton,
  FindApplicantInput,
  PagiNation,
} from "../components";

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

/** 마지막 열 제목은 보이는 지원자에 따라 달라 렌더할 때 붙인다. */
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

// 필터 체크박스 → 조회 파라미터
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

  // 접수 취소 등으로 페이지 수가 줄면 마지막 페이지로 당긴다.
  useEffect(() => {
    if (pageInfo && currentPage > totalPage) {
      setCurrentPage(totalPage);
    }
  }, [currentPage, pageInfo, totalPage]);

  const { updateArrival, isUpdatingArrival } = useUpdateApplicantArrival();
  const { runFirstScreening, isRunningFirstScreening } = useFirstScreening();
  const { registerFinalResult, isRegisteringFinalResult } = useRegisterFinalResult();
  const { failFinalResult, isFailingFinalResult } = useFailFinalResult();
  const { updateFirstPass, isUpdatingFirstPass } = useUpdateFirstPass();

  // 심사 대기 지원자는 "원서 정정" 메뉴, 1차 합격 발표 전에는 1차 합격자 등록·취소, 발표 뒤 1차 합격자는 "2차 결과" 메뉴다.
  // 접수 취소는 원서 접수 기간에만 고를 수 있다.
  const { periodStatus, firstAnnouncementStatus } = useApplicationPeriod();
  const isCancelAvailable = periodStatus === "open";
  const isBeforeFirstAnnouncement = firstAnnouncementStatus === "before";
  const tableHeaders = [
    ...APPLICANT_TABLE_FIXED_HEADERS,
    getApplicantActionHeader(
      applicants.map(applicant => getApplicantActionMode(applicant.status, firstAnnouncementStatus))
    ),
  ];

  const [correctionTarget, setCorrectionTarget] = useState<ApplicantListItem | null>(null);
  const handleCorrectionClose = useCallback(() => setCorrectionTarget(null), []);

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

  const handleIssueExamineeNumbersClick = () => {
    if (isIssuingExamineeNumbers) {
      return;
    }

    if (confirm("발급 대상 지원자에게 수험번호를 일괄 발급하시겠습니까?")) {
      issueExamineeNumbers();
    }
  };

  // 파일 다운로드는 모두 서버의 비동기 잡이다. 검색어·필터와 무관하게 수험표는 1차 합격자, 나머지는 전체 지원자가 대상이다.

  const handleChecklistClick = () => {
    if (isDownloadingChecklist) {
      return;
    }

    downloadChecklist();
  };

  const handleAdmissionTicketsClick = () => {
    if (isDownloadingAdmissionTickets) {
      return;
    }

    downloadAdmissionTickets();
  };

  const handleAdmissionFileClick = () => {
    if (isDownloadingAdmissionFile) {
      return;
    }

    downloadAdmissionFile();
  };

  const handleFirstPassListClick = () => {
    if (isDownloadingFirstPassList) {
      return;
    }

    downloadFirstPassList();
  };

  const handleEssaysClick = () => {
    if (isDownloadingEssays) {
      return;
    }

    downloadEssays();
  };

  // 진행 중에도 문구를 바꾸지 않는다(버튼 폭이 바뀌면 다운로드 버튼들이 줄바꿈된다).
  const processActions = [
    { label: "수험번호 발급", onClick: handleIssueExamineeNumbersClick, isPending: isIssuingExamineeNumbers },
    { label: "1차 합격자 산출", onClick: handleFirstScreeningClick, isPending: isRunningFirstScreening },
  ];

  const downloadActions = [
    { label: "점검표", onClick: handleChecklistClick, isPending: isDownloadingChecklist },
    { label: "전형 자료", onClick: handleAdmissionFileClick, isPending: isDownloadingAdmissionFile },
    { label: "1차 합격 명단", onClick: handleFirstPassListClick, isPending: isDownloadingFirstPassList },
    { label: "자기소개서·학업계획서", onClick: handleEssaysClick, isPending: isDownloadingEssays },
    { label: "수험표", onClick: handleAdmissionTicketsClick, isPending: isDownloadingAdmissionTickets },
  ];

  const handleRegisterClick = (applicant: ApplicantListItem) => {
    if (isRegisteringFinalResult) {
      return;
    }

    const name = applicant.applicantName || "해당";

    if (confirm(`${name} 지원자를 최종 합격자로 등록하시겠습니까?`)) {
      registerFinalResult({
        applicantId: applicant.applicantId,
        applicantName: applicant.applicantName,
        status: applicant.status,
      });
    }
  };

  const handleFinalFailClick = (applicant: ApplicantListItem) => {
    if (isFailingFinalResult) {
      return;
    }

    const name = applicant.applicantName || "해당";
    const message =
      applicant.status === "FINAL_PASS"
        ? `${name} 지원자의 2차 합격을 취소하시겠습니까?\n취소한 지원자는 최종 불합격이 되며, 다시 2차 합격자로 등록할 수 있습니다.`
        : `${name} 지원자를 2차 불합격으로 처리하시겠습니까?\n처리한 지원자는 최종 불합격이 되며, 다시 2차 합격자로 등록할 수 있습니다.`;

    if (confirm(message)) {
      failFinalResult({
        applicantId: applicant.applicantId,
        applicantName: applicant.applicantName,
        status: applicant.status,
      });
    }
  };

  const handleFirstPassClick = (applicant: ApplicantListItem, isFirstPass: boolean) => {
    if (isUpdatingFirstPass) {
      return;
    }

    const name = applicant.applicantName || "해당";
    const message = isFirstPass
      ? `${name} 지원자를 1차 합격자로 등록하시겠습니까?`
      : `${name} 지원자의 1차 합격을 취소하시겠습니까?\n취소한 지원자는 1차 불합격이 되어 발표 때 자동 선발에서도 빠지며, 발표 전까지 다시 등록할 수 있습니다.`;

    if (confirm(message)) {
      updateFirstPass({ applicantId: applicant.applicantId, applicantName: applicant.applicantName, isFirstPass });
    }
  };

  const handleCorrectClick = (applicant: ApplicantListItem) => {
    setCorrectionTarget(applicant);
  };

  // 되돌릴 수 없는 삭제라 "확인했습니다" 를 입력받는 모달을 연다.
  const handleCancelClick = (applicant: ApplicantListItem) => {
    if (isCancelInProgress) {
      return;
    }

    setCancelTarget(applicant);
  };

  // 삭제 직전에 서버 시각으로 접수 기간을 다시 확인하고, 기간이 아니면 삭제하지 않고 모달을 닫는다.
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

    // 결과는 훅이 토스트하고, 요청이 끝나면 모달을 닫는다.
    cancelApplication(
      { applicantId: cancelTarget.applicantId, applicantName: cancelTarget.applicantName },
      { onSettled: () => setCancelTarget(null) }
    );
  };

  // 요청 중에는 모달이 닫히지 않게 한다.
  const handleCancelModalClose = () => {
    if (isCancelInProgress) {
      return;
    }

    setCancelTarget(null);
  };

  const cancelModalContent = cancelTarget
    ? `${cancelTarget.applicantName || "해당"} 지원자(접수번호 ${cancelTarget.receiptCode})의 원서가 삭제되며, 삭제된 원서는 복구할 수 없습니다.`
    : "";

  const handleArrivalClick = (applicant: ApplicantListItem) => {
    if (isUpdatingArrival) {
      return;
    }

    // 체크박스로 도착 처리와 도착 취소를 토글한다.
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
        <ActionRow>
          <ActionGroup role="group" aria-labelledby="applicant-process-actions">
            <ActionGroupLabel id="applicant-process-actions">전형 처리</ActionGroupLabel>
            <ActionButtons>
              {processActions.map(action => (
                <Btn
                  key={action.label}
                  color={colors.gray[50]}
                  backgroundColor={colors.green[400]}
                  hoverBackgroundColor={colors.green[500]}
                  isBlocked={action.isPending}
                  onClick={action.onClick}
                >
                  {action.label}
                </Btn>
              ))}
            </ActionButtons>
          </ActionGroup>

          <ActionGroup role="group" aria-labelledby="applicant-download-actions">
            <ActionGroupLabel id="applicant-download-actions">파일 다운로드</ActionGroupLabel>
            <ActionButtons>
              {downloadActions.map(action => (
                <DownloadButton
                  key={action.label}
                  label={action.label}
                  isPending={action.isPending}
                  onClick={action.onClick}
                />
              ))}
            </ActionButtons>
          </ActionGroup>
        </ActionRow>

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
          {isLoading ? (
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
                status={applicant.status}
                actionMode={getApplicantActionMode(applicant.status, firstAnnouncementStatus)}
                isCancelAvailable={isCancelAvailable}
                isFirstPassSelectable={isBeforeFirstAnnouncement}
                onClick={() => handleApplicantClick(applicant)}
                onRegisterClick={() => handleRegisterClick(applicant)}
                onCorrectClick={() => handleCorrectClick(applicant)}
                onFirstPassClick={isFirstPass => handleFirstPassClick(applicant, isFirstPass)}
                onFinalFailClick={() => handleFinalFailClick(applicant)}
                onCancelClick={() => handleCancelClick(applicant)}
                onArrivalClick={() => handleArrivalClick(applicant)}
              />
            ))
          )}
        </ApplicantsAllList>
      </TableScroll>

      {selectedApplicant && (
        <ApplicantDetailModal applicantId={selectedApplicant.applicantId} isOpen={isOpen} onClose={close} />
      )}

      {correctionTarget && (
        <ApplicationCorrectionModal
          key={correctionTarget.applicantId}
          applicantId={correctionTarget.applicantId}
          applicantName={correctionTarget.applicantName}
          onClose={handleCorrectionClose}
        />
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

// 버튼·필터는 표보다 좌우로 최대 36px 안쪽에 두고, 화면이 좁아지면 이 여백부터 줄인다.
const Toolbar = styled.section`
  width: 100%;
  max-width: 1540px;
  padding: 0 clamp(0px, calc((100% - 1168px) / 2), 36px);
  display: flex;
  flex-direction: column;
  gap: 19px;
  margin-top: 32px;
`;

const ActionRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px 24px;
`;

const ActionGroup = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionGroupLabel = styled.span`
  color: ${colors.gray[400]};
  font-size: 14px;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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

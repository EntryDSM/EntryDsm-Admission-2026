import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { Btn } from "@entry/ui";

import { cancel } from "../assets";
import { useApplicantDetail, useApplicantDocumentDownloads, useCorrectApplication, useModalDialog } from "../hooks";
import {
  buildCorrectionDraft,
  type CorrectionErrorKey,
  type CorrectionFormValues,
  type CorrectionSection,
  formatReceiptNumber,
  getApplicationTypeLabel,
  getCorrectionChangeLabel,
  getEducationalStatusLabel,
  getRegionLabel,
  getVisibleCorrectionErrors,
  resetCorrectionSection,
  toCorrectionFormValues,
} from "../utils";
import { CorrectionAcademicRecordSection } from "./ApplicationCorrectionAcademicRecordSection";
import {
  CorrectionEssaySection,
  CorrectionGuardianSection,
  CorrectionNotice,
  CorrectionPersonalSection,
  CorrectionReasonSection,
  CorrectionTypeSection,
} from "./ApplicationCorrectionSections";

interface IApplicationCorrectionModalType {
  applicantId: number;
  /** 상세를 받기 전 머리말과 결과 토스트에 쓴다. */
  applicantName?: string;
  onClose: () => void;
}

interface ICorrectionFormState {
  /** 정정 전 원서 값. 연 뒤 받은 최신 상세로 한 번 정하고, 이후 재조회가 입력을 덮지 않게 고정한다. */
  initial: CorrectionFormValues;
  values: CorrectionFormValues;
}

/** 첫 오류 칸을 화면 가운데로 데려와 포커스한다. 칩 묶음이면 그 안의 첫 라디오에 포커스한다. */
const focusFirstInvalidField = (container: HTMLElement | null) => {
  const invalidElement = container?.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!invalidElement) {
    return;
  }

  invalidElement.scrollIntoView({ block: "center", behavior: "smooth" });
  const focusTarget = invalidElement.matches("input, select, textarea")
    ? invalidElement
    : invalidElement.querySelector<HTMLElement>("input:not([disabled]), select, textarea");
  focusTarget?.focus({ preventScroll: true });
};

/**
 * 원서 정정 패널(오른쪽에서 열린다). 마운트돼 있는 동안 열려 있다.
 * 상세 조회에 있는 항목은 현재 값으로 채워 바뀐 것만, 조회에 없는 항목은 입력한 것만 정정 API 로 보낸다.
 * 작성 중에 닫으려 하면 확인을 받고, 저장 요청 중에는 닫히지 않는다.
 */
export const ApplicationCorrectionModal = ({
  applicantId,
  applicantName,
  onClose,
}: IApplicationCorrectionModalType) => {
  // 목록을 연 뒤 원서가 바뀌었거나 1차 산출이 돌았을 수 있어, 캐시가 있어도 열 때마다 최신 원서를 다시 받는다.
  const { detail, isFetching, isError, refetch } = useApplicantDetail(applicantId, true, {
    alwaysRefetchOnMount: true,
  });
  const { correctApplication, isCorrectingApplication } = useCorrectApplication();
  const { downloadApplicationForm, isDownloadingApplicationForm } = useApplicantDocumentDownloads();

  const [form, setForm] = useState<ICorrectionFormState | null>(null);
  const [touched, setTouched] = useState<ReadonlySet<CorrectionErrorKey>>(() => new Set());
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // 다시 받은 최신 원서로 한 번만 채운다(렌더 중 상태 조정 — AdmissionsQuota 와 같은 패턴).
  if (form === null && detail && !isFetching) {
    const initial = toCorrectionFormValues(detail);
    setForm({ initial, values: initial });
  }

  const draft = useMemo(() => (form ? buildCorrectionDraft(form.values, form.initial) : null), [form]);
  const changedKeys = useMemo(() => new Set(draft?.changedKeys), [draft]);
  const visibleErrors = draft ? getVisibleCorrectionErrors(draft, touched, showAllErrors) : {};
  const changedCount = draft?.changedKeys.length ?? 0;
  const isDirty = changedCount > 0 || (form?.values.reason.trim() ?? "") !== "";
  // 방금 받은 상세로 정정 대상인지 다시 확인한다(서버도 같은 기준으로 409 를 준다).
  const isCorrectable = detail?.status === "PENDING";
  const displayName = detail?.name || applicantName || "지원자";

  const requestClose = useCallback(() => {
    if (isCorrectingApplication) {
      return;
    }

    if (isDirty && !confirm("정정 중인 내용이 저장되지 않습니다. 닫으시겠습니까?")) {
      return;
    }

    onClose();
  }, [isCorrectingApplication, isDirty, onClose]);

  const handleDialogKeyDown = useModalDialog(contentRef, requestClose);

  // 저장을 눌렀는데 오류가 남아 있으면 첫 오류 칸으로 데려간다(오류 표시가 그려진 뒤).
  useEffect(() => {
    if (submitAttempt > 0) {
      focusFirstInvalidField(contentRef.current);
    }
  }, [submitAttempt]);

  const handleChange = useCallback((patch: Partial<CorrectionFormValues>) => {
    setForm(prev => (prev ? { ...prev, values: { ...prev.values, ...patch } } : prev));
  }, []);

  const handleTouch = useCallback((key: CorrectionErrorKey) => {
    setTouched(prev => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, []);

  const handleReset = useCallback((section: CorrectionSection) => {
    setForm(prev => (prev ? { ...prev, values: resetCorrectionSection(prev.values, prev.initial, section) } : prev));
  }, []);

  const handleSubmit = () => {
    if (!form || !draft || changedCount === 0 || !isCorrectable || isCorrectingApplication) {
      return;
    }

    if (Object.keys(draft.errors).length > 0) {
      setShowAllErrors(true);
      setSubmitAttempt(prev => prev + 1);
      return;
    }

    const message = [
      `${displayName} 지원자의 원서를 정정하시겠습니까?`,
      `변경 항목: ${draft.changedKeys.map(getCorrectionChangeLabel).join(", ")}`,
      ...(draft.recalculatesScore ? ["전형·졸업 구분·성적이 바뀌어 총점을 다시 계산합니다."] : []),
    ].join("\n\n");

    if (!confirm(message)) {
      return;
    }

    // 결과는 훅이 토스트한다. 성공하면 패널을 닫고, 실패하면 입력을 그대로 두어 고쳐서 다시 보낼 수 있게 한다.
    correctApplication(
      {
        applicantId,
        applicantName: displayName,
        payload: { reason: form.values.reason.trim(), changes: draft.changes },
      },
      { onSuccess: onClose }
    );
  };

  const sectionProps = form && {
    values: form.values,
    initial: form.initial,
    errors: visibleErrors,
    changedKeys,
    showAllErrors,
    onChange: handleChange,
    onTouch: handleTouch,
    onReset: handleReset,
  };

  return (
    <Overlay onClick={requestClose}>
      <Panel
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={!form}
        tabIndex={-1}
        onClick={event => event.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
      >
        <PanelHeader>
          <HeaderTop>
            <Title id={titleId}>원서 정정</Title>
            <CloseButton type="button" aria-label="닫기" onClick={requestClose}>
              <img src={cancel} alt="" aria-hidden="true" />
            </CloseButton>
          </HeaderTop>

          <ApplicantSummary>
            <ApplicantIdentity>
              <ApplicantName>{displayName}</ApplicantName>
              <ReceiptBadge>접수번호 {detail?.receiptCode ?? formatReceiptNumber(applicantId)}</ReceiptBadge>
              {detail && (
                <ApplicantMeta>
                  {getApplicationTypeLabel(detail.applicationType)} ·{" "}
                  {getEducationalStatusLabel(detail.educationalStatus)} · {getRegionLabel(detail.region)}
                </ApplicantMeta>
              )}
            </ApplicantIdentity>
            <PdfButton
              type="button"
              disabled={isDownloadingApplicationForm}
              onClick={() => downloadApplicationForm(applicantId)}
            >
              {isDownloadingApplicationForm ? "원서 여는 중..." : "원서 PDF 보기"}
            </PdfButton>
          </ApplicantSummary>
        </PanelHeader>

        <PanelBody>
          {!form || !sectionProps || !draft ? (
            isError ? (
              <StateMessage role="alert">
                원서를 불러오지 못했습니다.
                <RetryButton type="button" onClick={() => refetch()}>
                  다시 시도
                </RetryButton>
              </StateMessage>
            ) : (
              <StateMessage role="status">원서를 불러오는 중...</StateMessage>
            )
          ) : (
            <>
              {!isCorrectable && (
                <BlockedAlert role="alert">
                  1차 합격자 산출 등으로 전형 결과가 나온 지원자는 원서를 정정할 수 없습니다.
                </BlockedAlert>
              )}
              <CorrectionNotice />
              <CorrectionTypeSection {...sectionProps} />
              <CorrectionPersonalSection {...sectionProps} />
              <CorrectionGuardianSection {...sectionProps} />
              <CorrectionEssaySection {...sectionProps} field="introduction" title="자기소개서" />
              <CorrectionEssaySection {...sectionProps} field="studyPlan" title="학업계획서" />
              <CorrectionAcademicRecordSection {...sectionProps} isRequired={draft.requiresAcademicRecord} />
              <CorrectionReasonSection {...sectionProps} />
            </>
          )}
        </PanelBody>

        <PanelFooter>
          <ChangeSummary aria-live="polite">
            {draft && changedCount > 0 ? (
              <>
                <ChangeCount>변경 {changedCount}개</ChangeCount>
                <ChangeLabels>{draft.changedKeys.map(getCorrectionChangeLabel).join(", ")}</ChangeLabels>
                {draft.recalculatesScore && <RecalculateBadge>총점 재계산</RecalculateBadge>}
              </>
            ) : (
              <ChangeLabels>바뀐 항목이 없습니다.</ChangeLabels>
            )}
          </ChangeSummary>
          <FooterActions>
            <FooterButton
              color={colors.gray[500]}
              backgroundColor={colors.extra.realWhite}
              hoverBackgroundColor={colors.gray[100]}
              borderColor={colors.gray[300]}
              isBlocked={isCorrectingApplication}
              onClick={requestClose}
            >
              닫기
            </FooterButton>
            <FooterButton
              color={colors.gray[50]}
              backgroundColor={colors.green[400]}
              hoverBackgroundColor={colors.green[500]}
              isBlocked={changedCount === 0 || !isCorrectable || isCorrectingApplication}
              onClick={handleSubmit}
            >
              {isCorrectingApplication ? "저장 중..." : "정정 저장"}
            </FooterButton>
          </FooterActions>
        </PanelFooter>
      </Panel>
    </Overlay>
  );
};

// 지원자 상세 모달과 같은 오른쪽 패널·애니메이션을 쓰되, 입력칸이 많아 폭을 조금 더 넉넉히 잡는다.
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.28);
  animation: correctionOverlayFadeIn 0.36s cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes correctionOverlayFadeIn {
    from {
      background-color: rgba(0, 0, 0, 0);
    }

    to {
      background-color: rgba(0, 0, 0, 0.28);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Panel = styled.div`
  width: clamp(640px, 52%, 820px);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${colors.gray[50]};
  box-shadow: -8px 0 20px rgba(0, 0, 0, 0.08);
  outline: none;
  animation: correctionPanelSlideIn 0.52s cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes correctionPanelSlideIn {
    from {
      transform: translateX(36px);
      opacity: 0;
    }

    60% {
      opacity: 1;
    }

    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const PanelHeader = styled.header`
  padding: 24px 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid ${colors.gray[200]};
  background-color: ${colors.extra.realWhite};

  @media (max-width: 768px) {
    padding: 20px 16px 16px;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  color: ${colors.gray[500]};
  font-size: 24px;
  font-weight: 700;
`;

const CloseButton = styled.button`
  padding: 4px;
  display: flex;
  border-radius: 8px;
  background: none;
  cursor: pointer;

  &:hover {
    background-color: ${colors.gray[100]};
  }
`;

const ApplicantSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 16px;
`;

const ApplicantIdentity = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
`;

const ApplicantName = styled.span`
  color: ${colors.gray[500]};
  font-size: 18px;
  font-weight: 600;
`;

const ReceiptBadge = styled.span`
  padding: 3px 10px;
  border-radius: 999px;
  background-color: ${colors.green[50]};
  color: ${colors.green[700]};
  font-size: 13px;
  font-weight: 600;
`;

const ApplicantMeta = styled.span`
  color: ${colors.gray[400]};
  font-size: 14px;
`;

const PdfButton = styled.button`
  height: 36px;
  padding: 0 14px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  background-color: ${colors.extra.realWhite};
  color: ${colors.gray[500]};
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${colors.gray[100]};
  }

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }
`;

const PanelBody = styled.div`
  flex: 1;
  min-height: 0;
  padding: 24px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  overscroll-behavior: contain;

  @media (max-width: 768px) {
    padding: 16px 16px 32px;
  }
`;

const StateMessage = styled.div`
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: ${colors.gray[400]};
  font-size: 16px;
  font-weight: 500;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  background-color: ${colors.green[400]};
  color: ${colors.gray[50]};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: ${colors.green[500]};
  }
`;

const BlockedAlert = styled.p`
  padding: 14px 18px;
  border: 1px solid rgba(232, 64, 69, 0.3);
  border-radius: 12px;
  background-color: rgba(232, 64, 69, 0.06);
  color: ${colors.extra.error};
  font-size: 14px;
  font-weight: 500;
  word-break: keep-all;
`;

const PanelFooter = styled.footer`
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid ${colors.gray[200]};
  background-color: ${colors.extra.realWhite};

  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-direction: column;
    align-items: stretch;
  }
`;

const ChangeSummary = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ChangeCount = styled.span`
  flex-shrink: 0;
  color: ${colors.green[600]};
  font-size: 15px;
  font-weight: 700;
`;

const ChangeLabels = styled.span`
  min-width: 0;
  overflow: hidden;
  color: ${colors.gray[400]};
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RecalculateBadge = styled.span`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: ${colors.gray[100]};
  color: ${colors.gray[500]};
  font-size: 12px;
  font-weight: 600;
`;

const FooterActions = styled.div`
  flex-shrink: 0;
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

// 패널 하단 막대에 맞게 기본 Btn(48px·18px)보다 한 단계 작게 잡는다.
const FooterButton = styled(Btn)`
  height: 44px;
  padding: 0 20px;
  border-radius: 10px;
  font-size: 16px;
`;

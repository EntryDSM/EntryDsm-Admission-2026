import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

import { useApplicantDetail, useApplicantPhoto } from "../hooks";
import { cancel } from "../assets";
import {
  getApplicationTypeLabel,
  getArrivalStatusLabel,
  getEducationalStatusLabel,
  getRegionLabel,
} from "./applicantLabelModel";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

interface IApplicantDetailModalType {
  applicantId?: number;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 전형별 1차 전형 총점 상한 (백엔드 application `ScoreCalculator` 의 REGULAR/SPECIAL_FIRST_SCREENING_MAX_SCORE).
 * 교과·출결·봉사 만점(일반 170·특별 110)에 가산점을 더한 값으로, 상세 응답의 `totalScore` 는 이 값으로 잘려 내려온다.
 */
const getMaxScore = (applicationType?: string) => {
  if (applicationType === "GENERAL" || applicationType === "COMMON") {
    return 173;
  }

  if (applicationType === "SOCIAL" || applicationType === "MEISTER") {
    return 119;
  }

  return "-";
};

/** 점수 항목 표기. 값이 없으면(총점 미산출이거나 백엔드 #263 배포 전) `-`. */
const formatScore = (score?: number) => score ?? "-";

export const ApplicantDetailModal = ({ applicantId, isOpen, onClose }: IApplicantDetailModalType) => {
  const { detail, isLoading } = useApplicantDetail(applicantId, isOpen);
  const { photoUrl, isPhotoFetching } = useApplicantPhoto(detail?.photoFileId, isOpen);
  // 서명 URL 을 받았는데 이미지가 깨지면(만료·삭제) 그 URL 만 placeholder 로 돌린다. 새 URL 을 받으면 다시 시도한다.
  const [brokenPhotoUrl, setBrokenPhotoUrl] = useState<string>();
  const scrollPositionRef = useRef(0);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    scrollPositionRef.current = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollPositionRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscapeKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    modalContentRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleModalKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      modalContentRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      modalContentRef.current?.focus();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    if (
      event.shiftKey &&
      (document.activeElement === firstFocusableElement || document.activeElement === modalContentRef.current)
    ) {
      event.preventDefault();
      lastFocusableElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  };

  // 자기소개서·학업계획서는 지원자가 쓴 줄바꿈(\n)이 그대로 오므로 <br /> 로 살린다. 비어 있으면 null → 안내 문구.
  const formatTextWithLineBreaks = (text?: string): ReactNode => {
    if (!text) {
      return null;
    }

    const lines = text.split("\n");
    return lines.map((line, index) => (
      <span key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </span>
    ));
  };

  const regionLabel = getRegionLabel(detail?.region);
  const maxScore = getMaxScore(detail?.applicationType);
  // 재조회 중에는 캐시된(만료됐을 수 있는) 옛 URL 을 그리지 않고 placeholder 를 보여, 헛된 403 요청과 깜빡임을 막는다.
  const displayedPhotoUrl = photoUrl && !isPhotoFetching && photoUrl !== brokenPhotoUrl ? photoUrl : undefined;

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent
        ref={modalContentRef}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="applicant-detail-modal-title"
        aria-busy={isLoading}
        tabIndex={-1}
      >
        {isLoading && <LoadingOverlay role="status">지원자 정보를 불러오는 중...</LoadingOverlay>}

        <CloseButton type="button" onClick={onClose} aria-label="닫기">
          <img src={cancel} alt="" aria-hidden="true" />
        </CloseButton>

        <ModalHeader>
          <ModalTitle id="applicant-detail-modal-title">지원자 상세 정보</ModalTitle>
          <ApplicantPhotoArea>
            <ApplicantNumberGroup>
              <ApplicantNumber>
                접수번호
                <NumberBadge>{detail?.receiptCode ?? "-"}</NumberBadge>
              </ApplicantNumber>

              <ApplicantNumber>
                수험번호
                <NumberBadge>{detail?.examinationNumber ?? "-"}</NumberBadge>
              </ApplicantNumber>
            </ApplicantNumberGroup>

            <ApplicantImage>
              {displayedPhotoUrl ? (
                <ApplicantPhoto
                  src={displayedPhotoUrl}
                  alt={detail?.name ? `${detail.name} 증명사진` : "증명사진"}
                  onError={() => setBrokenPhotoUrl(displayedPhotoUrl)}
                />
              ) : (
                <ProfilePlaceholder />
              )}
            </ApplicantImage>
          </ApplicantPhotoArea>

          <ApplicantInfo>
            <InfoRow>
              <InfoLabel>이름</InfoLabel>
              <InfoValue>{detail?.name ?? "-"}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>생년월일</InfoLabel>
              <InfoValue>{detail?.birthDay ?? "-"}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>학교</InfoLabel>
              <InfoValue>{detail?.schoolName ?? "-"}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>연락처</InfoLabel>
              <InfoValue>{detail?.phoneNumber ?? "-"}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>지역</InfoLabel>
              <InfoValue>{regionLabel}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>전형</InfoLabel>
              <InfoValue>{getApplicationTypeLabel(detail?.applicationType)}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>구분</InfoLabel>
              <InfoValue>{getEducationalStatusLabel(detail?.educationalStatus)}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>성적</InfoLabel>
              <ScoreValue>
                {detail?.totalScore ?? "-"}/{maxScore}
              </ScoreValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>상태</InfoLabel>
              <InfoValue>{getArrivalStatusLabel(detail?.isArrived)}</InfoValue>
            </InfoRow>
          </ApplicantInfo>
        </ModalHeader>

        <ModalSection>
          <SectionTitle>자기소개서</SectionTitle>
          <SectionContent>
            {formatTextWithLineBreaks(detail?.introduction) ?? "작성된 자기소개서가 없습니다."}
          </SectionContent>
        </ModalSection>

        <ModalSection>
          <SectionTitle>학업 계획서</SectionTitle>
          <SectionContent>
            {formatTextWithLineBreaks(detail?.studyPlan) ?? "작성된 학업 계획서가 없습니다."}
          </SectionContent>
        </ModalSection>

        <ModalSection>
          <SectionTitle>점수 상세</SectionTitle>
          <SectionContent>
            <ScoreRow>교과 점수: {formatScore(detail?.subjectScore)}</ScoreRow>
            <ScoreRow>출결 점수: {formatScore(detail?.attendanceScore)}</ScoreRow>
            <ScoreRow>봉사 점수: {formatScore(detail?.volunteerScore)}</ScoreRow>
            <ScoreRow>가산점: {formatScore(detail?.additionalScore)}</ScoreRow>
            <ScoreRow>총점: {formatScore(detail?.totalScore)}</ScoreRow>
          </SectionContent>
        </ModalSection>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.28);
  z-index: 1000;
  animation: modalOverlayFadeIn 0.36s cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes modalOverlayFadeIn {
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

const ModalContent = styled.div`
  background: white;
  width: 50%;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  box-shadow: -8px 0 20px rgba(0, 0, 0, 0.08);
  will-change: transform, opacity;
  animation: modalSlideIn 0.52s cubic-bezier(0.22, 1, 0.36, 1);

  @keyframes modalSlideIn {
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

  @media (max-width: 1024px) {
    width: 60%;
  }

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  color: ${colors.gray[400]};
  font-size: 18px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: ${colors.gray[400]};
  z-index: 10;
  padding: 4px;

  &:hover {
    color: ${colors.gray[500]};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  gap: 32px;
  padding: 60px 32px 32px 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 60px 20px 20px 20px;
  }
`;

const ModalTitle = styled.h2`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ApplicantImage = styled.div`
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  overflow: hidden;
  width: 200px;
  height: 253px;
`;

const ApplicantPhoto = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ApplicantPhotoArea = styled.div`
  flex-shrink: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    width: 200px;
  }
`;

const ProfilePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${colors.gray[200]};
  border-radius: 8px;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" fill="%23D1D5DB"><rect width="240" height="180" fill="%23F3F4F6"/><circle cx="120" cy="70" r="25" fill="%23D1D5DB"/><path d="M70 140 Q70 115 120 115 Q170 115 170 140 L170 180 L70 180 Z" fill="%23D1D5DB"/></svg>');
  background-size: cover;
  background-position: center;
`;

const ApplicantInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
`;

const ApplicantNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 24px;
  font-weight: 500;
  color: ${colors.gray[500]};
`;

const ApplicantNumberGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const NumberBadge = styled.span`
  color: ${colors.green[500]};
  font-size: 24px;
  font-weight: 500;
  text-align: right;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;

const InfoLabel = styled.div`
  width: 100px;
  color: ${colors.gray[500]};
  font-size: 18px;
  font-weight: 500;
`;

const InfoValue = styled.div`
  color: ${colors.gray[500]};
  font-size: 18px;
  text-align: right;
  flex: 1;
`;

const ScoreValue = styled.div`
  color: #10b981;
  font-weight: 700;
  font-size: 16px;
  text-align: right;
  flex: 1;
`;

const ModalSection = styled.div`
  padding: 24px 32px;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 24px;
  font-weight: 500;
  color: ${colors.gray[500]};
  margin-bottom: 16px;
`;

const SectionContent = styled.div`
  line-height: 1.6;
  color: ${colors.gray[400]};
  font-size: 18px;
`;

const ScoreRow = styled.div`
  margin-bottom: 6px;
  font-size: 16px;
  color: ${colors.gray[500]};
`;

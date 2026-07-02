import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";

import { cancel } from "../assets";

interface ApplicantDetail {
  photoUrl?: string;
  name?: string;
  birthDay?: string;
  gender?: string;
  phoneNumber?: string;
  examinationNumber?: string;
  isDaejeon?: boolean;
  applicationType?: string;
  educationalStatus?: string;
  totalScore?: number;
  applicationStatus?: string;
  selfIntroduce?: string;
  studyPlan?: string;
  totalGradeScore?: number;
  attendanceScore?: number;
  volunteerScore?: number;
  extraScore?: number;
  parentName?: string;
  parentTel?: string;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

interface IApplicantDetailModalType {
  receiptCode?: number;
  isOpen: boolean;
  onClose: () => void;
  applicant?: ApplicantDetail;
}

export const ApplicantDetailModal = ({ receiptCode, isOpen, onClose, applicant }: IApplicantDetailModalType) => {
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

  // 원서 \n 적용
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

  const getApplicationTypeLabel = (type?: string) => {
    if (type === "SOCIAL") {
      return "사회통합";
    }

    if (type === "MEISTER") {
      return "마이스터전형";
    }

    if (type === "COMMON") {
      return "일반";
    }

    return "-";
  };

  const getEducationalStatusLabel = (status?: string) => {
    if (status === "PROSPECTIVE_GRADUATE") {
      return "졸업 예정";
    }

    if (status === "GRADUATE") {
      return "졸업";
    }

    if (status === "QUALIFICATION_EXAM") {
      return "검정고시";
    }

    return "-";
  };

  const getApplicationStatusLabel = (status?: string) => {
    const statusMap: Record<string, string> = {
      NOT_APPLIED: "미지원",
      WRITING: "원서 작성 중",
      SUBMITTED: "지원 완료",
      WAITING_DOCUMENTS: "서류 도착 대기",
      DOCUMENTS_RECEIVED: "서류 접수 완료",
      SCREENING_IN_PROGRESS: "전형 진행 중",
      RESULT_ANNOUNCED: "합격 여부 확인",
    };

    return status ? (statusMap[status] ?? status) : "-";
  };

  const getMaxScore = (applicationType?: string) => {
    if (applicationType === "COMMON") {
      return 170;
    }

    if (applicationType === "SOCIAL" || applicationType === "MEISTER") {
      return 110;
    }

    return "-";
  };

  const regionLabel = applicant?.isDaejeon === undefined ? "-" : applicant.isDaejeon ? "대전" : "전국";

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
        tabIndex={-1}
      >
        <CloseButton type="button" onClick={onClose} aria-label="닫기">
          <img src={cancel} alt="" aria-hidden="true" />
        </CloseButton>

        <ModalHeader>
          <ModalTitle id="applicant-detail-modal-title">지원자 상세 정보</ModalTitle>
          <ApplicantPhotoArea>
            <ApplicantNumberGroup>
              <ApplicantNumber>
                접수번호
                <NumberBadge>{receiptCode ?? "-"}</NumberBadge>
              </ApplicantNumber>

              <ApplicantNumber>
                수험번호
                <NumberBadge>{applicant?.examinationNumber ?? "-"}</NumberBadge>
              </ApplicantNumber>
            </ApplicantNumberGroup>

            <ApplicantImage>
              {applicant?.photoUrl ? (
                <img
                  src={applicant.photoUrl}
                  alt="지원자 사진"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <ProfilePlaceholder />
              )}
            </ApplicantImage>
          </ApplicantPhotoArea>

          <ApplicantInfo>
            <InfoRow>
              <InfoLabel>이름</InfoLabel>
              <InfoValue>{applicant?.name ?? "-"}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>생년월일</InfoLabel>
              <InfoValue>{applicant?.birthDay ?? "-"}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>성별</InfoLabel>
              <InfoValue>{applicant?.gender ?? "-"}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>연락처</InfoLabel>
              <InfoValue>{applicant?.phoneNumber ?? "-"}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>지역</InfoLabel>
              <InfoValue>{regionLabel}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>전형</InfoLabel>
              <InfoValue>{getApplicationTypeLabel(applicant?.applicationType)}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>구분</InfoLabel>
              <InfoValue>{getEducationalStatusLabel(applicant?.educationalStatus)}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>성적</InfoLabel>
              <ScoreValue>
                {applicant?.totalScore ?? "-"}/{getMaxScore(applicant?.applicationType)}
              </ScoreValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>상태</InfoLabel>
              <InfoValue>{getApplicationStatusLabel(applicant?.applicationStatus)}</InfoValue>
            </InfoRow>
          </ApplicantInfo>
        </ModalHeader>

        <ModalSection>
          <SectionTitle>자기소개서</SectionTitle>
          <SectionContent>
            {formatTextWithLineBreaks(applicant?.selfIntroduce) ?? "작성된 자기소개서가 없습니다."}
          </SectionContent>
        </ModalSection>

        <ModalSection>
          <SectionTitle>학업 계획서</SectionTitle>
          <SectionContent>
            {formatTextWithLineBreaks(applicant?.studyPlan) ?? "작성된 학업 계획서가 없습니다."}
          </SectionContent>
        </ModalSection>

        <ModalSection>
          <SectionTitle>점수 상세</SectionTitle>
          <SectionContent>
            <ScoreRow>과목 점수: {applicant?.totalGradeScore ?? "-"}</ScoreRow>
            <ScoreRow>출결 점수: {applicant?.attendanceScore ?? "-"}</ScoreRow>
            <ScoreRow>봉사 점수: {applicant?.volunteerScore ?? "-"}</ScoreRow>
            <ScoreRow>가산점: {applicant?.extraScore ?? "-"}</ScoreRow>
          </SectionContent>
        </ModalSection>

        <ParentSection>
          <SectionTitle>보호자 정보</SectionTitle>
          <SectionContent>
            <InfoRow>
              <InfoLabel>부모님 성명</InfoLabel>
              <InfoValue>{applicant?.parentName ?? "-"}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>부모님 연락처</InfoLabel>
              <InfoValue>{applicant?.parentTel ?? "-"}</InfoValue>
            </InfoRow>
          </SectionContent>
        </ParentSection>
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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  width: 50%;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid ${colors.gray[300]};

  @media (max-width: 1024px) {
    width: 60%;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
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

const ParentSection = styled.div`
  padding: 24px 32px;
  margin-bottom: 65px;

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 60px;
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

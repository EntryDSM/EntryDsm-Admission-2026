import { useState } from "react";
import styled from "@emotion/styled";
import { AuthCard } from "../../components";
import { ConfirmAuthModal, PassAuthModal } from "../Modal";
import { usePassVerification } from "../../hooks/usePassVerification";
import type { PassInfo, SignupType } from "../../apis";

interface SelectUserProps {
  onVerified?: (passInfo: PassInfo, signupType: SignupType) => void;
}

type UserType = "student" | "parent";
type ModalStep = "confirm" | "auth" | null;

export const SelectUser = ({ onVerified }: SelectUserProps) => {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const { startVerification, cancelVerification, isLoading, error } = usePassVerification(passInfo => {
    if (!selectedType) return;
    setModalStep(null);
    onVerified?.(passInfo, selectedType === "student" ? "SELF" : "PARENT");
  });

  const handleCardClick = (type: UserType) => {
    setSelectedType(type);
    setModalStep("confirm");
  };

  const handleStartAuth = () => {
    setModalStep("auth");
    void startVerification();
  };

  const handleCloseModal = () => {
    cancelVerification();
    setModalStep(null);
    setSelectedType(null);
  };

  return (
    <SelectUserContainer>
      <CardContainer>
        <CardWrapper
          role="button"
          tabIndex={0}
          onClick={() => handleCardClick("student")}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") handleCardClick("student");
          }}
        >
          <AuthCard isStudent title="학생 명의로 인증" />
        </CardWrapper>
        <CardWrapper
          role="button"
          tabIndex={0}
          onClick={() => handleCardClick("parent")}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") handleCardClick("parent");
          }}
        >
          <AuthCard isStudent={false} title="부모 명의로 인증" />
        </CardWrapper>
      </CardContainer>

      {selectedType && modalStep === "confirm" && (
        <ConfirmAuthModal isOpen onClose={handleCloseModal} onConfirm={handleStartAuth} userType={selectedType} />
      )}

      {selectedType && modalStep === "auth" && (
        <PassAuthModal
          isOpen
          onClose={handleCloseModal}
          onRetry={startVerification}
          userType={selectedType}
          isLoading={isLoading}
          error={error}
        />
      )}
    </SelectUserContainer>
  );
};

const CardWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const SelectUserContainer = styled.div`
  width: 100%;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  margin-top: 30px;
  overflow-y: hidden;
  padding-top: 15px;
  gap: 20px;
`;

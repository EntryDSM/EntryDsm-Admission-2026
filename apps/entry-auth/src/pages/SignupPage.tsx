import { useState } from "react";
import { useNavigate } from "react-router";
import { SignupConsent } from "../components/signup/SignupConsent";
import type { SignupConsents } from "../components/signup/SignupConsent";
import { useStepFlow } from "../hooks/useStepFlow";
import { SelectUser, SignupForm } from "../components";
import { AuthLayout } from "../components/AuthLayout";
import { AuthLink, AuthLinkText } from "../components/AuthLink";
import type { PassInfo, SignupType } from "../apis";

export const SignUpPage = () => {
  const { currentStep, handleNextStep } = useStepFlow(1, 3);
  const navigate = useNavigate();
  const [consents, setConsents] = useState<SignupConsents | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<{ passInfo: PassInfo; signupType: SignupType } | null>(null);

  const handleVerified = (passInfo: PassInfo, signupType: SignupType) => {
    setVerifiedUser({ passInfo, signupType });
    handleNextStep();
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SignupConsent
            onContinue={value => {
              if (!value.terms || !value.privacy) return;
              setConsents(value);
              handleNextStep();
            }}
          />
        );
      case 2:
        return consents?.terms && consents.privacy ? <SelectUser onVerified={handleVerified} /> : null;
      case 3:
        return verifiedUser && consents?.terms && consents.privacy ? (
          <SignupForm consents={consents} passInfo={verifiedUser.passInfo} signupType={verifiedUser.signupType} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={currentStep === 1 ? "약관 및 개인정보 동의" : currentStep === 2 ? "EntryDSM 회원가입" : "회원정보 입력"}
      footer={
        <>
          <AuthLinkText onClick={() => navigate("/")}>로그인</AuthLinkText>
          <AuthLink onClick={() => navigate("/find-password")}>비밀번호 찾기</AuthLink>
        </>
      }
    >
      {renderContent()}
    </AuthLayout>
  );
};

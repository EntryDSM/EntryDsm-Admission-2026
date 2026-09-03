import { useState } from "react";
import { useNavigate } from "react-router";
import { useStepFlow } from "../hooks/useStepFlow";
import { SelectUser, SignupForm } from "../components";
import { AuthLayout } from "../components/AuthLayout";
import { AuthLink, AuthLinkText } from "../components/AuthLink";
import type { PassInfo, SignupType } from "../apis";

export const SignUpPage = () => {
  const { currentStep, handleNextStep } = useStepFlow(1, 2);
  const navigate = useNavigate();
  const [verifiedUser, setVerifiedUser] = useState<{ passInfo: PassInfo; signupType: SignupType } | null>(null);

  const handleVerified = (passInfo: PassInfo, signupType: SignupType) => {
    setVerifiedUser({ passInfo, signupType });
    handleNextStep();
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <SelectUser onVerified={handleVerified} />;
      case 2:
        return verifiedUser ? (
          <SignupForm passInfo={verifiedUser.passInfo} signupType={verifiedUser.signupType} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={currentStep === 1 ? "EntryDSM 회원가입" : "회원정보 입력"}
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

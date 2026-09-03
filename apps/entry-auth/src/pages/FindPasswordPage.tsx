import { useState } from "react";
import { useStepFlow } from "../hooks/useStepFlow";
import { SelectUser } from "../components";
// import styled from "@emotion/styled";
// import { colors } from "@entry/design";
import { AuthLayout } from "../components/AuthLayout";
import { AuthLink, AuthLinkText } from "../components/AuthLink";
import { useNavigate } from "react-router";
import { ChangePassword } from "../components";
import type { PassInfo } from "../apis";

export const FindPasswordPage = () => {
  const navigate = useNavigate();

  const { currentStep, handleNextStep } = useStepFlow(1, 2);
  const [passInfo, setPassInfo] = useState<PassInfo | null>(null);

  const handleVerified = (verifiedPassInfo: PassInfo) => {
    setPassInfo(verifiedPassInfo);
    handleNextStep();
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <SelectUser onVerified={handleVerified} />;
      case 2:
        return passInfo ? <ChangePassword passInfo={passInfo} /> : null;
      default:
        return null;
    }
  };

  const title = currentStep === 1 ? "EntryDSM 비밀번호 찾기" : "EntryDSM 비밀번호 변경";

  return (
    <AuthLayout
      title={title}
      footer={
        <>
          <AuthLinkText onClick={() => navigate("/signup")}>회원가입</AuthLinkText>
          <AuthLink onClick={() => navigate("/")}>로그인</AuthLink>
        </>
      }
    >
      {renderContent()}
    </AuthLayout>
  );
};

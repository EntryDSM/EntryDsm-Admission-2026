import { useState } from "react";
import { SelectUser } from "../components";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { AuthLayout } from "../components/AuthLayout";
import { AuthLink, AuthLinkText } from "../components/AuthLink";
import { useNavigate } from "react-router-dom";

export const FindPasswordPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <SelectUser onNext={handleNextStep} />;
      case 2:
        return <SecondStepPlaceholder>2단계 콘텐츠 준비 중</SecondStepPlaceholder>;
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title="EntryDSM 비밀번호 찾기"
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

const SecondStepPlaceholder = styled.div`
  margin-top: 40px;
  font-size: 18px;
  color: ${colors.gray[500]};
`;

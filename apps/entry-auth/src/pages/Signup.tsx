import { useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { EntryAuthTitle, SelectUser } from "../components";
import { useNavigate } from "react-router-dom";

export const SignUpPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

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
    <BackGroundWrapper>
      <SignUpPageContainer>
        <TitleWrapper>
          <EntryAuthTitle children="EntryDSM 회원가입" />
        </TitleWrapper>
        {renderContent()}
        <LoginKindContainer>
          <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            로그인
          </div>
          <AuthLink>비밀번호 찾기</AuthLink>
        </LoginKindContainer>
      </SignUpPageContainer>
    </BackGroundWrapper>
  );
};

const SignUpPageContainer = styled.div`
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  margin-bottom: 30px;
`;

const BackGroundWrapper = styled.div`
  display: flex;
  justify-content: center;
  overflow-x: hidden;
  height: calc(100vh - 70px);
`;

const TitleWrapper = styled.div`
  align-self: flex-start;
  width: 100%;
`;

const SecondStepPlaceholder = styled.div`
  margin-top: 40px;
  font-size: 18px;
  color: ${colors.gray[500]};
`;

const LoginKindContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.gray[300]};
  gap: 22px;
  margin-top: 60px;

  div:hover {
    color: ${colors.gray[400]};
    transition: all 0.3s ease-out;
  }
`;

const AuthLink = styled.div`
  width: 130px;
  display: flex;
  justify-content: center;
  border-inline-start: 2px solid ${colors.gray[100]};
  cursor: pointer;
`;

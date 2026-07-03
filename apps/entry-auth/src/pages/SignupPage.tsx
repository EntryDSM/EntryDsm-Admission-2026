import { useStepFlow } from "../hooks/useStepFlow";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { SelectUser } from "../components";
import { AuthLayout } from "../components/AuthLayout";
import { AuthLink, AuthLinkText } from "../components/AuthLink";
import { useNavigate } from "react-router";

export const SignUpPage = () => {
  const { currentStep, handleNextStep } = useStepFlow(1, 2);
  const navigate = useNavigate();

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
      title="EntryDSM 회원가입"
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

const SecondStepPlaceholder = styled.div`
  margin-top: 40px;
  font-size: 18px;
  color: ${colors.gray[500]};
`;

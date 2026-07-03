import styled from "@emotion/styled";
import type { ReactNode } from "react";
import { EntryAuthTitle } from "./AuthTitle/EntryAuthTitle";
import { colors } from "@entry/design";

interface AuthLayoutProps {
  title: string;
  footer: ReactNode;
  children: ReactNode;
}

export const AuthLayout = ({ title, footer, children }: AuthLayoutProps) => {
  return (
    <BackGroundWrapper>
      <PageContainer>
        <TitleWrapper>
          <EntryAuthTitle children={title} />
        </TitleWrapper>
        {children}
        <LoginKindContainer>{footer}</LoginKindContainer>
      </PageContainer>
    </BackGroundWrapper>
  );
};

const PageContainer = styled.div`
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

const LoginKindContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.gray[300]};
  gap: 22px;
  margin-top: 22px;

  div:hover {
    color: ${colors.gray[400]};
    transition: all 0.3s ease-out;
  }
`;

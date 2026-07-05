import styled from "@emotion/styled";
import { Outlet, useLocation } from "react-router";
import { Text } from "@entry/design";
import { ApplicationPreview, SubmitCheck } from "../pages";

export const ApplicationLayout = () => {
  const { pathname } = useLocation();

  const title = (() => {
    if (pathname.includes("applicant-info")) return "지원자 인적사항";
    if (pathname.includes("guardian-info")) return "보호자 인적사항";
    if (pathname.includes("middle-school-info")) return "중학교 정보 입력";
    if (pathname.includes("personal-statements")) return "자기소개서";
    if (pathname.includes("statement-of-purpose")) return "학업계획서";
    if (pathname.includes("application-classification")) return "지원자 유형 구분";
    if (pathname.includes("submit-check") || pathname.includes("application-preview")) return "";
    return "성적 기입";
  })();

  const isSubmitCheckPage = pathname.includes("submit-check");

  return (
    <Container>
      <TitleSection>
        <Text fontSize={32} fontWeight={600}>
          {title}
        </Text>
      </TitleSection>
      <ContentSection>
        {isSubmitCheckPage ? (
          <>
            <ApplicationPreview />
            <SubmitCheck />
          </>
        ) : (
          <Outlet />
        )}
      </ContentSection>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 60px;
`;

const TitleSection = styled.div`
  width: 100%;
`;

const ContentSection = styled.div`
  width: 100%;
  flex: 1;
  position: relative;
`;

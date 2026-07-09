import styled from "@emotion/styled";
import { Outlet, useLocation } from "react-router";
import { Text } from "@entry/design";
import { SubmitCheck } from "../pages";

export const ApplicationLayout = () => {
  const { pathname } = useLocation();

  const titleMap = new Map([
    ["/applicant-info", "지원자 인적사항"],
    ["/guardian-info", "보호자 인적사항"],
    ["/middle-school-info", "중학교 정보 입력"],
    ["/personal-statements", "자기소개서"],
    ["/statement-of-purpose", "학업계획서"],
    ["/application-classification", "지원자 유형 구분"],
    ["/application-preview", ""],
  ]);

  const title = titleMap.get(pathname);

  const isSubmitCheckPage = pathname.includes("submit-check");

  return (
    <Container>
      {title !== undefined && (
        <TitleSection>
          <Text fontSize={32} fontWeight={600}>
            {title}
          </Text>
        </TitleSection>
      )}
      <ContentSection>
        {isSubmitCheckPage ? (
          <>
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

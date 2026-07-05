import { colors, Flex, Skeleton, Text } from "@entry/design";
import { useState } from "react";
import styled from "@emotion/styled";

export const ApplicationPreview = () => {
  const [isLoading] = useState<boolean>(false);

  return (
    <Container>
      {isLoading ? (
        <ApplicationLoadingContainer>
          <Text fontSize={20} color={colors.gray[400]}>
            지원서 페이지를 로딩중입니다.
          </Text>
        </ApplicationLoadingContainer>
      ) : (
        <Flex width="100%" height="fit-content" isColumn={true}>
          <NoticeText>최종 제출 전 미리보기 UI만 남겨둔 상태입니다.</NoticeText>
          <ApplicationContainer>
            <PdfViewport>
              <Text color={colors.gray[400]}>PDF 미리보기 API와 생성 로직은 주석 처리되어 현재는 UI만 표시됩니다.</Text>
            </PdfViewport>
          </ApplicationContainer>
        </Flex>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
  width: 100%;
`;

const ApplicationContainer = styled.div`
  width: 100%;
  background-color: ${colors.gray[400]};
  display: block;
  padding: 24px 140px;
  box-sizing: border-box;
  max-height: 80vh;
  overflow-y: auto;
`;

const PdfViewport = styled.div`
  width: 100%;
  max-width: 794px;
  background-color: ${colors.extra.realWhite};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 40px;
  margin: 0 auto;
`;

const ApplicationLoadingContainer = styled(Skeleton)`
  width: 100%;
  height: 1500px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NoticeText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.gray[500]};
  padding: 16px 140px;
`;

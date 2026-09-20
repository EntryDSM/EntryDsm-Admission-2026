import { colors, Skeleton, Text } from "@entry/design";
import styled from "@emotion/styled";
import { getApplicationDocumentUrl, useApplicationDocument } from "../../apis";

export const ApplicationPreview = () => {
  const { data: applicationDocument, isError, isPending } = useApplicationDocument();
  const documentUrl = applicationDocument ? getApplicationDocumentUrl(applicationDocument.downloadUrl) : null;

  return (
    <Container>
      {isPending ? (
        <ApplicationLoadingContainer>
          <Text fontSize={20} color={colors.gray[400]}>
            원서 파일을 조회하고 있습니다.
          </Text>
        </ApplicationLoadingContainer>
      ) : isError ? (
        <ApplicationLoadingContainer>
          <Text fontSize={20} color={colors.gray[400]}>
            원서 파일을 불러오지 못했습니다.
          </Text>
        </ApplicationLoadingContainer>
      ) : !documentUrl ? (
        <ApplicationLoadingContainer>
          <Text fontSize={20} color={colors.gray[400]}>
            저장된 원서 파일이 없습니다.
          </Text>
        </ApplicationLoadingContainer>
      ) : (
        <PdfViewport>
          <PdfFrame title="원서 미리보기" src={documentUrl} />
        </PdfViewport>
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

const PdfViewport = styled.div`
  width: 100%;
  max-width: 794px;
  background-color: ${colors.extra.realWhite};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  margin: 0 auto;
  overflow: hidden;
`;

const PdfFrame = styled.iframe`
  width: 100%;
  height: 1120px;
  border: 0;
  display: block;
`;

const ApplicationLoadingContainer = styled(Skeleton)`
  width: 100%;
  height: 1500px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

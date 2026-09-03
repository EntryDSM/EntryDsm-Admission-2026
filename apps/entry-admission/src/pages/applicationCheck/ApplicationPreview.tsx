import { colors, Flex, Skeleton, Text } from "@entry/design";
import styled from "@emotion/styled";
import { getApplicationDocumentUrl, getStartedApplicantId, useApplicationDocument } from "../../apis";

export const ApplicationPreview = () => {
  // receiptCode API가 확정되기 전까지 현재 작성 원서의 applicantId를 조회 식별자로 사용합니다.
  const receiptCode = getStartedApplicantId()?.toString();
  const { data: applicationDocument, isError, isPending } = useApplicationDocument(receiptCode);
  const documentUrl = applicationDocument ? getApplicationDocumentUrl(applicationDocument.key) : null;
  const isPdf = applicationDocument?.fileName.toLowerCase().endsWith(".pdf");

  return (
    <Container>
      {isPending ? (
        <ApplicationLoadingContainer>
          <Text fontSize={20} color={colors.gray[400]}>
            원서 파일을 조회하고 있습니다.
          </Text>
        </ApplicationLoadingContainer>
      ) : !receiptCode ? (
        <ApplicationLoadingContainer>
          <Text fontSize={20} color={colors.gray[400]}>
            작성 중인 원서 정보를 찾을 수 없습니다.
          </Text>
        </ApplicationLoadingContainer>
      ) : isError ? (
        <ApplicationLoadingContainer>
          <Text fontSize={20} color={colors.gray[400]}>
            원서 파일을 불러오지 못했습니다.
          </Text>
        </ApplicationLoadingContainer>
      ) : !applicationDocument?.exists || !documentUrl ? (
        <ApplicationLoadingContainer>
          <Text fontSize={20} color={colors.gray[400]}>
            저장된 원서 파일이 없습니다.
          </Text>
        </ApplicationLoadingContainer>
      ) : (
        <Flex width="100%" height="fit-content" isColumn={true}>
          <NoticeText>{applicationDocument.fileName}</NoticeText>
          <ApplicationContainer>
            <PdfViewport>
              {isPdf ? (
                <PdfFrame title="원서 미리보기" src={documentUrl} />
              ) : (
                <FileLink href={documentUrl} target="_blank" rel="noreferrer">
                  {applicationDocument.fileName} 열기
                </FileLink>
              )}
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
  margin: 0 auto;
  overflow: hidden;
`;

const PdfFrame = styled.iframe`
  width: 100%;
  height: 1120px;
  border: 0;
  display: block;
`;

const FileLink = styled.a`
  display: block;
  padding: 40px;
  color: ${colors.orange[800]};
  text-align: center;
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

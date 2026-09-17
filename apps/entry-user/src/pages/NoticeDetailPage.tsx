import { media } from "@entry/design";
import { useParams, useNavigate } from "react-router";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { DownloadIcon, usePageTitle } from "@entry/ui";
import { useGetDetailNotice } from "../apis";

interface NoticeDetail {
  id: number;
  type: "GUIDE" | "NOTICE";
  title: string;
  createdAt: string;
  content: string;
  attachments?: Array<{ name: string; url: string }>;
}

export const NoticeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetDetailNotice(id);
  const noticeDetail: NoticeDetail | undefined = data
    ? {
        id: data.noticeId,
        type: data.division === "Prospective Students Notice" ? "GUIDE" : "NOTICE",
        title: data.title,
        content: data.content,
        createdAt: data.createdAt.split("T")[0],
      }
    : undefined;

  // 로드 후 탭 제목을 실제 공지 제목으로 바꾼다. 로드 전에는 라우트 기본 제목("공지사항 | EntryDSM")이 유지된다.
  usePageTitle(noticeDetail && `${noticeDetail.title} | EntryDSM`);

  const handleBackToList = () => {
    navigate("/notice");
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <div>로딩 중...</div>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <PageContainer>
        <ContentWrapper>
          <div>데이터를 불러오는데 실패했습니다.</div>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // noticeDetail이 없거나 필수 데이터가 없을 때 처리
  if (!noticeDetail || !noticeDetail.type) {
    return (
      <PageContainer>
        <ContentWrapper>
          <div>공지사항을 찾을 수 없습니다.</div>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <CategoryText>{noticeDetail.type === "NOTICE" ? "입학 공지사항" : "예비 신입생 안내"}</CategoryText>

        <TitleSection>
          <Title>{noticeDetail.title}</Title>
          <DateText>{noticeDetail.createdAt}</DateText>
        </TitleSection>

        <ContentSection>
          <ContentText>{noticeDetail.content}</ContentText>
        </ContentSection>

        {noticeDetail.attachments && noticeDetail.attachments.length > 0 && (
          <AttachmentsSection>
            <AttachmentTitle>첨부 파일</AttachmentTitle>
            <AttachmentList>
              {noticeDetail.attachments.map((file, index) => (
                <AttachmentItem key={index}>
                  <AttachmentName>첨부 파일 | {file.name}</AttachmentName>
                  <DownloadButton href={file.url} aria-label={`${file.name} 다운로드`}>
                    <DownloadIcon />
                  </DownloadButton>
                </AttachmentItem>
              ))}
            </AttachmentList>
          </AttachmentsSection>
        )}

        <ButtonSection>
          <BackButton onClick={handleBackToList}>목록으로</BackButton>
        </ButtonSection>
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: white;
  display: flex;
  justify-content: center;
  padding: 40px 0;

  ${media.tablet} {
    padding: 28px 0;
  }
`;

const ContentWrapper = styled.div`
  width: min(1200px, calc(100% - 48px));
  display: flex;
  flex-direction: column;

  ${media.medium} {
    width: calc(100% - 32px);
  }
`;

const CategoryText = styled.p`
  font-size: 14px;
  color: ${colors.gray[400]};
  margin: 0 0 8px 0;
`;

const TitleSection = styled.div`
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${colors.gray[200]};
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: inherit;

  overflow-wrap: anywhere;

  ${media.tablet} {
    font-size: 24px;
  }

  ${media.medium} {
    font-size: 22px;
    line-height: 1.4;
  }
`;

const DateText = styled.p`
  font-size: 16px;
  color: ${colors.gray[400]};
  margin: 0;

  ${media.medium} {
    font-size: 14px;
  }
`;

const ContentSection = styled.div`
  margin-bottom: 40px;
`;

const ContentText = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: ${colors.gray[500]};
  white-space: pre-wrap;
  overflow-wrap: anywhere;

  ${media.medium} {
    font-size: 15px;
    line-height: 1.7;
  }
`;

const AttachmentsSection = styled.div`
  margin-bottom: 40px;
`;

const AttachmentTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.gray[500]};
  margin-bottom: 16px;
`;

const AttachmentList = styled.div`
  border-top: 1px solid ${colors.gray[300]};
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${colors.gray[200]};
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 8px;

  &:hover {
    background-color: ${colors.gray[50]};
  }
`;

const AttachmentName = styled.span`
  font-size: 14px;
  color: ${colors.gray[500]};
  min-width: 0;
  overflow-wrap: anywhere;
`;

const DownloadButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
  }
`;

const BackButton = styled.button`
  padding: 12px 24px;
  background-color: ${colors.orange[800]};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${colors.orange[600]};
  }
`;

const ButtonSection = styled.div`
  display: flex;
  justify-content: flex-start;
`;

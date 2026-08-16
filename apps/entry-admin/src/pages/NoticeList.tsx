import { useState } from "react";
import styled from "@emotion/styled";
import { colors, Flex, Text } from "@entry/design";
import { Btn, TabSection, useModal } from "@entry/ui";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { useNotices, useQnas } from "../hooks";
import { getNoticeDivision, type NoticeType } from "../utils";
import { PagiNation, QnaDetailModal } from "../components";

const TAB_OPTIONS = [
  { key: "NOTICE", label: "입학 공지사항" },
  { key: "GUIDE", label: "예비 신입생 안내" },
  { key: "QNA", label: "Q&A" },
];

type NoticeTabKey = NoticeType | "QNA";

const ITEMS_PER_PAGE = 10;

export const NoticeList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NoticeTabKey>("NOTICE");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFaqId, setSelectedFaqId] = useState<number | null>(null);
  const { isOpen, open, close } = useModal();

  const isQnaTab = activeTab === "QNA";
  const activeDivision = isQnaTab ? undefined : getNoticeDivision(activeTab);

  // 명세상 목록 응답의 page 는 0 부터 시작하므로, UI 의 1-based 페이지를 변환해 보낸다.
  // 비활성 탭의 쿼리는 enabled=false 로 중지한다.
  // 공지 탭 분리는 division 필터 파라미터(명세 미기재 가정)로 서버에 위임하고,
  // 서버가 아직 지원하지 않으면 응답에 division 이 있을 때만 클라이언트에서 보조 분류한다.
  // (division 이 없는 공지는 숨기지 않고 양쪽 공지 탭에 모두 노출한다.)
  const pageParams = { page: currentPage - 1, size: ITEMS_PER_PAGE };
  const {
    notices: allNotices,
    totalPages: noticeTotalPages,
    isLoading: isNoticesLoading,
  } = useNotices({ ...pageParams, division: activeDivision }, !isQnaTab);
  const { qnas, totalPages: qnaTotalPages, isLoading: isQnasLoading } = useQnas(pageParams, isQnaTab);

  const notices = allNotices.filter(notice => !notice.division || notice.division === activeDivision);

  const totalPage = Math.max(1, (isQnaTab ? qnaTotalPages : noticeTotalPages) ?? 1);
  const isLoading = isQnaTab ? isQnasLoading : isNoticesLoading;
  const isEmpty = isQnaTab ? qnas.length === 0 : notices.length === 0;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as NoticeTabKey);
    setCurrentPage(1);
  };

  const handleCreateClick = () => {
    navigate("/notice/create");
  };

  const handleEditClick = (id: number) => {
    navigate(`/notice/edit/${id}`);
  };

  const handleDeleteClick = () => {
    // 공지 삭제 API 는 명세에 없어 아직 연동하지 않는다.
    toast.info("아직 지원하지 않는 기능입니다.");
  };

  const handleQnaClick = (faqId: number) => {
    setSelectedFaqId(faqId);
    open();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Container>
      <Flex isColumn={true} gap={24} width="100%" height="fit-content">
        <HeaderSection>
          <Text fontSize={32} fontWeight={600} color={colors.gray[400]}>
            공지사항 관리
          </Text>
          {!isQnaTab && (
            <Btn backgroundColor="#22c55e" hoverBackgroundColor="#16a34a" onClick={handleCreateClick}>
              공지사항 작성
            </Btn>
          )}
        </HeaderSection>

        <TabSection isAdmin={true} activeType={activeTab} onTypeChange={handleTabChange} options={TAB_OPTIONS} />

        {isQnaTab ? (
          <NoticeTable>
            <TableHeader>
              <HeaderColumn width="80px">번호</HeaderColumn>
              <HeaderColumn width="120px">카테고리</HeaderColumn>
              <HeaderColumn flex={1} justifyLeft>
                질문
              </HeaderColumn>
              <HeaderColumn flex={1} justifyLeft>
                답변
              </HeaderColumn>
            </TableHeader>

            <TableBody>
              {qnas.map(qna => (
                <ClickableRow key={qna.faqId} onClick={() => handleQnaClick(qna.faqId)}>
                  <TableCell width="80px">{qna.faqId}</TableCell>
                  <TableCell width="120px">{qna.category}</TableCell>
                  <TableCell flex={1} justifyLeft>
                    <EllipsisText>{qna.question}</EllipsisText>
                  </TableCell>
                  <TableCell flex={1} justifyLeft>
                    <EllipsisText>{qna.answer}</EllipsisText>
                  </TableCell>
                </ClickableRow>
              ))}
            </TableBody>
          </NoticeTable>
        ) : (
          <NoticeTable>
            <TableHeader>
              <HeaderColumn width="80px">번호</HeaderColumn>
              <HeaderColumn flex={1} justifyLeft>
                제목
              </HeaderColumn>
              <HeaderColumn width="100px">작성자</HeaderColumn>
              <HeaderColumn width="100px">고정</HeaderColumn>
              <HeaderColumn width="150px">작성일</HeaderColumn>
              <HeaderColumn width="140px">관리</HeaderColumn>
            </TableHeader>

            <TableBody>
              {notices.map(notice => (
                <TableRow key={notice.noticeId}>
                  <TableCell width="80px">{notice.noticeId}</TableCell>
                  <TableCell flex={1} justifyLeft>
                    <TitleCell>{notice.title}</TitleCell>
                  </TableCell>
                  <TableCell width="100px">{notice.author}</TableCell>
                  <TableCell width="100px">
                    {notice.isPinned ? (
                      <PinBadge>고정</PinBadge>
                    ) : (
                      <Text fontSize={12} color={colors.gray[400]}>
                        -
                      </Text>
                    )}
                  </TableCell>
                  <TableCell width="150px">{new Date(notice.createdAt).toLocaleDateString("ko-KR")}</TableCell>
                  <TableCell width="140px">
                    <ActionButtons>
                      <ActionButton onClick={() => handleEditClick(notice.noticeId)} color="#3b82f6">
                        수정
                      </ActionButton>
                      <ActionButton onClick={handleDeleteClick} color="#ef4444">
                        삭제
                      </ActionButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </NoticeTable>
        )}

        {isLoading ? (
          <EmptyState>
            <Text fontSize={16} color={colors.gray[400]}>
              {isQnaTab ? "Q&A를 불러오는 중..." : "공지사항을 불러오는 중..."}
            </Text>
          </EmptyState>
        ) : (
          isEmpty && (
            <EmptyState>
              <Text fontSize={16} color={colors.gray[400]}>
                {isQnaTab ? "등록된 Q&A가 없습니다." : "등록된 공지사항이 없습니다."}
              </Text>
            </EmptyState>
          )
        )}

        <PagiNation currentPage={currentPage} totalPage={totalPage} onPageChange={handlePageChange} />
      </Flex>

      {selectedFaqId !== null && <QnaDetailModal faqId={selectedFaqId} isOpen={isOpen} onClose={close} />}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
`;

const NoticeTable = styled.div`
  width: 100%;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  background-color: ${colors.gray[50]};
  border-bottom: 1px solid ${colors.gray[300]};
  padding: 16px;
`;

const HeaderColumn = styled.div<{ width?: string; flex?: number; justifyLeft?: boolean }>`
  ${({ width }) => width && `width: ${width};`}
  ${({ flex }) => flex && `flex: ${flex};`}
  display: flex;
  align-items: center;
  justify-content: ${({ justifyLeft }) => (justifyLeft ? "flex-start" : "center")};
  font-size: 16px;
  font-weight: 600;
  color: ${colors.gray[400]};
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const TableRow = styled.div`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid ${colors.gray[200]};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${colors.gray[50]};
  }
`;

const ClickableRow = styled(TableRow)`
  cursor: pointer;
`;

const TableCell = styled.div<{ width?: string; flex?: number; justifyLeft?: boolean }>`
  ${({ width }) => width && `width: ${width};`}
  ${({ flex }) => flex && `flex: ${flex};`}
  display: flex;
  align-items: center;
  justify-content: ${({ justifyLeft }) => (justifyLeft ? "flex-start" : "center")};
  font-size: 14px;
  color: ${colors.gray[400]};
  min-width: 0;
`;

const TitleCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
  width: 100%;
  padding-left: 0;
`;

const EllipsisText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ color: string }>`
  padding: 6px 12px;
  background-color: white;
  color: ${({ color }) => color};
  border: 1px solid ${({ color }) => color};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ color }) => color};
    color: white;
  }
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
`;

const PinBadge = styled.span`
  padding: 4px 8px;
  background-color: #fef3c7;
  color: #f59e0b;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
`;

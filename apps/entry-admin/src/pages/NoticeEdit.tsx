import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { colors, Flex, Text } from "@entry/design";
import { Btn } from "@entry/ui";
import { useNavigate, useParams } from "react-router";

import type { NoticeDetail } from "../apis";
import { useNoticeDetail, useUpdateNotice } from "../hooks";
import { getNewAttachmentFiles, toNoticeFormValue, toUpdateNoticePayload } from "../utils";
import { INITIAL_NOTICE_FORM_VALUE, NoticeForm, type NoticeAttachment, type NoticeFormValue } from "../components";

export const NoticeEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const noticeId = id && !Number.isNaN(Number(id)) ? Number(id) : undefined;
  const { notice, isLoading, isError, refetch } = useNoticeDetail(noticeId);

  useEffect(() => {
    if (noticeId === undefined) {
      navigate("/notice", { replace: true });
    }
  }, [noticeId, navigate]);

  if (noticeId === undefined) {
    return null;
  }

  if (isLoading) {
    return (
      <Container>
        <LoadingState>
          <Text fontSize={16} color={colors.gray[400]}>
            공지사항을 불러오는 중...
          </Text>
        </LoadingState>
      </Container>
    );
  }

  // 조회 실패 시 빈 수정 폼이 노출되지 않도록 에러 상태로 분기한다.
  // 단, 캐시 데이터가 있는 백그라운드 refetch 실패는 폼(작성 중 내용)을 유지한다.
  if (isError && !notice) {
    return (
      <Container>
        <LoadingState>
          <Flex isColumn={true} gap={12} width="fit-content" height="fit-content">
            <Text fontSize={16} color={colors.gray[400]}>
              공지사항을 불러오지 못했습니다.
            </Text>
            <Btn backgroundColor="#22c55e" hoverBackgroundColor="#16a34a" onClick={() => refetch()}>
              다시 시도
            </Btn>
          </Flex>
        </LoadingState>
      </Container>
    );
  }

  // 상세 조회가 끝난 뒤에 폼을 마운트해 응답을 초기값으로 주입한다. (key 로 공지가 바뀌면 재마운트)
  return <NoticeEditForm key={noticeId} noticeId={noticeId} notice={notice} />;
};

type NoticeEditFormProps = {
  noticeId: number;
  notice?: NoticeDetail;
};

const NoticeEditForm = ({ noticeId, notice }: NoticeEditFormProps) => {
  const navigate = useNavigate();
  const { updateNotice, isUpdating } = useUpdateNotice(noticeId);
  const [formData, setFormData] = useState<NoticeFormValue>(() =>
    notice ? toNoticeFormValue(notice) : { ...INITIAL_NOTICE_FORM_VALUE }
  );
  // 상세 조회 API(notification) 가 기존 첨부 목록을 내려주지 않아, 여기서는 새로 올릴 파일만 다룬다.
  const [attachments, setAttachments] = useState<NoticeAttachment[]>([]);

  const handleSubmit = () => {
    if (isUpdating) {
      return;
    }
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // 새 파일이 있으면 수정 훅이 document 에 올린 뒤 attachmentIds 로 함께 보낸다(기존 첨부는 전부 새 파일로 교체).
    updateNotice(
      { payload: toUpdateNoticePayload(formData), files: getNewAttachmentFiles(attachments) },
      { onSuccess: () => navigate("/notice") }
    );
  };

  const handleCancel = () => {
    if (confirm("수정 중인 내용이 사라집니다. 정말 취소하시겠습니까?")) {
      navigate("/notice");
    }
  };

  return (
    <Container>
      <Flex isColumn={true} gap={32} width="100%" height="fit-content">
        <HeaderSection>
          <Text fontSize={32} fontWeight={600} color={colors.gray[400]}>
            공지사항 수정
          </Text>
          <NoticeIdText>
            <Text fontSize={14} color={colors.gray[400]}>
              공지사항 번호: {noticeId}
            </Text>
          </NoticeIdText>
        </HeaderSection>

        <NoticeForm
          value={formData}
          attachments={attachments}
          uploadButtonText="파일 추가"
          uploadGuideText="새 파일을 올리면 기존 첨부파일은 모두 새 파일로 교체됩니다. (PDF·HWP·XLSX·DOCX·JPG·PNG·WEBP, 파일당 최대 20MB)"
          attachmentLabel="첨부된 파일"
          setValue={setFormData}
          setAttachments={setAttachments}
        />

        <ButtonSection>
          <Btn backgroundColor="#9ca3af" hoverBackgroundColor="#6b7280" onClick={handleCancel}>
            취소
          </Btn>
          <Btn backgroundColor="#22c55e" hoverBackgroundColor="#16a34a" onClick={handleSubmit}>
            {isUpdating ? "수정 중..." : "수정 완료"}
          </Btn>
        </ButtonSection>
      </Flex>
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
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const NoticeIdText = styled.div`
  display: flex;
  align-items: center;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
`;

const ButtonSection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
`;

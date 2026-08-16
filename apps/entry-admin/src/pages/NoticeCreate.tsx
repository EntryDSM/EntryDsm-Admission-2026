import { useState } from "react";
import styled from "@emotion/styled";
import { colors, Flex, Text } from "@entry/design";
import { Btn } from "@entry/ui";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { useCreateNotice } from "../hooks";
import { toCreateNoticePayload } from "../utils";
import { INITIAL_NOTICE_FORM_VALUE, NoticeForm, type NoticeAttachment, type NoticeFormValue } from "../components";

export const NoticeCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NoticeFormValue>(() => ({ ...INITIAL_NOTICE_FORM_VALUE }));
  const [attachments, setAttachments] = useState<NoticeAttachment[]>([]);

  const { createNotice, isCreating } = useCreateNotice();

  const handleSubmit = () => {
    if (isCreating) {
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

    // 파일 업로드(document) API 미연동이라 첨부파일은 아직 서버로 전송하지 못한다.
    if (attachments.length > 0) {
      toast.info("첨부파일 업로드는 아직 지원되지 않아 제외하고 등록합니다.");
    }

    createNotice(toCreateNoticePayload(formData), {
      onSuccess: () => navigate("/notice"),
    });
  };

  const handleCancel = () => {
    if (confirm("작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?")) {
      navigate("/notice");
    }
  };

  return (
    <Container>
      <Flex isColumn={true} gap={32} width="100%" height="fit-content">
        <HeaderSection>
          <Text fontSize={32} fontWeight={600} color={colors.gray[400]}>
            공지사항 작성
          </Text>
        </HeaderSection>

        <NoticeForm
          value={formData}
          attachments={attachments}
          uploadButtonText="파일 선택"
          uploadGuideText="여러 파일을 선택할 수 있습니다."
          attachmentLabel="업로드된 파일"
          setValue={setFormData}
          setAttachments={setAttachments}
        />

        <ButtonSection>
          <Btn backgroundColor="#9ca3af" hoverBackgroundColor="#6b7280" onClick={handleCancel}>
            취소
          </Btn>
          <Btn backgroundColor="#22c55e" hoverBackgroundColor="#16a34a" onClick={handleSubmit}>
            {isCreating ? "등록 중..." : "작성 완료"}
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
  align-items: center;
  width: 100%;
`;

const ButtonSection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
`;

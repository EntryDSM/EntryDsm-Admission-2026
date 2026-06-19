import { useState } from "react";
import styled from "@emotion/styled";
import { colors, Flex, Text } from "@entry/design";
import { Btn } from "@entry/ui";
import { useNavigate, useParams } from "react-router";
import { INITIAL_NOTICE_FORM_VALUE, NoticeForm, type NoticeAttachment, type NoticeFormValue } from "../components";

export const NoticeEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<NoticeFormValue>(() => ({ ...INITIAL_NOTICE_FORM_VALUE }));
  const [attachments, setAttachments] = useState<NoticeAttachment[]>([]);

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    navigate("/notice");
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
              공지사항 번호: {id}
            </Text>
          </NoticeIdText>
        </HeaderSection>

        <NoticeForm
          value={formData}
          attachments={attachments}
          uploadButtonText="파일 추가"
          uploadGuideText="새로운 파일을 추가하거나 기존 파일을 삭제할 수 있습니다."
          attachmentLabel="첨부된 파일"
          setValue={setFormData}
          setAttachments={setAttachments}
        />

        <ButtonSection>
          <Btn backgroundColor="#9ca3af" hoverBackgroundColor="#6b7280" onClick={handleCancel}>
            취소
          </Btn>
          <Btn backgroundColor="#22c55e" hoverBackgroundColor="#16a34a" onClick={handleSubmit}>
            수정 완료
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

const ButtonSection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
`;

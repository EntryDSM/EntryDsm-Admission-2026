import { useId, type Dispatch, type SetStateAction, type ChangeEvent } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { AuthInput } from "@entry/ui";
import type { NoticeAttachment, NoticeFormValue } from "./noticeFormModel";

type NoticeFormProps = {
  value: NoticeFormValue;
  attachments: NoticeAttachment[];
  uploadButtonText: string;
  uploadGuideText: string;
  attachmentLabel: string;
  setValue: Dispatch<SetStateAction<NoticeFormValue>>;
  setAttachments: Dispatch<SetStateAction<NoticeAttachment[]>>;
};

const createAttachment = (file: File): NoticeAttachment => ({
  id: crypto.randomUUID(),
  name: file.name,
  file,
});

export const NoticeForm = ({
  value,
  attachments,
  uploadButtonText,
  uploadGuideText,
  attachmentLabel,
  setValue,
  setAttachments,
}: NoticeFormProps) => {
  const fileInputId = useId();

  const handleInputChange =
    (field: keyof NoticeFormValue) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const nextValue = field === "isPinned" ? (e.target as HTMLInputElement).checked : e.target.value;

      setValue(prev => ({
        ...prev,
        [field]: nextValue,
      }));
    };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files.map(createAttachment)]);
    }

    e.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  return (
    <FormContainer>
      <FormRow>
        <FormLabel>카테고리</FormLabel>
        <Select value={value.category} onChange={handleInputChange("category")}>
          <option value="NOTICE">입학 공지사항</option>
          <option value="GUIDE">예비 신입생 안내</option>
        </Select>
      </FormRow>

      <FormRow>
        <CheckboxRow>
          <CheckboxLabel>
            <input type="checkbox" checked={value.isPinned} onChange={handleInputChange("isPinned")} />
            <span>상단 고정</span>
          </CheckboxLabel>
        </CheckboxRow>
      </FormRow>

      <FormRow>
        <FormLabel>제목</FormLabel>
        <AuthInput
          placeholder="공지사항 제목을 입력하세요"
          value={value.title}
          onChange={handleInputChange("title")}
          height="fit-content"
        />
      </FormRow>

      <FormRow>
        <FormLabel>내용</FormLabel>
        <ContentTextArea
          placeholder="공지사항 내용을 입력하세요"
          value={value.content}
          onChange={handleInputChange("content")}
          rows={15}
        />
      </FormRow>

      <FormRow>
        <FormLabel>첨부파일</FormLabel>
        <FileUploadSection>
          <FileInput type="file" multiple onChange={handleFileUpload} id={fileInputId} />
          <FileUploadButton htmlFor={fileInputId}>{uploadButtonText}</FileUploadButton>
          <FileUploadText>{uploadGuideText}</FileUploadText>
        </FileUploadSection>
      </FormRow>

      {attachments.length > 0 && (
        <FormRow>
          <FormLabel>{attachmentLabel}</FormLabel>
          <AttachmentList>
            {attachments.map(attachment => (
              <AttachmentItem key={attachment.id}>
                <AttachmentInfo>
                  <AttachmentName>{attachment.name}</AttachmentName>
                  {attachment.url && <ExistingFileLabel>기존 파일</ExistingFileLabel>}
                  {attachment.file && <NewFileLabel>새 파일</NewFileLabel>}
                </AttachmentInfo>
                <RemoveButton type="button" onClick={() => handleRemoveAttachment(attachment.id)}>
                  ×
                </RemoveButton>
              </AttachmentItem>
            ))}
          </AttachmentList>
        </FormRow>
      )}
    </FormContainer>
  );
};

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.gray[400]};
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.gray[400]};
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ContentTextArea = styled.textarea`
  padding: 16px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  font-size: 14px;
  color: ${colors.gray[400]};
  font-family: inherit;
  resize: vertical;
  min-height: 200px;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &::placeholder {
    color: ${colors.gray[400]};
  }
`;

const FileUploadSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadButton = styled.label`
  padding: 10px 16px;
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const FileUploadText = styled.span`
  font-size: 12px;
  color: ${colors.gray[400]};
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${colors.gray[50]};
  border: 1px solid ${colors.gray[200]};
  border-radius: 6px;
`;

const AttachmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AttachmentName = styled.span`
  font-size: 14px;
  color: ${colors.gray[500]};
`;

const ExistingFileLabel = styled.span`
  padding: 2px 6px;
  background-color: #dbeafe;
  color: #2563eb;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
`;

const NewFileLabel = styled.span`
  padding: 2px 6px;
  background-color: #dcfce7;
  color: #16a34a;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
`;

const RemoveButton = styled.button`
  width: 24px;
  height: 24px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:hover {
    background-color: #dc2626;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${colors.gray[400]};

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  span {
    user-select: none;
  }
`;

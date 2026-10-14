import { http } from "./http";
import type { DocumentFile } from "./types";

const DOCUMENT_ENDPOINT = "/api/document/v11";

export const getPhotoFile = (photoFileId: string) =>
  http.get<DocumentFile>(`${DOCUMENT_ENDPOINT}/photos/${encodeURIComponent(photoFileId)}`);

/** 공지 첨부 업로드. 확장자와 크기(20MB)는 서버가 검사한다. */
export const uploadAttachment = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return http.postFormData<DocumentFile>(`${DOCUMENT_ENDPOINT}/attachments`, formData);
};

/** 공지 저장이 실패했을 때 방금 올린 첨부를 지우는 데 쓴다. */
export const deleteAttachment = (attachmentId: string) =>
  http.delete<void>(`${DOCUMENT_ENDPOINT}/attachments/${encodeURIComponent(attachmentId)}`);

/** 정리 실패는 사용자 흐름을 막지 않도록 무시한다. */
export const discardAttachments = (attachmentIds: string[]) =>
  Promise.allSettled(attachmentIds.map(deleteAttachment)).then(() => undefined);

/** 첨부를 모두 올리고 ID 를 선택한 순서대로 돌려준다. 하나라도 실패하면 이미 올린 파일을 지우고 첫 에러를 던진다. */
export const uploadAttachments = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(files.map(uploadAttachment));
  const uploadedIds = results.flatMap(result =>
    result.status === "fulfilled" && result.value.id ? [result.value.id] : []
  );
  const failure = results.find((result): result is PromiseRejectedResult => result.status === "rejected");

  if (failure || uploadedIds.length !== files.length) {
    await discardAttachments(uploadedIds);
    throw failure?.reason ?? new Error("첨부파일 ID 를 받지 못했습니다.");
  }

  return uploadedIds;
};

/** 지원자 원서 PDF. 요청할 때마다 서버가 새로 만든다. */
export const getApplicantApplicationForm = (applicantId: number) =>
  http.get<DocumentFile>(`${DOCUMENT_ENDPOINT}/applications/${applicantId}`);

/** 지원자 수험표 PDF. 서버 제한으로 수험번호는 "미발급"으로 찍히며, 수험번호가 찍힌 수험표는 일괄 출력으로 받는다. */
export const getApplicantAdmissionTicket = (applicantId: number) =>
  http.get<DocumentFile>(`${DOCUMENT_ENDPOINT}/admission-tickets/${applicantId}`);

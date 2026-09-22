import { http } from "./http";
import type { DocumentFile } from "./types";

const DOCUMENT_ENDPOINT = "/api/document/v11";

/**
 * 증명사진 파일 조회. 지원자 상세의 `photoFileId`(`photo_…`)로 부르면 서명된 `downloadUrl`(`expiresIn` 초 유효)이 온다.
 * 증명사진은 본인과 ADMIN 만 받을 수 있고(백엔드 `FileCategory.PHOTO`), 응답 봉투는 admin 과 같은 `{ success, data }` 라
 * 공통 `http` 가 벗긴다. 없는 ID 는 404.
 */
export const getPhotoFile = (photoFileId: string) =>
  http.get<DocumentFile>(`${DOCUMENT_ENDPOINT}/photos/${encodeURIComponent(photoFileId)}`);

/**
 * 공지 첨부 업로드(ADMIN 전용, 백엔드 `FileCategory.ATTACHMENT`). multipart 필드 `file` 하나를 올리면
 * 공개 ID(`attachment_…`)가 든 파일 응답이 온다. 허용 확장자(pdf·hwp·xlsx·docx·jpg·png·webp)와
 * 크기(20MB)는 서버가 검사해 400 으로 거절한다.
 */
export const uploadAttachment = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return http.postFormData<DocumentFile>(`${DOCUMENT_ENDPOINT}/attachments`, formData);
};

/** 첨부 삭제(204). 공지 등록/수정이 실패했을 때 방금 올린 파일을 되돌리는 데 쓴다. */
export const deleteAttachment = (attachmentId: string) =>
  http.delete<void>(`${DOCUMENT_ENDPOINT}/attachments/${encodeURIComponent(attachmentId)}`);

/** 올린 첨부를 되돌린다. 정리 실패는 사용자 흐름을 막지 않도록 삼킨다(고아 파일은 남을 수 있다). */
export const discardAttachments = (attachmentIds: string[]) =>
  Promise.allSettled(attachmentIds.map(deleteAttachment)).then(() => undefined);

/**
 * 첨부 여러 개를 올리고 공개 ID 목록을 선택한 순서대로 돌려준다.
 * 하나라도 실패하면 이미 올라간 파일을 지워(최선 노력) 고아 파일을 남기지 않고 첫 에러를 던진다.
 */
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

/**
 * 지원자 한 명의 원서 PDF(요강 서식 1). 저장본이 없고 요청할 때마다 서버가 새로 만들어 서명 URL 로 준다
 * (`id` 없음, `fileName` 은 `application_{접수번호}.pdf`). ADMIN 과 원서 주인만 받는다. 원서가 없으면 404.
 */
export const getApplicantApplicationForm = (applicantId: number) =>
  http.get<DocumentFile>(`${DOCUMENT_ENDPOINT}/applications/${applicantId}`);

/**
 * 지원자 한 명의 수험표 PDF. 원서와 같이 요청마다 새로 만든다.
 * 백엔드(configuration `FileDocumentService.generateAdmissionTicket`)가 수험번호를 받을 길이 없어 수험번호 칸은 "미발급"으로 찍힌다.
 * 수험번호가 찍힌 수험표는 admin 일괄 출력(`POST /exports` ADMISSION_TICKET)으로만 받을 수 있다(2026-09-22 확인).
 */
export const getApplicantAdmissionTicket = (applicantId: number) =>
  http.get<DocumentFile>(`${DOCUMENT_ENDPOINT}/admission-tickets/${applicantId}`);

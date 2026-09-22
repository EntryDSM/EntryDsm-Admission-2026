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

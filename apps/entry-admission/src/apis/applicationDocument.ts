// receiptCode로 저장된 원서 문서의 메타데이터를 조회하는 API입니다.

import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";

// 원서 문서 파일 저장과 메타데이터 조회에 사용하는 API 경로입니다.
const APPLICATION_DOCUMENT_ENDPOINT = "/api/document/v11/applications";

export interface GetApplicationDocumentResponse {
  fileName: string;
  exists: boolean;
  size: number;
  downloadUrl: string;
  expiresIn: number;
}

// 파일 자체가 아닌 존재 여부와 저장소 key/fileName 메타데이터만 조회합니다.
export const getApplicationDocument = async () =>
  Http.get<GetApplicationDocumentResponse>(`${APPLICATION_DOCUMENT_ENDPOINT}`);

// applicantId별 조회 결과를 React Query 캐시에 분리하기 위한 키입니다.

// key가 URL이면 그대로 사용하고, 저장소 상대 경로면 API 서버 기준 URL로 만듭니다.
export const getApplicationDocumentUrl = (key: string | null | undefined) => {
  if (!key) {
    return null;
  }

  if (/^https?:\/\//i.test(key)) {
    return key;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl) {
    return null;
  }

  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  return `${baseUrl}/${key.replace(/^\//, "")}`;
};

export const useApplicationDocument = () =>
  useQuery({
    queryKey: ["application-document"],
    queryFn: () => getApplicationDocument(),
  });

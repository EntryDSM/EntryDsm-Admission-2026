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

// 백엔드는 이 조회마다 원서 PDF 를 새로 렌더링해 저장한다. 창 포커스·재연결마다 다시 만들지 않도록 자동 재조회는 끄고,
// 앞 단계에서 고친 내용이 반영되도록 캐시를 남기지 않아 미리보기에 들어올 때마다 한 번만 새로 만든다.
export const useApplicationDocument = () =>
  useQuery({
    queryKey: ["application-document"],
    queryFn: () => getApplicationDocument(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 0,
  });

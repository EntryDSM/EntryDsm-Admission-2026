// receiptCode로 저장된 원서 문서의 메타데이터를 조회하는 API입니다.

import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";

// 원서 문서 파일 저장과 메타데이터 조회에 사용하는 API 경로입니다.
const APPLICATION_DOCUMENT_ENDPOINT = "/application";

export interface GetApplicationDocumentResponse {
  key: string;
  fileName: string;
  exists: boolean;
}

// 파일 자체가 아닌 존재 여부와 저장소 key/fileName 메타데이터만 조회합니다.
export const getApplicationDocument = async (receiptCode: string) =>
  Http.get<GetApplicationDocumentResponse>(APPLICATION_DOCUMENT_ENDPOINT, {
    params: { receiptCode },
  });

// receiptCode별 조회 결과를 React Query 캐시에 분리하기 위한 키입니다.
export const applicationDocumentQueryKey = (receiptCode: string) => ["application-document", receiptCode] as const;

// key가 URL이면 그대로 사용하고, 저장소 상대 경로면 API 서버 기준 URL로 만듭니다.
export const getApplicationDocumentUrl = (key: string) => {
  if (/^https?:\/\//i.test(key)) {
    return key;
  }

  const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, "");
  return `${baseUrl}/${key.replace(/^\//, "")}`;
};

// receiptCode가 있을 때만 원서 문서 조회 요청을 실행합니다.
export const useApplicationDocument = (receiptCode: string | null | undefined) =>
  useQuery({
    queryKey: applicationDocumentQueryKey(receiptCode ?? ""),
    queryFn: () => getApplicationDocument(receiptCode!),
    enabled: Boolean(receiptCode),
  });

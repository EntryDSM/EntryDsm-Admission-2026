import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getQnaDetail } from "../apis";

/**
 * QnA(자주 묻는 질문) 상세 조회 훅.
 * `faqId` 가 없거나 `enabled` 가 false(예: 모달 닫힘)면 요청하지 않는다.
 */
export const useQnaDetail = (faqId?: number, enabled = true) => {
  const query = useQuery({
    queryKey: adminQueryKeys.qnas.detail(faqId ?? 0),
    queryFn: () => getQnaDetail(faqId as number),
    enabled: enabled && faqId !== undefined,
  });

  return {
    qna: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

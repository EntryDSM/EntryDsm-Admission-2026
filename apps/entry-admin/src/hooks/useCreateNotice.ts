import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, createNotice, HttpError, type CreateNoticePayload } from "../apis";

/**
 * 공지 등록 훅.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 * 성공 시 공지 목록 캐시를 무효화해 최신 값으로 갱신한다.
 */
export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateNoticePayload) => createNotice(payload),
    onSuccess: () => {
      toast.success("공지사항을 등록했습니다.");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.notices.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "공지 등록 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    createNotice: mutation.mutate,
    isCreating: mutation.isPending,
  };
};

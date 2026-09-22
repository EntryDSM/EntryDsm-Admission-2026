import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  adminQueryKeys,
  discardAttachments,
  HttpError,
  updateNotice,
  uploadAttachments,
  type UpdateNoticePayload,
} from "../apis";

/**
 * 수정 입력. `files` 가 있으면 document 에 먼저 올리고 받은 공개 ID 를 `attachmentIds` 로 보낸다.
 * `attachmentIds` 는 보내면 목록 전체가 교체되므로(빈 배열 = 첨부 제거) 새 파일이 없을 때는 보내지 않아 기존 첨부를 유지한다.
 */
export interface UpdateNoticeInput {
  payload: UpdateNoticePayload;
  files?: File[];
}

/**
 * 공지 수정 훅. 첨부파일 업로드(document) → 공지 수정(admin) 두 단계를 한 뮤테이션으로 묶는다.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 * 성공 시 공지 목록 캐시를 무효화해 최신 값으로 갱신한다.
 */
export const useUpdateNotice = (noticeId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ payload, files = [] }: UpdateNoticeInput) => {
      const attachmentIds = await uploadAttachments(files);

      try {
        await updateNotice(attachmentIds.length > 0 ? { ...payload, attachmentIds } : payload, noticeId);
      } catch (error) {
        // 수정이 반영되지 않았으면 방금 올린 첨부는 어디에도 묶이지 않으므로 지운다.
        await discardAttachments(attachmentIds);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("공지사항을 수정했습니다.");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.notices.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "공지 수정 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    updateNotice: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

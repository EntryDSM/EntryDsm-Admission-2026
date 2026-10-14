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

/** `files` 는 먼저 올리고 받은 ID 를 `attachmentIds` 로 보낸다. 새 파일이 없으면 보내지 않아 기존 첨부를 유지한다. */
export interface UpdateNoticeInput {
  payload: UpdateNoticePayload;
  files?: File[];
}

/** 첨부 업로드 → 공지 수정을 한 뮤테이션으로 묶는다. */
export const useUpdateNotice = (noticeId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ payload, files = [] }: UpdateNoticeInput) => {
      const attachmentIds = await uploadAttachments(files);

      try {
        await updateNotice(attachmentIds.length > 0 ? { ...payload, attachmentIds } : payload, noticeId);
      } catch (error) {
        // 수정이 실패하면 방금 올린 첨부를 지운다.
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

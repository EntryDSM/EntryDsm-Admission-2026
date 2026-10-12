import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  adminQueryKeys,
  createNotice,
  discardAttachments,
  HttpError,
  uploadAttachments,
  type CreateNoticePayload,
} from "../apis";

/** `files` 는 먼저 올리고 받은 ID 를 `attachmentIds` 로 함께 보낸다. */
export interface CreateNoticeInput {
  payload: CreateNoticePayload;
  files?: File[];
}

/** 첨부 업로드 → 공지 등록을 한 뮤테이션으로 묶는다. */
export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ payload, files = [] }: CreateNoticeInput) => {
      const attachmentIds = await uploadAttachments(files);

      try {
        await createNotice(attachmentIds.length > 0 ? { ...payload, attachmentIds } : payload);
      } catch (error) {
        // 등록이 실패하면 방금 올린 첨부를 지운다.
        await discardAttachments(attachmentIds);
        throw error;
      }
    },
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

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

/** 등록 입력. `files` 는 document 에 먼저 올리고, 받은 공개 ID 를 `attachmentIds` 로 함께 보낸다. */
export interface CreateNoticeInput {
  payload: CreateNoticePayload;
  files?: File[];
}

/**
 * 공지 등록 훅. 첨부파일 업로드(document) → 공지 등록(admin) 두 단계를 한 뮤테이션으로 묶는다.
 * 뮤테이션 에러는 QueryCache(쿼리 전용) 에서 잡히지 않으므로 여기서 직접 토스트한다.
 * 성공 시 공지 목록 캐시를 무효화해 최신 값으로 갱신한다.
 */
export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ payload, files = [] }: CreateNoticeInput) => {
      const attachmentIds = await uploadAttachments(files);

      try {
        await createNotice(attachmentIds.length > 0 ? { ...payload, attachmentIds } : payload);
      } catch (error) {
        // 공지가 만들어지지 않았으면 방금 올린 첨부는 어디에도 묶이지 않으므로 지운다.
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

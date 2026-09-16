import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { adminQueryKeys, deleteNotice, HttpError } from "../apis";

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (noticeId: number) => deleteNotice(noticeId),
    onSuccess: (_, noticeId) => {
      toast.success("공지사항을 삭제했습니다.");
      queryClient.removeQueries({ queryKey: adminQueryKeys.notices.detail(noticeId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.notices.all });
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : "공지 삭제 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });

  return {
    deleteNotice: mutation.mutate,
    isDeleting: mutation.isPending,
    deletingNoticeId: mutation.variables,
  };
};

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { HttpError } from "../apis";
import { notifyDownloadReady } from "../utils";

/** 요청 즉시 서명 URL 을 주는 파일(지원자 원서·수험표)을 받는다. 매번 새로 만들어지는 파일이라 캐시하지 않는다. */
export const useFileDownload = <TVariables = void>(
  label: string,
  request: (variables: TVariables) => Promise<{ downloadUrl: string }>
) => {
  const mutation = useMutation({
    mutationFn: request,
    onSuccess: file => notifyDownloadReady(label, file.downloadUrl),
    onError: (error: unknown) => {
      const message =
        error instanceof HttpError && error.message ? error.message : `${label} 생성 중 오류가 발생했습니다.`;
      toast.error(message);
    },
  });

  return {
    download: mutation.mutate,
    isDownloading: mutation.isPending,
  };
};

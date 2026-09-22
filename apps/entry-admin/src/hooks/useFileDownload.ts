import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { HttpError } from "../apis";
import { notifyDownloadReady } from "../utils";

/**
 * 서버가 요청 즉시 서명 URL 을 돌려주는 파일(지원자 원서·수험표, 1차 합격자 명단) 공용 다운로드 훅.
 * 요청할 때마다 새로 만들어지는 파일이라 캐시하지 않는 뮤테이션으로 부르고, 받은 URL 은 팝업 차단 대비 토스트로 연다.
 * 뮤테이션 에러는 QueryCache 에서 잡히지 않아 여기서 직접 토스트한다.
 */
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

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { type DownloadedFile, ESSAYS_ARCHIVE_FILE_NAME, getEssaysArchive, HttpError } from "../apis";
import { saveBlobAsFile } from "../utils";

const ESSAYS_LABEL = "자기소개서·학업계획서";

/** 엔트리가 하나도 없는 ZIP 은 EOCD 레코드 22바이트뿐이다. 서버는 대상이 없거나 전부 미작성이면 이 빈 ZIP 을 200 으로 준다. */
const EMPTY_ZIP_SIZE = 22;

const getErrorMessage = (error: unknown) => {
  if (error instanceof HttpError && error.message) {
    return error.message;
  }

  // `AbortSignal.timeout` 이 끊은 요청. 지원자 수만큼 PDF 를 만들다 시간이 모자란 경우다.
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return `${ESSAYS_LABEL} 생성이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.`;
  }

  return `${ESSAYS_LABEL} 다운로드 중 오류가 발생했습니다.`;
};

/**
 * 자기소개서·학업계획서 ZIP 다운로드 훅(`GET /essays`). 서명 URL 이 아니라 본문을 직접 받으므로
 * Blob 으로 받아 `saveBlobAsFile` 로 저장한다. 요청할 때마다 새로 만드는 파일이라 캐시하지 않는 뮤테이션으로 부르고,
 * 뮤테이션 에러는 QueryCache 에서 잡히지 않아 여기서 직접 토스트한다.
 */
export const useDownloadEssays = () => {
  const mutation = useMutation({
    mutationFn: getEssaysArchive,
    onSuccess: ({ blob, fileName }: DownloadedFile) => {
      if (blob.size <= EMPTY_ZIP_SIZE) {
        toast.info(`작성된 ${ESSAYS_LABEL}가 없어 내려받을 파일이 없습니다.`);
        return;
      }

      saveBlobAsFile(blob, fileName ?? ESSAYS_ARCHIVE_FILE_NAME);
      toast.success(`${ESSAYS_LABEL} 다운로드를 시작했습니다.`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    downloadEssays: () => mutation.mutate(),
    isDownloadingEssays: mutation.isPending,
  };
};

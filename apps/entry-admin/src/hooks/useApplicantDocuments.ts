import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { type DocumentFile, getApplicantAdmissionTicket, getApplicantApplicationForm, HttpError } from "../apis";
import { notifyDownloadReady } from "../utils";

const useApplicantDocumentDownload = (label: string, request: (applicantId: number) => Promise<DocumentFile>) => {
  const mutation = useMutation({
    mutationFn: request,
    onSuccess: (file: DocumentFile) => notifyDownloadReady(label, file.downloadUrl),
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

/**
 * 지원자 한 명의 원서·수험표 PDF 다운로드 훅(document `GET /applications/{id}`, `GET /admission-tickets/{id}`).
 * 서버가 요청할 때마다 새로 만들어 서명 URL 을 주므로 캐시하지 않는 뮤테이션으로 부르고,
 * 받은 URL 은 공용 다운로드 안내(팝업 차단 대비 토스트 클릭)로 연다. 뮤테이션 에러는 QueryCache 에서 잡히지 않아 여기서 직접 토스트한다.
 */
export const useApplicantDocumentDownloads = () => {
  const applicationForm = useApplicantDocumentDownload("원서", getApplicantApplicationForm);
  const admissionTicket = useApplicantDocumentDownload("수험표", getApplicantAdmissionTicket);

  return {
    downloadApplicationForm: applicationForm.download,
    isDownloadingApplicationForm: applicationForm.isDownloading,
    downloadAdmissionTicket: admissionTicket.download,
    isDownloadingAdmissionTicket: admissionTicket.isDownloading,
  };
};

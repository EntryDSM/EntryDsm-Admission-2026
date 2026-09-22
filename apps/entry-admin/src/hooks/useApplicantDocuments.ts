import { getApplicantAdmissionTicket, getApplicantApplicationForm } from "../apis";
import { useFileDownload } from "./useFileDownload";

/**
 * 지원자 한 명의 원서·수험표 PDF 다운로드 훅(document `GET /applications/{id}`, `GET /admission-tickets/{id}`).
 * 서버가 요청할 때마다 새로 만들어 서명 URL 을 주므로 공용 `useFileDownload` 로 받아 연다.
 */
export const useApplicantDocumentDownloads = () => {
  const applicationForm = useFileDownload("원서", getApplicantApplicationForm);
  const admissionTicket = useFileDownload("수험표", getApplicantAdmissionTicket);

  return {
    downloadApplicationForm: applicationForm.download,
    isDownloadingApplicationForm: applicationForm.isDownloading,
    downloadAdmissionTicket: admissionTicket.download,
    isDownloadingAdmissionTicket: admissionTicket.isDownloading,
  };
};

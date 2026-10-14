import { getApplicantAdmissionTicket, getApplicantApplicationForm } from "../apis";
import { useFileDownload } from "./useFileDownload";

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

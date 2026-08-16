import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { getAdmissionTicketJobs, getApplicationChecklist, HttpError, type AdminDocumentJob } from "../apis";

/**
 * 문서 생성 잡(job) 조회 → 다운로드 공통 훅.
 * 잡이 완료(COMPLETED)면 서명된 downloadUrl 을 새 창으로 열고, 진행 중이면 상태를 안내한다.
 */
const useDocumentJobDownload = (fetchJob: () => Promise<AdminDocumentJob>, label: string) => {
  const mutation = useMutation({
    mutationFn: fetchJob,
    onSuccess: (job: AdminDocumentJob) => {
      if (job.status === "COMPLETED" && job.downloadUrl) {
        window.open(job.downloadUrl, "_blank", "noopener,noreferrer");
        toast.success(`${label} 다운로드를 시작했습니다.`);
        return;
      }

      toast.info(`${label} 생성 중입니다. (${job.processedCount}/${job.totalCount}) 잠시 후 다시 시도해주세요.`);
    },
    onError: (error: unknown) => {
      const message = error instanceof HttpError ? error.message : `${label} 다운로드 중 오류가 발생했습니다.`;
      toast.error(message);
    },
  });

  return {
    download: mutation.mutate,
    isDownloading: mutation.isPending,
  };
};

/** 지원서 점검표 다운로드 훅 */
export const useDownloadChecklist = () => {
  const { download, isDownloading } = useDocumentJobDownload(getApplicationChecklist, "지원서 점검표");

  return {
    downloadChecklist: download,
    isDownloadingChecklist: isDownloading,
  };
};

/** 수험표 일괄 다운로드 훅 */
export const useDownloadAdmissionTickets = () => {
  const { download, isDownloading } = useDocumentJobDownload(getAdmissionTicketJobs, "수험표");

  return {
    downloadAdmissionTickets: download,
    isDownloadingAdmissionTickets: isDownloading,
  };
};

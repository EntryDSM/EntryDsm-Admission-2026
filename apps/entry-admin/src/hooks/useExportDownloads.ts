import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { createExport, type ExportJob, type ExportType, getExportJob } from "../apis";

const POLL_INTERVAL_MS = 2_000;
/** 수험표 ZIP 은 지원자 수만큼 PDF 를 만들어 묶으므로 넉넉히 기다린다. */
const MAX_WAIT_MS = 5 * 60 * 1000;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const isFinished = (job: ExportJob) => job.status === "COMPLETED" || job.status === "FAILED";

/** 잡을 접수하고 완료/실패로 끝날 때까지 주기적으로 조회한다. 제한 시간을 넘기면 에러로 끝낸다. */
const runExport = async (type: ExportType): Promise<ExportJob> => {
  const { exportJobId } = await createExport({ type });
  const deadline = Date.now() + MAX_WAIT_MS;

  let job = await getExportJob(exportJobId);
  while (!isFinished(job)) {
    if (Date.now() >= deadline) {
      throw new Error("생성이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.");
    }

    await sleep(POLL_INTERVAL_MS);
    job = await getExportJob(exportJobId);
  }

  return job;
};

const openDownload = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

/**
 * 내보내기(수험표 ZIP / 지원자 목록 엑셀) 공통 훅.
 * `POST /exports` 로 잡을 접수하고 `GET /exports/{id}` 를 폴링해, 완료되면 서명된 downloadUrl 을 새 창으로 연다.
 * 폴링 뒤의 window.open 은 사용자 클릭과 떨어져 있어 브라우저가 팝업으로 막을 수 있으므로,
 * 토스트를 클릭해도 같은 링크가 열리게 한다. 뮤테이션 에러는 QueryCache 에서 잡히지 않아 여기서 직접 토스트한다.
 */
const useExportDownload = (type: ExportType, label: string) => {
  const mutation = useMutation({
    mutationFn: () => runExport(type),
    onSuccess: (job: ExportJob) => {
      const downloadUrl = job.status === "COMPLETED" ? job.downloadUrl : null;

      if (!downloadUrl) {
        toast.error(`${label} 생성에 실패했습니다. 잠시 후 다시 시도해주세요.`);
        return;
      }

      const opened = openDownload(downloadUrl);
      toast.success(
        opened
          ? `${label} 다운로드를 시작했습니다.`
          : `${label} 생성이 완료되었습니다. 여기를 클릭하면 다운로드 링크를 엽니다.`,
        { autoClose: 15_000, onClick: () => openDownload(downloadUrl) }
      );
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error && error.message ? error.message : `${label} 다운로드 중 오류가 발생했습니다.`;
      toast.error(message);
    },
  });

  return {
    download: mutation.mutate,
    isDownloading: mutation.isPending,
  };
};

/** 지원자 점검표(지원자 목록 엑셀, `APPLICANT_LIST`) 다운로드 훅 */
export const useDownloadChecklist = () => {
  const { download, isDownloading } = useExportDownload("APPLICANT_LIST", "지원자 점검표");

  return {
    downloadChecklist: download,
    isDownloadingChecklist: isDownloading,
  };
};

/** 수험표 일괄(ZIP, `ADMISSION_TICKET`) 다운로드 훅 */
export const useDownloadAdmissionTickets = () => {
  const { download, isDownloading } = useExportDownload("ADMISSION_TICKET", "수험표");

  return {
    downloadAdmissionTickets: download,
    isDownloadingAdmissionTickets: isDownloading,
  };
};

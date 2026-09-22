import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { createExport, type ExportFilter, type ExportJob, type ExportType, getExportJob } from "../apis";
import { notifyDownloadReady } from "../utils";

const POLL_INTERVAL_MS = 2_000;
/** 수험표 PDF 는 지원자 수만큼 장을 만들어 묶으므로 넉넉히 기다린다. */
const MAX_WAIT_MS = 5 * 60 * 1000;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const isFinished = (job: ExportJob) => job.status === "COMPLETED" || job.status === "FAILED";

/** 내보내기 옵션. `filter` 는 지원자 목록 조회와 같은 조건이며, 없으면 전체 지원자를 대상으로 한다. */
export interface ExportDownloadOptions {
  filter?: ExportFilter;
}

/** 잡을 접수하고 완료/실패로 끝날 때까지 주기적으로 조회한다. 제한 시간을 넘기면 에러로 끝낸다. */
const runExport = async (type: ExportType, filter?: ExportFilter): Promise<ExportJob> => {
  const { exportJobId } = await createExport(filter ? { type, filter } : { type });
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

/**
 * 내보내기(수험표 PDF / 지원자 목록 엑셀) 공통 훅.
 * `POST /exports` 로 잡을 접수하고 `GET /exports/{id}` 를 폴링해, 완료되면 서명된 downloadUrl 을 새 창으로 연다
 * (팝업 차단 대비는 `notifyDownloadReady` 가 맡는다). 화면의 검색 조건을 `filter` 로 넘기면 그 조건의 지원자만 대상이 된다.
 * 뮤테이션 에러는 QueryCache 에서 잡히지 않아 여기서 직접 토스트한다.
 */
const useExportDownload = (type: ExportType, label: string) => {
  const mutation = useMutation({
    mutationFn: ({ filter }: ExportDownloadOptions) => runExport(type, filter),
    onSuccess: (job: ExportJob, { filter }) => {
      const scopedLabel = filter ? `현재 검색 조건의 ${label}` : label;
      const downloadUrl = job.status === "COMPLETED" ? job.downloadUrl : null;

      if (!downloadUrl) {
        toast.error(`${scopedLabel} 생성에 실패했습니다. 잠시 후 다시 시도해주세요.`);
        return;
      }

      notifyDownloadReady(scopedLabel, downloadUrl);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error && error.message ? error.message : `${label} 다운로드 중 오류가 발생했습니다.`;
      toast.error(message);
    },
  });

  return {
    download: (options: ExportDownloadOptions = {}) => mutation.mutate(options),
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

/** 수험표 일괄(PDF, `ADMISSION_TICKET`) 다운로드 훅 */
export const useDownloadAdmissionTickets = () => {
  const { download, isDownloading } = useExportDownload("ADMISSION_TICKET", "수험표");

  return {
    downloadAdmissionTickets: download,
    isDownloadingAdmissionTickets: isDownloading,
  };
};

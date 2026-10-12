import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { createExport, type ExportJob, type ExportType, getExportJob } from "../apis";
import { notifyDownloadReady } from "../utils";

const POLL_INTERVAL_MS = 2_000;
/** 수험표·자기소개서 묶음은 만드는 데 오래 걸려 넉넉히 기다린다. */
const MAX_WAIT_MS = 5 * 60 * 1000;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const isFinished = (job: ExportJob) => job.status === "COMPLETED" || job.status === "FAILED";

const waitForExportJob = async (exportJobId: string): Promise<ExportJob> => {
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

const runExport = async (type: ExportType): Promise<ExportJob> => {
  const { exportJobId } = await createExport({ type });
  return waitForExportJob(exportJobId);
};

/** 파일 출력 공통 훅. 생성 잡을 접수하고 끝날 때까지 기다린 뒤 다운로드 링크를 연다. */
const useExportDownload = (type: ExportType, label: string) => {
  const mutation = useMutation({
    mutationFn: () => runExport(type),
    onSuccess: (job: ExportJob) => {
      const downloadUrl = job.status === "COMPLETED" ? job.downloadUrl : null;

      if (!downloadUrl) {
        toast.error(`${label} 생성에 실패했습니다. 잠시 후 다시 시도해주세요.`);
        return;
      }

      notifyDownloadReady(label, downloadUrl);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error && error.message ? error.message : `${label} 다운로드 중 오류가 발생했습니다.`;
      toast.error(message);
    },
  });

  return {
    download: () => mutation.mutate(),
    isDownloading: mutation.isPending,
  };
};

export const useDownloadChecklist = () => {
  const { download, isDownloading } = useExportDownload("APPLICATION_CHECKLIST", "지원자 점검표");

  return {
    downloadChecklist: download,
    isDownloadingChecklist: isDownloading,
  };
};

export const useDownloadAdmissionTickets = () => {
  const { download, isDownloading } = useExportDownload("ADMISSION_TICKET", "수험표");

  return {
    downloadAdmissionTickets: download,
    isDownloadingAdmissionTickets: isDownloading,
  };
};

export const useDownloadAdmissionFile = () => {
  const { download, isDownloading } = useExportDownload("ADMISSION_FILE", "전형 자료");

  return {
    downloadAdmissionFile: download,
    isDownloadingAdmissionFile: isDownloading,
  };
};

export const useDownloadFirstPassList = () => {
  const { download, isDownloading } = useExportDownload("FIRST_PASS", "1차 합격자 명단");

  return {
    downloadFirstPassList: download,
    isDownloadingFirstPassList: isDownloading,
  };
};

export const useDownloadEssays = () => {
  const { download, isDownloading } = useExportDownload("ESSAYS", "자기소개서·학업계획서");

  return {
    downloadEssays: download,
    isDownloadingEssays: isDownloading,
  };
};

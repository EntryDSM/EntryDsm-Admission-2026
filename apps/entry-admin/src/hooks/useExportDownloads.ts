import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { createExport, type ExportJob, type ExportType, getExportJob, HttpError } from "../apis";
import { notifyDownloadReady } from "../utils";

const POLL_INTERVAL_MS = 2_000;
/** 수험표·자기소개서 묶음은 만드는 데 오래 걸려 넉넉히 기다린다. */
const MAX_WAIT_MS = 5 * 60 * 1000;

/** 대기 시간을 넘긴 작업. 다시 누르면 새로 만들지 않고 이어서 기다린다. */
const pendingJobIds = new Map<ExportType, string>();

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const isFinished = (job: ExportJob) => job.status === "COMPLETED" || job.status === "FAILED";

const waitForExportJob = async (exportJobId: string): Promise<ExportJob> => {
  const deadline = Date.now() + MAX_WAIT_MS;

  let job = await getExportJob(exportJobId);
  while (!isFinished(job)) {
    if (Date.now() >= deadline) {
      throw new Error("생성이 오래 걸리고 있습니다. 다시 누르면 진행 중인 작업을 이어서 확인합니다.");
    }

    await sleep(POLL_INTERVAL_MS);
    job = await getExportJob(exportJobId);
  }

  return job;
};

const runExport = async (type: ExportType): Promise<ExportJob> => {
  const exportJobId = pendingJobIds.get(type) ?? (await createExport({ type })).exportJobId;
  pendingJobIds.set(type, exportJobId);

  // 끝난 작업·없는 작업(404)은 잊고, 시간 초과나 일시 오류는 남겨 두어 다시 누르면 이어서 확인한다.
  try {
    const job = await waitForExportJob(exportJobId);
    pendingJobIds.delete(type);
    return job;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      pendingJobIds.delete(type);
    }
    throw error;
  }
};

const getExportFailureMessage = (label: string, job: ExportJob) =>
  `${label} 생성에 실패했습니다. ${job.failureMessage ?? "잠시 후 다시 시도해주세요."}${
    job.failedCount ? ` (실패 ${job.failedCount}건)` : ""
  }`;

/** 파일 출력 공통 훅. 생성 잡을 접수하고 끝날 때까지 기다린 뒤 다운로드 링크를 연다. */
const useExportDownload = (type: ExportType, label: string) => {
  const mutation = useMutation({
    mutationFn: () => runExport(type),
    onSuccess: (job: ExportJob) => {
      if (job.status === "COMPLETED" && job.downloadUrl) {
        notifyDownloadReady(label, job.downloadUrl);
        return;
      }

      toast.error(getExportFailureMessage(label, job));
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

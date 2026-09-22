import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  createAdmissionFileExport,
  createExport,
  type ExportFilter,
  type ExportJob,
  type ExportType,
  getExportJob,
  getFirstPassListFile,
} from "../apis";
import { notifyDownloadReady } from "../utils";
import { useFileDownload } from "./useFileDownload";

const POLL_INTERVAL_MS = 2_000;
/** 수험표 PDF 는 지원자 수만큼 장을 만들어 묶고, 전형 자료는 첫 요청 때 지원자 데이터를 동기화하므로 넉넉히 기다린다. */
const MAX_WAIT_MS = 5 * 60 * 1000;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const isFinished = (job: ExportJob) => job.status === "COMPLETED" || job.status === "FAILED";

/** 내보내기 옵션. `filter` 는 지원자 목록 조회와 같은 조건이며, 없으면 전체 지원자를 대상으로 한다. */
export interface ExportDownloadOptions {
  filter?: ExportFilter;
}

/** 접수된 잡이 완료/실패로 끝날 때까지 주기적으로 조회한다. 제한 시간을 넘기면 에러로 끝낸다. */
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

/** `POST /exports` 로 잡을 접수하고 끝날 때까지 기다린다. */
const runExport = async (type: ExportType, filter?: ExportFilter): Promise<ExportJob> => {
  const { exportJobId } = await createExport(filter ? { type, filter } : { type });
  return waitForExportJob(exportJobId);
};

/**
 * 내보내기 잡 다운로드 공통 훅. `start` 가 잡을 접수하고 끝날 때까지 기다린 결과를 받아,
 * 완료면 서명된 downloadUrl 을 새 창으로 연다(팝업 차단 대비는 `notifyDownloadReady` 가 맡는다).
 * 뮤테이션 에러는 QueryCache 에서 잡히지 않아 여기서 직접 토스트한다.
 */
const useExportJobDownload = (label: string, start: (options: ExportDownloadOptions) => Promise<ExportJob>) => {
  const mutation = useMutation({
    mutationFn: start,
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

/**
 * `POST /exports` 계열(수험표 PDF / 지원자 목록 엑셀) 훅. 화면의 검색 조건을 `filter` 로 넘기면 그 조건의 지원자만 대상이 된다.
 */
const useExportDownload = (type: ExportType, label: string) =>
  useExportJobDownload(label, ({ filter }) => runExport(type, filter));

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

/**
 * 전형 자료(전체 지원자 엑셀, `ADMISSION_FILE`) 다운로드 훅.
 * `GET /admission-file` 이 조건 없이 잡을 접수해 `jobId` 를 돌려주므로(화면 필터와 무관하게 전체 지원자),
 * 이후는 다른 내보내기와 같이 `GET /exports/{jobId}` 를 폴링한다.
 */
export const useDownloadAdmissionFile = () => {
  const { download, isDownloading } = useExportJobDownload("전형 자료", async () => {
    const { jobId } = await createAdmissionFileExport();
    return waitForExportJob(jobId);
  });

  return {
    downloadAdmissionFile: () => download(),
    isDownloadingAdmissionFile: isDownloading,
  };
};

/**
 * 1차 합격자 명단(엑셀, `FIRST_PASS_LIST`) 다운로드 훅.
 * `GET /first-pass` 는 서버가 요청 안에서 파일을 만들어 서명 URL 을 바로 돌려주므로 잡 폴링 없이 공용 `useFileDownload` 로 연다.
 * 조건은 받지 않아 화면 필터와 무관하다.
 */
export const useDownloadFirstPassList = () => {
  const { download, isDownloading } = useFileDownload("1차 합격자 명단", getFirstPassListFile);

  return {
    downloadFirstPassList: () => download(),
    isDownloadingFirstPassList: isDownloading,
  };
};

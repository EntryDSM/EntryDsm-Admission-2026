import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { createExport, type ExportJob, type ExportType, getExportJob } from "../apis";
import { notifyDownloadReady } from "../utils";

const POLL_INTERVAL_MS = 2_000;
/** 수험표는 1차 합격자 수만큼 그려 한 파일로 묶고, 자기소개서 ZIP 은 지원자마다 PDF 를 렌더링하므로 넉넉히 기다린다. */
const MAX_WAIT_MS = 5 * 60 * 1000;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const isFinished = (job: ExportJob) => job.status === "COMPLETED" || job.status === "FAILED";

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
const runExport = async (type: ExportType): Promise<ExportJob> => {
  const { exportJobId } = await createExport({ type });
  return waitForExportJob(exportJobId);
};

/**
 * 관리자 파일 출력 공통 훅. 모든 출력물은 `POST /exports` 에 `{ type }` 만 보내 접수하는 비동기 잡이라(백엔드 #293)
 * 잡이 끝날 때까지 기다린 뒤, 완료면 서명된 downloadUrl 을 새 창으로 연다(팝업 차단 대비는 `notifyDownloadReady` 가 맡는다).
 * 대상 조건은 보내지 않는다 — 수험표는 서버가 1차 합격자 전체를 고르고, 나머지는 화면 필터와 무관하게 전체 지원자가 대상이다.
 * 접수 단계의 실패(1차 합격자가 없어 수험표를 만들 수 없는 409 `ADMISSION_TICKET_NO_TARGET` 등)는 서버 메시지를 그대로 보여준다.
 * 뮤테이션 에러는 QueryCache 에서 잡히지 않아 여기서 직접 토스트한다.
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

/** 지원자 점검표(엑셀, `APPLICATION_CHECKLIST`) 다운로드 훅 */
export const useDownloadChecklist = () => {
  const { download, isDownloading } = useExportDownload("APPLICATION_CHECKLIST", "지원자 점검표");

  return {
    downloadChecklist: download,
    isDownloadingChecklist: isDownloading,
  };
};

/** 1차 합격자 수험표 묶음(엑셀 한 파일, `ADMISSION_TICKET`) 다운로드 훅. 1차 합격자가 없으면 접수 단계에서 409 로 실패한다. */
export const useDownloadAdmissionTickets = () => {
  const { download, isDownloading } = useExportDownload("ADMISSION_TICKET", "수험표");

  return {
    downloadAdmissionTickets: download,
    isDownloadingAdmissionTickets: isDownloading,
  };
};

/** 전형 자료(전체 지원자 엑셀, `ADMISSION_FILE`) 다운로드 훅 */
export const useDownloadAdmissionFile = () => {
  const { download, isDownloading } = useExportDownload("ADMISSION_FILE", "전형 자료");

  return {
    downloadAdmissionFile: download,
    isDownloadingAdmissionFile: isDownloading,
  };
};

/** 1차 합격자 명단(엑셀, `FIRST_PASS`) 다운로드 훅 */
export const useDownloadFirstPassList = () => {
  const { download, isDownloading } = useExportDownload("FIRST_PASS", "1차 합격자 명단");

  return {
    downloadFirstPassList: download,
    isDownloadingFirstPassList: isDownloading,
  };
};

/** 자기소개서·학업계획서 PDF 묶음(ZIP, `ESSAYS`) 다운로드 훅. 미작성 항목은 서버가 빼고 담는다. */
export const useDownloadEssays = () => {
  const { download, isDownloading } = useExportDownload("ESSAYS", "자기소개서·학업계획서");

  return {
    downloadEssays: download,
    isDownloadingEssays: isDownloading,
  };
};

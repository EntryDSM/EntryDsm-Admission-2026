import { http } from "./http";
import type {
  AdmissionFileExportJob,
  CreateExportPayload,
  CreateExportResult,
  ExportJob,
  FileDownloadLink,
} from "./types";

const EXPORTS_ENDPOINT = "/api/v11/admin/exports";
const ADMISSION_FILE_ENDPOINT = "/api/v11/admin/admission-file";
const FIRST_PASS_ENDPOINT = "/api/v11/admin/first-pass";

/**
 * 내보내기 잡 접수 (202 Accepted). 실제 생성(수험표 ZIP / 지원자 목록 엑셀)은 서버가 비동기로 진행하므로
 * `getExportJob` 으로 상태를 조회한다. `filter` 를 생략하면 전체 지원자를 대상으로 한다.
 */
export const createExport = (payload: CreateExportPayload) => http.post<CreateExportResult>(EXPORTS_ENDPOINT, payload);

/** 내보내기 잡 조회. `COMPLETED` 면 서명된 `downloadUrl`(기본 15분 유효)이 함께 내려온다. */
export const getExportJob = (exportJobId: string) => http.get<ExportJob>(`${EXPORTS_ENDPOINT}/${exportJobId}`);

/**
 * 전형 자료(전체 지원자 엑셀, `ADMISSION_FILE`) 내보내기 접수. GET 이지만 서버가 잡을 만들어 `jobId` 를 돌려주고,
 * 실제 생성은 다른 내보내기와 같이 비동기라 `getExportJob(jobId)` 로 완료를 기다린다. 조건은 받지 않는다(전체 지원자).
 */
export const createAdmissionFileExport = () => http.get<AdmissionFileExportJob>(ADMISSION_FILE_ENDPOINT);

/**
 * 1차 합격자 명단(3열 엑셀, `FIRST_PASS_LIST`) 다운로드 링크. 서버(`FirstPassFileService`)가 요청 안에서 파일을 만들어
 * 서명 URL 을 바로 돌려주므로 잡 폴링이 없다. 조건은 받지 않으며, 1차 합격자가 없어도 빈 명단으로 성공한다(생성 실패는 500).
 */
export const getFirstPassListFile = () => http.get<FileDownloadLink>(FIRST_PASS_ENDPOINT);

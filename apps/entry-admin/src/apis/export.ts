import { http } from "./http";
import type { CreateExportPayload, CreateExportResult, ExportJob } from "./types";

const EXPORTS_ENDPOINT = "/api/v11/admin/exports";

/**
 * 내보내기 잡 접수 (202 Accepted). 실제 생성(수험표 ZIP / 지원자 목록 엑셀)은 서버가 비동기로 진행하므로
 * `getExportJob` 으로 상태를 조회한다. `filter` 를 생략하면 전체 지원자를 대상으로 한다.
 */
export const createExport = (payload: CreateExportPayload) => http.post<CreateExportResult>(EXPORTS_ENDPOINT, payload);

/** 내보내기 잡 조회. `COMPLETED` 면 서명된 `downloadUrl`(기본 15분 유효)이 함께 내려온다. */
export const getExportJob = (exportJobId: string) => http.get<ExportJob>(`${EXPORTS_ENDPOINT}/${exportJobId}`);

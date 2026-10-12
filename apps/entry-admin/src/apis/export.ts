import { http } from "./http";
import type { CreateExportPayload, CreateExportResult, ExportJob } from "./types";

const EXPORTS_ENDPOINT = "/api/v11/admin/exports";

/** 파일 생성 잡을 접수한다. 생성은 비동기라 `getExportJob` 으로 완료를 확인한다. */
export const createExport = (payload: CreateExportPayload) => http.post<CreateExportResult>(EXPORTS_ENDPOINT, payload);

export const getExportJob = (exportJobId: string) => http.get<ExportJob>(`${EXPORTS_ENDPOINT}/${exportJobId}`);

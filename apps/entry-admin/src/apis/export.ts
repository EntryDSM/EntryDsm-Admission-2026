import { http } from "./http";
import type { CreateExportPayload, CreateExportResult, ExportJob } from "./types";

const EXPORTS_ENDPOINT = "/api/v11/admin/exports";

/**
 * 내보내기 잡 접수 (202 Accepted). 관리자 파일 출력(수험표 묶음·1차 합격자 명단·전형 자료·지원자 점검표·자기소개서 ZIP)은
 * 전부 이 API 에 `{ type }` 만 보내 접수하고(백엔드 #293), 실제 생성은 서버가 비동기로 진행하므로 `getExportJob` 으로 상태를 조회한다.
 * 대상 조건은 받지 않는다 — 수험표는 서버가 1차 합격자 전체를 고르고, 나머지는 전체 지원자가 대상이다.
 * 수험표(`ADMISSION_TICKET`)는 1차 합격자가 없으면 접수하지 않고 409 `ADMISSION_TICKET_NO_TARGET` 로 실패한다.
 */
export const createExport = (payload: CreateExportPayload) => http.post<CreateExportResult>(EXPORTS_ENDPOINT, payload);

/** 내보내기 잡 조회. `COMPLETED` 면 서명된 `downloadUrl`(기본 15분 유효)이 함께 내려온다. */
export const getExportJob = (exportJobId: string) => http.get<ExportJob>(`${EXPORTS_ENDPOINT}/${exportJobId}`);

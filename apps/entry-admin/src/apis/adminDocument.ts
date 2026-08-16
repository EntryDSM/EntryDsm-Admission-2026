import { http } from "./http";
import type { AdminDocumentJob } from "./types";

// 이 파일의 엔드포인트만 명세상 `v1` 경로다(다른 admin API 는 `v11`).

/** 지원서 점검표 생성 잡 조회 (완료 시 downloadUrl 포함) */
export const getApplicationChecklist = () => http.get<AdminDocumentJob>("/api/v1/admin/application-checklist");

/** 수험표 일괄 생성 잡 조회 (완료 시 downloadUrl 포함) */
export const getAdmissionTicketJobs = () => http.get<AdminDocumentJob>("/api/v1/admin/admission-ticket-jobs");

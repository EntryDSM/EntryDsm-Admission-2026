import { http } from "./http";
import type { DownloadedFile } from "./http";

const ESSAYS_ENDPOINT = "/api/v11/admin/essays";

/**
 * 서버가 `Content-Disposition` 으로 주는 파일명과 같다(백엔드 `EssayController`).
 * 게이트웨이 CORS 가 노출하는 응답 헤더는 `X-Trace-Id` 뿐이라 브라우저에서는 그 헤더를 못 읽으므로 이 값을 쓴다.
 */
export const ESSAYS_ARCHIVE_FILE_NAME = "자기소개서_학업계획서.zip";

/**
 * 지원자 전원의 자기소개서·학업계획서 PDF 를 만드는 동안 기다릴 시간.
 * 지원자마다 configuration 서비스에 gRPC 로 PDF 를 렌더링해 스트리밍하므로 공용 타임아웃(30초)으로는 모자란다.
 */
const ESSAYS_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * 자기소개서·학업계획서 ZIP 다운로드(`GET /api/v11/admin/essays`, 백엔드 #284).
 * 다른 출력물과 달리 서명 URL 도 내보내기 잡도 없이 ZIP 본문(`application/zip`)을 그대로 스트리밍한다.
 * 지원자마다 서식 3 PDF 를 `{수험번호|지원자ID}_{이름}_자기소개서.pdf`·`…_학업계획서.pdf` 로 담고 미작성 항목은 뺀다.
 * 조건은 받지 않으며(전체 지원자), 대상이 없거나 전부 미작성이면 엔트리 없는 빈 ZIP 을 200 으로 준다.
 * 시작 전 실패(APPLICANT_NOT_FOUND 404 · ESSAY_GENERATION_FAILED 500)는 JSON 봉투로, 스트리밍 도중 실패는 끊긴 응답으로 온다.
 */
export const getEssaysArchive = (): Promise<DownloadedFile> =>
  http.getFile(ESSAYS_ENDPOINT, { signal: AbortSignal.timeout(ESSAYS_TIMEOUT_MS) });

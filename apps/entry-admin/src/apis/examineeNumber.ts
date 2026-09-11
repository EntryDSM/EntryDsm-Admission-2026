import { http } from "./http";
import type { ExamineeNumberIssueResult } from "./types";

const EXAMINEE_NUMBERS_ENDPOINT = "/api/v11/admin/examinee-numbers";

/**
 * 수험번호 일괄 발급. 요청 본문 없이 호출하며, 발급 대상 전체에 대해 발급/건너뜀 집계를 반환한다(200).
 * 명세의 에러 코드 표(INVALID_CREDENTIALS 등)는 로그인 API 것이 그대로 붙어 있어, 이 API 고유 에러 코드는 미확정이다.
 */
export const issueExamineeNumbers = () => http.post<ExamineeNumberIssueResult>(`${EXAMINEE_NUMBERS_ENDPOINT}/issue`);

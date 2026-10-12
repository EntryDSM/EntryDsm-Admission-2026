import { http } from "./http";
import type { ExamineeNumberIssueResult } from "./types";

const EXAMINEE_NUMBERS_ENDPOINT = "/api/v11/admin/examinee-numbers";

/** 발급 대상 전체에 수험번호를 발급한다. 이미 발급된 지원자는 건너뛴다. */
export const issueExamineeNumbers = () => http.post<ExamineeNumberIssueResult>(`${EXAMINEE_NUMBERS_ENDPOINT}/issue`);

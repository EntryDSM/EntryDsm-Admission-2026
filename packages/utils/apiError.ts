/** 백엔드 에러 본문에서 꺼낸 코드·메시지. 본문 모양에 따라 둘 다 없을 수 있다. */
export interface ApiErrorInfo {
  code?: string;
  message?: string;
}

const asString = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);

/**
 * 서비스마다 다른 에러 본문 모양을 하나로 읽는다.
 * - admin·application·configuration·identity 등: `{ success: false, error: { code, message } }`
 * - 게이트웨이(인증·CSRF·서킷·타임아웃 등): `{ status, error: "CSRF_INVALID", traceId }` — `error` 가 코드 문자열이고 메시지가 없다
 * - notification: `{ status, message, code }` — 최상위에 둔다
 */
export const readApiError = (body: unknown): ApiErrorInfo => {
  if (!body || typeof body !== "object") {
    return {};
  }

  const { error, code, message } = body as Record<string, unknown>;
  if (typeof error === "string") {
    return { code: asString(error) };
  }

  if (error && typeof error === "object") {
    const detail = error as Record<string, unknown>;
    return { code: asString(detail.code), message: asString(detail.message) };
  }

  return { code: asString(code), message: asString(message) };
};

/** 서버가 한국어 메시지를 주지 않는 에러 코드(게이트웨이·notification·application)의 안내 문구 */
const API_ERROR_CODE_MESSAGES: Record<string, string> = {
  AUTH_UNAUTHORIZED: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  CSRF_INVALID: "보안 확인이 만료되었습니다. 다시 시도해 주세요.",
  IDENTITY_UNAVAILABLE: "로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  CIRCUIT_OPEN: "서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해 주세요.",
  BAD_GATEWAY: "서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해 주세요.",
  GATEWAY_TIMEOUT: "서버 응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요.",
  REQUEST_TOO_LARGE: "요청 크기가 너무 큽니다. 첨부 파일 크기를 확인해 주세요.",
  ROUTE_NOT_FOUND: "요청한 기능을 찾을 수 없습니다.",
  NOTIFICATION_NOT_FOUND: "공지사항을 찾을 수 없습니다.",
  APPLICATION_PERIOD_CLOSED: "원서 접수 기간이 아닙니다.",
  SCHEDULE_SERVICE_UNAVAILABLE: "원서 접수 기간을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  SENSITIVE_CONSENT_REQUIRED: "사회통합전형은 민감정보 처리 동의가 필요합니다.",
};

const getStatusMessage = (status: number) => {
  if (status === 400) return "요청 내용이 올바르지 않습니다. 입력한 내용을 확인해 주세요.";
  if (status === 401) return "로그인이 만료되었습니다. 다시 로그인해 주세요.";
  if (status === 403) return "접근 권한이 없습니다.";
  if (status === 404) return "요청한 데이터를 찾을 수 없습니다.";
  if (status === 409) return "현재 상태에서는 처리할 수 없는 요청입니다.";
  if (status === 413) return "요청 크기가 너무 큽니다. 첨부 파일 크기를 확인해 주세요.";
  if (status === 429) return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  if (status >= 500) return "서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  return "요청 처리 중 오류가 발생했습니다.";
};

const HANGUL = /[가-힣]/;
// Spring 검증 원문. 입력값(rejected value)이 그대로 들어 있어 한글이 섞여도 보여주면 안 된다.
const FRAMEWORK_MESSAGE = /rejected value|Validation failed|Field error/i;

const isUserFacingMessage = (message?: string): message is string =>
  !!message && HANGUL.test(message) && !FRAMEWORK_MESSAGE.test(message);

/**
 * 사용자에게 보여줄 에러 문구. 서버가 준 한국어 메시지 → 코드별 문구 → 상태 코드별 문구 순으로 고른다.
 * notification·application 의 영문 메시지는 내부용(예: "invalid request")이고 Spring 검증 원문에는 입력값까지 들어 있어 보여주지 않는다.
 */
export const getApiErrorMessage = (status: number, info: ApiErrorInfo) =>
  (isUserFacingMessage(info.message) ? info.message : undefined) ??
  (info.code ? API_ERROR_CODE_MESSAGES[info.code] : undefined) ??
  getStatusMessage(status);

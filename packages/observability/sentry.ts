import * as Sentry from "@sentry/react";
import type { Breadcrumb, ErrorEvent, Log } from "@sentry/react";
import { redactClientLog } from "@entry/utils";

export { captureException, reactErrorHandler, setUser } from "@sentry/react";

/** 이벤트 `app` 태그 값. admin·monitoring 은 Sentry 프로젝트를 공유하므로 이 태그로 구분한다 (docs/OBSERVABILITY.md 1절). */
export type SentryApp = "entry-user" | "entry-auth" | "entry-admin" | "entry-admission" | "entry-monitoring";

export interface InitSentryOptions {
  app: SentryApp;
  /** `VITE_SENTRY_DSN`. 비어 있으면 SDK 를 켜지 않는다 — 로컬 개발·PR 프리뷰 빌드의 기본 상태. */
  dsn: string | undefined;
  /** `VITE_SENTRY_ENVIRONMENT` — `production` | `staging`. 없으면 `development`. */
  environment: string | undefined;
  /** `VITE_SENTRY_RELEASE` — vite define 으로 주입되는 `<app>@<commit sha>` (vite.ts). */
  release: string | undefined;
}

// 브라우저 확장 프로그램이 페이지에 주입한 스크립트의 오류는 우리 코드가 아니므로 버린다.
const EXTENSION_URLS = [
  /^chrome-extension:\/\//i,
  /^moz-extension:\/\//i,
  /^safari(-web)?-extension:\/\//i,
  /^chrome:\/\//i,
];

// redactClientLog 는 절대 URL 의 쿼리만 지우므로, 상대 경로(`/pass/result?mdl_tkn=…`)용으로 쿼리·프래그먼트를 먼저 뗀다.
const stripQuery = (url: string) => url.replace(/[?#].*$/, "");
const redactText = (text: string) => redactClientLog(text);
const redactUrl = (url: string) => redactClientLog(stripQuery(url));

const URL_DATA_KEYS = new Set(["url", "from", "to"]);

/** 브레드크럼(fetch·console·navigation·ui.click)은 문자열·숫자만 남기고 마스킹한다. 객체 인자는 통째로 버린다. */
const redactBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb => {
  if (breadcrumb.message) {
    breadcrumb.message = redactText(breadcrumb.message);
  }

  if (breadcrumb.data) {
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(breadcrumb.data)) {
      if (typeof value === "string") {
        data[key] = URL_DATA_KEYS.has(key) ? redactUrl(value) : redactText(value);
      } else if (typeof value === "number" || typeof value === "boolean") {
        data[key] = value;
      }
      // 그 외(console 원본 인자 배열 등 객체)는 응답 본문·폼 값이 섞일 수 있어 전송하지 않는다.
    }
    breadcrumb.data = data;
  }

  return breadcrumb;
};

/**
 * 오류 이벤트의 메시지·예외 값·요청 URL 을 마스킹한다. 쿠키·본문은 dataCollection 으로 애초에 수집하지 않는다.
 * 헤더는 httpContext 통합이 붙이는 것 중 브라우저·OS 판별용 User-Agent 만 남긴다 (Referer 는 이전 페이지 URL 을 담을 수 있다).
 */
const redactEvent = (event: ErrorEvent): ErrorEvent => {
  if (event.message) {
    event.message = redactText(event.message);
  }

  for (const exception of event.exception?.values ?? []) {
    if (exception.value) {
      exception.value = redactText(exception.value);
    }
  }

  if (event.request?.url) {
    event.request.url = redactUrl(event.request.url);
  }

  if (event.request?.headers) {
    const userAgent = event.request.headers["User-Agent"];
    event.request.headers = userAgent ? { "User-Agent": userAgent } : undefined;
  }

  return event;
};

/** Sentry Logs(console.error / console.warn) 의 메시지와 문자열 속성을 마스킹한다. */
const redactLog = (log: Log): Log => {
  log.message = redactText(log.message);

  if (log.attributes) {
    const attributes: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(log.attributes)) {
      attributes[key] = typeof value === "string" ? redactText(value) : value;
    }
    log.attributes = attributes as Log["attributes"];
  }

  return log;
};

/**
 * Sentry 초기화. 각 앱의 `src/instrument.ts` 가 main.tsx 최상단에서 호출한다.
 * 결정 사항(에러 + Logs 만, Tracing·Replay 없음, 최소 수집)은 docs/OBSERVABILITY.md 참고.
 * @returns SDK 를 켰는지 여부
 */
export const initSentry = ({ app, dsn, environment, release }: InitSentryOptions): boolean => {
  if (!dsn) {
    return false;
  }

  Sentry.init({
    dsn,
    environment: environment || "development",
    release,
    initialScope: { tags: { app } },
    // 지원자(미성년자) 개인정보가 흐르는 서비스라 SDK 기본 수집 항목을 전부 끈다. 이벤트 본문은 아래 before* 훅이 마스킹한다.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      urlQueryParams: false,
      httpBodies: [],
    },
    // console.error / console.warn 을 Sentry Logs 로 보낸다 (admission 의 인하우스 수집기와 같은 기준).
    enableLogs: true,
    integrations: [Sentry.consoleLoggingIntegration({ levels: ["error", "warn"] })],
    beforeSend: redactEvent,
    beforeBreadcrumb: redactBreadcrumb,
    beforeSendLog: redactLog,
    denyUrls: EXTENSION_URLS,
  });

  return true;
};

export type ApiErrorSource = "query" | "mutation" | "fetch";

export interface ReportApiErrorOptions {
  /** 어디서 잡았는지 — react-query 캐시(query / mutation) 또는 fetch 래퍼 */
  source: ApiErrorSource;
  /** react-query 키 배열 또는 요청 경로. 이슈 분리용 라벨로만 쓰며 쿼리스트링·숫자 세그먼트는 지운다. */
  target?: unknown;
  /** 정상 흐름으로 간주해 보고하지 않을 HTTP 상태 코드 (예: 비로그인 방문자의 `/accounts/me` 401). 5xx·네트워크 오류에는 영향이 없다. */
  ignoreStatuses?: readonly number[];
}

/**
 * react-query 쿼리/뮤테이션의 `meta.sentryIgnoreStatuses`(숫자 배열)를 읽는다. 형식이 다르면 빈 배열.
 * 각 앱 queryClient 가 `reportApiError` 의 `ignoreStatuses` 로 넘긴다 (docs/OBSERVABILITY.md 2절).
 */
export const getSentryIgnoreStatuses = (meta: Record<string, unknown> | undefined): number[] => {
  const value = meta?.sentryIgnoreStatuses;
  return Array.isArray(value) ? value.filter((status): status is number => typeof status === "number") : [];
};

// 각 앱의 HttpError / IdentityApiError 는 status 필드를 가진다. 공용 타입이 없으므로 구조로 판별한다.
const getHttpStatus = (error: unknown): number | undefined => {
  if (!(error instanceof Error)) {
    return undefined;
  }
  const { status } = error as Error & { status?: unknown };
  return typeof status === "number" ? status : undefined;
};

// 경로의 식별자 세그먼트(숫자만 · 4자리 이상 숫자 포함 · UUID 류). `v11` 같은 버전 세그먼트는 남긴다.
const ID_SEGMENT = /\/(?:\d+|[^/]*\d{4,}[^/]*|[0-9a-f-]{16,})(?=\/|$)/gi;

// 이슈 그룹 라벨: 쿼리 키는 첫 원소(도메인)만, 경로는 쿼리를 제거하고 식별자 세그먼트를 :id 로 치환한다.
const describeTarget = (target: unknown): string => {
  const raw = Array.isArray(target) ? target[0] : target;
  if (typeof raw !== "string") {
    return raw === undefined || raw === null ? "unknown" : String(raw);
  }
  return redactText(stripQuery(raw).replace(ID_SEGMENT, "/:id")).slice(0, 200);
};

/**
 * API 실패를 Sentry 로 보고한다. 4xx 도 모두 보내되(팀 결정) 5xx·네트워크 오류와 구분되도록 warning 레벨로 낮춘다.
 * 같은 http 래퍼에서 던져져 스택이 같은 오류들이 한 이슈로 뭉치지 않게 상태 코드·대상별로 fingerprint 를 나눈다.
 */
export const reportApiError = (error: unknown, { source, target, ignoreStatuses }: ReportApiErrorOptions): void => {
  // 화면 이탈로 취소된 요청은 오류가 아니다.
  if (error instanceof DOMException && error.name === "AbortError") {
    return;
  }

  const status = getHttpStatus(error);

  // 호출부가 정상 흐름으로 선언한 상태 코드(예: 비로그인 방문자의 401)는 보고하지 않는다.
  if (status !== undefined && ignoreStatuses?.includes(status)) {
    return;
  }

  const statusLabel = status === undefined ? "network" : String(status);
  const label = describeTarget(target);

  Sentry.captureException(error, {
    level: status !== undefined && status < 500 ? "warning" : "error",
    tags: { "api.source": source, "http.status": statusLabel },
    extra: { target: label },
    fingerprint: ["{{ default }}", source, statusLabel, label],
  });
};

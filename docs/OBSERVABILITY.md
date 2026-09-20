# 관측성 — Sentry 오류 수집 · Logs

프론트엔드 5개 앱의 **런타임 오류와 console 로그를 Sentry 로 수집**한다. 초기화 코드는 공용 패키지 `@entry/observability` 한 곳에 있고,
각 앱은 `src/instrument.ts` 한 파일로 붙는다. 켜고 끄는 것은 **Worker 별 빌드 변수(`VITE_SENTRY_DSN`)** 로만 결정되며,
값이 비어 있는 로컬 개발·PR 프리뷰 빌드에서는 SDK 가 아예 초기화되지 않는다. 이슈 #161(관측성 스택 추가)의 일부. 배포 절차 자체는 [DEPLOYMENT.md](./DEPLOYMENT.md) 참고.

## 1. 결정 요약

| 항목            | 결정                                                                                                                                                         | 근거                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Sentry 프로젝트 | **4개** — user · admission · auth 각 1개, **admin + monitoring 공용 1개**(이벤트 `app` 태그로 구분)                                                          | 지원자 대면 앱만 이슈·알림·쿼터를 세밀하게 분리, 내부용 2개는 합쳐 관리 부담을 줄임     |
| DSN · 환경 주입 | 빌드 변수 `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT`(`production` / `staging`) — 코드에 하드코딩하지 않음                                                  | 기존 `VITE_*` 주입 관례(DEPLOYMENT.md 4절)와 동일, prod/stag 값 분리, DSN 비면 자동 off |
| 코드 위치       | 공용 패키지 **`packages/observability`**(`@entry/observability`) — `@sentry/react` 의존도 이 패키지가 소유                                                   | 5개 앱이 같은 설정을 쓰므로 한 곳에서 관리                                              |
| 수집 범위       | **오류 모니터링 + Sentry Logs(console.error / warn)** — Tracing · Session Replay 는 **도입하지 않음**                                                        | 번들·수집 데이터 최소화. 필요해지면 `sentry.ts` 한 곳만 수정 (9절)                      |
| 개인정보        | SDK `dataCollection` 전부 off(사용자 정보·쿠키·헤더·쿼리스트링·HTTP 본문) + 팀 공용 `redactClientLog` 적용                                                   | 지원자(미성년자) 개인정보가 흐르는 서비스                                               |
| 사용자 식별     | `Sentry.setUser({ id: 내부 userId })` — 이름·연락처·IP 는 넣지 않음. auth 앱은 로그인 전이라 미설정                                                          | 같은 사용자의 반복 오류·영향 범위 파악용. 해시 없이 내부 식별자 원문 사용(팀 결정)      |
| API 오류        | react-query 쿼리·뮤테이션 실패와 auth 의 fetch 실패를 **4xx 포함 전부** 보고 (4xx 는 `warning` 레벨, 정상 흐름인 코드는 `meta.sentryIgnoreStatuses` 로 제외) | 백엔드 응답 오류를 프론트 관점에서 빠짐없이 보려는 팀 결정. 레벨로 노이즈를 구분        |
| 소스맵          | **업로드하지 않음** (스택은 minified) — vite 플러그인·`SENTRY_AUTH_TOKEN` 미도입                                                                             | 빌드 시크릿 관리 부담을 지금은 지지 않음. 추후 과제(9절)                                |
| release         | `<앱 이름>@<커밋 SHA 7자>` — Workers Builds 의 `WORKERS_CI_COMMIT_SHA`, 로컬은 `git rev-parse` 폴백                                                          | 배포 단위 = 커밋. 릴리스별 신규/회귀 이슈 추적                                          |
| 로컬 개발       | `.env` 에 DSN 이 없으면 꺼짐(기본). 확인이 필요할 때만 DSN 을 넣어 `development` 환경으로 켠다                                                               | 개발 노이즈가 쿼터를 먹지 않게                                                          |
| 오류 화면       | 변경 없음 — Sentry 연결만. react-router 기본 오류 화면(영문)은 별도 과제                                                                                     | 이번 작업 범위를 관측성으로 한정                                                        |

## 2. 동작 원리

### 2.1 초기화 순서

- 각 앱 `src/main.tsx` 는 **가장 먼저 `import "./instrument";`** 를 둔다. ES 모듈은 import 순서대로 평가되므로 `instrument.ts` 와 그 의존(`@entry/observability` → `@sentry/react`)이
  `App`·`@entry/ui` 보다 먼저 실행된다. 덕분에 모듈 평가 시점에 나는 오류(예: `@entry/ui` env 모듈이 필수 `VITE_*` 누락으로 던지는 에러)도 잡힌다.
- `instrument.ts` 는 `initSentry({ app, dsn, environment, release })` 를 호출한다. 값은 전부 `import.meta.env` 에서 읽고, **DSN 이 비어 있으면 `Sentry.init` 을 호출하지 않고 끝난다.**
- `environment` 가 비면 `development` 로 기록된다. stag 도 vite 프로덕션 빌드(`import.meta.env.PROD`)라 `MODE` 로는 prod/stag 를 구분할 수 없어 변수를 따로 둔다.

### 2.2 무엇이 잡히는가

| 경로                           | 수집 방법                                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 처리되지 않은 예외 · rejection | SDK 기본 `globalHandlers` 통합(`window.onerror`, `unhandledrejection`)                                                                                                 |
| React 렌더 오류                | React 19 `createRoot(el, { onCaughtError, onUncaughtError, onRecoverableError })` 에 `Sentry.reactErrorHandler()` — react-router 기본 errorElement 가 잡는 오류도 포함 |
| API 실패 (react-query 앱 4개)  | 각 앱 `apis/queryClient.ts` 의 `QueryCache` / `MutationCache` `onError` → `reportApiError` (재시도가 모두 끝난 뒤 1회)                                                 |
| API 실패 (auth, fetch 직접)    | `apis/identity.ts` 의 `request()` 가 던지기 직전에 `reportApiError`                                                                                                    |
| console.error / console.warn   | `consoleLoggingIntegration({ levels: ["error", "warn"] })` → **Sentry Logs**(이슈가 아니라 로그 스트림)                                                                |
| 브레드크럼                     | SDK 기본(fetch·navigation·click·console) — 3절 규칙으로 마스킹 후 첨부                                                                                                 |
| 세션(crash-free)               | SDK 기본 `browserSession` — release·environment 별 세션 수만 보낸다(개인정보 없음)                                                                                     |

- `reportApiError` 는 `HttpError`/`IdentityApiError` 의 `status` 를 읽어 태그 `http.status`(없으면 `network`), `api.source`(`query` / `mutation` / `fetch`)를 붙인다.
  **4xx 는 `warning`, 5xx·네트워크 오류는 `error`** 레벨이다. 화면 이탈로 취소된 요청(`AbortError`)은 보내지 않는다.
- 이슈 그룹핑: 같은 http 래퍼에서 던져진 오류는 스택이 같아 한 이슈로 뭉치므로 `fingerprint = [기본, source, status, target]` 으로 나눈다.
  `target` 은 쿼리 키의 첫 원소(도메인 이름) 또는 요청 경로다. 경로는 쿼리스트링을 제거하고, 숫자만이거나 4자리 이상 숫자·UUID 가 든 세그먼트를 `:id` 로 바꾼다 (`v11` 같은 버전 세그먼트는 유지).
- admin·monitoring 의 전역 토스트(`meta.suppressGlobalErrorToast`)는 화면 처리만 끄고 **보고는 항상** 한다.
- 정상 흐름인 상태 코드는 쿼리/뮤테이션에 `meta: { sentryIgnoreStatuses: [401] }` 를 붙여 **그 코드만** 제외한다(5xx·네트워크 오류는 계속 보고). 4개 앱의 queryClient 가 모두 이 meta 를 인식하며, 현재는 entry-user 의 `/accounts/me` 조회 3곳(AppLayout·Main·MyPage)이 비로그인 방문자의 401 을 제외한다.
- 브라우저 확장 프로그램 URL(`chrome-extension://` 등)에서 난 오류는 `denyUrls` 로 버린다. `Script error.`·`ResizeObserver loop` 류는 SDK 기본 필터가 이미 버린다.
- admission 의 인하우스 수집기(`@entry/hooks` `useSessionMonitoring` → 백엔드 `/api/monitor/v11/collect/client-log`)는 **그대로 병행**한다. 같은 window 오류·console 로그가 양쪽에 남는 것은 의도된 상태이며 통합은 추후 과제(9절).

## 3. 개인정보 처리

| 층위                 | 설정                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SDK `dataCollection` | `userInfo: false`(IP 등 자동 채움 없음), `cookies: false`, `httpHeaders: false`, `urlQueryParams: false`, `httpBodies: []`                                                                              |
| `beforeSend`         | 오류 메시지·예외 값·`request.url` 에 `redactClientLog` 적용, URL 은 쿼리·프래그먼트를 먼저 제거. 요청 헤더는 브라우저·OS 판별용 `User-Agent` 만 남기고 제거(Referer 는 이전 페이지 URL 을 담을 수 있음) |
| `beforeBreadcrumb`   | 문자열·숫자·불리언만 남기고 문자열은 마스킹, `url`/`from`/`to` 는 쿼리 제거. **console 원본 인자 배열 등 객체는 통째로 버린다**                                                                         |
| `beforeSendLog`      | Logs 의 메시지와 문자열 속성에 `redactClientLog` 적용                                                                                                                                                   |
| `setUser`            | `{ id: 내부 userId }` 만. 로그아웃·401 로 계정 정보가 사라지면 `null` 로 해제                                                                                                                           |

- `redactClientLog`(`packages/utils/redactClientLog.ts`, 인하우스 수집기와 **같은 함수**)는 URL 자격증명·절대 URL 의 쿼리·Bearer/Basic·JWT·`password|token|email|phone|userId|applicantId` 류 키 값·이메일·전화번호·UUID 를 `[REDACTED]` 로 바꾼다.
  규칙을 바꾸면 양쪽에 동시에 적용되고, 테스트는 `bun test packages/utils/redactClientLog.test.mjs`.
- **내부 userId 원문 사용의 한계**: 이름·연락처는 아니지만 DB 와 대조하면 개인이 특정된다. Sentry 프로젝트 멤버 권한을 최소로 유지하고, 필요해지면 `useSentryUser` 한 곳에서 해시로 바꿀 수 있다.
- Sentry 서버 측 **Data Scrubber**(프로젝트 Settings → Security & Privacy)도 기본 켬 상태를 유지한다. 클라이언트 마스킹이 1차, 서버 스크러버가 2차다.
- 보내지 않는 것: 요청/응답 본문, 쿠키, 헤더(브라우저·OS 판별용 `User-Agent` 는 예외), 쿼리스트링, IP, 폼 값, Session Replay(도입 안 함).

## 4. 코드 배치

| 파일                                                                         | 역할                                                                                                                  |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `packages/observability/sentry.ts`                                           | `initSentry`, 마스킹 훅, `reportApiError`, `@sentry/react` 재노출(`captureException`, `reactErrorHandler`, `setUser`) |
| `packages/observability/useSentryUser.ts`                                    | 계정 조회 결과의 `userId` 를 `user.id` 로 붙이는 훅                                                                   |
| `packages/observability/vite.ts`                                             | `sentryReleaseDefine(app)` — release 를 vite `define` 으로 주입 (4절)                                                 |
| `apps/*/src/instrument.ts`                                                   | 앱별 초기화 진입점 (`app` 이름만 다름)                                                                                |
| `apps/*/src/main.tsx`                                                        | `import "./instrument"` 최상단 + `createRoot` 오류 훅                                                                 |
| `apps/*/src/apis/queryClient.ts`                                             | QueryCache / MutationCache `onError` 보고 (admission·user 는 이번에 신설, main.tsx 의 인라인 QueryClient 대체)        |
| `apps/entry-auth/src/apis/identity.ts`                                       | fetch 래퍼 `request()` 에서 보고                                                                                      |
| `RequireAdmin` · `RequireAuth` · `RequireMonitoringAccess`, user `AppLayout` | `useSentryUser(account?.userId)` 호출 지점                                                                            |
| `packages/utils/redactClientLog.ts`(+ 테스트)                                | `packages/hooks` 에서 이동. `@entry/hooks` 도 여기서 import                                                           |
| `turbo.json` `build.env`                                                     | `WORKERS_CI_COMMIT_SHA` 추가 — release 가 바뀌면 빌드 캐시도 갈리게                                                   |

## 5. 빌드 변수와 release

`VITE_*` 값은 번들에 그대로 들어간다. DSN 은 비밀값이 아니므로(전송 주소일 뿐) 노출돼도 되지만, **Sentry Auth Token 같은 비밀은 절대 `VITE_` 로 넣지 말 것.**
Worker 10개(앱 5 × prod/stag) 각각의 Settings → Build → Variables 에 넣는다 (DEPLOYMENT.md 3~4절 절차와 동일).

| 변수                      | prod Worker (`main`)   | stag Worker (`develop`)                | 비고                                                  |
| ------------------------- | ---------------------- | -------------------------------------- | ----------------------------------------------------- |
| `VITE_SENTRY_DSN`         | 해당 앱 프로젝트의 DSN | **같은 DSN** (환경은 아래 변수로 구분) | 비우면 해당 Worker 빌드는 Sentry 꺼짐                 |
| `VITE_SENTRY_ENVIRONMENT` | `production`           | `staging`                              | 미설정 시 `development` 로 기록됨 — stag 에도 꼭 넣기 |

앱 ↔ 프로젝트 대응 (프로젝트 이름은 예시, 6절에서 만들 때 정한다):

| 앱               | Sentry 프로젝트 (예시 이름) | `app` 태그         |
| ---------------- | --------------------------- | ------------------ |
| entry-user       | `entry-user`                | `entry-user`       |
| entry-admission  | `entry-admission`           | `entry-admission`  |
| entry-auth       | `entry-auth`                | `entry-auth`       |
| entry-admin      | `entry-internal` (공용)     | `entry-admin`      |
| entry-monitoring | `entry-internal` (공용)     | `entry-monitoring` |

- **release 는 변수가 아니다.** 각 앱 `vite.config.ts` 가 `sentryReleaseDefine("<앱 이름>")` 으로 `import.meta.env.VITE_SENTRY_RELEASE` 를 빌드 시점에 박는다.
  값은 `<앱 이름>@<WORKERS_CI_COMMIT_SHA 앞 7자>` 이고, 로컬 빌드는 `git rev-parse --short=7 HEAD`, git 이 없으면 `local` 이다.
  `vite.config.ts` 는 Node 가 직접 로드하므로 `@entry/observability` 별칭 대신 `../../packages/observability/vite` 상대 경로로 import 한다.
- `WORKERS_CI_COMMIT_SHA` 는 Cloudflare Workers Builds 가 빌드 컨테이너에 넣어 주는 값이다. 이름이 바뀌면 `packages/observability/vite.ts` 와 `turbo.json` 두 곳을 고친다.

## 6. Sentry 프로젝트 생성·설정 절차 (계정 필요 — 직접 수행)

1. Sentry 조직에서 프로젝트를 **4개** 준비한다 (platform: React). 이미 만든 프로젝트 1개가 있으면 그것을 하나로 쓰고 3개를 추가한다.
2. 각 프로젝트 Settings → Client Keys (DSN) 에서 DSN 을 복사해 5절 표대로 Worker 10개의 빌드 변수에 넣는다. **변경 후 재빌드해야 반영된다.**
3. 프로젝트 Settings → Security & Privacy 에서 Data Scrubber·Use Default Scrubbers 가 켜져 있는지 확인한다.
4. (권장) Alerts → 프로젝트별로 "새 이슈 발생 시" 알림 규칙 하나씩. Logs 는 알림 대상이 아니다.
5. (권장) Settings → Quotas 에서 Errors·Logs 의 spike protection 을 켜 둔다 — 4xx 까지 보고하므로 백엔드 장애 시 급증할 수 있다.

## 7. 배포 후 검증 체크리스트 (stag 에서, 수동)

마스킹·태그·release·Logs 동작은 도입 시점에 로컬 가짜 수신기(DSN 을 `127.0.0.1` 로 향하게 한 auth 빌드)로 확인했다. 아래는 실제 Sentry 프로젝트를 연결한 뒤 stag 에서 볼 항목이다.

- [ ] 빌드 로그에 `VITE_SENTRY_DSN`·`VITE_SENTRY_ENVIRONMENT` 가 주입됐는지 (Worker 빌드 변수 화면 확인).
- [ ] 브라우저 콘솔에서 `setTimeout(() => { throw new Error("sentry smoke") })` 실행 → 해당 프로젝트에 이슈가 뜨고 태그 `app` · `environment: staging` · `release: <앱>@<sha>` 가 맞는지.
- [ ] 같은 이슈의 Request 항목에 **쿼리스트링·쿠키가 없고 헤더는 `User-Agent` 뿐인지**, 브레드크럼 fetch URL 에 쿼리가 없는지.
- [ ] `console.error("smoke log")` → Explore → Logs 에 로그가 오고 `console.log` 는 오지 않는지.
- [ ] 로그인 실패(틀린 비밀번호) → auth 프로젝트에 `api.source: fetch`, `http.status: 401`, 레벨 `warning` 이벤트.
- [ ] 로그인 후 user/admission 에서 오류 발생 시 이벤트의 User 가 `id` 만 있는지 (이메일·이름·IP 없음).
- [ ] admin·monitoring 은 공용 프로젝트에서 `app` 태그로 구분되는지.
- [ ] 로컬 `bun run dev` (DSN 없음) 에서 Network 탭에 `sentry` 요청이 전혀 없는지.

## 8. 유지보수 규칙

- **새 앱을 만들면**: `@entry/observability` 의존 추가 → `src/instrument.ts`(app 이름) → `main.tsx` 최상단 import + `createRoot` 오류 훅 → `vite.config.ts` 에 `define: sentryReleaseDefine("<앱>")`
  → react-query 를 쓰면 `apis/queryClient.ts` 패턴 → `.env.example` 두 변수 → Worker 빌드 변수 → Sentry 프로젝트(또는 공용) 결정 후 5절 표 갱신.
- DSN·환경을 코드에 하드코딩하지 않는다. `SentryApp` 타입에 앱 이름을 추가해야 `initSentry` 가 받는다.
- Tracing·Replay·추가 통합을 켜는 변경은 `sentry.ts` 한 곳에서 하되, **이 문서 1절과 3절을 같이 갱신**한다. Replay 는 개인정보 영향이 커서 별도 결정이 필요하다.
- 마스킹 규칙은 `packages/utils/redactClientLog.ts` 에서만 고치고 테스트를 추가한다. Sentry 쪽 훅에 규칙을 따로 쓰지 않는다.
- `setUser` 에 이름·이메일·전화번호를 넣지 않는다. 사용자 식별 방식 변경은 `useSentryUser` 한 곳.
- API 오류 레벨 정책(4xx `warning`)을 바꾸면 알림 규칙도 같이 본다.
- 어떤 상태 코드가 그 화면에서 정상 흐름이면 쿼리를 통째로 빼지 말고 `meta.sentryIgnoreStatuses` 로 그 코드만 제외한다.
- SDK 업그레이드는 `packages/observability/package.json` 에서만 한다. 루트 `package.json` 에 `@sentry/*` 를 두지 않는다.

## 9. 추후 과제

- **소스맵 업로드**: `@sentry/vite-plugin` + Workers Builds 빌드 시크릿 `SENTRY_AUTH_TOKEN`(+ `SENTRY_ORG`/`SENTRY_PROJECT`), `build.sourcemap: "hidden"` 으로 만들고 업로드 후 `.map` 삭제. 토큰이 없을 때 플러그인이 no-op 이어야 PR·로컬 빌드가 깨지지 않는다.
- Tracing(라우트 전환·fetch 스팬, `wrapCreateBrowserRouter`)·Session Replay 도입 여부 재검토.
- 알림(Slack 등) 규칙과 이슈 담당자 지정.
- 광고 차단기 우회용 `tunnel` — 현재 Worker 는 정적 자산 전용이라 프록시 스크립트가 없다. 별도 Worker 가 필요.
- admission 인하우스 클라이언트 로그 수집기와의 역할 정리(중복 수집 해소 또는 백엔드 수집기 폐지).
- react-router 기본 오류 화면을 `@entry/ui` `ErrorPage` 기반 한국어 화면으로 교체 (이번 작업에서 보류).
- `useSentryUser` 의 내부 userId 를 해시로 바꿀지 재검토.

## 참고

- Sentry React SDK: https://docs.sentry.io/platforms/javascript/guides/react/
- `dataCollection` 옵션: https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#dataCollection
- Sentry Logs (JavaScript): https://docs.sentry.io/platforms/javascript/guides/react/logs/
- React 19 오류 훅 연동: https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/
- Cloudflare Workers Builds 환경 변수: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/

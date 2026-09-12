# 배포 가이드 — Cloudflare Workers (prod / stag)

프론트엔드 5개 앱을 **정적 자산 전용 Cloudflare Worker**로 배포한다. 환경은 **prod(main)·stag(develop)** 2개로 분리되어
앱당 Worker 2개, **총 10개**다. Worker 설정(도메인·SPA fallback·환경 정의)은 각 앱의 `wrangler.jsonc`로 저장소에 커밋되어 있고,
빌드·배포는 **Workers Builds**(GitHub 연동)가 수행하므로 저장소에는 배포 워크플로우를 두지 않는다
(`.github/workflows/`에는 PR 검증용 build·lint 워크플로우만 유지).

## 1. 아키텍처 개요

```
push (main)    ─ Workers Builds ─ turbo 빌드 → wrangler deploy --env=""  → prod Worker 5개
push (develop) ─ Workers Builds ─ turbo 빌드 → wrangler deploy -e stag   → stag Worker 5개
                                        └ apps/{app}/dist 업로드, 커스텀 도메인 자동 연결 (같은 계정 zone)
```

| 앱               | prod 도메인 (`main`)       | stag 도메인 (`develop`)         | Worker 이름 (prod / stag)                    |
| ---------------- | -------------------------- | ------------------------------- | -------------------------------------------- |
| entry-user       | `entrydsm.hs.kr`           | `stag.entrydsm.hs.kr`           | `entry-user` / `entry-user-stag`             |
| entry-auth       | `auth.entrydsm.hs.kr`      | `stag-auth.entrydsm.hs.kr`      | `entry-auth` / `entry-auth-stag`             |
| entry-admin      | `admin.entrydsm.hs.kr`     | `stag-admin.entrydsm.hs.kr`     | `entry-admin` / `entry-admin-stag`           |
| entry-admission  | `admission.entrydsm.hs.kr` | `stag-admission.entrydsm.hs.kr` | `entry-admission` / `entry-admission-stag`   |
| entry-monitoring | `monitor.entrydsm.hs.kr`   | `stag-monitor.entrydsm.hs.kr`   | `entry-monitoring` / `entry-monitoring-stag` |

- stag 도메인을 `stag.entrydsm.hs.kr`의 하위(`auth.stag.…`)가 아니라 **한 단계 서브도메인(`stag-auth.…`)** 으로 둔 이유:
  2단계 서브도메인은 기본 와일드카드 인증서(`*.entrydsm.hs.kr`) 범위를 벗어나고, 쿠키 `Domain=.entrydsm.hs.kr` 공유 규칙도 그대로 쓸 수 있기 때문.

## 2. wrangler.jsonc — 저장소가 들고 있는 설정

앱마다 같은 구조다. 도메인·서빙 동작이 코드로 관리되므로 대시보드에서 손댈 것이 거의 없다.

- **최상위 = prod**, `env.stag` = 스테이징. stag는 `name`(`-stag` 접미사)과 `routes`(stag 도메인)만 다르고 나머지(assets 등)는 상속한다.
- `assets.directory: "./dist"` — 서버 스크립트 없는 **정적 자산 전용 Worker**. 빌드 산출물을 그대로 업로드한다.
- `assets.not_found_handling: "single-page-application"` — 자산에 매칭되지 않는 요청은 `index.html`(200)로 응답한다. 모든 앱이 react-router(BrowserRouter)를 쓰므로 딥링크 새로고침이 이걸로 동작한다. **`404.html`을 dist에 넣지 말 것.**
- `routes[].custom_domain: true` — 배포 시 해당 도메인의 DNS 레코드와 TLS 인증서가 자동 생성·연결된다.
  ⚠️ 이전 AWS 배포 시절의 **CloudFront(`dxxxx.cloudfront.net`) 대상 CNAME 레코드가 남아 있으면 충돌로 배포가 실패**하므로 먼저 삭제한다.
- `workers_dev: false` — `*.workers.dev`로는 서빙하지 않는다 (중복 origin으로 인한 CORS·SEO 혼선 방지).
- 각 앱 `public/`의 `robots.txt`·`_headers`(entry-user는 `sitemap.xml`과 검색엔진 소유확인 파일도)는 빌드 시 `dist/` 루트로 복사되어 그대로 배포된다. 검색 노출 정책(user 앱만 허용, 나머지 Disallow + noindex)은 [SEO.md](./SEO.md) 참고.
- wrangler는 루트 `package.json`의 devDependency로 **버전이 고정**되어 있어, 배포 시점에 임의 최신 버전을 받지 않는다.
- 배포 대상 환경은 항상 명시한다: prod는 `--env=""`(최상위), stag는 `-e stag`. 플래그 없이 실행하면 wrangler가 경고를 내며 최상위(prod)로 가므로 **로컬에서 함부로 `wrangler deploy`를 치지 말 것.**

## 3. Worker 생성 + GitHub 연동 (앱별 prod·stag 각 1개, 총 10개)

Cloudflare 대시보드 → Workers & Pages → Create → Workers → **Import a repository** → 이 저장소 선택.
같은 앱이라도 prod/stag는 **별도 Worker로 각각 연동**한다 (브랜치와 배포 커맨드만 다르다).

| 항목              | prod                                                                                                  | stag                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Worker 이름       | `wrangler.jsonc`의 `name` (`entry-user` 등)                                                           | `env.stag.name` (`entry-user-stag` 등)                                       |
| Production branch | `main`                                                                                                | `develop`                                                                    |
| Root directory    | 비움(저장소 루트) — turbo가 공용 패키지(`@entry/*`)까지 함께 빌드해야 하므로 앱 폴더로 좁히면 안 된다 | 동일                                                                         |
| Build command     | `bun install --frozen-lockfile && bunx --no-install turbo run build --filter=<앱 이름>`               | 동일                                                                         |
| Deploy command    | `bunx --no-install wrangler deploy --env="" -c apps/<앱 이름>/wrangler.jsonc`                         | `bunx --no-install wrangler deploy -e stag -c apps/<앱 이름>/wrangler.jsonc` |

- 저장소에 `bun.lock`이 있으므로 빌드 이미지가 bun을 자동으로 사용한다.
- (선택) Settings → Build → **Build watch paths**에 `apps/<앱>/**`, `packages/**`, 루트 설정 파일을 지정하면 관련 없는 변경으로 인한 재빌드를 줄일 수 있다.
- PR을 올리면 프로덕션에 반영되지 않는 **프리뷰 버전**이 업로드되어 프리뷰 URL로 확인할 수 있다.

## 4. 환경 변수 (빌드 변수)

`VITE_*` 값은 번들에 그대로 노출되므로 **진짜 비밀값(API 키 등)은 절대 넣지 말 것.**
각 Worker → Settings → **Build** 의 변수(Variables)로 설정한다. **Worker별로 따로 설정하므로 prod와 stag가 서로 다른 값을 가진다.**
값은 빌드 타임에 박히므로 **변경 후 재빌드해야 반영**된다. (런타임 Worker 변수가 아니라 **빌드 변수**여야 vite 빌드에 주입된다.)

| 이름                       | prod 값 예시                       | stag 값 예시                            | 사용 앱                                          |
| -------------------------- | ---------------------------------- | --------------------------------------- | ------------------------------------------------ |
| `VITE_API_BASE_URL`        | prod 백엔드 API URL                | stag 백엔드 API URL                     | admin, admission, monitoring, user               |
| `VITE_IDENTITY_API_URL`    | prod 인증 백엔드 URL               | stag 인증 백엔드 URL                    | auth                                             |
| `VITE_USER_APP_URL`        | `https://entrydsm.hs.kr`           | `https://stag.entrydsm.hs.kr`           | **전 앱** (공용 헤더 링크, auth 로그인 리디렉션) |
| `VITE_AUTH_APP_URL`        | `https://auth.entrydsm.hs.kr`      | `https://stag-auth.entrydsm.hs.kr`      | **전 앱** (공용 헤더 로그인 링크)                |
| `VITE_ADMISSION_APP_URL`   | `https://admission.entrydsm.hs.kr` | `https://stag-admission.entrydsm.hs.kr` | user (지원하기 링크)                             |
| `VITE_SCHOOL_HOMEPAGE_URL` | `https://dsmhs.djsch.kr/main.do`   | 동일                                    | user (학교 홈페이지 링크)                        |
| `VITE_ADMISSION_ROUND`     | `2026-1`                           | `2026-1`                                | monitoring                                       |

- stag도 vite **프로덕션 빌드**(`import.meta.env.PROD`)이므로 필수 변수 검증이 동일하게 적용된다: `VITE_USER_APP_URL`·`VITE_AUTH_APP_URL`은 공용 패키지(`@entry/ui`)의 env 모듈이 앱 로드 시 검증하며, 값이 비면 **앱이 로드 시점에 에러를 던진다** (조용한 오작동 방지). stag Worker 10개 중 5개에도 전부 넣어야 한다.
- ⚠️ 변수를 만들어 두지 않으면 빈 문자열이 번들에 박히고, 코드의 `?? "기본값"` 은 빈 문자열에는 동작하지 않는다. 흰 화면(특히 admin)이 나오면 변수 누락부터 확인한다.
- ⚠️ stag 앱에 prod 링크 값(`VITE_USER_APP_URL` 등)을 넣으면 stag에서 로그인·헤더 이동 시 prod로 새어 나간다. 표의 stag 열대로 넣을 것.

## 5. 백엔드 CORS·쿠키 요구사항 (백엔드 팀 전달용)

프론트는 `fetch(..., { credentials: "include" })`로 세션 쿠키를 주고받으므로 백엔드가 다음을 지원해야 한다.

- **CORS**: `Access-Control-Allow-Origin`에 와일드카드 불가, `Access-Control-Allow-Credentials: true` 필수. 환경별로 자기 origin들만 허용한다.
  - prod 백엔드: `https://entrydsm.hs.kr`, `https://auth.entrydsm.hs.kr`, `https://admin.entrydsm.hs.kr`, `https://admission.entrydsm.hs.kr`, `https://monitor.entrydsm.hs.kr`
  - stag 백엔드: `https://stag.entrydsm.hs.kr`, `https://stag-auth.entrydsm.hs.kr`, `https://stag-admin.entrydsm.hs.kr`, `https://stag-admission.entrydsm.hs.kr`, `https://stag-monitor.entrydsm.hs.kr`
- **쿠키**: 서브도메인 간 공유가 필요하면 `Set-Cookie`에 `Domain=.entrydsm.hs.kr; Secure; SameSite=Lax`.
  - ⚠️ prod와 stag가 같은 zone을 쓰므로 `Domain=.entrydsm.hs.kr` 쿠키는 **양쪽 환경에 모두 전송된다.** stag 백엔드는 쿠키 이름을 분리(예: `accessToken_stag`)하거나 별도 도메인 정책을 써서 prod 세션과 섞이지 않게 해야 한다.
  - entry-admin은 `document.cookie`에서 `accessToken`을 읽으므로 해당 쿠키는 `HttpOnly`를 붙일 수 없고 `Domain=.entrydsm.hs.kr`가 필수다.
  - 근본 대책은 앱별 host-only `HttpOnly; Secure; SameSite=Lax` 쿠키 + 서버 측 세션(또는 앱 간 토큰 교환)으로 가는 것 — entry-admin의 `document.cookie` 토큰 읽기 제거와 백엔드 변경이 필요하므로 추후 과제로 남긴다.

## 6. 롤백

- **대시보드 롤백**: 해당 Worker(prod든 stag든) → Deployments → 이전 배포의 **Rollback**. 정적 자산도 버전에 포함되므로 즉시 이전 화면으로 돌아간다.
- **git revert**: 무엇이 배포됐는지 git 이력에 남기려면 문제 커밋을 revert 후 해당 브랜치(main/develop)에 push한다.

```bash
git revert <문제-커밋-SHA>
git push origin main   # stag만 되돌리려면 develop
```

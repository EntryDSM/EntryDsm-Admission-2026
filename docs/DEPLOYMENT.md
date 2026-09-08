# 배포 가이드 — Cloudflare Pages

프론트엔드 5개 앱을 **Cloudflare Pages 프로젝트 5개**로 배포한다.
빌드·배포는 Cloudflare Pages의 GitHub 연동이 수행하므로 저장소에는 배포 워크플로우를 두지 않는다
(`.github/workflows/`에는 PR 검증용 build·lint 워크플로우만 유지).

## 1. 아키텍처 개요

```
push (main)
  └─ Cloudflare Pages (GitHub 연동, 앱별 프로젝트 5개)
       └─ 프로젝트별 빌드 (turbo) → apps/{app}/dist 업로드 → 커스텀 도메인 서빙
                                                                  ↑
                                              Cloudflare DNS (같은 계정 zone, 자동 연결)
```

| 앱               | 도메인                     | 빌드 출력 디렉토리           |
| ---------------- | -------------------------- | ---------------------------- |
| entry-user       | `entrydsm.hs.kr`           | `apps/entry-user/dist`       |
| entry-auth       | `auth.entrydsm.hs.kr`      | `apps/entry-auth/dist`       |
| entry-admin      | `admin.entrydsm.hs.kr`     | `apps/entry-admin/dist`      |
| entry-admission  | `admission.entrydsm.hs.kr` | `apps/entry-admission/dist`  |
| entry-monitoring | `monitor.entrydsm.hs.kr`   | `apps/entry-monitoring/dist` |

## 2. Pages 프로젝트 생성 (앱별 5개)

Cloudflare 대시보드 → Workers & Pages → Create → Pages → **Connect to Git** → 이 저장소 선택.
앱마다 아래 설정으로 반복한다 (모노레포이므로 5개 프로젝트가 같은 저장소를 바라본다).

| 항목                   | 값                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Production branch      | `main`                                                                                                |
| Build command          | `bun install --frozen-lockfile && bunx --no-install turbo run build --filter=<앱 이름>`               |
| Build output directory | `apps/<앱 이름>/dist`                                                                                 |
| Root directory         | 비움(저장소 루트) — turbo가 공용 패키지(`@entry/*`)까지 함께 빌드해야 하므로 앱 폴더로 좁히면 안 된다 |

- 저장소에 `bun.lock`이 있으므로 Pages 빌드 이미지가 bun을 자동으로 사용한다.
- (선택) 프로젝트 → Settings → Builds → **Build watch paths**에 `apps/<앱>/**`, `packages/**`, 루트 설정 파일을 지정하면 관련 없는 변경으로 인한 재빌드를 줄일 수 있다.
- PR을 올리면 프로젝트마다 **프리뷰 배포** URL이 생성된다. 프리뷰가 필요 없으면 Settings → Builds에서 끈다.

## 3. 환경 변수

`VITE_*` 값은 번들에 그대로 노출되므로 **진짜 비밀값(API 키 등)은 절대 넣지 말 것.**
각 프로젝트 → Settings → **Variables and Secrets** (Production)에서 설정한다. 값은 빌드 타임에 박히므로 **변경 후 재배포해야 반영**된다.

| 이름                       | 값 예시                            | 사용 앱                                          |
| -------------------------- | ---------------------------------- | ------------------------------------------------ |
| `VITE_API_BASE_URL`        | 백엔드 API URL                     | admin, admission, monitoring, user               |
| `VITE_IDENTITY_API_URL`    | 인증 백엔드 URL                    | auth                                             |
| `VITE_USER_APP_URL`        | `https://entrydsm.hs.kr`           | **전 앱** (공용 헤더 링크, auth 로그인 리디렉션) |
| `VITE_AUTH_APP_URL`        | `https://auth.entrydsm.hs.kr`      | **전 앱** (공용 헤더 로그인 링크)                |
| `VITE_ADMISSION_APP_URL`   | `https://admission.entrydsm.hs.kr` | user (지원하기 링크)                             |
| `VITE_SCHOOL_HOMEPAGE_URL` | `https://dsmhs.djsch.kr/main.do`   | user (학교 홈페이지 링크)                        |
| `VITE_ADMISSION_ROUND`     | `2026-1`                           | monitoring                                       |

- `VITE_USER_APP_URL`·`VITE_AUTH_APP_URL`은 공용 패키지(`@entry/ui`)의 env 모듈이 앱 로드 시 검증하므로, 프로덕션 빌드에서 값이 비면 **모든 앱이 로드 시점에 에러를 던진다** (조용한 오작동 방지).
- ⚠️ 변수를 만들어 두지 않으면 빈 문자열이 번들에 박히고, 코드의 `?? "기본값"` 은 빈 문자열에는 동작하지 않는다. 흰 화면(특히 admin)이 나오면 변수 누락부터 확인한다.

## 4. SPA fallback

모든 앱이 react-router(BrowserRouter)를 쓴다. Pages는 빌드 출력 최상위에 `404.html`이 없으면
**SPA로 간주해 매칭되지 않는 경로를 `index.html`(200)로 응답**하므로 별도 설정이 필요 없다.
**`404.html`이나 `_redirects` 파일을 dist에 넣지 말 것** — 딥링크 새로고침 동작이 바뀐다.

## 5. 커스텀 도메인 / DNS

각 프로젝트 → **Custom domains** → 1단계 표의 도메인 추가.
`entrydsm.hs.kr` zone이 같은 Cloudflare 계정에 있으므로 DNS 레코드와 TLS 인증서가 자동으로 설정된다.

- 이전 AWS 배포 시절에 만든 **CloudFront(`dxxxx.cloudfront.net`) 대상 CNAME 레코드가 남아 있으면 도메인 연결 전에 삭제**한다 (Pages가 자기 레코드로 교체하는 과정에서 충돌 방지).

## 6. 백엔드 CORS·쿠키 요구사항 (백엔드 팀 전달용)

프론트는 `fetch(..., { credentials: "include" })`로 세션 쿠키를 주고받으므로 백엔드가 다음을 지원해야 한다.

- **CORS**: `Access-Control-Allow-Origin`에 와일드카드 불가. 아래 5개 origin을 정확히 허용 + `Access-Control-Allow-Credentials: true`.
  - `https://entrydsm.hs.kr`, `https://auth.entrydsm.hs.kr`, `https://admin.entrydsm.hs.kr`, `https://admission.entrydsm.hs.kr`, `https://monitor.entrydsm.hs.kr`
- **쿠키**: 서브도메인 간 공유가 필요하면 `Set-Cookie`에 `Domain=.entrydsm.hs.kr; Secure; SameSite=Lax`.
  - entry-admin은 `document.cookie`에서 `accessToken`을 읽으므로 해당 쿠키는 `HttpOnly`를 붙일 수 없고 `Domain=.entrydsm.hs.kr`가 필수다.
  - 근본 대책은 앱별 host-only `HttpOnly; Secure; SameSite=Lax` 쿠키 + 서버 측 세션(또는 앱 간 토큰 교환)으로 가는 것 — entry-admin의 `document.cookie` 토큰 읽기 제거와 백엔드 변경이 필요하므로 추후 과제로 남긴다.

## 7. 롤백

- **대시보드 롤백**: 프로젝트 → Deployments → 이전 배포의 `⋯` → **Rollback to this deployment**. 즉시 전환된다.
- **git revert**: 무엇이 배포됐는지 git 이력에 남기려면 문제 커밋을 revert 후 push한다.

```bash
git revert <문제-커밋-SHA>
git push origin main
```

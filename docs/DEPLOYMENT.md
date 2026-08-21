# 배포 가이드 — S3 + CloudFront + Cloudflare DNS

프론트엔드 5개 앱을 S3(비공개 버킷) + CloudFront(OAC·ACM) + Cloudflare(DNS 전용)로 배포한다.
이 문서는 **AWS 콘솔·Cloudflare·GitHub에서 직접 해야 하는 설정**을 순서대로 안내한다.

## 1. 아키텍처 개요

```
push (main → prod / develop → stag)
  └─ GitHub Actions
       ├─ build job:  turbo build → artifact 업로드   (AWS 자격증명 없음)
       └─ deploy job: artifact 다운로드 → aws s3 sync → CloudFront 무효화 + smoke test
            └─ S3 단일 버킷 (ap-northeast-2, 비공개)  ← OAC ── CloudFront (ACM, SPA rewrite)
                 └─ {env}/{app}/ 폴더로 구분                 │ 배포별 Origin path = /{env}/{app}
                                                                   ↑
                                                 Cloudflare DNS (CNAME, 회색 구름 = DNS 전용)
```

| 앱               | prod 도메인                | stag 도메인                     | 버킷 폴더 (prod / stag)                           | CloudFront ID (prod / stag 기입) |
| ---------------- | -------------------------- | ------------------------------- | ------------------------------------------------- | -------------------------------- |
| entry-user       | `entrydsm.hs.kr`           | `stag.entrydsm.hs.kr`           | `prod/entry-user` / `stag/entry-user`             |                                  |
| entry-auth       | `auth.entrydsm.hs.kr`      | `auth-stag.entrydsm.hs.kr`      | `prod/entry-auth` / `stag/entry-auth`             |                                  |
| entry-admin      | `admin.entrydsm.hs.kr`     | `admin-stag.entrydsm.hs.kr`     | `prod/entry-admin` / `stag/entry-admin`           |                                  |
| entry-admission  | `admission.entrydsm.hs.kr` | `admission-stag.entrydsm.hs.kr` | `prod/entry-admission` / `stag/entry-admission`   |                                  |
| entry-monitoring | `monitor.entrydsm.hs.kr`   | `monitor-stag.entrydsm.hs.kr`   | `prod/entry-monitoring` / `stag/entry-monitoring` |                                  |

stag는 `-stag` 접미사가 붙는 **플랫 서브도메인** 방식이라 모든 도메인이 `entrydsm.hs.kr`의 한 단계 아래다 → 와일드카드 인증서 1장으로 전부 커버된다(2단계). smoke test도 이 규칙(`{sub}.entrydsm.hs.kr` / `{sub}-stag.entrydsm.hs.kr`)으로 도메인을 계산하므로 임의로 바꾸면 배포 검증이 실패한다.

- **S3 버킷은 1개를 전 앱·환경이 공유**하고 `{env}/{앱 이름}` 폴더(prefix)로 구분한다: `prod/entry-user`, `prod/entry-auth`, … `stag/entry-user`, … (총 10개 폴더). 폴더 이름은 워크플로우가 이 규칙으로 자동 계산하므로 임의로 바꿀 수 없고, 배포 시 자동 생성되므로 미리 만들 필요도 없다.
- CloudFront 배포는 도메인마다 1개씩 **총 10개**. 각 배포의 **Origin path**가 자기 폴더를 가리킨다(4단계).
- Cloudflare는 프록시(오렌지 구름)가 아니라 **DNS 전용(회색 구름)** 으로만 쓴다. TLS는 CloudFront가 ACM 인증서로 종료한다.

## 2. ACM 인증서 발급 — 반드시 us-east-1

CloudFront는 **버지니아 북부(us-east-1)** 리전의 ACM 인증서만 사용할 수 있다. 서울 리전에 만들면 목록에 나오지 않는다.

1. AWS 콘솔 → 리전을 **us-east-1**로 변경 → Certificate Manager → 인증서 요청(퍼블릭)
2. 도메인 이름에 2개를 추가한다. stag가 플랫 방식(`auth-stag.…`)이라 모든 도메인이 한 단계 아래이므로 와일드카드 하나로 전부 커버된다.
   - `entrydsm.hs.kr`
   - `*.entrydsm.hs.kr`
3. 검증 방법: **DNS 검증** 선택 → 요청 후 검증용 CNAME(`_xxxx.entrydsm.hs.kr` → `_yyyy.acm-validations.aws.`)이 표시된다.
4. Cloudflare 대시보드 → **entrydsm.hs.kr zone** → DNS → 해당 CNAME 레코드 추가:
   - **프록시 상태를 반드시 회색 구름(DNS only)으로.** 오렌지 구름이면 검증이 영원히 끝나지 않는다.
   - 이름 칸에는 `_xxxx` 부분까지만 입력한다(Cloudflare가 `.entrydsm.hs.kr`를 자동으로 붙임).
   - `entrydsm.hs.kr`와 `*.entrydsm.hs.kr`는 같은 검증 레코드가 나온다. 한 번만 추가하면 된다.
5. 몇 분 ~ 30분 내 상태가 **발급됨(Issued)** 으로 바뀌는 것을 확인한다.

## 3. 기존 S3 버킷 점검 (ap-northeast-2)

이미 만들어 둔 **버킷 1개**를 전 앱·환경이 공유한다. 아래 상태인지 확인한다. OAC 방식은 웹사이트 엔드포인트를 쓰지 않으므로 **버킷 이름이 도메인과 일치할 필요는 없다.**

- [ ] **퍼블릭 액세스 차단 4개 항목 전부 ON** (버킷은 CloudFront를 통해서만 읽힌다)
- [ ] 속성 → **정적 웹 사이트 호스팅: 비활성화** (REST 엔드포인트를 원본으로 쓴다)
- [ ] 기존에 퍼블릭 정책이나 ACL이 있으면 제거 (버킷 정책은 4단계에서 OAC용으로 교체)
- [ ] `prod/`·`stag/` 폴더 경로에 배포 산출물 외 다른 파일이 없어야 한다 (다른 용도 파일은 별도 경로에 두면 배포가 건드리지 않음)
- [ ] (선택) 버저닝 활성화 + 수명 주기 규칙 — 만료는 반드시 **이전 버전(NoncurrentVersionExpiration, 예: 30일)에만** 적용. ⚠️ 현재(Current) 객체에 만료 규칙을 걸면 서비스 중인 파일이 삭제된다

## 4. CloudFront 배포 10개 생성

배포마다 동일한 절차를 반복한다 (prod 5개 + stag 5개).

### 4-1. 원본(Origin) — 공유 버킷 + Origin path

| 항목            | 값                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Origin domain   | 공유 버킷 선택 시 자동 완성되는 `버킷명.s3.ap-northeast-2.amazonaws.com` — **"웹 사이트 엔드포인트 사용" 버튼이 떠도 누르지 않는다**                            |
| **Origin path** | 이 배포가 서비스할 폴더. 슬래시로 시작, 끝 슬래시 없음. 예: prod user 배포는 `/prod/entry-user`, stag admin 배포는 `/stag/entry-admin` (1단계 표의 폴더와 일치) |
| Origin access   | **Origin access control settings (OAC)** 선택 → 첫 배포에서 `Create new OAC` 생성, **나머지 9개 배포는 같은 OAC를 재사용**                                      |

Origin path를 설정하면 뷰어의 `/index.html` 요청이 S3 키 `prod/entry-user/index.html`로 매핑된다. 배포마다 폴더가 다르므로 **10개 배포 전부 Origin path를 정확히 입력하는 것이 핵심**이다.

버킷 정책은 공유 버킷에 **한 번만** 설정하되, 10개 배포 ARN을 전부 나열한다 (콘솔이 배포 생성 시 보여주는 정책은 배포 1개짜리이므로 그대로 붙여넣지 말고 아래처럼 합친다. `<>` 부분을 실제 값으로 교체):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<버킷명>/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": [
            "arn:aws:cloudfront::<계정ID>:distribution/<prod-user-배포ID>",
            "arn:aws:cloudfront::<계정ID>:distribution/<prod-auth-배포ID>",
            "arn:aws:cloudfront::<계정ID>:distribution/<prod-admin-배포ID>",
            "arn:aws:cloudfront::<계정ID>:distribution/<prod-admission-배포ID>",
            "arn:aws:cloudfront::<계정ID>:distribution/<prod-monitoring-배포ID>",
            "arn:aws:cloudfront::<계정ID>:distribution/<stag-user-배포ID>",
            "arn:aws:cloudfront::<계정ID>:distribution/<stag-auth-배포ID>",
            "arn:aws:cloudfront::<계정ID>:distribution/<stag-admin-배포ID>",
            "arn:aws:cloudfront::<계정ID>:distribution/<stag-admission-배포ID>",
            "arn:aws:cloudfront::<계정ID>:distribution/<stag-monitoring-배포ID>"
          ]
        }
      }
    }
  ]
}
```

배포를 하나씩 만들면서 ARN을 이 목록에 추가해 나가면 된다 (아직 목록에 없는 배포는 `AccessDenied`가 난다).

### 4-2. 캐시 동작(Behaviors) — 기본 동작 + `/assets/*` 동작 2개

관리형 `CachingOptimized`는 최소 TTL이 1초라 `no-cache` HTML도 최소 1초 캐시한다.
따라서 HTML이 지나는 **기본 동작은 CachingDisabled**, 1년 캐시할 해시 자산 경로에만 CachingOptimized를 쓴다.

| 항목                           | 기본 동작 (HTML·고정 파일)                    | 추가 동작 `/assets/*` (해시 자산) |
| ------------------------------ | --------------------------------------------- | --------------------------------- |
| Path pattern                   | Default (`*`)                                 | `/assets/*`                       |
| Viewer protocol policy         | **Redirect HTTP to HTTPS**                    | 동일                              |
| Allowed HTTP methods           | GET, HEAD                                     | GET, HEAD                         |
| Cache policy                   | **CachingDisabled** (관리형)                  | **CachingOptimized** (관리형)     |
| Compress objects automatically | **Yes**                                       | **Yes**                           |
| Function associations          | Viewer request → `spa-rewrite` (4-4에서 생성) | 없음                              |
| (선택) Response headers policy | SecurityHeadersPolicy (관리형)                | 동일                              |

### 4-3. 설정(Settings)

| 항목                          | 값                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| Price class                   | **PriceClass_200 이상** — ⚠️ PriceClass_100은 한국 엣지가 없어 국내 접속이 느려진다 |
| Alternate domain name (CNAME) | 해당 배포의 도메인 (예: `admin.entrydsm.hs.kr`, stag는 `admin-stag.entrydsm.hs.kr`) |
| Custom SSL certificate        | 2단계에서 만든 ACM 인증서 선택                                                      |
| Default root object           | `index.html`                                                                        |

### 4-4. SPA fallback — CloudFront Function rewrite (필수)

모든 앱이 react-router(BrowserRouter)를 쓰므로 `/some/path` 새로고침 시 S3에는 그런 키가 없다.

**⚠️ 사용자 정의 오류 응답(403/404 → `/index.html` 200) 방식을 쓰지 말 것.** 딥링크는 살지만
없는 JS 파일, OAC 설정 오류, (향후 도입할 수 있는) WAF 차단 응답까지 전부 200 HTML로 가려져
장애가 조용히 묻힌다. 대신 viewer-request 단계에서 **SPA 라우트만** `/index.html`로 바꿔 주는
CloudFront Function을 쓴다 (AWS 공식 SPA rewrite 예제 패턴).

1. CloudFront 콘솔 → Functions → Create function → 이름 `spa-rewrite` (계정당 1개 만들어 10개 배포가 공유)
2. 코드 입력:

```js
function handler(event) {
  var request = event.request;
  // 파일 확장자가 없는 요청(= SPA 라우트)만 index.html로 rewrite.
  // /assets/xxx.js 같은 실제 파일 요청은 그대로 통과해 없는 파일이면 진짜 403/404가 난다.
  if (!request.uri.includes(".")) {
    request.uri = "/index.html";
  }
  return request;
}
```

3. **Publish 탭에서 게시(LIVE 상태)** — 게시하지 않으면 연결할 수 없다
4. 배포 10개 각각: 기본 동작 편집 → Function associations → **Viewer request**에 `spa-rewrite` 연결
   (`/assets/*` 동작에는 연결하지 않는다)

결과: `/deep/route` → 200 + HTML, 없는 `/assets/xxx.js` → 실제 403/404.
배포 워크플로우의 smoke test가 이 두 경우를 모두 자동 검증한다.

배포가 완료되면 각 배포의 **배포 도메인 이름(`dxxxxxxxxxxxx.cloudfront.net`)과 배포 ID**를 1단계 표에 기록해 둔다.

## 5. Cloudflare DNS 레코드

Cloudflare → **entrydsm.hs.kr zone** → DNS → 레코드 10개 추가. **전부 회색 구름(DNS only).**

| Type  | 이름                        | 대상                                    | 프록시 상태 |
| ----- | --------------------------- | --------------------------------------- | ----------- |
| CNAME | `entrydsm.hs.kr` (또는 `@`) | prod user 배포의 `dxxxx.cloudfront.net` | DNS only    |
| CNAME | `auth`                      | prod auth 배포                          | DNS only    |
| CNAME | `admin`                     | prod admin 배포                         | DNS only    |
| CNAME | `admission`                 | prod admission 배포                     | DNS only    |
| CNAME | `monitor`                   | prod monitoring 배포                    | DNS only    |
| CNAME | `stag`                      | stag user 배포                          | DNS only    |
| CNAME | `auth-stag`                 | stag auth 배포                          | DNS only    |
| CNAME | `admin-stag`                | stag admin 배포                         | DNS only    |
| CNAME | `admission-stag`            | stag admission 배포                     | DNS only    |
| CNAME | `monitor-stag`              | stag monitoring 배포                    | DNS only    |

- apex(`entrydsm.hs.kr`)에 CNAME을 넣으면 Cloudflare가 자동으로 **CNAME Flattening**을 적용한다. 별도 설정 불필요.
- 회색 구름이면 트래픽이 Cloudflare를 경유하지 않으므로 **Cloudflare의 SSL/TLS 모드 설정은 이 도메인들에 영향이 없다.**
- 오렌지 구름으로 켜면 Cloudflare↔CloudFront 이중 CDN이 되어 인증서·캐시·리디렉션 문제가 생긴다. 켜지 말 것.

## 6. IAM 배포 사용자

GitHub Actions가 쓸 전용 사용자를 만든다 (콘솔 로그인 비활성화, 프로그래밍 방식 액세스만).

1. IAM → 사용자 → 생성: `github-actions-entry-deploy`
2. 인라인 정책으로 아래 최소 권한 부여 (`<>`를 실제 버킷명·계정ID·배포ID로 교체, 10개씩 전부 나열):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SyncList",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::<버킷명>"
    },
    {
      "Sid": "SyncWrite",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::<버킷명>/prod/*", "arn:aws:s3:::<버킷명>/stag/*"]
    },
    {
      "Sid": "Invalidate",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
      "Resource": [
        "arn:aws:cloudfront::<계정ID>:distribution/<prod-user-배포ID>",
        "arn:aws:cloudfront::<계정ID>:distribution/<prod-auth-배포ID>",
        "arn:aws:cloudfront::<계정ID>:distribution/<prod-admin-배포ID>",
        "arn:aws:cloudfront::<계정ID>:distribution/<prod-admission-배포ID>",
        "arn:aws:cloudfront::<계정ID>:distribution/<prod-monitoring-배포ID>",
        "arn:aws:cloudfront::<계정ID>:distribution/<stag-user-배포ID>",
        "arn:aws:cloudfront::<계정ID>:distribution/<stag-auth-배포ID>",
        "arn:aws:cloudfront::<계정ID>:distribution/<stag-admin-배포ID>",
        "arn:aws:cloudfront::<계정ID>:distribution/<stag-admission-배포ID>",
        "arn:aws:cloudfront::<계정ID>:distribution/<stag-monitoring-배포ID>"
      ]
    }
  ]
}
```

3. 보안 자격 증명 → **액세스 키 생성**(용도: 서드파티 서비스) → 키 2개 값을 7단계에서 GitHub Secrets에 넣는다.
4. ⚠️ 키가 노출되면 즉시 이 화면에서 **비활성화 → 삭제** 후 재발급한다. 퍼블릭 레포이므로 키를 코드·이슈·PR에 절대 붙여넣지 말 것.

## 7. GitHub 설정 (Environments / Secrets / Variables)

퍼블릭 레포이므로 `.env` 파일은 커밋하지 않고, 모든 값을 GitHub에서 빌드 타임에 주입한다.

### 7-1. Environments 생성

저장소 → Settings → Environments → `prod`, `stag` 두 개 생성.

- **Deployment branches**: prod는 `main`만, stag는 `develop`만 허용으로 제한한다 (워크플로우의 브랜치→환경 매핑을 이중으로 보호).
  워크플로우가 임의 SHA 체크아웃을 허용하지 않으므로 이 정책이 실제로 배포되는 코드까지 보호한다.
- (선택) prod에 Required reviewers를 걸면 프로덕션 배포 전 승인 단계가 생긴다.
  build job과 deploy job이 둘 다 environment를 참조하므로 **승인 요청이 job 단계마다(최대 2회) 올 수 있다.**

### 7-2. 저장소 공통 Secrets

Settings → Secrets and variables → Actions → **Secrets**:

| 이름                    | 값                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | 6단계에서 발급한 키                                                                      |
| `AWS_SECRET_ACCESS_KEY` | 6단계에서 발급한 키                                                                      |
| `S3_BUCKET_NAME`        | 공유 버킷 이름 (비밀은 아니지만 secret으로 넣어야 퍼블릭 Actions 로그에서 자동 마스킹됨) |

### 7-3. 환경별 Secrets (prod / stag 각각, 같은 이름·다른 값)

배포 ID는 비밀은 아니지만 **secret으로 넣어야 퍼블릭 Actions 로그에서 자동 마스킹**된다.
폴더 경로는 워크플로우가 `{env}/{앱}` 규칙으로 계산하므로 별도 설정이 없다.

| 이름                          | 값                           |
| ----------------------------- | ---------------------------- |
| `CF_DIST_ID_ENTRY_USER`       | 해당 환경 user 배포 ID       |
| `CF_DIST_ID_ENTRY_AUTH`       | 해당 환경 auth 배포 ID       |
| `CF_DIST_ID_ENTRY_ADMIN`      | 해당 환경 admin 배포 ID      |
| `CF_DIST_ID_ENTRY_ADMISSION`  | 해당 환경 admission 배포 ID  |
| `CF_DIST_ID_ENTRY_MONITORING` | 해당 환경 monitoring 배포 ID |

### 7-4. 환경별 Variables (prod / stag 각각)

`VITE_*` 값은 어차피 번들에 그대로 노출되므로 Variables로 관리한다. **진짜 비밀값(API 키 등)은 절대 `VITE_*`로 넣지 말 것.**

| 이름                    | prod 예시                | stag 예시                     | 사용 앱                      |
| ----------------------- | ------------------------ | ----------------------------- | ---------------------------- |
| `VITE_API_BASE_URL`     | 백엔드 prod API URL      | 백엔드 stag API URL           | admin, admission, monitoring |
| `VITE_IDENTITY_API_URL` | 인증 백엔드 prod URL     | 인증 백엔드 stag URL          | auth                         |
| `VITE_USER_APP_URL`     | `https://entrydsm.hs.kr` | `https://stag.entrydsm.hs.kr` | auth (로그인 후 리디렉션)    |
| `VITE_ADMISSION_ROUND`  | `2026-1`                 | `2026-1`                      | monitoring                   |

⚠️ **변수를 만들어 두지 않으면 빈 문자열이 번들에 박히고**, 코드의 `?? "기본값"` 은 빈 문자열에는 동작하지 않는다.
[deploy.yaml](../.github/workflows/deploy.yaml)의 `Validate environment configuration` 스텝이 앱별 필수 변수가 비어 있으면 배포를 실패시키므로, 빨간불이 나면 이 표를 다시 확인한다.

## 8. 배포 파이프라인 동작

- **트리거**: `main` 푸시 → prod 환경 / `develop` 푸시 → stag 환경. 문서(`*.md`, `docs/`)만 바뀐 푸시는 스킵.
- **빌드/배포 job 분리 (공급망 방어)**:
  - `build` job: 저장소 코드·의존성 스크립트를 실행하는 유일한 job. **AWS 자격증명을 일절 참조하지 않는다.** 5개 앱을 한 번에 빌드하고, 산출물에 `.env*`·`*.map`·키 파일이 섞였는지 검사한 뒤 artifact로 업로드.
  - `deploy` job(앱별 5개 병렬, `fail-fast: false`): **저장소 코드를 체크아웃하지 않고** artifact만 받아 aws CLI를 실행. 의존성이 오염돼도 자격증명에 접근할 수 없다.
  - 모든 GitHub Actions는 **전체 커밋 SHA로 핀**되어 있고 [dependabot.yml](../.github/dependabot.yml)이 주간으로 갱신 PR을 올린다. 갱신 PR은 diff의 SHA가 해당 태그의 실제 커밋인지 확인 후 머지.
- **캐시 전략 (3계층)**:
  | 대상 | Cache-Control | 이유 |
  | --- | --- | --- |
  | `assets/**` (해시 파일명) | `public,max-age=31536000,immutable` | 내용이 바뀌면 파일명이 바뀌므로 1년 캐시해도 안전 |
  | 루트 고정 이름 파일 (`vite.svg`, favicon 등) | `public,max-age=300` | 이름이 안 바뀌므로 짧게만 캐시 |
  | `*.html` | `no-cache` | 매번 재검증 → 배포 즉시 새 해시 참조. CloudFront 쪽도 기본 동작이 CachingDisabled라 캐시 안 함 |
  - 업로드 순서는 **자산 → 고정 파일 → HTML**. 새 HTML이 아직 없는 자산을 참조하는 순간이 생기지 않도록.
  - **`--delete`를 쓰지 않는다.** 배포 중 이전 해시 자산을 지우면 이미 열려 있는 탭·캐시된 이전 HTML이 참조하는 파일이 사라져 그 순간 접속자에게 장애가 난다. 오래된 자산은 버킷에 남겨 두고(용량 미미), 시즌 종료 후 등 **배포와 무관한 시점에** 정리한다.
- **무효화 + 검증**: 배포마다 `/*` 무효화 1건(경로 1개로 계산, 월 1,000경로 무료) 생성 후 **완료를 대기**하고, 이어서 smoke test 2건을 자동 실행 — ① 딥링크(`/__deploy_smoke__`)가 200 + `text/html`인지(SPA rewrite 동작 확인), ② 없는 자산(`/assets/__missing__*.js`)이 200이 **아닌지**(오류를 HTML로 가리는 설정 방지).
- **동시성**: 같은 브랜치에 연속 푸시하면 이전 배포가 끝날 때까지 대기(중간에 끊어 반쪽 배포가 되는 것 방지).

## 9. 백엔드 CORS·쿠키 요구사항 (백엔드 팀 전달용)

프론트는 `fetch(..., { credentials: "include" })`로 세션 쿠키를 주고받으므로 백엔드가 다음을 지원해야 한다.

- **CORS**: `Access-Control-Allow-Origin`에 와일드카드 불가. 아래 10개 origin을 정확히 허용 + `Access-Control-Allow-Credentials: true`.
  - prod: `https://entrydsm.hs.kr`, `https://auth.entrydsm.hs.kr`, `https://admin.entrydsm.hs.kr`, `https://admission.entrydsm.hs.kr`, `https://monitor.entrydsm.hs.kr`
  - stag: `https://stag.entrydsm.hs.kr`, `https://auth-stag.entrydsm.hs.kr`, `https://admin-stag.entrydsm.hs.kr`, `https://admission-stag.entrydsm.hs.kr`, `https://monitor-stag.entrydsm.hs.kr`
- **쿠키**: 서브도메인 간 공유가 필요하면 `Set-Cookie`에 `Domain=.entrydsm.hs.kr; Secure; SameSite=Lax`.
  - entry-admin은 `document.cookie`에서 `accessToken`을 읽으므로 해당 쿠키는 `HttpOnly`를 붙일 수 없고 `Domain=.entrydsm.hs.kr`가 필수다.
  - stag 도메인도 전부 `entrydsm.hs.kr` 바로 아래라(플랫 방식) `.entrydsm.hs.kr` 쿠키 범위에 포함된다 → **stag와 prod가 쿠키를 공유**하게 된다. 플랫 구조에서는 도메인으로 좁힐 수 없으므로 stag 백엔드는 **쿠키 이름을 다르게** 쓰는 것을 권장.

## 10. 롤백

**revert 커밋 방식만 사용한다.** 문제 커밋을 되돌리는 커밋을 만들어 push하면 정상 파이프라인이 그대로 재배포한다:

```bash
git revert <문제-커밋-SHA>
git push origin main   # 또는 develop
```

- 브랜치 보호·PR 규칙·Environment 브랜치 정책을 전부 통과하므로 우회 경로가 없고, 무엇이 배포됐는지 git 이력에 그대로 남는다.
- 워크플로우에 "임의 SHA 배포" 입력을 일부러 두지 않았다 — Environment 브랜치 정책은 워크플로우 실행의 ref만 검사하므로, main에서 실행하며 다른 SHA를 체크아웃하면 prod 보호가 우회되기 때문.
- Actions 탭의 **Run workflow**(workflow_dispatch)는 해당 브랜치 **HEAD 재배포**용이다 (GitHub 변수 수정 후 재배포 등).
- S3 버저닝을 켜 두었다면 콘솔에서 개별 객체 복원도 가능하다.

## 11. 트러블슈팅

| 증상                                            | 원인 / 해결                                                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 새로고침하면 403/404 XML                        | `spa-rewrite` 함수가 미게시(LIVE 아님)이거나 기본 동작의 Viewer request에 미연결(4-4)                       |
| Smoke test "딥링크 응답 이상" 실패              | 위와 동일 — 함수 게시·연결 확인                                                                             |
| Smoke test "없는 자산이 200으로 응답" 실패      | 사용자 정의 오류 응답(403/404→200)이 남아 있음 → 오류 페이지 매핑 삭제 (4-4 방식만 사용)                    |
| 모든 페이지가 `index.html`만 나옴 (JS 안 뜸)    | `spa-rewrite`를 `/assets/*` 동작에도 연결했거나, 자산이 `assets/` 밖에 있음                                 |
| **다른 앱 화면이 나옴**                         | 해당 배포의 **Origin path** 오타 또는 다른 폴더를 가리킴(4-1) — 폴더 표(1단계)와 대조                       |
| `AccessDenied` XML이 계속 뜸                    | 공유 버킷 정책의 `AWS:SourceArn` 목록에 그 배포 ARN이 누락/오타(4-1), 또는 Origin path가 없는 폴더를 가리킴 |
| ACM 인증서가 계속 "검증 대기 중"                | Cloudflare 검증 CNAME이 오렌지 구름이거나, 이름에 `.entrydsm.hs.kr`를 중복 입력함                           |
| 브라우저 SSL 오류·무한 리디렉션                 | Cloudflare 레코드가 오렌지 구름 → 회색으로 변경                                                             |
| 흰 화면 (특히 admin)                            | 빌드 시 `VITE_API_BASE_URL` 누락 → 7-4 변수 확인 후 재배포                                                  |
| 배포했는데 옛 화면                              | 무효화 실패 여부 확인, 브라우저 강력 새로고침. HTML이 `no-cache`인지 응답 헤더 확인                         |
| `bun install --frozen-lockfile` 실패            | 로컬에서 `bun install` 후 `bun.lock` 커밋 누락 → lockfile 갱신 커밋                                         |
| CloudFront 도메인으로는 되는데 실제 도메인 불통 | Cloudflare CNAME 대상 오타 또는 배포의 Alternate domain name 미입력                                         |
| 한국에서 유독 느림                              | Price class가 PriceClass_100 → 200 이상으로 변경                                                            |

## 부록: 최초 구축 체크리스트

1. [ ] ACM 인증서 발급 (us-east-1, SAN 2개: `entrydsm.hs.kr`, `*.entrydsm.hs.kr`) + Cloudflare 검증 CNAME(회색)
2. [ ] 공유 S3 버킷 설정 점검 (3단계)
3. [ ] `spa-rewrite` CloudFront Function 생성·게시 (4-4)
4. [ ] CloudFront 배포 10개 생성 — **배포별 Origin path**, 공유 버킷 정책(SourceArn 10개), `/assets/*` 동작 분리, 기본 동작에 함수 연결. **오류 응답 매핑은 만들지 않음**
5. [ ] Cloudflare CNAME 10개 (전부 회색 구름)
6. [ ] IAM 사용자·정책(`GetInvalidation` 포함)·액세스 키
7. [ ] GitHub Environments(prod/stag) + 저장소 Secrets 3개 + 환경별 Secrets 5개씩 + Variables 4개씩
8. [ ] `develop` 푸시 → 5개 배포 잡 녹색 + smoke test 통과 → stag 도메인 수동 확인
9. [ ] `main` 병합 → prod 확인 + `git revert` 롤백 리허설 1회

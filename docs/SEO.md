# 검색 노출 정책 — robots.txt · noindex · sitemap

지원자용 앱 **entry-user(`entrydsm.hs.kr`)만 검색엔진에 노출**하고, 나머지 4개 앱(auth·admin·admission·monitoring)은
**크롤링과 색인을 모두 차단**한다. 설정은 전부 각 앱의 `public/`(빌드 시 `dist/` 루트로 복사)과 `index.html`에 커밋되어 있어
별도 절차 없이 일반 배포([DEPLOYMENT.md](./DEPLOYMENT.md))로 반영된다. 이슈 #107(SEO 개선)의 일부.

## 1. 결정 요약

| 항목                 | entry-user (`entrydsm.hs.kr`)                                                      | entry-auth · admin · admission · monitoring                          |
| -------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `public/robots.txt`  | 전체 허용, `/mypage`만 `Disallow`, `Sitemap:` 선언                                 | `User-agent: *` / `Disallow: /` (크롤링 전체 차단)                   |
| `index.html` 메타    | `lang="ko"`, `<title>`, `description`, `og:*` (기본 SEO 메타)                      | `<meta name="robots" content="noindex, nofollow">`                   |
| `public/_headers`    | `/mypage*` → `X-Robots-Tag: noindex, nofollow`                                     | `/*` → `X-Robots-Tag: noindex, nofollow` (SPA fallback 포함 전 응답) |
| `public/sitemap.xml` | 공개 경로 5개                                                                      | 없음                                                                 |
| stag 도메인          | prod와 같은 파일, 별도 처리 없음 (8절)                                             | 동일 — 어차피 전체 차단                                              |
| AI 크롤러            | Cloudflare zone 설정 **Block AI bots**(WAF) 사용, 관리형 robots.txt는 **끔** (9절) | 동일 (zone 전체 적용)                                                |

결정 근거:

- 4개 앱은 **Disallow + noindex 병행**이다. 평소에는 Disallow가 크롤링(봇 트래픽)을 막고, Disallow가 풀리는 상황(관리형 robots.txt 삽입, 규칙 실수)이나
  외부 링크로 발견되어 크롤링되는 순간에는 noindex가 색인을 막는다.
- entry-user는 `/mypage`(로그인 사용자 개인 페이지)만 제외한다. 성적 계산기(`/calculate/*`)·공지·FAQ·전형 안내·요강 PDF는 모두 검색 허용.
- 정적 자산(`/assets/*`)은 어떤 앱에서도 Disallow 하지 않는다. Google이 SPA를 렌더링하려면 JS·CSS를 받아야 한다 (4개 앱은 `Disallow: /`라 무관).

## 2. 동작 원리 — 왜 세 겹으로 두는가

- **robots.txt는 "크롤링(수집)" 제어이지 "색인" 제어가 아니다.** Google 공식 문서: robots.txt로 막힌 URL이라도 다른 페이지가 설명 텍스트와 함께
  링크하면 방문 없이 URL만 색인될 수 있다. 검색결과에서 확실히 빼는 정식 수단은 `noindex`다.
- **noindex는 크롤러가 페이지를 읽어야 작동한다.** Google: "noindex 규칙이 효과가 있으려면 페이지가 robots.txt로 차단되어 있지 않아야 한다."
  즉 `Disallow: /` 상태에서는 Googlebot이 noindex 메타·헤더를 보지 못한다.
- 그래서 4개 앱은 평소 Disallow(크롤링 차단)로 동작하고, 크롤링이 허용되는 순간 noindex가 색인을 막는 **2단 구조**다.
  남는 위험은 하나 — Disallow 상태에서 외부 링크로 URL만 색인되는 경우(제목만 있고 설명이 없는 검색결과)이며, 발생 시 10절의 삭제 요청 절차로 대응한다.
- **SPA 특성**: 모든 앱이 `not_found_handling: "single-page-application"`이라 자산에 없는 모든 경로(`/notice`, `/mypage`, …)에 `index.html`이
  200으로 응답한다. 정적 자산 전용 Worker는 `Sec-Fetch-Mode` 헤더와 무관하게 항상 이 fallback을 태우므로(크롤러·curl 동일) `index.html`의
  메타 태그 하나가 모든 경로에 적용되고, `_headers`의 `/*` 규칙도 fallback 응답에 붙는다.
- **변경 전 상태**: robots.txt 파일이 없었으므로 `/robots.txt` 요청도 SPA fallback으로 `index.html`(200, `text/html`)이 응답됐다.
  크롤러는 이를 "규칙 없음 = 전부 허용"으로 해석하므로 admin·monitor 등도 크롤링 허용 상태였다.

## 3. 파일 배치와 서빙

Vite는 `apps/<앱>/public/`의 파일을 이름·경로 그대로 `dist/` 루트에 복사하고(해시 없음), wrangler가 `dist/`를 업로드한다.

| 파일                                                                                      | entry-user      | 4개 앱       | 서빙 방식                                                                                                      |
| ----------------------------------------------------------------------------------------- | --------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `public/robots.txt`                                                                       | ✅              | ✅           | `https://<도메인>/robots.txt`, `text/plain`                                                                    |
| `public/_headers`                                                                         | ✅ (`/mypage*`) | ✅ (`/*`)    | wrangler가 자산 목록에서 제외하고 헤더 설정으로 업로드 → URL로 노출되지 않음 (`/_headers` 요청은 SPA fallback) |
| `public/sitemap.xml`                                                                      | ✅              | ❌           | `application/xml`                                                                                              |
| `index.html`                                                                              | SEO 메타        | noindex 메타 | 모든 경로에 서빙                                                                                               |
| `public/googlea5fa325d9b61d05b.html`, `public/naverbf6d97a24a77158f7cad49fe6b1dcc29.html` | ✅              | ❌           | Search Console·서치어드바이저 **소유확인 파일**(HTML 파일 방식, 10절). 삭제·이동 금지                          |

4개 앱의 `robots.txt`·`_headers`는 내용이 같지만 **의도적으로 중복**해 둔다 — 2~4줄짜리 파일이라 중복 비용이 없고, 빌드 설정 변경 없이
동작하며, 앱별로 예외를 두기 쉽다. 새 앱을 추가하면 같은 3종(robots.txt·\_headers·noindex 메타)을 복사한다 (12절).

### 3.1 파일 전문

`apps/entry-user/public/robots.txt`

```
User-agent: *
Disallow: /mypage

Sitemap: https://entrydsm.hs.kr/sitemap.xml
```

`apps/entry-user/public/_headers`

```
/mypage*
  X-Robots-Tag: noindex, nofollow
```

`apps/entry-user/public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://entrydsm.hs.kr/</loc></url>
  <url><loc>https://entrydsm.hs.kr/landing</loc></url>
  <url><loc>https://entrydsm.hs.kr/notice</loc></url>
  <url><loc>https://entrydsm.hs.kr/faq</loc></url>
  <url><loc>https://entrydsm.hs.kr/admission-overview</loc></url>
</urlset>
```

`apps/entry-{auth,admin,admission,monitoring}/public/robots.txt` (4개 동일)

```
User-agent: *
Disallow: /
```

`apps/entry-{auth,admin,admission,monitoring}/public/_headers` (4개 동일)

```
/*
  X-Robots-Tag: noindex, nofollow
```

`apps/entry-{auth,admin,admission,monitoring}/index.html` — `<head>`에 추가

```html
<meta name="robots" content="noindex, nofollow" />
```

(실제 파일에는 `#`·`<!-- -->` 주석으로 이 문서 절 번호를 달아 두었다.)

## 4. robots.txt 규칙 해설

문법(RFC 9309 + Google 해석):

- `User-agent:` 줄로 그룹이 시작되고, 그룹 안의 `Disallow:`/`Allow:`는 **경로 접두어** 매칭이다.
  `Disallow: /mypage`는 `/mypage`, `/mypage/`, `/mypage?x=1`, `/mypage-foo`를 모두 막는다.
- `Sitemap:`은 그룹과 무관한 독립 지시자이며 **절대 URL**이어야 한다.
- 같은 User-agent 그룹이 여러 개면 Google은 하나로 **병합**하고, 규칙이 충돌하면 **더 긴(구체적인) 경로**가 이기며,
  길이가 같으면 **덜 제한적인 쪽(Allow)** 을 택한다. → 9절 관리형 robots.txt 주의.
- `#` 이후는 주석. UTF-8, Google은 500 KiB까지만 읽는다. 크롤러는 robots.txt를 보통 하루 정도 캐시하므로 변경이 즉시 반영되지 않는다.

앱별 규칙:

- **4개 앱** — `Disallow: /` 로 모든 크롤러의 모든 경로를 막는다. 로그인 화면(auth)·원서 작성(admission)도 검색에 나올 이유가 없다.
- **entry-user**
  - `/mypage`만 차단. `/calculate/*`(성적 계산기)는 검색 허용하기로 결정했다.
  - `/error_fixing`, `/return_soon`은 Router 상 임시·오류 경로지만 허용 상태로 둔다(결정). 검색결과에 노출되는 것이 확인되면 `Disallow` 줄을 추가한다.
  - 요강 PDF(`public/2027학년도 … 입학전형 요강.pdf`)는 허용한다. Google은 PDF 본문까지 색인하므로 "입학전형 요강" 검색에 도움이 된다.
- ⚠️ 하지 말 것: `/assets/` Disallow(SPA 렌더링 불가 → 빈 페이지로 색인), `Crawl-delay`(Google은 무시). 파일은 BOM 없는 UTF-8로 저장한다(현재 파일 그대로).

## 5. `_headers` — X-Robots-Tag

Cloudflare 정적 자산의 헤더 규칙 파일. 문법:

- 경로 줄(`/`로 시작하거나 `https://<호스트>/…`) 다음에 들여쓴 `헤더명: 값` 줄. `*`는 스플랫(한 규칙에 하나만), `:name`은 플레이스홀더.
- 규칙 최대 100개, 줄당 2,000자. `#` 주석. `! 헤더명`으로 기존 헤더 제거.
- `https://<호스트>/…` 형식이면 호스트까지 매칭한다 → 8절 stag 대응에 사용 가능.

적용 범위:

- **4개 앱 `/*`** — 모든 응답에 붙는다: `index.html`, SPA fallback, `/assets/*.js`, `robots.txt` 자체까지. JS·robots.txt에 붙는 것은 무해하다.
- **entry-user `/mypage*`** — `/mypage`, `/mypage/…`에만. 다른 경로에는 어떤 헤더도 추가하지 않는다.
- Google은 HTML이 아닌 리소스(PDF 등)에 메타 태그를 쓸 수 없으므로 `X-Robots-Tag`가 유일한 noindex 수단이다.
  나중에 요강 PDF를 검색에서 빼야 하면 entry-user `_headers`에 `/*.pdf` 규칙을 추가한다.
- 헤더 이름은 HTTP/2 응답에서 소문자(`x-robots-tag`)로 보인다.

로컬 확인(배포 전): 앱을 빌드한 뒤 wrangler dev로 `dist/`를 그대로 서빙해 헤더를 본다.

```bash
bunx --no-install turbo run build --filter=entry-admin
bunx --no-install wrangler dev -c apps/entry-admin/wrangler.jsonc --port 8787
curl -sI http://localhost:8787/robots.txt        # 200, text/plain, x-robots-tag
curl -sI http://localhost:8787/any/deep/route    # 200, text/html(SPA fallback), x-robots-tag
```

- wrangler dev는 `apps/<앱>/.wrangler/` 상태 폴더를 만든다. 커밋하지 말 것(`.gitignore`에 아직 없음).
- 도입 시점(2026-09-11) 로컬 검증에서 확인된 동작: 4개 앱은 `/`, 임의 경로, `/robots.txt`, SVG 자산 응답 전부에 `x-robots-tag`가 붙고
  `/_headers` 요청은 `text/html`(SPA fallback)로 응답했다. entry-user는 `/mypage`·`/mypage/edit`에만 헤더가 붙고
  `/faq`·`/notice/12`·`/robots.txt`·`/sitemap.xml`에는 붙지 않았다.

## 6. index.html 메타 태그

**4개 앱**: `<meta name="robots" content="noindex, nofollow" />` 한 줄. SPA라 이 한 줄이 모든 경로에 적용된다.

**entry-user**:

| 태그                          | 값                                                        | 비고                                               |
| ----------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| `<html lang>`                 | `ko`                                                      | 기존 `en` → 한국어 사이트로 정정 (검색·스크린리더) |
| `<title>`                     | `EntryDSM \| 대덕소프트웨어마이스터고등학교 입학전형`     | 검색결과 제목. 브랜드를 앞에 두기로 결정           |
| `<meta name="description">`   | `대덕소프트웨어마이스터고등학교 입학전형 원서접수 사이트` | 검색결과 요약문                                    |
| `og:type` / `og:site_name`    | `website` / `EntryDSM`                                    |                                                    |
| `og:title` / `og:description` | title·description과 동일                                  | 카카오톡·메신저 링크 미리보기                      |
| `og:locale`                   | `ko_KR`                                                   |                                                    |

넣지 않은 것과 이유:

- **`canonical`·`og:url`** — 정적 `index.html` 하나가 모든 경로에 서빙되므로 루트 URL로 고정하면 `/faq`, `/notice`도 "대표 URL은 `/`"라고
  선언하게 되어 하위 페이지 색인이 루트로 합쳐질 위험이 있다. 생략하면 Google은 실제 URL을 대표로 쓰고, 메신저는 공유한 주소를 그대로 쓴다.
- **`og:image`** — 1200×630 PNG/JPG가 필요한데 저장소에 적합한 이미지가 없다 (SVG 파비콘은 대부분의 미리보기가 지원하지 않음). 추후 과제(13절).
- **경로별 title/description** — 정적 HTML로는 불가능. `react-helmet-async` 같은 런타임 방식이나 프리렌더링이 필요하다. 추후 과제.

## 7. sitemap.xml

- 포함: `/`, `/landing`, `/notice`, `/faq`, `/admission-overview` — 로그인 없이 볼 수 있는 안내 페이지.
- 제외: `/mypage`(Disallow), `/calculate/*`(입력 화면이라 색인 가치 없음, 크롤링은 허용), `/notice/:id`(백엔드 데이터라 정적 파일에 담을 수 없음.
  Google은 `/notice` 목록의 링크를 따라 발견한다), `/error_fixing`·`/return_soon`(임시).
- `lastmod`·`changefreq`·`priority`는 넣지 않는다 — Google은 `changefreq`·`priority`를 무시하고, `lastmod`는 정확할 때만 참고하는데 정적 파일에서
  정확히 유지할 수 없다.
- robots.txt의 `Sitemap:` 줄로 선언되어 있으므로 크롤러가 자동 발견하고, Search Console·서치어드바이저에도 같은 URL을 제출한다(10절).
- stag에서도 같은 파일이 서빙되지만 prod URL만 들어 있어 무해하다.
- ⚠️ **Router.tsx에 공개 라우트를 추가하면 이 파일도 갱신할 것** (12절).

## 8. 스테이징(stag) — 결정: 손대지 않음

prod와 stag는 같은 빌드 산출물을 쓰므로 파일이 동일하다.

- `stag-auth`·`stag-admin`·`stag-admission`·`stag-monitor`: 4개 앱 규칙(Disallow + noindex)이 그대로 적용되어 문제 없다.
- `stag.entrydsm.hs.kr`(entry-user stag): prod와 같은 "허용" 규칙이 적용된다. 어디에도 링크되지 않아 발견 확률은 낮지만,
  발견되면 prod와 **중복 콘텐츠**로 색인될 수 있다.
- 발견 시 대응(빌드 변경 없음): entry-user `public/_headers`에 호스트 규칙 한 줄을 추가하면 stag 응답에만 noindex가 붙는다.
  Cloudflare 자산 워커는 `https://`로 시작하는 규칙을 `https://<요청 호스트><경로>`와 비교한다.

  ```
  https://stag.entrydsm.hs.kr/*
    X-Robots-Tag: noindex, nofollow
  ```

- 미리보기 URL(`*.workers.dev`)은 `workers_dev: false`라 기본 비활성이므로 별도 조치가 없다.

## 9. Cloudflare 대시보드 설정 (zone `entrydsm.hs.kr`) — AI 크롤러

코드가 아닌 **zone 설정**이라 5개 앱·stag 전체에 한꺼번에 적용된다. 대시보드 → 해당 zone → **Security → Settings**.

| 설정                                                                                          | 상태        | 이유                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Block AI bots** (새 UI: Configure AI bot policies) → Block on all pages                     | **켬**      | WAF가 알려진 AI 크롤러(GPTBot, ClaudeBot, CCBot, Bytespider 등) 요청을 엣지에서 거부한다. robots.txt는 건드리지 않고, Google·Naver 등 검색 크롤러는 영향 없다. 모든 플랜 사용 가능. 2026-09-15부터 기본 정책이 바뀌어(학습·에이전트 봇 기본 차단, 검색 봇 허용) 화면 문구가 다를 수 있다. |
| **Set your preference to block training in robots.txt** (관리형 robots.txt, Bot traffic 필터) | **끔 유지** | 아래 ⚠️ 참고. 선언만 하고 강제하지 않는 기능이라 위 WAF 차단이 있으면 필요 없다.                                                                                                                                                                                                          |

⚠️ **관리형 robots.txt를 켜면 안 되는 이유**: 이 기능은 우리 robots.txt **앞에** 다음 블록을 붙여 하나의 응답으로 합친다.

```
User-Agent: *
Content-signal: search=yes, ai-train=no, use=reference
Allow: /

User-agent: GPTBot
Disallow: /
… (Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, Google-Extended, meta-externalagent)
```

Google은 같은 `User-agent: *` 그룹을 병합하므로 4개 앱에서는 `Allow: /`(Cloudflare)와 `Disallow: /`(우리 파일)가 같은 길이로 충돌하고,
**덜 제한적인 `Allow: /`가 채택되어 크롤링 차단이 무력화**된다. noindex 메타·헤더 덕분에 색인은 계속 막히지만 정책이 의도와 달라지고
검증 결과도 헷갈린다. entry-user의 `Disallow: /mypage`는 더 긴 규칙이라 영향 없다.
켜져 있는지 확인: `curl -s https://admin.entrydsm.hs.kr/robots.txt` 첫 줄이 `# BEGIN Cloudflare Managed content`면 켜진 것.

기타:

- Bot Fight Mode / Super Bot Fight Mode를 켤 경우 Google·Naver 검색 봇은 Cloudflare "verified bots"로 허용되지만, 켠 뒤에는
  Search Console **URL 검사 → 실시간 테스트**로 Googlebot 접근이 막히지 않았는지 확인한다.
- WAF 커스텀 규칙으로 `/robots.txt`·`/sitemap.xml`을 막지 않도록 주의한다 (검색 봇이 robots.txt를 5xx/403으로 받으면 사이트 전체 크롤링을 보류한다).

## 10. 검색엔진 콘솔 등록·삭제 절차 (계정 필요 — 직접 수행)

### 10.1 Google Search Console (search.google.com/search-console)

1. **소유확인** — HTML 파일 방식 확인 파일 `apps/entry-user/public/googlea5fa325d9b61d05b.html`이 이미 커밋되어 있다
   (URL 접두어 속성 `https://entrydsm.hs.kr/`). 배포 후 `https://entrydsm.hs.kr/googlea5fa325d9b61d05b.html`이 200으로 열리는지 확인하고
   Search Console에서 "확인"을 누른다. 이 파일은 삭제·이동하면 소유권이 해제되므로 유지한다.
   - URL 접두어 속성은 `https://entrydsm.hs.kr/` 아래만 다룬다. `admin.entrydsm.hs.kr` 등 서브도메인의 URL 검사·삭제 요청(4~5번)까지 하려면
     **속성 추가 → 도메인** 유형으로 `entrydsm.hs.kr`을 추가 등록한다 (Cloudflare DNS에 안내된 TXT 레코드 `google-site-verification=…` 추가).
     도메인 속성 하나가 모든 서브도메인(admin, stag-… 포함)·http/https를 포함한다.
2. **Sitemaps** → `https://entrydsm.hs.kr/sitemap.xml` 제출.
3. **설정 → 크롤링 → robots.txt** 보고서에서 호스트별로 Google이 가져간 robots.txt 내용과 가져온 시각을 확인한다. 배포 직후에는 "재크롤링 요청"을 누른다.
4. **URL 검사** → `https://admin.entrydsm.hs.kr/` 입력 → **실시간 테스트**: "robots.txt에 의해 차단됨"(Disallow 적용) 또는
   "noindex 태그로 색인 제외"가 나오면 정상. `https://entrydsm.hs.kr/faq`는 "색인 생성 가능"이어야 한다.
5. **이미 색인된 내부 앱 URL이 있을 때** (`site:admin.entrydsm.hs.kr` 등으로 확인):
   - **삭제(Removals) → 새 요청 → URL 임시 삭제 → "이 접두어로 시작하는 URL 모두 삭제"** 에 `https://admin.entrydsm.hs.kr/` 입력. 약 6개월간 결과에서 사라진다.
   - 영구 제거는 noindex가 담당한다. Disallow 상태에서는 Google이 noindex를 볼 수 없으므로, 삭제 요청 후에도 URL이 되살아나면
     해당 앱 robots.txt의 `Disallow: /`를 **일시적으로** 비워(`Disallow:`) noindex를 읽게 한 뒤 색인에서 빠진 것을 확인하고 되돌린다.
   - 이미 색인된 URL이 없으면 이 단계는 건너뛴다.

### 10.2 네이버 서치어드바이저 (searchadvisor.naver.com)

1. **웹마스터 도구 → 사이트 등록** → `https://entrydsm.hs.kr`.
2. **사이트 소유확인** — HTML 파일 업로드 방식 확인 파일 `apps/entry-user/public/naverbf6d97a24a77158f7cad49fe6b1dcc29.html`이 이미 커밋되어 있다.
   배포 후 `https://entrydsm.hs.kr/naverbf6d97a24a77158f7cad49fe6b1dcc29.html`이 200으로 열리는지 확인하고 서치어드바이저에서 "소유확인"을 누른다.
   파일은 삭제·이동 금지. 내부 앱 서브도메인은 검색 대상이 아니므로 등록하지 않는다(노출 사고 시에만 6번).
3. **요청 → 사이트맵 제출** → `https://entrydsm.hs.kr/sitemap.xml`.
4. **검증 → robots.txt** → "수집요청"으로 최신 robots.txt를 가져가게 하고 "검증"으로 규칙을 확인한다.
5. **요청 → 웹 페이지 수집**으로 주요 URL(`/`, `/notice`, `/faq`, `/admission-overview`)의 수집을 요청한다.
6. 내부 앱 URL이 네이버에 노출되어 있으면: 해당 서브도메인도 사이트로 등록해 robots.txt 수집요청을 넣으면 다음 수집 때 제외된다.
   급하면 네이버 고객센터의 검색결과 삭제(게시중단) 문의를 이용한다.

### 10.3 (선택) Bing Webmaster Tools

Search Console 계정 가져오기(Import)로 속성·사이트맵을 한 번에 등록할 수 있다. Bing도 robots.txt·noindex·X-Robots-Tag를 같은 방식으로 해석한다.

## 11. 배포 후 검증 체크리스트 (수동)

Git Bash 기준. PowerShell에서는 `curl` 대신 `curl.exe`를 쓴다 (`curl`은 Invoke-WebRequest 별칭).

**4개 앱** (auth·admin·admission·monitor 각각, stag-\* 도 동일):

| 명령                                                                            | 기대 결과                                                                                            |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `curl -sI https://admin.entrydsm.hs.kr/robots.txt`                              | `200`, `content-type: text/plain`, `x-robots-tag: noindex, nofollow`                                 |
| `curl -s https://admin.entrydsm.hs.kr/robots.txt`                               | 커밋한 파일 그대로. 첫 줄이 `# BEGIN Cloudflare Managed content`면 관리형 robots.txt가 켜진 것 → 9절 |
| `curl -sI https://admin.entrydsm.hs.kr/some/deep/route`                         | `200`, `text/html`(SPA fallback), `x-robots-tag` 있음                                                |
| `curl -s https://admin.entrydsm.hs.kr/ \| grep -io '<meta name="robots"[^>]*>'` | `<meta name="robots" content="noindex, nofollow" />`                                                 |
| `curl -sI https://admin.entrydsm.hs.kr/_headers`                                | `text/html` — 규칙 파일이 URL로 노출되지 않음                                                        |

**entry-user** (`entrydsm.hs.kr`):

| 명령                                                                                       | 기대 결과                                                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `curl -sI https://entrydsm.hs.kr/robots.txt`                                               | `200`, `text/plain`, `x-robots-tag` **없음**                                    |
| `curl -s https://entrydsm.hs.kr/robots.txt`                                                | `Disallow: /mypage` 와 `Sitemap:` 줄 존재                                       |
| `curl -sI https://entrydsm.hs.kr/mypage`                                                   | `x-robots-tag: noindex, nofollow`                                               |
| `curl -sI https://entrydsm.hs.kr/faq`                                                      | `200`, `x-robots-tag` **없음**                                                  |
| `curl -sI https://entrydsm.hs.kr/sitemap.xml`                                              | `200`, `application/xml`                                                        |
| `curl -s https://entrydsm.hs.kr/ \| grep -io '<meta name="\(robots\|description\)"[^>]*>'` | `description`만 나오고 `robots`는 없어야 함                                     |
| `curl -s https://entrydsm.hs.kr/ \| grep -io '<html lang="[^"]*">'`                        | `<html lang="ko">`                                                              |
| `curl -sI https://entrydsm.hs.kr/googlea5fa325d9b61d05b.html`                              | `200`, `text/html`, `x-robots-tag` **없음** — 소유확인 파일(네이버 파일도 동일) |

콘솔 확인(배포 1~2주 후):

- Search Console **robots.txt 보고서**에서 10개 호스트 모두 최신 내용을 가져갔는지.
- **URL 검사 실시간 테스트**: `https://admin.entrydsm.hs.kr/` → 차단/색인 제외, `https://entrydsm.hs.kr/faq` → 색인 가능.
- 검색창에 `site:entrydsm.hs.kr -site:www.entrydsm.hs.kr` 로 어떤 호스트가 색인됐는지 확인. `site:admin.entrydsm.hs.kr` 등이 0건이어야 한다.
- 카카오톡·슬랙에 `https://entrydsm.hs.kr/` 를 붙여 미리보기 제목·설명이 6절 값으로 나오는지.

## 12. 유지보수 규칙

- **새 앱 추가 시**: `public/robots.txt`(`Disallow: /`) + `public/_headers`(`/*` noindex) + `index.html` noindex 메타 3종을 함께 넣는다. 검색 허용 앱이면 entry-user를 본뜬다.
- **entry-user에 라우트 추가 시**: 공개 안내 페이지면 `sitemap.xml`에 추가, 로그인·개인 화면이면 `robots.txt`에 `Disallow`와 `_headers`에 noindex 규칙을 추가한다.
- 로그인이 필요한 경로는 항상 Disallow 대상이다 (크롤러는 빈 껍데기나 로그인 리디렉션만 본다).
- `/assets/`는 절대 Disallow 하지 않는다. `dist/`에 `404.html`을 넣지 않는다 (SPA fallback 규칙, DEPLOYMENT.md).
- robots.txt·`_headers`를 바꾸면 커밋 전에 로컬 빌드로 `dist/`에 복사됐는지 확인하고(`ls apps/<앱>/dist`), 배포 후 11절 체크리스트를 돌린다.
- Cloudflare zone 설정(9절)을 바꿀 때는 이 문서의 표를 같이 갱신한다.
- `apps/entry-user/public/`의 소유확인 파일 2개(`googlea5fa….html`, `naverbf6d….html`)는 삭제·이름 변경 금지 — 지우면 Search Console·서치어드바이저 소유권이 해제된다.
  `robots.txt`·`_headers` 규칙이 이 파일들을 막지 않는지도 함께 확인한다(현재 규칙은 `/mypage*`만 건드린다).

## 13. 추후 과제

- **경로별 메타**: `/notice/:id` 제목·설명, `/faq` 등 페이지별 `<title>`·`description` — `react-helmet-async` 도입 또는 빌드 시 프리렌더링.
- **`og:image`**: 1200×630 PNG 제작 후 `public/`에 추가하고 `<meta property="og:image" content="https://entrydsm.hs.kr/og.png" />` 삽입.
- **4개 앱 `lang="ko"`**: 지금은 entry-user만 `ko`로 바꿨다. 나머지도 한국어 UI이므로 정정할 것(검색과 무관, 접근성).
- **stag noindex**: 8절의 `_headers` 호스트 규칙을 선제적으로 넣을지 결정.
- **공지 상세 sitemap**: 백엔드가 `sitemap.xml`을 생성하거나, 빌드 시 API에서 공지 목록을 받아 정적 파일을 만드는 방식 검토.
- **구조화 데이터**: 학교·전형 일정에 `Organization`/`Event` JSON-LD 추가 검토.

## 참고

- Google — robots.txt 소개: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Google — noindex로 색인 차단: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Google — robots.txt 해석 규칙(그룹 병합·우선순위): https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
- Google — robots 메타 태그·X-Robots-Tag: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- Cloudflare — Workers 정적 자산 `_headers`: https://developers.cloudflare.com/workers/static-assets/headers/
- Cloudflare — 관리형 robots.txt: https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/
- Cloudflare — Block AI bots: https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/
- Sitemap 프로토콜: https://www.sitemaps.org/protocol.html
- 네이버 서치어드바이저: https://searchadvisor.naver.com/

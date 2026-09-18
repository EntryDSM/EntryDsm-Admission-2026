import { execSync } from "node:child_process";

/**
 * Sentry release 이름에 쓸 커밋 SHA(7자)를 구한다.
 * - Workers Builds: 빌드 컨테이너의 `WORKERS_CI_COMMIT_SHA` (turbo.json build.env 에도 등록돼 캐시 키에 포함된다)
 * - 로컬: `git rev-parse` 폴백, git 이 없으면 `local`
 */
export const resolveCommitSha = (env: Record<string, string | undefined> = process.env): string => {
  const fromCi = env.WORKERS_CI_COMMIT_SHA?.trim();
  if (fromCi) {
    return fromCi.slice(0, 7);
  }

  try {
    const sha = execSync("git rev-parse --short=7 HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    return sha || "local";
  } catch {
    return "local";
  }
};

/**
 * vite `define` 항목. 앱 코드에서는 `import.meta.env.VITE_SENTRY_RELEASE` 로 읽힌다
 * (vite 는 define 의 `import.meta.env.*` 키를 dev·build 모두 지원한다).
 * vite.config.ts 는 Node 가 직접 로드하므로 워크스페이스 별칭 대신 상대 경로로 이 파일을 import 한다.
 */
export const sentryReleaseDefine = (app: string): Record<string, string> => ({
  "import.meta.env.VITE_SENTRY_RELEASE": JSON.stringify(`${app}@${resolveCommitSha()}`),
});

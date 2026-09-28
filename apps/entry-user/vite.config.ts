import { readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, normalizePath, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { sentryReleaseDefine } from "../../packages/observability/vite";

const NOTICE_IMAGE_DIR = "NoticeImg";
const NOTICE_IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

/**
 * public/NoticeImg 의 이미지 URL 목록을 `virtual:notice-images` 모듈로 내보낸다(NoticeModal 이 한 장씩 띄운다).
 * 배포된 사이트에서는 폴더 안을 조회할 수 없어서 빌드할 때 목록을 만들어 넣는다.
 * 순서는 파일명 a-z 순이고, 대소문자는 가리지 않으며 숫자는 크기 순(1, 2, 10)이다. 이미지가 아닌 파일은 뺀다.
 * 개발 서버에서는 폴더에 파일을 넣거나 빼면 목록을 다시 읽고 페이지를 새로고침한다.
 */
const noticeImages = (): Plugin => {
  const virtualId = "virtual:notice-images";
  const resolvedVirtualId = `\0${virtualId}`;
  let imageDir = "";

  const readImageUrls = () => {
    try {
      const collator = new Intl.Collator("ko", { numeric: true });
      return readdirSync(imageDir, { withFileTypes: true })
        .filter(entry => entry.isFile() && NOTICE_IMAGE_EXTENSIONS.test(entry.name))
        .map(entry => entry.name)
        .sort(collator.compare)
        .map(fileName => `/${NOTICE_IMAGE_DIR}/${encodeURIComponent(fileName)}`);
    } catch {
      // 폴더가 없으면(이미지를 모두 지워 git 에서 폴더가 사라진 경우 등) 띄울 공지가 없다.
      return [];
    }
  };

  return {
    name: "entry-user:notice-images",
    configResolved(config) {
      imageDir = normalizePath(join(config.publicDir, NOTICE_IMAGE_DIR));
    },
    resolveId(id) {
      return id === virtualId ? resolvedVirtualId : undefined;
    },
    load(id) {
      return id === resolvedVirtualId ? `export default ${JSON.stringify(readImageUrls())};` : undefined;
    },
    configureServer(server) {
      const reloadImageUrls = (file: string) => {
        if (!normalizePath(file).startsWith(`${imageDir}/`)) return;

        const virtualModule = server.moduleGraph.getModuleById(resolvedVirtualId);
        if (virtualModule) server.moduleGraph.invalidateModule(virtualModule);
        server.ws.send({ type: "full-reload" });
      };

      server.watcher.on("add", reloadImageUrls);
      server.watcher.on("unlink", reloadImageUrls);
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), noticeImages()],
  // Sentry release("entry-user@<commit sha>") 를 import.meta.env.VITE_SENTRY_RELEASE 로 주입한다 (docs/OBSERVABILITY.md 4절).
  define: sentryReleaseDefine("entry-user"),
  server: {
    port: 8000,
    strictPort: true,
  },
  preview: {
    port: 9000,
    strictPort: true,
  },
});

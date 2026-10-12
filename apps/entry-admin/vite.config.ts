import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryReleaseDefine } from "../../packages/observability/vite";

export default defineConfig({
  plugins: [react()],
  // Sentry release("entry-admin@<commit sha>")를 빌드 때 주입한다.
  define: sentryReleaseDefine("entry-admin"),
  server: {
    port: 8003,
    strictPort: true,
  },
  preview: {
    port: 9003,
    strictPort: true,
  },
});

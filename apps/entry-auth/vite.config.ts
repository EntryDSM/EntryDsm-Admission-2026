import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryReleaseDefine } from "../../packages/observability/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Sentry release("entry-auth@<commit sha>") 를 import.meta.env.VITE_SENTRY_RELEASE 로 주입한다 (docs/OBSERVABILITY.md 4절).
  define: sentryReleaseDefine("entry-auth"),
  server: {
    port: 8001,
    strictPort: true,
  },
  preview: {
    port: 9001,
    strictPort: true,
  },
});

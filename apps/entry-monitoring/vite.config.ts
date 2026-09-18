import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryReleaseDefine } from "../../packages/observability/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Sentry release("entry-monitoring@<commit sha>") 를 import.meta.env.VITE_SENTRY_RELEASE 로 주입한다 (docs/OBSERVABILITY.md 4절).
  define: sentryReleaseDefine("entry-monitoring"),
  server: {
    port: 8004,
    strictPort: true,
  },
  preview: {
    port: 9004,
    strictPort: true,
  },
});

import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, globalIgnores } from "eslint/config"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig([
  globalIgnores(["dist"]),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: false,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import {defineConfig, globalIgnores} from 'eslint/config';

export default defineConfig([
  prettierConfig,
  // Web/shared lint only. Native trees live in `_archive-non-web/` (2026-08-27).
  globalIgnores([
    'dist',
    'desktop-dist',
    '_archive-non-web',
    'canon/_archive-non-web',
    'public',
    'scripts',
    'workspace-files',
    '.blackbox',
    'packages/core-rs',
    'packages/core/wasm',
    'packages/core/src/generated',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['packages/core/src/**/*.ts'],
    languageOptions: {
      globals: {...globals.browser, ...globals.node},
    },
  },
  // Uncle Bob CRAP-lite pilot: complexity ceiling on calc/metrics pure modules.
  // Broader shared files stay on crap-check allowlists until refactored.
  {
    files: [
      'packages/shared/src/utils/calc.ts',
      'packages/shared/src/utils/calcValidators.ts',
      'packages/shared/src/utils/plates.ts',
      'packages/shared/src/utils/journalMetrics.ts',
    ],
    rules: {
      complexity: ['error', 12],
    },
  },
]);

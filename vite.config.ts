import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import wasm from 'vite-plugin-wasm';
import {fileURLToPath, URL} from 'node:url';

const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET?.trim() ||
  process.env.API_PROXY_TARGET?.trim() ||
  'http://127.0.0.1:3002';

// https://vite.dev/config/
export default defineConfig({
  plugins: [wasm(), react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
      '@training/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
      '@training/shared': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@training/core'],
  },
  assetsInclude: ['**/*.wasm'],
  server: {
    host: true,
    allowedHosts: true,
    watch: {
      ignored: ['**/_tmp_auth_sync/**', '**/_tmp_*/**', '**/public/imagePhone/**'],
    },
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'safari15',
  },
});

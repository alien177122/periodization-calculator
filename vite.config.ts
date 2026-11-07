import {existsSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import wasm from 'vite-plugin-wasm';
import {fileURLToPath, URL} from 'node:url';
import {iphoneHarness} from './dev/iphone-harness/plugin';

const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET?.trim() ||
  process.env.API_PROXY_TARGET?.trim() ||
  'http://127.0.0.1:3002';

/** Keep dist ≤ 5 MB: auth triptych (`imagePhone`) is unused on the guest screen. */
function omitHeavyPublicSources() {
  return {
    name: 'omit-heavy-public-sources',
    apply: 'build' as const,
    closeBundle() {
      const distDir = fileURLToPath(new URL('./dist', import.meta.url));
      const triptych = join(distDir, 'imagePhone');
      if (existsSync(triptych)) rmSync(triptych, {recursive: true, force: true});
    },
  };
}

/**
 * Cloudflare quick tunnels terminate TLS on 443. Vite leaves the HMR port empty,
 * so the browser builds `wss://<host>:/` and then falls back to localhost — which
 * a phone cannot reach. Default the port from the page protocol when it is blank.
 */
function tunnelHmrPortPlugin() {
  const needle = 'hmrPort || importMetaUrl.port';
  const patched =
    'hmrPort || importMetaUrl.port || (importMetaUrl.protocol === "https:" ? "443" : "80")';
  return {
    name: 'tunnel-hmr-default-port',
    enforce: 'post' as const,
    transform(code: string, id: string) {
      const normalizedId = id.replaceAll('\\', '/');
      if (!normalizedId.includes('/vite/dist/client/client.mjs') || !code.includes(needle)) {
        return null;
      }
      return code.replaceAll(needle, patched);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    react(),
    tunnelHmrPortPlugin(),
    omitHeavyPublicSources(),
    iphoneHarness(),
  ],
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
      ignored: [
        '**/_tmp_auth_sync/**',
        '**/_tmp_*/**',
        '**/public/imagePhone/**',
        '**/*.tar',
        '**/*.tar.gz',
        '**/*.tgz',
      ],
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

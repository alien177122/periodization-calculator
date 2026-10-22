import {existsSync, readdirSync, rmSync, unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import {fileURLToPath, URL} from 'node:url';

const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET?.trim() ||
  process.env.API_PROXY_TARGET?.trim() ||
  'http://127.0.0.1:3002';

/**
 * Keep dist ≤ 5 MB: never ship mp4 wallpaper masters.
 * Auth triptych (`imagePhone`) is unused while guest wallpaper is the video canvas.
 */
function omitHeavyPublicSources() {
  return {
    name: 'omit-heavy-public-sources',
    apply: 'build' as const,
    closeBundle() {
      const distDir = fileURLToPath(new URL('./dist', import.meta.url));
      const wallpapers = join(distDir, 'wallpapers');
      if (existsSync(wallpapers)) {
        for (const name of readdirSync(wallpapers)) {
          if (name.endsWith('.mp4')) unlinkSync(join(wallpapers, name));
        }
      }
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
  plugins: [react(), tunnelHmrPortPlugin(), omitHeavyPublicSources()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
      '@training/shared': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
    },
  },
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

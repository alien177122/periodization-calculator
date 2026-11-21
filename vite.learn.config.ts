import {fileURLToPath, URL} from 'node:url';
import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react-swc';

/**
 * Отдельная дев-конфигурация превью самоучителя (`npm run dev:learn`, порт 5174).
 * Основной dev (5173, vite.config.ts) не затрагивается.
 */
const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET?.trim() ||
  process.env.API_PROXY_TARGET?.trim() ||
  'http://127.0.0.1:3002';

/** Redirect `/` → `/selfstudy/`, чтобы порт 5174 сразу открывал превью. */
function learnRootRedirect(): Plugin {
  return {
    name: 'learn-root-redirect',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '/').split('?')[0];
        if (url === '/' || url === '/index.html') {
          res.statusCode = 302;
          res.setHeader('Location', '/selfstudy/');
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [react(), learnRootRedirect()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
      '@training/shared': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'safari15',
    rollupOptions: {
      input: {
        learn: fileURLToPath(new URL('./selfstudy/index.html', import.meta.url)),
      },
    },
  },
});

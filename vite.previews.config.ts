import {fileURLToPath, URL} from 'node:url';
import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react-swc';

/**
 * Дев-конфигурация превью-хаба (`npm run dev:previews`, порт 5175).
 * Основной dev (5173, vite.config.ts) и самоучитель (5174, vite.learn.config.ts) не затрагиваются.
 */
const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET?.trim() ||
  process.env.API_PROXY_TARGET?.trim() ||
  'http://127.0.0.1:3002';

/** Redirect `/` → `/previews/`, чтобы порт 5175 сразу открывал хаб. */
function previewsRootRedirect(): Plugin {
  return {
    name: 'previews-root-redirect',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '/').split('?')[0];
        if (url === '/' || url === '/index.html') {
          res.statusCode = 302;
          res.setHeader('Location', '/previews/');
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
  plugins: [react(), previewsRootRedirect()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
      '@training/shared': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5175,
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
        previews: fileURLToPath(new URL('./previews/index.html', import.meta.url)),
      },
    },
  },
});

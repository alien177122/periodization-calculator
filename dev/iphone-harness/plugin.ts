import {readFile} from 'node:fs/promises';
import {extname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {Plugin} from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

/**
 * Dev-only iPhone viewport + element inspector.
 *
 * Serves `/__iphone`: a device frame with the app in a same-origin iframe.
 * The frame can be inspected, clicked and nudged without touching app code.
 * Never included in `npm run build` because `apply: 'serve'`.
 */
export function iphoneHarness(): Plugin {
  return {
    name: 'iphone-harness',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__iphone', async (req, res, next) => {
        const path = (req.url || '/').split('?')[0];
        const file = path === '/' || path === '' ? 'index.html' : path.replace(/^\/+/, '');
        if (!/^(index\.html|client\.(js|css))$/.test(file)) {
          next();
          return;
        }
        try {
          const body = await readFile(join(root, file));
          res.statusCode = 200;
          res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
          res.setHeader('Cache-Control', 'no-store');
          res.end(body);
        } catch {
          next();
        }
      });
    },
  };
}

import {createApp} from './app.js';
import {getServerConfig} from './config.js';

const config = getServerConfig(process.env);
const app = createApp({env: process.env});

// Audit 2026-11-07: explicit opt-in to non-loopback bind in development.
if (config.isDevelopment && config.host === '0.0.0.0') {
  console.warn(
    'ALLOW_DEV_BIND=1 — API слушает 0.0.0.0 в development (доступен из LAN). Убери переменную, если это не нужно.',
  );
}

app.listen(config.port, config.host, () => {
  console.log(`API → http://localhost:${config.port}`);
});

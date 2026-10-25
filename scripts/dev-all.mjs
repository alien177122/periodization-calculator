import {spawn, execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
import net from 'node:net';
import process from 'node:process';
import {setTimeout as delay} from 'node:timers/promises';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VITE_PORT = '5173';

// Do not use generic PORT — docker/public scripts often set PORT=3001 (Uptime Kuma).
const API_PORT = process.env.DEV_API_PORT?.trim() || process.env.API_PORT?.trim() || '3002';
const API_PROXY_TARGET = `http://127.0.0.1:${API_PORT}`;
const API_URL = `${API_PROXY_TARGET}/api/health`;

const managedChildren = [];
let shuttingDown = false;

function killPort(port) {
  try {
    const pids = execSync(`lsof -ti :${port}`, {encoding: 'utf8'}).trim();
    if (!pids) return 0;

    let killed = 0;
    for (const pid of pids.split('\n').filter(Boolean)) {
      try {
        process.kill(Number(pid), 'SIGTERM');
        killed += 1;
      } catch {
        // already gone
      }
    }
    return killed;
  } catch {
    return 0;
  }
}

function isPortOpen(port) {
  return new Promise(resolve => {
    const socket = net.connect({port: Number(port), host: '127.0.0.1'});
    const done = open => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(open);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.setTimeout(400, () => done(false));
  });
}

function spawnManaged(label, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {...process.env, ...extraEnv},
  });

  managedChildren.push(child);

  child.once('exit', (code, signal) => {
    if (shuttingDown) return;
    if (code === 0) return;
    console.error(`[dev] ${label} exited with code ${code ?? 'unknown'} (signal: ${signal})`);
    void shutdown(code ?? 1);
  });

  child.once('error', error => {
    if (shuttingDown) return;
    console.error(`[dev] ${label} failed to start`, error);
    void shutdown(1);
  });

  return child;
}

async function waitForHealth(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type') ?? '';
      if (response.ok && contentType.includes('application/json')) {
        const body = await response.json();
        if (body?.ok === true) return;
      }
    } catch {
      // API still starting
    }
    await delay(250);
  }

  throw new Error(`API health check timed out: ${url}`);
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of managedChildren) {
    if (!child.killed) child.kill('SIGTERM');
  }

  await delay(300);
  process.exit(exitCode);
}

process.on('SIGINT', () => void shutdown(0));
process.on('SIGTERM', () => void shutdown(0));

const freedApi = killPort(API_PORT);
const freedVite = killPort(VITE_PORT);
if (freedApi || freedVite) {
  console.log(
    `[dev] Freed stale listeners (api:${freedApi}, vite:${freedVite}) on :${API_PORT} / :${VITE_PORT}`,
  );
  await delay(400);
}

if (await isPortOpen('3001')) {
  console.warn(
    `[dev] Port 3001 is busy (often Uptime Kuma). Gym API uses :${API_PORT}; Vite proxy → ${API_PROXY_TARGET}`,
  );
}

console.log(`[dev] Starting API on port ${API_PORT}…`);
spawnManaged('api', 'node', ['--experimental-strip-types', 'server/index.js'], {
  PORT: API_PORT,
  JWT_SECRET: process.env.JWT_SECRET?.trim() || 'dev',
  NODE_ENV: 'development',
});

try {
  await waitForHealth(API_URL);
  console.log(`[dev] API ready → ${API_URL}`);
} catch (error) {
  console.error(`[dev] ${error.message}`);
  await shutdown(1);
}

console.log(
  `[dev] Starting Vite on http://127.0.0.1:${VITE_PORT} (proxy /api → ${API_PROXY_TARGET})…`,
);
spawnManaged('vite', 'node', ['node_modules/vite/bin/vite.js'], {
  VITE_API_PROXY_TARGET: API_PROXY_TARGET,
  API_PROXY_TARGET: API_PROXY_TARGET,
});

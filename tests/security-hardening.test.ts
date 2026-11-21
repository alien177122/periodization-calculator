import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {once} from 'node:events';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {createApp} from '../server/app.js';
import {createDb} from '../server/db.js';
import {THEME_BOOT_SCRIPT_CSP_HASH} from '../server/security.js';
import {createFileWorkspace} from '../server/file-workspace.js';
import {
  assertPublicTunnelConfig,
  getPublicTunnelSecurityIssues,
  publicServerEnv,
} from '../scripts/public-utils.mjs';

async function createSecurityContext(
  env: Record<string, string>,
  extra: {fetchImpl?: typeof fetch} = {},
) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'gym-sec-'));
  const db = createDb({dbPath: path.join(tempDir, 'gym.db')});
  const app = createApp({env, db, enableStatic: false, ...extra});
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No port');

  return {
    db,
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise((resolve, reject) => {
        server.close(error => (error ? reject(error) : resolve(undefined)));
      });
      db.close();
      await rm(tempDir, {recursive: true, force: true});
    },
  };
}

async function register(baseUrl: string, name: string, password = 'squat123') {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name, password}),
  });
  const body = await response.json();
  return {response, body};
}

test('public tunnel refuses missing or development JWT secrets', () => {
  assert.match(getPublicTunnelSecurityIssues({jwtSecret: ''}).join(' '), /JWT_SECRET is required/);
  assert.match(
    getPublicTunnelSecurityIssues({jwtSecret: 'gym-secret-dev'}).join(' '),
    /development or placeholder/,
  );
  assert.match(
    getPublicTunnelSecurityIssues({jwtSecret: 'dev'}).join(' '),
    /development or placeholder/,
  );
  assert.throws(() => assertPublicTunnelConfig({jwtSecret: 'replace-with-a-long-random-secret'}));
  assert.equal(
    getPublicTunnelSecurityIssues({jwtSecret: 'a-long-random-production-secret'}).length,
    0,
  );
});

test('publicServerEnv forces production and disables file workspace', () => {
  const env = publicServerEnv(
    {env: {JWT_SECRET: 'ok', ENABLE_FILE_WORKSPACE: '1', NODE_ENV: 'development'}},
    3010,
  );
  assert.equal(env.NODE_ENV, 'production');
  assert.equal(env.ENABLE_FILE_WORKSPACE, '0');
  assert.equal(env.PORT, '3010');
});

test('production health responses hide X-Powered-By and pin theme CSP hash', async t => {
  const ctx = await createSecurityContext({NODE_ENV: 'production', JWT_SECRET: 'prod-test-secret'});
  t.after(() => ctx.close());

  const response = await fetch(`${ctx.baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-powered-by'), null);

  const csp = response.headers.get('content-security-policy') ?? '';
  assert.match(csp, new RegExp(`script-src 'self' '${THEME_BOOT_SCRIPT_CSP_HASH}'`));
  assert.equal(csp.includes("'unsafe-inline'"), true);
  assert.equal(/script-src[^;]*'unsafe-inline'/.test(csp), false);
});

test('theme boot script hash matches index.html inline script', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match);
  const digest = createHash('sha256').update(match[1]).digest('base64');
  assert.equal(`sha256-${digest}`, THEME_BOOT_SCRIPT_CSP_HASH);
});

test('register rejects usernames longer than 32 characters', async t => {
  const ctx = await createSecurityContext({NODE_ENV: 'test', JWT_SECRET: 'test-secret'});
  t.after(() => ctx.close());

  const longName = await register(ctx.baseUrl, 'A'.repeat(33));
  assert.equal(longName.response.status, 400);
  assert.match(longName.body.error, /32/);
});

test('access tokens are signed with HS256', async t => {
  const ctx = await createSecurityContext({NODE_ENV: 'test', JWT_SECRET: 'test-secret'});
  t.after(() => ctx.close());

  const created = await register(ctx.baseUrl, 'HsUser');
  assert.equal(created.response.status, 200);
  const [header] = String(created.body.token).split('.');
  const parsed = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
  assert.equal(parsed.alg, 'HS256');
});

test('file workspace API does not share inbox between users', async t => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'workspace-api-users-'));
  t.after(async () => {
    await rm(rootDir, {recursive: true, force: true});
  });

  const ctx = await createSecurityContext({
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    ENABLE_FILE_WORKSPACE: '1',
    WORKSPACE_FILES_ROOT: rootDir,
  });
  t.after(() => ctx.close());

  const alice = await register(ctx.baseUrl, 'Alice');
  const bob = await register(ctx.baseUrl, 'Bob');
  const workspace = createFileWorkspace({env: {WORKSPACE_FILES_ROOT: rootDir}});
  await workspace.ensureWorkspace('Alice');
  await writeFile(
    path.join(workspace.getPaths('Alice').inboxDir, 'secret-alice.txt'),
    'alice',
    'utf8',
  );

  const aliceList = await fetch(`${ctx.baseUrl}/api/files/workspace`, {
    headers: {Authorization: `Bearer ${alice.body.token}`},
  });
  const bobList = await fetch(`${ctx.baseUrl}/api/files/workspace`, {
    headers: {Authorization: `Bearer ${bob.body.token}`},
  });
  const aliceBody = await aliceList.json();
  const bobBody = await bobList.json();

  assert.equal(aliceList.status, 200);
  assert.equal(bobList.status, 200);
  assert.equal(
    aliceBody.files.some((file: {name: string}) => file.name === 'secret-alice.txt'),
    true,
  );
  assert.equal(
    bobBody.files.some((file: {name: string}) => file.name === 'secret-alice.txt'),
    false,
  );
});

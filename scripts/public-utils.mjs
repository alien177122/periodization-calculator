import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const DEFAULT_PUBLIC_PORT = 3001;
export const PUBLIC_ENV_FILES = ['.env.public', '.env.public.local'];
export const LAUNCHD_LABEL = 'com.reactproject.public';

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function parseEnvText(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key) continue;

    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());
    env[key] = value;
  }
  return env;
}

export function loadPublicEnv({cwd = process.cwd(), env = process.env} = {}) {
  const fileEnv = {};

  for (const name of PUBLIC_ENV_FILES) {
    const filePath = path.join(cwd, name);
    if (!existsSync(filePath)) continue;
    Object.assign(fileEnv, parseEnvText(readFileSync(filePath, 'utf8')));
  }

  return {...fileEnv, ...env};
}

export function envNumber(value, fallback, min = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, parsed);
}

export function normalizeHostname(value) {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

export function getPublicConfig({cwd = process.cwd(), env = process.env} = {}) {
  const effectiveEnv = loadPublicEnv({cwd, env});
  const publicHostname = normalizeHostname(effectiveEnv.PUBLIC_HOSTNAME);
  const tunnelToken = effectiveEnv.CLOUDFLARE_TUNNEL_TOKEN?.trim() || '';
  const jwtSecret = effectiveEnv.JWT_SECRET?.trim() || '';
  const localPort = envNumber(effectiveEnv.PUBLIC_PORT, DEFAULT_PUBLIC_PORT, 1);

  return {
    cwd,
    env: effectiveEnv,
    jwtSecret,
    localPort,
    tunnelToken,
    publicHostname,
    publicUrl: publicHostname ? `https://${publicHostname}` : '',
  };
}

function isPlaceholderSecret(value) {
  return typeof value === 'string' && value.startsWith('replace-with-');
}

function isPlaceholderToken(value) {
  return typeof value === 'string' && value.startsWith('replace-with-');
}

function isPlaceholderHostname(value) {
  return (
    typeof value === 'string' && (value === 'app.example.com' || value.endsWith('.example.com'))
  );
}

export function getStableConfigIssues(config) {
  const issues = [];

  if (!config.jwtSecret) {
    issues.push('JWT_SECRET is required in .env.public');
  } else if (isPlaceholderSecret(config.jwtSecret)) {
    issues.push('JWT_SECRET still contains the example placeholder');
  }

  if (!config.tunnelToken) {
    issues.push('CLOUDFLARE_TUNNEL_TOKEN is required in .env.public');
  } else if (isPlaceholderToken(config.tunnelToken)) {
    issues.push('CLOUDFLARE_TUNNEL_TOKEN still contains the example placeholder');
  }

  if (!config.publicHostname) {
    issues.push('PUBLIC_HOSTNAME is required in .env.public');
  } else if (isPlaceholderHostname(config.publicHostname)) {
    issues.push('PUBLIC_HOSTNAME still contains the example hostname');
  }

  return issues;
}

export function assertStableConfig(config) {
  const issues = getStableConfigIssues(config);
  if (issues.length > 0) {
    throw new Error(issues.join('. '));
  }
}

const DEV_JWT_SECRETS = new Set(['dev', 'gym-secret-dev']);

export function getPublicTunnelSecurityIssues(config) {
  const issues = [];
  const secret = config.jwtSecret?.trim() || '';
  if (!secret) {
    issues.push('JWT_SECRET is required to start a public tunnel');
  } else if (isPlaceholderSecret(secret) || DEV_JWT_SECRETS.has(secret)) {
    issues.push('JWT_SECRET cannot be a development or placeholder secret on a public tunnel');
  }
  return issues;
}

export function assertPublicTunnelConfig(config) {
  const issues = getPublicTunnelSecurityIssues(config);
  if (issues.length > 0) {
    throw new Error(issues.join('. '));
  }
}

export function publicServerEnv(config, port) {
  return {
    ...config.env,
    PORT: String(port),
    NODE_ENV: 'production',
    ENABLE_FILE_WORKSPACE: '0',
  };
}

export function ensureLogDir(cwd = process.cwd()) {
  const logDir = path.join(cwd, 'logs');
  mkdirSync(logDir, {recursive: true});
  return logDir;
}

export function getLaunchAgentPath(home = os.homedir()) {
  return path.join(home, 'Library', 'LaunchAgents', `${LAUNCHD_LABEL}.plist`);
}

function xmlEscape(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function plistArray(values) {
  return values.map(value => `    <string>${xmlEscape(value)}</string>`).join('\n');
}

function plistDict(entries) {
  return entries
    .map(
      ([key, value]) =>
        `    <key>${xmlEscape(key)}</key>\n    <string>${xmlEscape(value)}</string>`,
    )
    .join('\n');
}

export function buildLaunchdPlist({nodePath, scriptPath, cwd, stdoutPath, stderrPath}) {
  const envVars = {
    HOME: os.homedir(),
    PATH: process.env.PATH || '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin',
    SHELL: process.env.SHELL || '/bin/zsh',
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${xmlEscape(LAUNCHD_LABEL)}</string>
  <key>ProgramArguments</key>
  <array>
${plistArray([nodePath, scriptPath, '--stable'])}
  </array>
  <key>WorkingDirectory</key>
  <string>${xmlEscape(cwd)}</string>
  <key>EnvironmentVariables</key>
  <dict>
${plistDict(Object.entries(envVars))}
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>15</integer>
  <key>StandardOutPath</key>
  <string>${xmlEscape(stdoutPath)}</string>
  <key>StandardErrorPath</key>
  <string>${xmlEscape(stderrPath)}</string>
</dict>
</plist>
`;
}

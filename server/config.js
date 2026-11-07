const DEV_JWT_SECRET = 'gym-secret-dev';

function envNumber(value, fallback, min = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, parsed);
}

function parseCorsOrigins(env = process.env) {
  const raw = env.CORS_ORIGINS?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

function envFlag(value) {
  if (value === undefined || value === null || value === '') return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes') return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'no') return false;
  return null;
}

function resolvePlategaEnabled(env) {
  const flag = envFlag(env.PLATEGA_ENABLED);
  if (flag !== null) return flag;
  return false;
}

function assertBillingConfig(config) {
  if (!config.plategaEnabled) return;
  if (config.isDevelopment) return;

  const missing = [];
  if (!config.plategaMerchantId) missing.push('PLATEGA_MERCHANT_ID');
  if (!config.plategaSecret) missing.push('PLATEGA_SECRET');
  if (!config.publicAppUrl) missing.push('PUBLIC_APP_URL');

  if (missing.length > 0) {
    throw new Error(`Platega billing enabled but missing required env: ${missing.join(', ')}`);
  }
}

/**
 * File workspace is opt-in outside development.
 * Development defaults to on for local DX; set ENABLE_FILE_WORKSPACE=0 to disable.
 * API inbox is per authenticated user when enabled. Never enable on public-run.
 */
function resolveEnableFileWorkspace(env, isDevelopment) {
  const flag = envFlag(env.ENABLE_FILE_WORKSPACE);
  if (flag !== null) return flag;
  return isDevelopment;
}

export function getServerConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV?.trim() || 'development';
  const isDevelopment = nodeEnv === 'development';
  const jwtSecret = env.JWT_SECRET?.trim();

  if (!isDevelopment && !jwtSecret) {
    throw new Error('JWT_SECRET is required when NODE_ENV is not development');
  }

  // Audit 2026-11-07: development binds to loopback by default; explicit
  // ALLOW_DEV_BIND=1 opts in to 0.0.0.0 (LAN exposure). Docker/public-run set
  // NODE_ENV=production and are unaffected.
  const devBindAllowed = envFlag(env.ALLOW_DEV_BIND) === true;
  const host = isDevelopment && !devBindAllowed ? '127.0.0.1' : '0.0.0.0';

  const plategaEnabled = resolvePlategaEnabled(env);

  const config = {
    nodeEnv,
    isDevelopment,
    jwtSecret: jwtSecret || DEV_JWT_SECRET,
    /** Interim access TTL (was 30d). Override with JWT_EXPIRES_IN e.g. 1h / 24h. */
    jwtExpiresIn: env.JWT_EXPIRES_IN?.trim() || '24h',
    port: envNumber(env.PORT, 3001, 1),
    host,
    authWindowMs: envNumber(env.AUTH_RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000, 1000),
    loginMaxAttempts: envNumber(env.LOGIN_MAX_ATTEMPTS, 7, 1),
    registerMaxAttempts: envNumber(env.REGISTER_MAX_ATTEMPTS, 5, 1),
    corsOrigins: parseCorsOrigins(env),
    enableFileWorkspace: resolveEnableFileWorkspace(env, isDevelopment),
    plategaEnabled,
    plategaMerchantId: env.PLATEGA_MERCHANT_ID?.trim() || '',
    plategaSecret: env.PLATEGA_SECRET?.trim() || '',
    plategaPriceRub: envNumber(env.PLATEGA_PRICE_RUB, 499, 1),
    freeCalculationLimit: envNumber(env.FREE_CALCULATION_LIMIT, 3, 0),
    publicAppUrl: env.PUBLIC_APP_URL?.trim() || '',
  };

  assertBillingConfig(config);
  return config;
}

export {parseCorsOrigins, resolveEnableFileWorkspace};

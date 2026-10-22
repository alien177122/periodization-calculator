import {randomUUID, timingSafeEqual} from 'node:crypto';

export const CHECKOUT_CLIENT_ERROR = 'Не удалось создать платёж';

const PLATEGA_API_URL = 'https://app.platega.io/v2/transaction/process';

function normalizePublicAppUrl(url) {
  return url.replace(/\/+$/, '');
}

export function buildPaymentReturnUrls(config) {
  const base = normalizePublicAppUrl(config.publicAppUrl || 'http://localhost:5173');
  return {
    success: `${base}/?payment=success`,
    failed: `${base}/?payment=failed`,
  };
}

export async function createPlategaCheckout({config, userName, paymentId, fetchImpl = fetch}) {
  const returnUrls = buildPaymentReturnUrls(config);

  const response = await fetchImpl(PLATEGA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MerchantId': config.plategaMerchantId,
      'X-Secret': config.plategaSecret,
    },
    body: JSON.stringify({
      paymentDetails: {
        amount: config.plategaPriceRub,
        currency: 'RUB',
      },
      description: 'Безлимитные расчёты 1ПМ — Training Calculator',
      return: returnUrls.success,
      failedUrl: returnUrls.failed,
      payload: paymentId,
      metadata: {
        userId: userName,
      },
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && typeof body.message === 'string'
        ? body.message
        : 'Platega checkout failed';
    throw new Error(message);
  }

  const transactionId = typeof body?.transactionId === 'string' ? body.transactionId : '';
  const paymentUrl = typeof body?.url === 'string' ? body.url : (body?.redirect ?? '');

  if (!transactionId || !paymentUrl) {
    throw new Error('Platega checkout returned incomplete payload');
  }

  return {transactionId, paymentUrl};
}

function headerValue(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return '';
}

function timingSafeEqualString(left, right) {
  const a = Buffer.from(String(left), 'utf8');
  const b = Buffer.from(String(right), 'utf8');
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyPlategaWebhookHeaders(req, config) {
  if (!config.plategaMerchantId || !config.plategaSecret) return false;
  const merchantId = headerValue(req.headers['x-merchantid']);
  const secret = headerValue(req.headers['x-secret']);
  return (
    timingSafeEqualString(merchantId, config.plategaMerchantId) &&
    timingSafeEqualString(secret, config.plategaSecret)
  );
}

export function parsePlategaWebhookBody(body) {
  if (!body || typeof body !== 'object') return {error: 'Invalid callback body'};

  const transactionId =
    typeof body.id === 'string'
      ? body.id
      : typeof body.transactionId === 'string'
        ? body.transactionId
        : typeof body.Id === 'string'
          ? body.Id
          : '';

  const status =
    typeof body.status === 'string'
      ? body.status.toUpperCase()
      : typeof body.Status === 'string'
        ? body.Status.toUpperCase()
        : '';

  const amount = Number(body.amount ?? body.Amount);
  const currency =
    typeof body.currency === 'string'
      ? body.currency
      : typeof body.Currency === 'string'
        ? body.Currency
        : '';

  const payload =
    typeof body.payload === 'string'
      ? body.payload
      : typeof body.Payload === 'string'
        ? body.Payload
        : '';

  if (!transactionId || !status) {
    return {error: 'Missing transaction id or status'};
  }

  return {
    transactionId,
    status,
    amount,
    currency,
    payload,
  };
}

export function createInternalPaymentId() {
  return randomUUID();
}

export function applyWebhookToDb(db, parsed, config) {
  const payment =
    (parsed.payload ? db.getBillingPaymentById(parsed.payload) : null) ??
    db.getBillingPaymentByProviderTransactionId(parsed.transactionId);

  if (!payment) {
    return {ok: false, reason: 'payment_not_found'};
  }

  const amountOk =
    Number.isFinite(parsed.amount) &&
    parsed.amount > 0 &&
    Number(payment.amount) === Math.round(parsed.amount);
  const currencyOk =
    typeof parsed.currency === 'string' &&
    parsed.currency.length > 0 &&
    parsed.currency === payment.currency;

  if (parsed.status === 'CONFIRMED') {
    if (!amountOk) return {ok: false, reason: 'amount_mismatch'};
    if (!currencyOk) return {ok: false, reason: 'currency_mismatch'};
    db.updateBillingPaymentStatus(payment.id, 'CONFIRMED', parsed.transactionId);
    db.setUserPremium(payment.user_name, true);
    return {ok: true, status: 'CONFIRMED'};
  }

  if (parsed.status === 'CANCELED' || parsed.status === 'CANCELLED') {
    db.updateBillingPaymentStatus(payment.id, 'CANCELED', parsed.transactionId);
    db.recalculatePremiumAccess(payment.user_name);
    return {ok: true, status: 'CANCELED'};
  }

  if (parsed.status === 'CHARGEBACKED') {
    db.updateBillingPaymentByProviderId(parsed.transactionId, 'CHARGEBACKED');
    db.recalculatePremiumAccess(payment.user_name);
    return {ok: true, status: 'CHARGEBACKED'};
  }

  db.updateBillingPaymentStatus(payment.id, parsed.status, parsed.transactionId);
  return {ok: true, status: parsed.status};
}

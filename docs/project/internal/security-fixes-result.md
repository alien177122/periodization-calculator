# Security hardening — результат

Репозиторий: `~/Desktop/Calculator/Web_Calculator`.  
Ветка коммитов: `refactor/bundle-optimization` (те же SHA на `cursor/security-hardening-ceb2`). Push на origin отклонён: OAuth без `workflow` scope (в истории есть `.github/workflows/ci.yml`). PR не открывался. Swith/iOS не трогались. JWT → httpOnly cookies не делались (WC-01).

## Ворота

| Проверка | Результат |
| -------- | --------- |
| typecheck | OK |
| test | 274 pass / 0 fail |
| lint | 0 errors / 0 warnings |

## Коммиты

1. `8bc6e23a` — `fix(security): lock public tunnel and drop Eruda from production`
2. `8741ffb6` — `fix(security): harden webhook, workspace isolation, auth and headers`

Локально на `refactor/bundle-optimization` и `cursor/security-hardening-ceb2`. Push не прошёл (GitHub OAuth: нет `workflow` scope). PR не открывался.

## Файлы в репо

- `.gitignore` — `.env` / `.env.*` + `!.env*.example` (WC-06)
- `scripts/public-run.mjs`, `scripts/public-utils.mjs` — JWT_SECRET обязателен, не dev-секрет; `NODE_ENV=production`; `ENABLE_FILE_WORKSPACE=0` (WC-03, WC-04)
- `src/platform/initEruda.ts`, `index.tsx` — Eruda только `import.meta.env.DEV` (WC-05)
- `server/file-workspace.js`, `server/app.js` — inbox per authenticated user (WC-04)
- `server/billing.js` — `timingSafeEqual`, amount/currency, 404 на `payment_not_found`, CANCELED → `recalculatePremiumAccess` (WC-07); checkout 502 без `error.message` (WC-10)
- `server/db.js` — cascade delete attempts/payments (WC-08)
- `server/security.js` — CSP `script-src` hash темы, без `'unsafe-inline'` у скриптов (WC-02 частично)
- `server/passwordPolicy.js`, `packages/shared/src/utils/passwordValidation.ts` — `score >= 3`, max 72 (WC-09)
- `server/app.js` — `x-powered-by` off, JWT HS256, username max 32 (WC-12 частично)
- тесты: `tests/security-hardening.test.ts` + правки `billing` / `db` / `file-workspace` / `password-validation`

`.env.public.example` не менялся (правка `.env*` заблокирована политикой); public-run и так форсит production + workspace=0.

## Status after fix (ID)

См. также `docs/security-audit.md` §3.

- **WC-03** закрыто
- **WC-04** закрыто
- **WC-05** закрыто
- **WC-06** закрыто
- **WC-08** закрыто
- **WC-09** закрыто (в рамках «small, consistent with squat123»)
- **WC-10** закрыто
- **x-powered-by / HS256** закрыто
- **WC-02** частично (hash script-src; style-src `'unsafe-inline'` остался)
- **WC-07** частично (нет MAC тела / timestamp / replay)
- **WC-12** частично (max length есть; 409 enumeration нет)

## Leftover

- **WC-01** JWT в `localStorage` — отдельный проект
- **WC-11** bind `0.0.0.0` / Vite `allowedHosts: true`
- **WC-13** `TRUST_PROXY` / `cf-connecting-ip`
- **WC-14** `connect-src 'self'` для split-деплоя
- **WC-15** rate limit только login/register
- **WC-07 remainder** HMAC/MAC тела webhook
- **WC-12 remainder** одинаковый ответ на занятое имя
- **WC-02 remainder** nonce / `style-src` без `'unsafe-inline'`

## Не коммитилось

`canon/`, `releases/`, `node_modules/`, секреты, чужой WIP на `refactor/bundle-optimization` (schema/split UI и т.д.).

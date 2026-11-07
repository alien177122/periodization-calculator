# Аудит безопасности — Журнал Сплит (Web_Calculator)

Дата: 2026-10-22. Режим: **только чтение**, локально. Код, git, зависимости и данные не менялись. Swith, JournalApp/iOS и прод не рассматривались.

**Итог:** Critical нет. Наивысшая подтверждённая серьёзность — **Medium**. Приложение — смешанный веб+API (React 19 / Vite 7 / Express 5 / better-sqlite3 / JWT / опциональный Platega). Защита пользовательского блоба по JWT в целом собрана; основные остаточные риски — сессия в `localStorage`, CSP с `'unsafe-inline'`, и конфиг public-туннеля, который по умолчанию остаётся в `NODE_ENV=development`.

---

## 1. Краткое резюме

Подтверждённые Medium:

- JWT и копия токена живут в `localStorage` (известный контракт, не новый Critical).
- `npm run public*` поднимает API без принудительного `NODE_ENV=production`; при пустом `JWT_SECRET` остаётся встроенный dev-секрет, а file workspace в development включён по умолчанию.
- При включённом file workspace inbox общий для любого аутентифицированного пользователя.

Известное, не раздувать:

- CSP production: `script-src`/`style-src` с `'unsafe-inline'`.
- Rate limit login/register по IP (+ имя), не глобальный API limit.
- Debug ingest на `127.0.0.1:7373` **отсутствует** в текущем дереве (`server/app.js` после гигиенического прохода).

Теоретические (без живой эксплуатации): статическая проверка секрета webhook Platega без подписи тела; доверие `cf-connecting-ip` при `TRUST_PROXY`.

Живой API (`:3001` / `:3002` / Vite `:5173`) на момент аудита **не слушал**. Проверялись только заголовки уже запущенного `vite preview` на `:4173` (статика без Express-заголовков). Маршруты API — по коду и тестам, не по live 401.

---

## 2. Область и метод

**В области:** `~/Desktop/Calculator/Web_Calculator` — `server/`, `src/`, `packages/shared/`, `scripts/dev-all.mjs`, `scripts/public-run.mjs`, Docker/CI, `.gitignore`, тесты `tests/server.test.ts` / `tests/billing.test.ts`.

**Вне области:** `~/Desktop/React/Swith`, `~/Desktop/React/ios/JournalApp`, прод, вызовы Platega, brute force, мутации данных, DoS, PoC/payloads.

**Метод:**

- Чтение текущего кода (дерево могло быть изменено гигиеной — ingest не восстанавливался).
- Сопоставление с тестами и `docs/DEPLOYMENT.md` / README billing.
- Проверка портов: `:3001`, `:3002`, `:5173`, `:7373` — нет ответа; `:4173` — HTTP 200, без CSP/HSTS/`X-Frame-Options`.
- Не запускались новые серверы, не открывался `gym.db`, не дергался Platega.

**Контекст продукта:** PWA + Express JSON API; SQLite `users.data` как JSON-документ; фримиум 1ПМ (лимит + webhook); сессия Bearer JWT.

---

## 3. Таблица находок

Формат: `ID | серьёзность | компонент | заголовок | CWE | уверенность | трудоёмкость | статус`

- **WC-01** | Medium | Клиент / сессия | JWT и копия токена в `localStorage` | CWE-922 | высокая | M | подтверждено, известно
- **WC-02** | Low | `server/security.js` | CSP с `'unsafe-inline'` | CWE-693 | высокая | M | подтверждено, известно
- **WC-03** | Medium | `scripts/public-run.mjs`, `server/config.js` | Public-туннель остаётся development + dev JWT | CWE-1188 | высокая | S | подтверждено
- **WC-04** | Medium | `server/file-workspace.js` | Общий inbox для любого JWT, если workspace включён | CWE-285 | высокая | S (держать выкл.) | подтверждено
- **WC-05** | Low | `src/platform/initEruda.ts` | Eruda включается query-флагом и в production-бандле | CWE-489 | высокая | S | подтверждено
- **WC-06** | Low | `.gitignore` | `.env` не игнорируется (в отличие от `.env.public` / `.env.docker`) | CWE-540 | высокая | S | подтверждено
- **WC-07** | Low | `server/billing.js` | Webhook: статический заголовочный секрет, без MAC тела | CWE-347 | средняя | M | теоретическое
- **WC-08** | Low | `server/db.js` | `DELETE /api/users/:name` не чистит billing/расчёты | CWE-212 | высокая | S | подтверждено
- **WC-09** | Low | `server/passwordPolicy.js` | Политика пароля принимает слабые 8-символьные значения | CWE-521 | высокая | S | подтверждено
- **WC-10** | Low | `server/app.js` | Checkout отдаёт `error.message` провайдера клиенту | CWE-209 | высокая | S | подтверждено
- **WC-11** | Low | `server/index.js`, `vite.config.ts` | Слушание `0.0.0.0` / `allowedHosts: true` | CWE-1327 | высокая | S | подтверждено (dev)
- **WC-12** | Low | Auth | Имя без верхней границы; `409` на регистрации перечисляет логины | CWE-204 | высокая | S | подтверждено
- **WC-13** | Low | `server/app.js` | `TRUST_PROXY` доверяет `cf-connecting-ip` без проверки | CWE-290 | средняя | S | теоретическое
- **WC-14** | Low | `server/security.js` | `connect-src 'self'` ломает split-деплой Vercel+API | CWE-16 | средняя | S | теоретическое (конфиг)
- **WC-15** | Info | Rate limit | Лимит только login/register; checkout/webhook без лимита | CWE-770 | высокая | S | подтверждено, не раздувать

Status after fix (2026-10-22, без JWT-cookies / без PoC):

- **WC-01** — открыто (отдельный проект; httpOnly cookies не делались).
- **WC-02** — частично: `script-src` больше без `'unsafe-inline'` (hash темы); `style-src` по-прежнему `'unsafe-inline'`.
- **WC-03** — закрыто: public-run требует JWT_SECRET (не dev), `NODE_ENV=production`, workspace выкл.
- **WC-04** — закрыто: default off вне development; API inbox per-user; public-run форсит `ENABLE_FILE_WORKSPACE=0`.
- **WC-05** — закрыто: Eruda только при `import.meta.env.DEV`; prod-бандл без query-пути.
- **WC-06** — закрыто: `.gitignore` — `.env` / `.env.*` + `!.env*.example`.
- **WC-07** — частично: `timingSafeEqual`, premium только с amount/currency, не `{ok:true}` на `payment_not_found`, `CANCELED` пересчитывает premium. MAC тела / replay — нет.
- **WC-08** — закрыто: `delUser` явно чистит `calculation_attempts` и `billing_payments`.
- **WC-09** — закрыто в этом проходе: `score >= 3`, длина ≤ 72; `squat123` ещё валиден.
- **WC-10** — закрыто: checkout 502 отдаёт общее «Не удалось создать платёж».
- **WC-11** — открыто (dev bind-all, вне этого прохода).
- **WC-12** — частично: имя ≤ 32 символа; `409` enumeration не меняли.
- **WC-13** — открыто.
- **WC-14** — открыто (`connect-src 'self'`).
- **WC-15** — открыто (info).
- **x-powered-by / HS256** — закрыто: `app.disable('x-powered-by')`; sign `algorithm: 'HS256'`, verify `algorithms: ['HS256']`.

Critical / High: **нет** (после правок V-01/V-03/V-04/V-05 из аудита 2026-07).

---

## 4. Детали находок

### WC-01 — JWT в `localStorage` (подтверждено, известно)

- Клиент: `src/utils/webTokenStorage.ts` ключи `gym_token` / `gym_username`.
- Offline outbox кладёт **тот же токен** рядом с данными пользователя (`packages/shared/src/utils/offlineOutbox.ts`, запись из `api.ts` при сетевом сбое).
- Снимок данных: `gym_user_data_*` в `useAuthSession.ts`.
- Сервер: `jwt.sign({name, tv}, …, {expiresIn})`, по умолчанию `24h` (`server/config.js`, `tests/auth-interim.test.ts`). Logout бампит `token_version` (`server/app.js`).
- CSRF классический (cookie) здесь не основной вектор: токен в `Authorization`, не в cookie. Риск — XSS / физический доступ к браузеру / чужой `?eruda=1` (WC-05).
- Не поднимать до High: это зафиксированный контракт (старый V-02); TTL уже 24h, не 30d.

### WC-02 — CSP `'unsafe-inline'` (подтверждено, известно)

`server/security.js`: CSP выставляется **только если не development**. Политика включает `script-src 'self' 'unsafe-inline'` и `style-src 'self' 'unsafe-inline' …`. В `index.html` есть inline-скрипт темы — без nonce/hash `'unsafe-inline'` неизбежен. Это ослабляет XSS-защиту в связке с WC-01, но само по себе не RCE.

На живом `vite preview :4173` CSP **нет вообще** (это не Express). API в этот момент не работал — заголовки production Express не наблюдались live.

### WC-03 — Public-туннель / insecure defaults (подтверждено)

- `NODE_ENV` по умолчанию `development` (`server/config.js`).
- Без `JWT_SECRET` в development берётся встроенный `DEV_JWT_SECRET` (`gym-secret-dev`). `scripts/dev-all.mjs` явно ставит `JWT_SECRET=dev` для `npm run dev`.
- `scripts/public-run.mjs` **не** ставит `NODE_ENV=production`; если секрета нет — предупреждение в лог и продолжение со встроенным dev-секретом.
- `.env.public.example` задаёт `CORS_ORIGINS` и `ENABLE_FILE_WORKSPACE=0`, но не `NODE_ENV`. При неполном `.env.public`: CORS reflect (`origin: true`), file workspace **вкл.**, нет HSTS/CSP, rate-limit skip для loopback.
- Docker это уже закрыл: `JWT_SECRET` обязателен, `NODE_ENV=production`, workspace `0` (старый V-04). Ручной `npm run server` / `public` — нет.

Не High: это путь «dev в интернет», не образ production Docker. Для Steve, который поднимает туннель, Moderate достаточен.

### WC-04 — Общий file workspace (подтверждено)

Маршруты `GET /api/files/workspace`, `POST …/analyze` защищены `authAny`, не владельцем файла. `listFiles()` читает весь inbox. Path traversal по `dirname` отсекается (`file-workspace.js`). Абсолютные FS-пути в JSON больше не отдаются (тест в `tests/server.test.ts`). В ответе есть OCR `baseUrl`/`model` (раскрытие внутренней конфигурации, низкий ущерб).

Вне development workspace **выключен** по умолчанию (`404`). Риск актуален, если `ENABLE_FILE_WORKSPACE=1` на туннеле/LAN.

### WC-05 — Eruda в production-бандле (подтверждено)

`index.tsx` всегда вызывает `initEruda()`. Включение: `?eruda=1` (липкий `localStorage`) или `VITE_ERUDA=1`. Нет `import.meta.env.DEV`. Dynamic `import('eruda')` попадает в клиентский бандл. На общем телефоне/ссылке это консоль с доступом к WC-01. Не High: нужна уже открытая сессия жертвы в том же профиле браузера.

### WC-06 — `.env` не в `.gitignore` (подтверждено)

Игнорируются `.env.public`, `.env.docker`, `*.local`. Файл `.env` — нет. Документация предлагает копировать example-файлы; ошибка `cp … .env && git add` возможна. В репозитории сейчас нет закоммиченного `.env` (проверка `git ls-files`). `gym.db` в ignore есть.

### WC-07 — Webhook Platega (теоретическое)

`verifyPlategaWebhookHeaders`: сравнение `X-MerchantId` и `X-Secret` через `===`, не `timingSafeEqual`, не подпись тела, нет timestamp/replay. `assertBillingConfig` требует merchant/secret/URL **только вне development**. Проверка суммы пропускается, если amount не конечное положительное. `CANCELED` меняет статус платежа, **не** снимает `premium` (снимает только `CHARGEBACKED` через `recalculatePremiumAccess`). HTTP-ответ webhook всегда `{ok: true}`, даже если `applyWebhookToDb` вернул `payment_not_found`.

Не тестировался Platega. Не High: нужен секрет мерчанта. Это модель «shared secret в заголовке», как в README.

`?payment=success` на клиенте **не** выдаёт premium: только poll `GET /api/billing/status` (`useBilling.ts`). Это ложный позитив, если искать «оплата через query».

### WC-08 — Удаление аккаунта без каскада (подтверждено)

`delUser` удаляет строку `users`. Таблицы `calculation_attempts` и `billing_payments` остаются. Клиентского `DELETE` в `createApiClient` нет, но маршрут живой: `DELETE /api/users/:name` при своём JWT, без повторного пароля.

### WC-09 — Политика пароля (подтверждено)

`isValid`: длина ≥ 8 и score ≥ 2 из набора критериев. Тесты регистрируют значение без заглавной и спецсимвола. bcrypt cost 10. Усечения bcrypt 72 байта нет в UX. Демо-сид с известным паролем в `journalDemoSeed.js` **запрещён** вне development (тест + throw в `createApp`) — старый V-05 закрыт.

### WC-10 — Утечка сообщения checkout (подтверждено)

`POST /api/billing/checkout` при ошибке: `502` с `error.message` от `createPlategaCheckout` (тело/сообщение провайдера). Секрет в ответ не кладётся (он только в исходящих заголовках к Platega). Лимита на checkout нет (WC-15).

### WC-11 — Bind-all / Vite hosts (подтверждено, dev)

`server/index.js`: `app.listen(config.port, '0.0.0.0')`. Vite: `host: true`, `allowedHosts: true`. На LAN API доступен соседям; в development с JWT=`dev` это локальный риск. Не раздувать до High.

### WC-12 — Имя пользователя (подтверждено)

Регистрация: trim, минимум 2 символа, **нет** максимума и алфавита. PK в SQLite — сырое имя, регистр различается (`Steve` ≠ `steve`). Дубликат → `409` «Пользователь уже существует» (перечисление). Логин: одна и та же ошибка для неизвестного имени и неверного пароля; dummy-hash есть, но при отсутствии пользователя выполняется лишний `bcrypt.compare` (теоретический тайминг, не раздувать).

### WC-13 — TRUST_PROXY (теоретическое)

При `TRUST_PROXY=1|true` ключ rate-limit берёт `cf-connecting-ip`, иначе `req.ip`. Заголовок не валидируется как Cloudflare. Имеет смысл только если флаг включён за прокси.

### WC-14 — CSP `connect-src 'self'` (теоретическое / конфиг)

При раздельном фронте (Vercel) и API CSP запретит `fetch` на другой origin. Операторы могут снять CSP целиком. Пока фронт отдаётся тем же Express (`dist/`) — ок. `img-src https:` широкий. HSTS `preload` без редиректа HTTP→HTTPS в приложении.

### WC-15 — Rate limit только auth (info)

`express-rate-limit` на login (7) и register (5) за окно, ключ IP и имя, `skipSuccessfulRequests: true`, в development skip loopback (тест). Остальной API, checkout, webhook — без лимита. Не описывать как DoS-процедуру.

---

## 5. Что сделано хорошо (не findings)

- SQL через плейсхолдеры `better-sqlite3`, без склейки строк.
- `JWT_SECRET` обязателен, если `NODE_ENV !== development`. Docker без дефолтного секрета.
- CORS: allowlist; пустой список в non-dev → `origin: false`; чужой Origin в тесте даёт 403.
- `auth` сверяет `payload.name` с `:name` (нет IDOR по чужому URL при валидном токене — по коду).
- Валидация PUT-блоба (`schema.js`), лимиты журнала/сплита, calculator body, 402 без `oneRM`.
- Цена платежа только с сервера; `FREE_CALCULATION_LIMIT` с env.
- JSON body `256kb`.
- Нет `dangerouslySetInnerHTML` / `eval` в `src` и `server`.
- `SEED_JOURNAL_DEMO` вне development падает при старте.
- Logout инвалидирует все access-токены пользователя (`token_version`).
- Ingest `:7373` / `#region agent log` в `server/` нет.

---

## 6. Быстрые победы (не делались в этом проходе)

1. В `.gitignore` добавить `.env` и `.env.*` с исключениями `!.env*.example`.
2. `scripts/public-run.mjs`: требовать `JWT_SECRET`, ставить `NODE_ENV=production` (или отказываться поднимать туннель).
3. Eruda только при `import.meta.env.DEV` (убрать query-флаг из prod).
4. `ENABLE_FILE_WORKSPACE` не включать на туннеле; если нужен — изолировать по пользователю.
5. Webhook: `crypto.timingSafeEqual`, не подтверждать premium без amount/currency, не оставлять premium после `CANCELED`, не отвечать `{ok:true}` на `payment_not_found`.
6. `delete` каскадом (или явным SQL) по `calculation_attempts` / `billing_payments`.
7. `app.disable('x-powered-by')`; pin `algorithms: ['HS256']` в `jwt.sign`/`verify`.
8. CSP: nonce на inline темы, убрать `'unsafe-inline'` из `script-src`, когда фронт и API на одном origin; для split-деплоя добавить API origin в `connect-src`.
9. Верхняя длина имени; одинаковый ответ регистрации на занятое имя (после продуктового решения про UX).

Перенос JWT в httpOnly cookie + refresh — отдельный проект, не «quick win».

---

## 7. Ложные срабатывания / не баги

- CORS `origin: true` в development — намеренный DX.
- `GET /api/health` без auth — healthcheck Docker/туннеля.
- При `PLATEGA_ENABLED=0` все пользователи `premium: true` — локальный режим README.
- `?payment=success` не выдаёт оплату, только опрос статуса.
- Path traversal workspace по `../` в имени — отсекается `dirname`.
- Известный пароль демо-сида — не действует без `SEED_JOURNAL_DEMO=1` и `NODE_ENV=development`.
- Dummy bcrypt hash в login — защитный приём, не секрет продакшена.
- Отсутствие service worker — токен не кэшируется SW.

---

## 8. Дыры покрытия

- API не был запущен: **live** 401/заголовки Express не снимались. Тест CORS/rate-limit/402 есть; теста «GET `/api/users/:name` без токена → 401» и «токен Alice на Bob → 403» **нет**.
- Platega и сеть провайдера не вызывались (по правилам аудита).
- `npm audit` не гонялся (read-only аудит кода; в репо есть `npm run audit:prod`).
- Replay/HMAC webhook, symlink inbox, bcrypt 72-byte — только статически.
- `_archive-non-web/`, Swith, JournalApp — вне скоупа. В архиве `fastlane/.env.default` без секретов (только opt-out Fastlane).
- Старый файл `audit/security-vulnerability-audit-2026-07.md` в gitignore, в этом проходе не перечитывался; сверка по `docs/open-source-plan.md` (V-01…V-05).

---

## 9. Чеклист (OWASP ASVS-подобно, сжато)

- **Authn:** пароль hashing bcrypt; политика слабая (WC-09); JWT HS256, TTL 24h; logout revoke есть; refresh нет; сессия в LS (WC-01).
- **Authz:** привязка токена к `:name`; workspace — любой auth (WC-04); webhook — секрет заголовка (WC-07).
- **Session:** нет cookie/SameSite; `token_version`; 24h.
- **Ввод:** JSON 256kb; schema PUT; calc validators; имя без max (WC-12).
- **SQLite:** плейсхолдеры; FK/cascade нет (WC-08); `gym.db` не в git.
- **XSS:** React default escape; нет innerHTML; CSP unsafe-inline (WC-02); Eruda (WC-05).
- **CSRF:** Bearer header, CORS allowlist в non-dev.
- **Secrets:** Docker/prod требуют JWT; `.env` не ignored (WC-06); Platega secret только server-side.
- **Headers:** nosniff, DENY, Referrer-Policy, HSTS+CSP только non-dev; нет Permissions-Policy / COOP; `X-Powered-By` не выключен.
- **Rate limit:** IP+name на auth; checkout/webhook нет.
- **Billing:** цена серверная; 402 без 1RM; return URL не trust; webhook теоретически слабже MAC.
- **Supply/debug:** ingest 7373 снят; Eruda остался; CI typecheck/test/lint/build без security-scan job.
- **Туннель:** Cloudflare quick URL меняется; без NODE_ENV=production (WC-03).

---

## 10. Соответствие старому аудиту 2026-07 (по коду, не по старому файлу)

| Старый ID | Тема | Сейчас |
|-----------|------|--------|
| V-01 | CORS `*` | Закрыто: allowlist / `origin: false` в non-dev |
| V-02 | JWT TTL / httpOnly | TTL 24h; httpOnly **не** сделан (WC-01, осознанно Medium) |
| V-03 | File workspace paths | Относительные пути, default off вне dev; API inbox per-user (WC-04 закрыт 2026-10-22) |
| V-04 | Docker JWT default | Закрыто |
| V-05 | Demo seed в prod | Закрыто throw |
| — | ingest `:7373` | Снят гигиеной 2026-10 |

---

*Аудитор: read-only pass 2026-10-22. Исправления §6 + WC-03/04 внесены тем же днём (status after fix в §3). JWT httpOnly (WC-01) не делался.*

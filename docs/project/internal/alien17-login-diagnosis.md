# Диагностика входа alien17 (локальный dev)

**Дата:** 2026-10-24  
**Окружение:** `~/Desktop/Calculator/Web_Calculator`, `http://127.0.0.1:5173`

## Симптом

Steve не может войти как `alien17` / `test1234` через UI на Vite dev.

## Проверки

### Dev-серверы

| Сервис | Порт | Статус после фикса |
|--------|------|-------------------|
| Vite | 5173 | OK |
| Gym API (dev-all) | 3002 | OK |
| Прокси `/api` → `127.0.0.1:3002` | — | OK |

До перезапуска: Vite отвечал, но API на `:3002` был **устаревший** процесс `node server/index.js` (~49 мин), поднятый вне `npm run dev`.

### Пользователь в `gym.db`

```text
name     | hash_prefix              | hash_len | token_version
alien17  | $2b$10$2RSS6dHrZKcdx…    | 60       | 0
```

Пользователь **существует**, bcrypt-хеш на месте (полный хеш в отчёт не выводился).

### POST `/api/auth/login`

| Маршрут | Учётные данные | HTTP | Результат |
|---------|----------------|------|-----------|
| `http://127.0.0.1:3002/api/auth/login` (до перезапуска API) | alien17 / test1234 | 400 | HTML-ошибка Express |
| `http://127.0.0.1:3001/api/auth/login` (отдельный процесс) | alien17 / test1234 | 200 | `{ token, name: "alien17" }` |
| `http://127.0.0.1:5173/api/auth/login` (через Vite proxy, до фикса) | alien17 / test1234 | 400 | та же ошибка |
| `http://127.0.0.1:5173/api/auth/login` (после `npm run dev`) | alien17 / test1234 | 200 | `{ ok: true, name: "alien17" }` |

Тело ошибки на «битом» API (без секретов):

```text
Error: Cannot find module '../encodings'
Require stack:
  .../node_modules/raw-body/node_modules/iconv-lite/lib/index.js
  .../body-parser/...
  .../express/...
```

Причина: **разбор JSON-тела** (body-parser → raw-body → iconv-lite) падал на POST. GET `/api/health` при этом отвечал `{"ok":true}` — поэтому «сервер жив», а логин «не работает».

В `node_modules/raw-body/node_modules/` осталась **пустая** вложенная папка (артеfact частичного `npm install`); свежий процесс после перезапуска резолвит `iconv-lite` корректно из корня `node_modules`.

### Политика пароля (register vs login)

- **Register** (`passwordPolicy.js`): `test1234` → **400** — «Пароль слабый…» (score 2, нужен ≥3: заглавные + строчные + цифра/спецсимвол).
- **Login**: политика **не применяется**, только `bcrypt.compare` — для существующего `alien17` пароль `test1234` **совпадает** с хешем в БД.

Смена пароля в БД **не требовалась**.

## Корневая причина

**Не неверный пароль и не политика на login**, а **сломанный/устаревший API на порту 3002**, куда Vite проксирует `/api`. POST login возвращал 400 из‑за отсутствующего модуля `iconv-lite/encodings` в цепочке body-parser.

Фронт (`buildApiConfig` для web) ходит на относительный `/api` → proxy → `:3002` (см. `vite.config.ts`, `scripts/dev-all.mjs`).

## Исправление для Steve

1. Остановить зависшие процессы на `:3002` / `:5173` и поднять dev штатно:

   ```bash
   cd ~/Desktop/Calculator/Web_Calculator
   npm run dev
   ```

   (`dev-all.mjs` сам освобождает порты и стартует API на **3002** + Vite на **5173**.)

2. Если API запускается отдельно — **обязательно `PORT=3002`**, иначе UI через Vite не попадёт на сервер:

   ```bash
   PORT=3002 npm run server
   ```

3. При повторении ошибки `../encodings` — переустановить зависимости:

   ```bash
   rm -rf node_modules/raw-body/node_modules
   npm ci
   npm run dev
   ```

4. Логин: **alien17** / **test1234** (локальный dev, хеш уже в `gym.db`).

## Верификация

После `npm run dev` в tmux-сессии `gym-dev-verify`:

- `curl http://127.0.0.1:3002/api/health` → `{"ok":true}`
- `curl -X POST http://127.0.0.1:5173/api/auth/login -H 'Content-Type: application/json' -d '{"name":"alien17","password":"test1234"}'` → **200**, token + `name: alien17`

## PR / код

Изменений в репозитории **не требуется** — инфраструктурная проблема dev-процесса и `node_modules`, не баг auth-логики.

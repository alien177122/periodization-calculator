# Security notes — 2026-11-07

Итог применения фиксов по security-аудиту (`docs/project/security-audit.md`). Минимальный диф, без коммита.

## Исправлено сейчас

1. **trust proxy / cf-connecting-ip (MEDIUM, WC-13)** — `server/app.js`
   - `app.set('trust proxy', true)` → `app.set('trust proxy', 1)`: доверяем ровно одному прокси-хопу.
   - `requestIp()`: заголовок `cf-connecting-ip` учитывается только когда прямое соединение пришло от локального прокси/туннеля (loopback, RFC1918 `10/192.168/172.16-31`, ULA `fc/fd`). Для прямых клиентов берём socket-адрес — заголовок больше нельзя использовать как ключ rate-limit.

2. **Bind 0.0.0.0 в development (MEDIUM)** — `server/config.js`, `server/index.js`
   - В development по умолчанию `host = '127.0.0.1'`; `ALLOW_DEV_BIND=1` явно включает `0.0.0.0` (+ warn в консоль).
   - Docker и `npm run public` не затронуты: compose задаёт `NODE_ENV=production`; public-run работает через локальный прокси на `127.0.0.1`.

3. **Длина name на логине (LOW)** — `server/app.js`
   - Проверка `USERNAME_MAX_LENGTH` (32) на `POST /api/auth/login` → 400 **до** bcrypt.compare.

4. **Утечка внутренних деталей OCR (LOW)** — `server/file-workspace.js`
   - Сырой `error.message` от Ollama больше не уходит клиенту: в `preview` — общий текст, детали в `console.warn` на сервере.
   - `baseUrl`/`endpoint` Ollama удалены из всех клиентских payload (`metadata.endpoint`, `listFiles().ocr`); подсказка `buildOllamaHint` без URL endpoint'а. Клиенту отдаётся только `model` и `ocrStatus`.

5. **Dockerfile (LOW)**
   - Build-стейдж: `npm install` → `npm ci` (воспроизводимая сборка по lock-файлу).
   - Runtime-стейдж: `chown node:node` для `/app/data` и `/app/workspace-files` + `USER node` (не-root).

6. **Разнобой имён Ollama env (LOW)** — `server/ollama-ocr.js`, `docker-compose.yml`
   - Канон: `OLLAMA_URL`; `OLLAMA_BASE_URL` читается как legacy-fallback. Compose переведён на `OLLAMA_URL`.

7. **`server/db.sqlite` в git (LOW)**
   - Выполнен `git rm --cached server/db.sqlite` (файл на диске остался). `.gitignore` уже содержит `*.sqlite`. **Нужен коммит от владельца** — до коммита файл продолжает числиться удалённым из индекса в working tree.

## Принятые риски (осознанный трейдофф)

- **`gym.db` в git-истории** — чистка требует `git filter-repo` + force-push + синхронизации зеркал (gdrive). Не выполняется автоматически: awaiting decision владельца.
- **JWT в localStorage** — сохранён: осознанный трейдофф ради PWA/WebView (нет HttpOnly cookie на текущем хостинге).

## Осталось сделать вручную (только с разрешения владельца)

1. Закоммитить удаление `server/db.sqlite` из индекса (после ревью диффа).
2. Решить судьбу `gym.db` в истории: `git filter-repo --path gym.db --invert-paths`, force-push, ротация всех JWT_SECRET/паролей, чистка gdrive-зеркала.
3. Заменить/убедиться в уникальном `JWT_SECRET` в прод-окружении (`.env.docker`).

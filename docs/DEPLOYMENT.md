# Deployment

How to run Training Calculator outside local development.

## Quick local run

```bash
bun install
bun run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3002

## Environment variables

Copy examples and fill secrets locally (never commit real `.env` files):

| File                                  | Purpose                        |
| ------------------------------------- | ------------------------------ |
| `.env.docker.example` → `.env.docker` | Docker Compose stack           |
| `.env.public.example` → `.env.public` | Cloudflare tunnel / public dev |
| `.env.production.example`             | Production API reference       |

### Required for production API

| Variable            | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `JWT_SECRET`        | Long random string for signing JWTs                   |
| `PORT` / `APP_PORT` | API listen port (default 3001 or 3002 in dev scripts) |
| `DB_PATH`           | Optional path to SQLite file                          |

### Required for production frontend build

| Variable       | Description                                           |
| -------------- | ----------------------------------------------------- |
| `VITE_API_URL` | Full API base URL, e.g. `https://api.example.com/api` |

Vite inlines `VITE_*` at **build time**. Rebuild and redeploy after changing `VITE_API_URL`.

## Docker (full stack)

```bash
cp .env.docker.example .env.docker
# Edit JWT_SECRET in .env.docker

bun run docker:up
```

App: http://127.0.0.1:3001 (or `APP_PORT` from `.env.docker`)

Persistence:

- `./docker-data/gym.db` — database
- `./workspace-files/` — uploaded files

```bash
bun run docker:status
bun run docker:logs
bun run docker:down
```

## Vercel (frontend only)

The Express + SQLite backend **does not** run on Vercel.

1. Deploy API separately (VPS, Railway, Fly.io, Docker host).
2. Configure CORS on the API for your Vercel domain.
3. Set `VITE_API_URL=https://<api-host>/api` in Vercel project settings.
4. Build command: `bun run build`
5. Output directory: `dist`

Without `VITE_API_URL`, the deployed site loads but API calls fail (404 on `/api`).

## Production API + static frontend

Serve `dist/` from Express when built:

```bash
bun run build
PORT=3001 JWT_SECRET=<secret> node server/index.js
```

The server serves static files from `dist/` when present (`server/app.js`).

## iPhone PWA

1. Deploy frontend over HTTPS.
2. Open in Safari → Share → Add to Home Screen.
3. Icons and manifest: `public/manifest.webmanifest`, `public/icons/`.

Offline service worker is not enabled yet; network is required for API calls.

## Desktop (macOS)

```bash
bun run desktop
bun run desktop:pack
```

Packaged data paths:

- `~/Library/Application Support/Training Calculator/data/gym.db`
- `~/Library/Application Support/Training Calculator/workspace-files`

## Public tunnel (development only)

Temporary internet access for local stack — **not** production hosting:

```bash
cp .env.public.example .env.public
bun run public:stable
```

Настройка туннеля — в секции «Named tunnel» ниже; прежние детали — [docs/README-old-2026-11-08.md](./README-old-2026-11-08.md).

### Named tunnel (стабильный URL, облако Mac ↔ Venus)

Решение от 2026-11-08: named tunnel вместо `trycloudflare` (адрес которого меняется при каждом рестарте).
Precondition: **домен, добавленный в зону Cloudflare**, и установленный `cloudflared` (тот же бинарник, что раздаёт trycloudflare).

```bat
:: 1) одноразовая привязка к аккаунту (браузер открывается сам)
cloudflared tunnel login

:: 2) создать туннель и DNS-маршрут (домен — свой, в зоне Cloudflare)
cloudflared tunnel create journalsplit
cloudflared tunnel route dns journalsplit app.ВАШ_ДОМЕН

:: 3) config.yml в %USERPROFILE%\.cloudflared\config.yml
:: tunnel: journalsplit
:: credentials-file: %USERPROFILE%\.cloudflared\tunnels\<UUID-туннеля>.json
:: ingress:
::   - hostname: app.ВАШ_ДОМЕН
::     service: http://localhost:5173   (приложение; для API — второй hostname → localhost:3002)
::   - service: http_status:404

:: 4) запуск (вручную) / установка сервиса Windows
cloudflared tunnel run journalsplit
:: или: cloudflared service install <TOKEN из Zero Trust dashboard>

:: 5) проверка
cloudflared tunnel info journalsplit
```

Если домена в Cloudflare нет — остаёмся на trycloudflare (URL меняется при перезапуске туннеля).
Статус на 2026-11-08: Venus (Tailscale `pc`, 100.102.108.96) оффлайн уже ~12 ч — runbook готов, выполнение после возврата машины в сеть.

**Удалённый терминал / управление Mac** (Tailscale, SSH, RustDesk) — не путать с public tunnel приложения: см. [REMOTE-ACCESS.md](./REMOTE-ACCESS.md).

## Health check

```bash
curl http://127.0.0.1:3002/api/health
# {"ok":true}
```

## Security checklist

- [ ] Strong `JWT_SECRET` in production (required; Docker has no default secret)
- [ ] `CORS_ORIGINS` set to known browser origins (comma-separated; no `*`)
- [ ] `ENABLE_FILE_WORKSPACE=0` on public/tunnel unless intentionally enabled
- [ ] Never set `SEED_JOURNAL_DEMO=1` outside local development
- [ ] HTTPS everywhere
- [ ] `gym.db` backups on server, not in git
- [ ] Rate limits enabled (default in `server/app.js`)

See also [`audit/security-vulnerability-audit-2026-07.md`](../audit/security-vulnerability-audit-2026-07.md).

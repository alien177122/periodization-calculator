# Periodization / Training Calculator

Мини-экосистема для силовой периодизации: калькулятор 1RM и рабочих весов, тренировочный журнал с прогрессом, конструктор сплита и компактная теория. Открытый исходный код под MIT.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

| Documentation | |
| --- | --- |
| Русский README | [README.ru.md](README.ru.md) |
| Участие | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Архитектура | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Деплой | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| План OSS и поддержка | [docs/open-source-kaspi-plan.md](docs/open-source-kaspi-plan.md) |

Стек: React 19 + TypeScript (Vite), Express 5 + better-sqlite3, JWT-аутентификация, ESLint/Prettier, тесты через `node --test` (unit) и Playwright (e2e).

## Что внутри

- **Калькулятор** — расчёт 1RM (формулы Эйпли/Бжицки), рабочие веса по шагам программы, «лесенка» разминочных подходов и разбор штанги по блинам.
- **Журнал** — история тренировок с датами выполнения, недельные графики e1RM и тоннажа, отметки выполненных дней/недель.
- **Конструктор сплита** — сборка сплита по группам мышц с предпросмотром каждого дня и прогрессией по неделям.
- **Теория** — 10 глав с цельными «лекциями» и проверяемыми числами из исходников, отдельные материалы для чтения.
- **Auth** — регистрация/вход с политикой паролей, отзыв токенов через `token_version`, rate-limit на auth-эндпоинтах.
- **Freemium** — 3 бесплатных серверных расчёта на аккаунт (лимит настраивается), дальше — одноразовая оплата через Platega (webhook). По умолчанию выключен (`PLATEGA_ENABLED=0`): все аккаунты считаются премиум.
- **PWA** — манифест и iOS-совместимые иконки: сайт ставится на домашний экран без браузерной обёртки.

## Быстрый старт

```sh
npm install
npm run dev      # API на :3002 и Vite на http://127.0.0.1:5173
```

API отдельно (если вы надеваете Vite на другой бэкенд): `JWT_SECRET='your-secret' npm run server`.

Основные команды:

| Command | Что делает |
| --- | --- |
| `npm run typecheck` | `tsc -b --noEmit`, быстрая проверка типов |
| `npm run build` | `tsc -b` + сборка фронта в `dist/` |
| `npm run preview` | статический сервер поверх `dist/` |
| `npm test` | unit-набор (`node --test`) по общим утилитам и API |
| `npm run lint` | ESLint по web/shared коду |
| `npm run test:e2e` | Playwright |

## Деплой

Фронтенд — статическая сборка Vite (Vercel); Express + SQLite живут на отдельном хосте: фронт получает адрес API через `VITE_API_URL`, бэкенд разрешает CORS для домена Vercel. Полный разбор — в [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Готовый docker-compose для «всё на одной машине»:

```sh
cp .env.docker.example .env.docker   # минимум — свой JWT_SECRET
npm run docker:up                    # http://127.0.0.1:3001
```

Для «расшарить работающий локальный стек» есть туннель-скрипты (`npm run public`, `public:stable`, автозапуск через launchd на macOS) — только для временного показа, не прод-хостинг.

## Бэкенд API

- `GET /api/health` → `{"ok": true}` — health-check.
- `POST /api/calculator/calculate`, `GET /api/calculator/history` — расчёты и символическая история (включая free-limit 402 при включённом freemium).
- `GET /api/billing/status`, `POST /api/billing/checkout`, `POST /api/billing/webhook` — Platega-путь.
- `/api/users/:name` и auth-эндпоинты — профиль, журнал, сплиты и настройки пользователя.

## Лицензия

[MIT](LICENSE).

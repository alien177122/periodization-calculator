# Диагностика ERR_CONNECTION_REFUSED :5173

**Дата:** 2026-10-24  
**Проект:** `~/Desktop/Calculator/Web_Calculator`

## Причина

На порту **5173** никто не слушал — dev-сервер не был запущен. `curl http://127.0.0.1:5173/` давал *Connection refused*; `lsof -i :5173` был пуст.

При этом работал **другой** процесс: `vite preview --host 127.0.0.1 --port **4173**` (production preview), не dev на 5173.

## Что сделано

Запущен `npm run dev` в tmux-сессии `vite-dev-server`. Скрипт `scripts/dev-all.mjs` поднял:

- API: `http://127.0.0.1:3002` (`/api/health`)
- Vite: `http://127.0.0.1:5173/` (прокси `/api` → 3002)

После старта: `curl` → **HTTP 200**, `lsof -i :5173` — node (Vite 7.3.7).

## Команда для Steve

Из корня репозитория:

```bash
cd ~/Desktop/Calculator/Web_Calculator && npm run dev
```

Оставить терминал открытым (или tmux: `tmux new -s vite-dev-server -c ~/Desktop/Calculator/Web_Calculator -- npm run dev`).

Открыть в браузере:

`http://127.0.0.1:5173/?tab=calculator&split=e780520c-dc12-412b-8e64-fdb0ca387835`

(эквивалентно `http://localhost:5173/...`)

## 5173 после старта

**Да, работает** (проверено curl, код 200).

## Заметки

- `:4173` — это `npm run preview`, не dev; URL с калькулятором нужен на **5173**.
- Для API без dev-all отдельно: `npm run server` (порт по умолчанию может отличаться; `dev-all` использует 3002).

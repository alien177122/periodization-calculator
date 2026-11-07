---
cursor:
  subagentId: "bc-1f5aede9-9652-5937-953b-b945649ace6c"
---

# Публичный туннель (Venus PC)

- **URL:** https://developing-recipient-counter-weighted.trycloudflare.com
- **Команда:** `node scripts/public-run.mjs --quick --no-build`  
  (после `npm run build`; `npm run public:quick` упал на Windows `spawn EINVAL` из‑за `npm.cmd`)
- **Каталог:** `C:\Users\user\Desktop\Сортировка\Разработка\React_Project`
- **Локально:** production API/static `:3001` (туннель сюда). Уже были и не трогал: Vite `:5173`, API `:3002`.
- **Проверка:** `http://127.0.0.1:3001/api/health` → `{"ok":true}`; публичный `/api/health` → `{"ok":true}`; `/` → 200.
- **Env:** существующий `.env.public` (JWT_SECRET есть, длина 64); `NODE_ENV=production`; `ENABLE_FILE_WORKSPACE=0`. Секреты не печатать.
- **Web_Calculator** (`Desktop\Calculator\...`) на этом ПК нет. `Desktop\React_Project` пустой (только `.logs`). Это копия Журнал Сплит с калькулятором внутри.
- Процесс оставлен в фоне. Коммитов/PR нет. Старые cloudflared (Vite `:5173`, MCP `:8811`) не убивал.

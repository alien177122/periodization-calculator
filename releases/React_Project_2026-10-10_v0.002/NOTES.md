# React_Project_2026-10-10_v0.002

| Поле | Значение |
|------|----------|
| **Версия** | v0.002 (`package.json` → `0.0.2`) |
| **Дата** | 2026-10-10 |
| **Источник Mac** | `/Users/stevengord/Desktop/React/React_Project_Журнал_Сплит` |
| **Архив** | `source.tar.gz` — без `.git` / node_modules / `.env` / `*.db` / тяжёлых media |

## Мини-лог

- **Web-only облегчённая сборка** (`refactor/bundle-optimization`): JS entry gzip ~90 kB (было ~414 kB), CSS ~37 kB, lazy tabs, без Ionic/Capacitor в root.
- Тесты: 247/247, quality:quick PASS, Playwright smoke 4/4 (см. `BASELINE.md`).
- Скрипты обновления с сохранением туннеля: `apply-update-preserve-tunnel.sh` / `.ps1`.

## Обновление без потери туннеля (Tailscale)

См. `UPDATE-TAILSCALE.md` в этой папке.

Кратко (Windows Venus):

```powershell
# 1) С Mac скачать пакет по Tailscale (Mac IP: tailscale ip -4)
scp stevengord@100.x.x.x:~/Desktop/React/releases/React_Project_2026-10-10_v0.002/source.tar.gz .

# 2) Применить (архивирует старую папку, сохраняет .env.public + gym.db)
powershell -ExecutionPolicy Bypass -File apply-update-preserve-tunnel.ps1 -Archive .\source.tar.gz

# 3) Перезапустить public (тот же CLOUDFLARE_TUNNEL_TOKEN)
cd %USERPROFILE%\Desktop\React_Project
npm run public:stable
```

## Установка с нуля

```bash
tar -xzf source.tar.gz
cd React_Project_*
npm install && npm run server & npm run dev
```

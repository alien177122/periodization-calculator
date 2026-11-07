# Обновление облегчённой версии через Tailscale (без потери туннеля)

**Цель:** заменить код на Windows (Venus) или Mac, сохранив `.env.public` (Cloudflare tunnel token), `gym.db` и workspace.

## Что сохраняется автоматически

| Файл / папка | Зачем |
|---|---|
| `.env.public` | `CLOUDFLARE_TUNNEL_TOKEN`, `PUBLIC_HOSTNAME`, `JWT_SECRET` |
| `.env`, `.env.docker` | локальные секреты и Docker |
| `gym.db` (+ wal/shm) | данные журнала |
| `docker-data/`, `workspace-files/` | persistence Docker / файлы |

Named tunnel **не меняется** — тот же token → тот же hostname в Cloudflare.

---

## A. Mac → Windows (Venus) по Tailscale

### 1. Mac: собрать пакет

```bash
cd ~/Desktop/React/React_Project_Журнал_Сплит
npm run release:pack -- --no-venus   # если SMB мост не смонтирован
# или с копией на MacVenus_Bridge:
zsh ~/mnt/remount-MacVenus_Bridge.sh
npm run release:pack
```

Пакет: `releases/React_Project_YYYY-MM-DD_v0.00N/`

Опционально раздать по HTTP (LAN или Tailscale):

```bash
npm run release:pack:serve
# http://<tailscale-ip>:8765/releases/.../source.tar.gz
tailscale ip -4
```

### 2. Windows: скачать по Tailscale

```powershell
# Tailscale на обоих узлах, один аккаунт
# Mac IP: tailscale ip -4  (например 100.112.244.105)

scp stevengord@100.112.244.105:Desktop/React/React_Project_Журнал_Сплит/releases/React_Project_*/source.tar.gz $env:USERPROFILE\Downloads\
scp stevengord@100.112.244.105:Desktop/React/React_Project_Журнал_Сплит/scripts/apply-update-preserve-tunnel.ps1 $env:USERPROFILE\Downloads\
```

Или через браузер/curl, если Mac запущен `release:pack:serve`.

### 3. Windows: применить (архивирует старую версию)

```powershell
cd $env:USERPROFILE\Downloads
powershell -ExecutionPolicy Bypass -File .\apply-update-preserve-tunnel.ps1 `
  -Archive .\source.tar.gz `
  -TargetDir "$env:USERPROFILE\Desktop\React_Project"
```

Старая папка → `Desktop\_React_Project_Archive\React_Project_<timestamp>`.

### 4. Перезапуск public tunnel

```powershell
cd $env:USERPROFILE\Desktop\React_Project
npm run public:stable
```

Проверка: `npm run public:status` или открыть `PUBLIC_HOSTNAME` из `.env.public`.

---

## B. Обновление на том же Mac (in-place)

```bash
cd ~/Desktop/React/React_Project_Журнал_Сплит
npm run release:pack -- --no-venus
scripts/apply-update-preserve-tunnel.sh releases/React_Project_*/source.tar.gz ~/Desktop/React_Project_Live
```

LaunchAgent public tunnel (`npm run public:launchd:install`) подхватит новый код после `launchctl kickstart -k gui/$(id -u)/com.reactproject.public`.

---

## C. Откат

Windows:

```powershell
# Остановить node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
# Вернуть архив
$arch = Get-ChildItem "$env:USERPROFILE\Desktop\_React_Project_Archive" | Sort-Object Name -Descending | Select-Object -First 1
Remove-Item -Recurse -Force "$env:USERPROFILE\Desktop\React_Project"
Move-Item $arch.FullName "$env:USERPROFILE\Desktop\React_Project"
cd "$env:USERPROFILE\Desktop\React_Project"
npm run public:stable
```

---

## Чеклист после обновления

- [ ] `npm run typecheck && npm test` (на целевой машине)
- [ ] `/api/health` отвечает локально и через public URL
- [ ] Логин и журнал — данные на месте (`gym.db`)
- [ ] iPhone 390px — калькулятор и lazy tabs открываются

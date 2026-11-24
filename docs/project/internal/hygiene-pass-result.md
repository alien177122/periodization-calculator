# Гигиена Web_Calculator — результат

Ветка: `refactor/bundle-optimization` (PR не открывался, push не делался).

## Что сделано

1. Снят debug-ingest `#region agent log` / `127.0.0.1:7373` из `server/app.js` и `server/file-workspace.js`. В `server/` больше нет этих маркеров.
2. `npm audit fix`: `proxy-addr` 2.0.8, `ip-address` 10.7.4, `qs` 6.16.1, `express-rate-limit` 8.7.1, `body-parser` 2.3.0. Express остался на **5.2.1** (major не было). Тесты rate limit (IP/имя: localhost bypass + 429) зелёные.
3. Lint: `useWallpaperOverlayGate` переведён на `useSyncExternalStore`; в WIP `useSplitConstructor` добавлен `savedSplits` (в HEAD он уже был). `npm run lint` — 0 errors / 0 warnings. Добавлен `.github/workflows/ci.yml` (Node 22: typecheck, test, lint, build). Шаблоны issue/PR не трогались.
4. Обои: 3× WebM + AVIF/WebP постеры (~1.9 МБ), исходные mp4 в `assets/wallpapers-src/` (gitignore, не в dist). Нет `preload="auto"`; видео после жеста или Wi-Fi, не на первом кадре. Гостевой экран only, mute на dialog/sheet, не на `.auth-card`.
5. Удалены неиспользуемые `src/screens/CalculatorTabV3.tsx` и `src/platform/initNativeShell.ts`. `src/ionic/` не было.
6. README, ARCHITECTURE, STRUCTURE, AGENTS.md, CHANGELOG, `package.json` → **0.0.3**.

## Ворота

| Проверка | Результат |
| -------- | --------- |
| typecheck | OK |
| test | 259 pass / 0 fail |
| lint | 0 / 0 |
| build | OK |
| dist/ | **4.12 MiB** (4 317 416 байт), `du` 4.3M — ≤ 5 МБ |
| `:7373` в server/ | нет |
| mp4 в dist | нет (preview отдаёт HTML-fallback SPA) |

## Коммиты

1. `a542e945fc2592ceb65ac6dbc3f47ffc4a18da98` — `chore(server): drop debug ingest, audit CVEs, add CI`
2. `e94e7d104eabfaabcb76ca3191a082d720a23912` — `perf(auth): compress guest wallpaper under the dist budget`
3. `d839c2f426526e8ab89983ac949283b91cb854a0` — `chore: drop unused stubs and document v0.003`

## Остаточные риски

- `npm audit` ещё ругается на `braces` через `react-doctor` (чистка только через `--force`).
- `eruda` всё ещё ~506 КБ в dist (ленивый чанк, в бюджет влезли).
- `imagePhone` убран из dist: если вернуть `AuthHeroDecor` без правок Vite — 404.
- Качество tiktok-3.webm снижено (~983 КБ) ради бюджета.
- Живой клик в браузере не прогонялся (нет CDP/Playwright browsers); проверка — preview HTTP + бандл.
- Husky hooks не executable, pre-commit на коммитах не бежал (тесты гонялись вручную).
- В рабочей копии остался чужой WIP (split hub, canon, releases) — в эти 3 коммита не входил.
- Вне скоупа плана: JWT httpOnly, объединение `server/calc.js`, Playwright UI, чистка `canon/`/`releases/`.

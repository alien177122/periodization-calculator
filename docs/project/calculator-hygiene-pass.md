# Гигиена Web_Calculator (шаги 1–6)

Работа только в git-репозитории `~/Desktop/Calculator/Web_Calculator`. Swith, JournalApp и эталон UI с вкладки «Калькулятор» в этот проход не входят.

Обои сжимаем и снимаем с первого экрана (пункт 4 списка) — сознательный откат размера относительно прошлых TikTok-mp4; mute-on-overlay и звук после жеста сохраняем.

Вне скоупа: JWT→httpOnly, объединение `server/calc.js` с shared, Playwright UI-сценарий, чистка `canon/` / `releases/` на диске.

## 1. Убрать debug-телеметрию

В `server/app.js` удалить все блоки `#region agent log` / `#endregion` с `fetch('http://127.0.0.1:7373/ingest/...')`. Проверка: в `server/` не осталось `127.0.0.1:7373` и `#region agent log`.

## 2. Audit + проверки

- `npm audit fix` (цель: `proxy-addr`, `ip-address`, `qs`, `express-rate-limit`, `body-parser`).
- Прогнать `npm run typecheck`, `npm test`, `npm run build`.
- Если audit-fix меняет major Express — точечно проверить rate limit (IP + имя).

## 3. Lint и CI

- `src/hooks/useWallpaperOverlayGate.ts` ~строка 40: убрать синхронный `setState` в эффекте.
- `packages/shared/src/hooks/useSplitConstructor.ts` ~строка 647: закрыть missing dependency.
- `npm run lint` — 0 errors / 0 warnings.
- Добавить `.github/workflows/ci.yml`: `typecheck`, `test`, `lint`, `build` на Node версии из проекта. Шаблоны issue/PR не трогать.

## 4. Бюджет обоев, `dist` ≤ 5 МБ

- Сжать в WebM (и постер AVIF/WebP), суммарно 1–2 МБ; исходные mp4 не класть в `dist`.
- Убрать `preload="auto"`; грузить видео после жеста / по Wi-Fi, не на первом кадре.
- Сохранить логику: обои только на гостевом входе, пауза звука на dialog/sheet, не на `.auth-card`.
- `npm run build` и проверить размер `dist/` ≤ 5 МБ.

## 5. Мёртвый код — удалить, если нет импортов

- `src/screens/CalculatorTabV3.tsx`
- `src/ionic/`
- `src/platform/initNativeShell.ts`

Не удалять живой split/journal/theory. После удаления — typecheck.

## 6. Документация, версия, коммиты

Обновить README, docs/ARCHITECTURE.md, STRUCTURE.md, AGENTS.md, CHANGELOG и версию в package.json под Vite/React/Express/`packages/shared` и релиз `v0.003`.

Коммиты на `refactor/bundle-optimization`, без `canon/`, `releases/`, `node_modules/`, секретов. 2–3 коммита:

1. debug-fetch + audit + lint + CI
2. обои и бюджет `dist`
3. мёртвый код + доки/версия

PR не открывать.

## Проверки

- typecheck / test / lint / build зелёные
- `dist/` ≤ 5 МБ
- в `server/` нет ingest на `:7373`
- git: 2–3 понятных коммита

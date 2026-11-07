# ESSENTIALS — Журнал Сплит (выжимка memory-bank, 2026-10-14)

**Цель:** приложение для силовой периодизации: калькулятор 1ПМ и нагрузок, program v3, журнал, сплит, раздел «Теория». Основная платформа: iPhone (PWA / WKWebView). Прод: фронт на Vercel, API отдельно.

**Архитектура**

- `src/` (screens, components, hooks, `styles/` с токенами), `packages/shared` (`@training/shared`: API-клиент, hooks, calc/journal/split), `server/` (Express 5, better-sqlite3, JWT, файловое workspace).
- Порты: Vite 5173 → proxy → API 3001. Docker: `npm run docker:up` (`.env.docker`), том SQLite `react-project-app-data`.
- Публичный доступ: `npm run public` (Cloudflare; quick-туннель меняет URL при каждом перезапуске). Health: `GET /api/health`.
- Env: `JWT_SECRET`, `DB_PATH`, `VITE_API_URL`, `.env.public` (токен туннеля).
- Security: статус и принятые риски — `docs/security-notes-2026-11-07.md` (trust proxy, dev-bind, OCR-утечки, `server/db.sqlite` из индекса).

**Три варианта клиента (эксперимент)**

1. Веб по ссылке. 2. iOS-обёртка `~/Desktop/React/ios/JournalApp` (WKWebView, `JournalURL` в Info.plist). 3. Нативный Swift `~/Desktop/React/Swith` (Periodization + `PeriodizationCore`): перенос логики из `packages/shared` экран за экраном, начать с калькулятора.

**Качество:** typecheck + test обязательны. Для Tier A (расчёты в shared) ещё `test:acceptance`, `test:crap`, `test:mutate` или `npm run quality`. Сложность новых функций ≤ 12.

**Схемы/отчёты:** инструменты диаграмм (Typst/CeTZ, Fletcher, cetz-plot, Mermaid, Pages `.canvas`) → `memory-bank/diagram-tools.md`.

**Архив:** полный старый memory-bank остался в `memory-bank/` (tasks, activeContext, reference и т.д.) и в бэкапе `~/Desktop/cursor-cleanup-backup-2026-10-14/`. Читать только по необходимости.

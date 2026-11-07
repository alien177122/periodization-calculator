# AGENTS.md — Журнал Сплит

Единая инструкция для агентов (Cursor, Claude, Codex). Подробности: `memory-bank/ESSENTIALS.md`.

- **Продукт:** веб-приложение силовой периодизации: калькулятор нагрузок, программы v3, журнал тренировок, конструктор сплита, теория. Делается iPhone-first (PWA/WebView).
- **Код:** `src/` UI · `packages/shared/` бизнес-логика · `server/` API (Express + SQLite) · `tests/`, `features/` (Gherkin) · `docs/design-standards/` эталоны UI.
- **Запуск:** `npm install` → `npm run dev` (Vite :5173, проксирует `/api` на :3002) и `npm run server`.
- **Проверки:** `npm run typecheck && npm test && npm run lint`; при изменениях расчётов в `packages/shared` ещё `npm run quality`. CI (`.github/workflows/ci.yml`) гоняет typecheck, test, lint, build.
- **Дизайн:** Quiet UI, токены `--color-*`, сетка 4px, системный шрифт. После правок UI проверять ширину 390–430px.
- **Нельзя:** коммитить без просьбы, коммитить `.env*`, `gym.db`, `workspace-files/`, трогать `_archive-non-web/`.

## Cursor — фокус

- Дизайн: правило `ui-quiet` + skill `apple-design` при Apple-стиле.
- Бэкенд: правило `backend` на `server/**` и `packages/shared/**`.
- Скорость кода: глобальное `code-efficiency` + проектное `performance`.

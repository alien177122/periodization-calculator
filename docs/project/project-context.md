# TreningCalculator — контекст проекта

Обновлено: **2026-11-07**. База: **`~/Desktop/Calculator`** (MacBook Steve).

> Карта workspace и границы между репозиториями — также в
> [`README.md`](../../../README.md) корня workspace.

## Цели

1. Развивать **тренировочный калькулятор** (8-недельные планы, сплиты, прогрессия, RPE/%1ПМ).
2. **Добавлять системы периодизации** (новые пресеты, схемы недель, методы внутри сессии) — в первую очередь в shared-движке, затем UI.
3. **Ускорять работу**: тяжёлые пересчёты при смене параметров, большие данные (`theory.ts`, конструктор сплита), бандл Vite.

## Структура `~/Desktop/Calculator`

| Папка | Назначение | Git |
|--------|------------|-----|
| **Web_Calculator** | Основной продукт: Vite 7 + React 19 + TS, Express 5 + SQLite, npm-workspace, пакет `@training/shared`. Remote: `github.com/alien177122/periodization-calculator`. | свой репо |
| **Web_Calculator-rust-core** | **Worktree того же репо**, ветка `cursor/rust-core-calc-1fb7` — Rust/WASM-ядро расчётов. | тот же репо |
| **Swith** | Swift-версия: **PeriodizationCore** (Swift Package) + приложение **Periodization** (SwiftUI). 24 Swift-файла. | репо workspace |
| **ios** | **JournalApp** — SwiftUI + WKWebView на dev-сервер (`127.0.0.1:5173`) или туннель; нативная «оболочка» без Safari UI. | репо workspace |
| **icons**, **ios-shots** | Мастер-иконка 1024, PWA/iOS asset pipeline, скриншоты. | репо workspace |
| **docs** | Workspace-level материалы; проектная документация ведётся в `Web_Calculator/docs/project/`. | репо workspace |
| **backups** | Локальные бэкапы (7.4 ГБ) + страховочные копии от 2026-11-07. | вне git |
| Корень | `PLAN-2026-10-14.md`, `THEORY-EDIT-2026-10-14.md`. | репо workspace |

## Ветки и работа в двух worktree

| Ветка | Назначение |
|-------|------------|
| `cursor/appsheet-wave0-9228` | Основная рабочая ветка: весь веб-продукт. Запушена в origin. |
| `cursor/rust-core-calc-1fb7` | Rust/WASM-ядро (`packages/core-rs`, `packages/core`). Запушена в origin. Обе ветки содержат общую базу. |
| `main` | Локальная копия origin/main. Локально не задеплоена — рабочая ветка не `main`. |

Ветки не слитые с HEAD (28 шт.) сохранены — часть содержит апрельские
security-фиксы, которые уже перереализованы в текущем коде
(`passwordPolicy.js` — лимит 72, `app.js` — `LOGIN_DUMMY_HASH` против
timing-атаки, `config.js` — обязательный `JWT_SECRET` в production,
`schema.js` — `normalizeUserData`).

## Web_Calculator — стек и точки входа

- **UI:** `src/` — `AppShell`, вкладки (`tabs.ts`, `TabPanel`), журнал, теория (`src/components/theory/`), конструктор сплита.
- **Движок:** `packages/shared/src/` — типы, упражнения, **program/v3/** (`trainingV3.ts`, `prescription.ts`), **progressionPresets.ts**, **progressionPreview.ts**, `hooks/useSplitConstructor.ts`, `data/theory.ts`.
- **Сервер:** `server/` — Express 5 + better-sqlite3, JWT, файловое workspace, биллинг Platega.
- **Rust-ядро:** `packages/core-rs` (280 строк Rust) → WASM в `packages/core/wasm`; шим `packages/core/src/index.ts` грузит WASM лениво, при неудаче — TS-фолбэк. Паритет защищён golden-фикстурами и proptest.
- **Документация:** `docs/ARCHITECTURE.md`, `docs/design-standards/`, `canon/memory-bank/`.

### Гейты (все зелёные на 2026-11-07)

| Команда | Результат |
|---------|-----------|
| `npm run typecheck` | чисто |
| `npm run lint` (`--max-warnings 0`) | 0 ошибок |
| `npm test` | **283** теста (289 в rust-ветке) |
| `npm run build` | 1.8 с |
| `cargo test --manifest-path packages/core-rs/Cargo.toml` | **14** тестов (8 unit + 2 golden + 4 proptest) |
| pre-commit хук | `npm test` + `npm run typecheck` + react-doctor (не блокирует) |

> Хук husky был неисполняемым с 2026-06-30 и молча не срабатывал — бит
> восстановлен (`chore(hooks)`). Если хук снова «не выполнился», проверьте
> `chmod +x .husky/_/*`.

### Периодизация (уже в коде)

- В shared живут **две линии**: legacy **2.0** и текущая **v3** (`program/v3/`). Новые системы периодизации добавляем в v3 + пресеты.
- Модель **v3** тренировочной программы и **prescription** — ядро расчёта плана.
- **progressionPresets** — именованные схемы прогрессии.
- **progressionPreview** — предпросмотр траектории (горячий путь при движении слайдеров).

### Горячие места и perf

| Место | Размер | Комментарий |
|-------|--------|-------------|
| `packages/shared/src/data/theory.ts` | 3305 строк | Тянет чанк `TheoryTab` — 472 КБ (128 КБ gzip), крупнейший ассет бандла. Вынести в ленивый чанк. |
| `packages/shared/src/hooks/useSplitConstructor.ts` | 1453 строки | Крупнейший хук; react-doctor: высокая сложность, lookup в цикле, state-adjust-on-prop-change. |
| `src/components/theory/chapterContent.tsx` | 985 строк | Кандидат на разбиение. |
| `src/components/split/GlobalExerciseAdder.tsx` | 347 строк | react-doctor: giant component. |

react-doctor по состоянию на 2026-11-07: **64/100**, 72 замечания
(1 error, 1 warning по безопасности — JWT в localStorage, это осознанный
трейдофф, см. `security-notes-2026-11-07.md`).

## Безопасность

- Итог аудита и применённых фиксов: [`security-notes-2026-11-07.md`](security-notes-2026-11-07.md).
- Исходный аудит: [`security-audit.md`](security-audit.md).
- Принятые риски: `gym.db` в истории git (требует `filter-repo` + ротации секретов — решение владельца), JWT в localStorage.
- Требует скоупа `workflow` для пуша: `.github/workflows/ci.yml` создан локально, но OAuth-токен не может обновить workflow-файл. Инструкция по возврату — в `git log` коммита `chore(ci)`.

## Нативные таргеты

- **Swith/PeriodizationCore** — Swift Package, источники в `Sources/`. Цель: паритет с web shared, не дублировать формулы вслепую.
- **Swith/Periodization** — приложение SwiftUI.
- **ios/JournalApp** — WKWebView-оболочка.
- Статус нативных таргетов: `Swith/memory-bank/plans/`.

## Рекомендуемые следующие шаги

1. **Rust-миграция** — сейчас 280 строк и 6 модулей-заглушек (`progression.rs` — 9 строк). Следующий шаг: перенести `progression` и `volume_matrix` с golden-фикстурами.
2. **Вернуть CI на GitHub** — `gh auth refresh -s workflow`, затем `git add -f .github/workflows/ci.yml`.
3. **Решить судьбу `gym.db` в истории** — требует `filter-repo`, force-push и ротации всех секретов.
4. **Вынести `theory.ts` в ленивый чанк** — сократит главный бандл.
5. **Почистить `useSplitConstructor`** — 1453 строки и замечания react-doctor.
6. **iOS**: smoke JournalApp после изменений иконки/URL.
7. **Swith**: перенос одного пресета из shared в PeriodizationCore с golden-тестом.

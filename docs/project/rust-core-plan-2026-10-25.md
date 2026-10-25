# TS + Rust — план и факт сборки (2026-10-25)

> Local-first копия плана + что реально собрано в ветке `cursor/rust-core-calc-1fb7`.
> Cursor-план в Agent Store **не** редактировался.

UI не переписываем (Leptos/Yew/Dioxus — нет). Полный «всё на Rust» не следующий шаг:
скорость перебора дизайна важнее одного языка.

## Решение

- **React + Vite** — оболочка, сплит, журнал, теория.
- **Rust** — только чистые расчёты: 1ПМ, прогрессия недель, готовность веса сплита, матрица объёма.
- **Сборка в wasm — не в Фазе 0.** Сначала крейт + тесты на Mac, без DOM и без Vite.
- **iOS UniFFI и Axum-сервер — фазы 4/3, опционально и позже.**

Связка рабочая (wasm-bindgen + ts-rs + Vite), но цена реальная: второй тулчейн,
+30–90 КБ gzip, хуже дебаг на границе JS↔wasm. На 8 неделях × ~10 упражнений JS
не тормозит; выигрыш — типы и один движок, не FPS.

## Ловушка: не три формулы 1ПМ

Сейчас уже два места: `packages/shared/src/utils/calc.ts` и дубль `server/calc.js`.
Релиз 0.0.4 это чинит (R04-2.1): сервер вызывает shared, parity в
`tests/calculation-parity.test.ts` (Epley + Brzycki).

Rust не стартует третьим источником. Порядок:

1. Один TS-источник (R04-2.1) — можно отдельно от Rust.
2. Фаза 0 зеркалит этот `calc.ts`.
3. Golden: одни и те же кейсы, TS = Rust.
4. wasm и подмена `packages/shared/src/utils/*` — только после зелёных golden.

## Фазы (план)

### Фаза 0 — опция «для начала»

Крейт `packages/core-rs` (plain Rust, без wasm в default-features):

- 1ПМ (Epley/Brzycki) из текущего `calc.ts`;
- затем прогрессия недель, `split-weight-readiness`, матрица объёма;
- proptest + golden JSON, которые уже гоняет TS;
- `cargo test` зелёный; **в npm/Vite не подключать** на этом шаге;
- этот док на диске.

### Фаза 1 — мост

`wasm-pack --target web` → `@training/core`, `ts-rs`, lazy-init и TS-fallback
(PWA/offline, первый запуск без wasm).

### Фаза 2 — по одному модулю

В `packages/shared/src/utils/*`. Каждый шаг закрыт golden TS=Rust. UI не трогать.
В этой сборке подменён **только** путь 1ПМ (+ крошечные хелперы в крейте, без swap в TS).

### Фаза 3 (нет)

Axum вместо клиентского расчёта. Сейчас Express + SQLite — не надо.

### Фаза 4 (нет)

UniFFI → Swift, когда дозреет нативная ветка (Swith / PeriodizationCore).
Не JournalApp-WebView.

## Что не входит

- Перенос вкладки Сплит / AppSheet / S1-текстов в Rust.
- Коммиты без зелёных тестов.
- Параллельная писанина в основном checkout, пока S1 держит `theory.ts`.

## Что собрано (факт)

Работа шла в git worktree `../Web_Calculator-rust-core` от `origin/cursor/appsheet-wave0-9228` (`d055a3b9`), без правок S1-файлов и без CI workflow.

### R04-2.1 / unify-ts-calc

- `server/calc.js` больше не содержит формул: re-export `calc1RM` и `roundOneRm` из `packages/shared/src/utils/calc.ts`.
- `roundOneRm` перенесён в shared.
- Сервер стартует с `--experimental-strip-types` (`npm run server` / `start` / `scripts/dev-all.mjs` / `public-run.mjs`).
- `tests/calculation-parity.test.ts`: Epley + Brzycki, границы (0 / отрицательные вес и повторы), известные фикстуры.

### Фаза 0 — `packages/core-rs`

- Plain Rust lib, default-features пустые (wasm — `--features wasm`).
- Порт: `calc_1rm` (Epley/Brzycki, те же литералы), `ceil_to_step`, `round_weight`, `calc_working_weight`, `volume_class`, `round_one_rm`.
- Stubs: `progression.rs` (таблицы недель остаются в TS — каталог упражнений), `volume_matrix.rs` (полный breakdown в TS), `split_weight_readiness.rs` (предикат без каталога).
- Golden: `packages/core-rs/golden/one_rm.json` + `helpers.json` (числа сгенерированы из TS).
- `cargo test`: unit + golden + proptest.

Как гонять:

```bash
cargo test --manifest-path packages/core-rs/Cargo.toml
# или
npm run core:test
```

### Фаза 1 — `@training/core`

- `wasm-pack --target web --out-dir packages/core/wasm --out-name training_core -- --features wasm`
- npm-пакет `packages/core` (`@training/core`), не `@periodization/core` — в репо уже `@training/shared`.
- ts-rs пишет `packages/core/src/generated/OneRmMethod.ts` и `EquipmentType.ts` при `cargo test`.
- Lazy-init + TS-fallback, если wasm нет или не загрузился. В браузере `scheduleTrainingCoreInit()` не блокирует первый кадр.
- `vite-plugin-wasm`; top-level await не нужен (async init).
- Артефакты wasm (~16 КБ) лежат в `packages/core/wasm/` и коммитятся, чтобы CI/npm test не требовали rustup.

Пересборка wasm:

```bash
npm run core:build
```

### Фаза 2 — swap только 1ПМ

- `calc1RM` в `packages/shared/src/utils/calc.ts` вызывает wasm через `calc1RMFromCore`, иначе `calc1RMTs`.
- Остальные shared utils не подменялись.
- Golden TS=Rust: `tests/calc-core-golden.test.ts` (тот же JSON, что `cargo test`).

```bash
npm test
npm run typecheck
npm run lint
```

### Проверки на этой сборке

| Команда | Результат |
|---------|-----------|
| `cargo test --manifest-path packages/core-rs/Cargo.toml` | зелёный (unit + golden + proptest) |
| `npx tsc --noEmit -p packages/core/tsconfig.json` | зелёный |
| `npm test` | 260 pass, в т.ч. wasm 1RM = TS golden |
| `npm run lint` | зелёный |
| `npm run typecheck` (`tsc -b`) | зелёный на origin AppSheet (без локальных uncommitted AppSheet-модулей) |

## Остаточные риски

- Node 22 в CI должен уметь type-strip `.ts` (сервер импортирует `calc.ts`). Локально проверено на Node 26; при регрессии на старом 22.6–22.17 нужен флаг, он уже проставлен.
- wasm `--target web` в Node грузится через `fs.readFileSync` fallback; в браузере — `fetch(new URL(..., import.meta.url))`. MIME `application/wasm` на проде желателен, иначе instantiateStreaming упадёт в более медленный путь.
- Первый вызов `calc1RM` в PWA до конца init идёт через TS; после загрузки wasm числа должны совпасть (golden).
- `progressionPreview` и полный `volume-breakdown` не портированы (каталоги). Не swap-ать пачкой.
- `split-weight-readiness.ts` на origin AppSheet нет; в Rust — catalog-free предикат.
- CI rust job **не** добавлен: GitHub OAuth App не может пушить `.github/workflows` без workflow scope. `npm run core:test` локально.
- Не трогались: UI, AppSheet, `theory.ts`, hero-tips, content-s1-validate, SplitCreateDialog, vaul.

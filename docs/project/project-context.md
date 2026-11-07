# TreningCalculator — контекст проекта

Обновлено: 2026-10-18. База: **`~/Desktop/Calculator`** (MacBook Steve).

## Цели

1. Развивать **тренировочный калькулятор** (8-недельные планы, сплиты, прогрессия, RPE/%1ПМ).
2. **Добавлять системы периодизации** (новые пресеты, схемы недель, методы внутри сессии) — в первую очередь в shared-движке, затем UI.
3. **Ускорять работу**: тяжёлые пересчёты при смене параметров, большие данные (`theory.ts`, конструктор сплита), бандл Vite.

## Структура `~/Desktop/Calculator`

| Папка | Назначение |
|--------|------------|
| **Web_Calculator** | Основной продукт: Vite + React UI, npm-workspace, пакет `@periodization/shared`. Repo: `alien177122/periodization-calculator`. |
| **ios** | **JournalApp** — SwiftUI + WKWebView на dev-сервер (`127.0.0.1:5173`) или туннель; нативная «оболочка» без Safari UI. |
| **Swith** | Будущая Swift-версия: **PeriodizationCore** (Swift Package), UI **Periodization** — план отложен (PLAN §4). |
| **icons** | Мастер-иконка 1024, PWA/iOS asset pipeline. |
| **backups** | Локальные бэкапы. |
| Корень | `PLAN-2026-10-14.md`, `THEORY-EDIT-2026-10-14.md` (копии в [reference](file:///cursor/stores/self/docs/reference/)). |

## Web_Calculator — стек и точки входа

- **UI:** `src/` — `AppShell`, вкладки (`tabs.ts`, `TabPanel`), журнал, теория (`src/components/theory/`), конструктор сплита.
- **Движок:** `packages/shared/src/` — типы, упражнения, **program/v3/** (`trainingV3.ts`, `prescription.ts`), **progressionPresets.ts**, **progressionPreview.ts**, **hooks/useSplitConstructor.ts**, **data/theory.ts** (крупный статический контент).
- **Документация в репо:** `docs/ARCHITECTURE.md`, `canon/memory-bank/` (ESSENTIALS, activeContext).
- **Скрипты:** `npm run dev` (Vite ~5173), typecheck, build, тесты (256 на 14.10).

### Периодизация (уже в коде)

- В shared живут **две линии**: legacy **2.0** и текущая **v3** (`program/v3/`). Новые системы периодизации добавляем в v3 + пресеты; теория в UI описывает больше моделей, чем сейчас подключено в калькуляторе — это главный content/code gap.
- Модель **v3** тренировочной программы и **prescription** — ядро расчёта плана.
- **progressionPresets** — именованные схемы прогрессии (то, что расширяем новыми системами).
- **progressionPreview** — предпросмотр траектории (горячий путь при движении слайдеров/пресетов).
- Теория в UI описывает «этажи» периодизации (год → метод); контент синхронизирован с THEORY-EDIT.

### Горячие места и perf

- **useSplitConstructor** — большой хук конструктора; eslint: refs during render (PLAN: 22 ошибки общего lint, не блокируют теорию).
- **theory.ts** + рендер глав — объём данных; lazy/ code-split вкладки «Теория» при необходимости.
- **progressionPreview / v3** — вызывать мемоизацию, Web Worker при частых пересчётах 8 недель × N упражнений.
- **vite.config** — проверить manualChunks для `shared` и theory.

## iOS

- Проект **JournalApp** (`ios/JournalApp/`): `JournalApp.swift`, WebView на веб-приложение.
- Сборка через Xcode; на Xcode 27 — **Device Hub** вместо старого Simulator.app (PLAN §2).
- AppIcon из `icons/` + Assets.xcassets (загруженные plist/json — артеfacts catalog).

## Swith (Swift, позже)

- **PeriodizationCore** — Swift Package (источники в `Sources/`).
- Отдельное приложение **Periodization** — цель: паритет с web shared, не дублировать формулы вслепую.

## Соответствие PLAN / THEORY

| PLAN | Статус |
|------|--------|
| Тексты теории | Сделано (THEORY-EDIT); в Context — diff-описание |
| Проверки web | typecheck/build/tests OK; общий lint — техдолг |
| Иконка 1024 | iOS + PWA по PLAN |
| Swith | Отложено |

## Рекомендуемые следующие шаги

1. **Зафиксировать контракт** новой системы периодизации в `packages/shared` (тип + preset + тесты на v3).
2. **UI**: выбор пресета и preview без лагов (profiling React + shared).
3. **Lint**: починить `useSplitConstructor` (refs during render) — стабильность и perf рендера.
4. **iOS**: smoke JournalApp + Device Hub после изменений иконки/URL.
5. **Swith**: перенос одного preset из shared в PeriodizationCore с golden-тестом (когда дойдём до §4 PLAN).

## Ссылки в Context

- [PLAN-2026-10-14](file:///cursor/stores/self/docs/reference/PLAN-2026-10-14.md)
- [THEORY-EDIT-2026-10-14](file:///cursor/stores/self/docs/reference/THEORY-EDIT-2026-10-14.md)
- [ingest-summary](file:///cursor/stores/self/internal/ingest-summary.md)

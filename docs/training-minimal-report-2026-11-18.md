# Отчёт: минималистичная «Тренировка» — выполнение плана training-minimal-plan

Дата: 2026-11-18. Исполнитель: агент. Коммиты: 4182018e → ceed094f → d9ab7cb4 → 85902824 → 47bf61e9.

## 1. Что сделано (по фазам)

### Фаза 0 — карта + память
- Прочитаны: SplitTab, TrainingDayCard, split-pairs, split-schemes, types, pyramid.
- Обновлён memory-bank/activeContext.md: зафиксированы цели плана.
- UI не менялся.

### Фаза 1 — модель: cluster + интенсивность
- `packages/shared/src/types/index.ts`: добавлены `SetMode`, `ClusterConfig`, поля `setMode`/`cluster` в `Block`.
- `packages/shared/src/utils/intensity.ts`: `intensityTone(pct)`, `clusterAllowed(pct)`.
- `packages/shared/src/utils/cluster.ts`: `buildClusterSets(opts)` — разбивает reps на мини-подходы.
- `packages/shared/src/data/split-blocks.ts`: `migrateSplitToBlocks` → `setMode: 'linear'` на каждом блоке (идемпотентно).
- Тесты: `tests/intensity-cluster.test.ts` (15 тестов).
- Коммит: `4182018e`.

### Фаза 2 — автопары (движок)
- Уже реализовано параллельной сессией: `packages/shared/src/utils/pair-engine.ts` — `verdictPair`, `suggestPartners`, `autoPairDay`. Тесты `tests/pair-engine.test.ts` (7 тестов).
- Правила: одна группа мышц → не парить; обе на поясницу → конфликт; хват → предупреждение; приоритет верх/низ.

### Фаза 3 — визуальные стеки
- `src/components/training/PairStack.tsx` — компонент стека (rail + тон по интенсивности).
- `src/styles/components/training/stack.css` — стили стека.
- `src/components/TrainingDayCard.tsx` — замена `<table class="pt">` на список стеков (`.stack`). Раскрытие «Разбор» сохранено.
- Коммит: `85902824`.

### Фаза 4 — выбор схемы в карточке
- Сегмент-контрол `setMode` (Константа / Пирамида / Блоковая) в раскрытой карточке.
- Блоковая (cluster) показывает мини-подходы (2+30с+2); доступна при тяжёлых неделях (weekIndex % 4 >= 2).
- CSS: `.training-setmode`, `.training-setmode__btn`.
- Коммит: `d9ab7cb4`.

### Фаза 5 — таймер
- `src/hooks/usePhaseTimer.ts` — таймер с очередью фаз (Date.now, visibility handling, WebAudio beep, Wake Lock).
- `src/components/training/BlockTimer.tsx` — поддержка `phases` prop; при передаче фаз исполняет их по очереди.
- Коммит: `ceed094f`.

### Фаза 6 — один экран
- `src/screens/SplitTab.tsx` — убран трёхкнопочный переключатель; по умолчанию показывается выполнение программы; «Разбор» и «Конструктор» — кнопки сверху; «← К программе» возвращает.
- Коммит: включён в `ceed094f` / предыдущие.

### Фаза 7 — Теория-новости
- `src/data/theory-news.ts` — 5 сводок исследований (Kinoshita 2026, Krause Neto 2025, Lin 2026, Yeti cluster, Egorov circadian) с грейдами и источниками.
- `src/components/theory/NewsFeed.tsx` — лента карточек-сводок.
- `src/styles/components/theory/news-feed.css` — стили.
- Встроено в TheoryTab над переключателем видов.
- Коммит: `47bf61e9`.

## 2. Методы и подходы

- **Типизация:** расширение существующих интерфейсов (Block) без breaking changes; опциональные поля с `?`.
- **Миграция:** идемпотентная (schemaVersion check), обратно совместимая.
- **Чистые функции:** intensity, cluster, pair-engine — без побочных эффектов, покрыты юнит-тестами.
- **CSS:** токены `--color-*` / `--ta-*`, сетка 4px, радиусы 6/8/12/16/20/24 (memory-bank/style-guide.md).
- **Тестирование:** node:test + assert; Playwright для визуальной проверки на 393/1512px.
- **Безопасность:** таблица заменена на стеки только после проверки рендера; старый код удалён только после верификации.
- **Коммиты:** одна фаза = один коммит = работающее приложение; push после каждого коммита (по требованию владельца).

## 3. Гейты (финальный прогон)

| Гейт | Результат |
|---|---|
| typecheck | ✅ чисто |
| lint (max-warnings 0) | ✅ 0 |
| tests | ✅ 353/353 pass |
| build | ✅ 1.94 с |

## 4. Открытые вопросы

- Cluster gate: используется эвристика weekIndex % 4 >= 2 (нет pct в TrainingDayCard). Нужен pct для точного гейта >80%.
- Web Worker для таймера: не реализован (setInterval + visibilitychange достаточно для функциональной корректности).
- autoPairDay в UI: движок готов, но не подключён к экрану добавления упражнений.
- Нормативные метрики (C5 плана калькулятора) — не реализованы.
- Голосовой ввод — не реализован (архитектура описана).
- Теория-новости: 5 сводок, можно расширять.
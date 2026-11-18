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

## 4. Фаза 8 — доводка (выполнено)

### 8.1 ✅ Точный gate cluster и тон по pct
- `TrainingExerciseRow.intensityPct` добавлен (из percentage в getTrainingExercises).
- `TrainingDayCard` использует `intensityTone(blockPct)` и `clusterAllowed(blockPct)` вместо эвристики weekIndex.
- Подсказка при disabled: «Блоковая доступна при >80% — сейчас N%».

### 8.2 ✅ Сохранение выбора схемы в Block.setMode/cluster
- `withBlockSetMode(split, day, blockId, setMode, cluster?)` в split-blocks.ts (иммутабельный).
- Селектор вызывает `onSetModeChange` callback (передаётся в TrainingDayCard).

### 8.3 ✅ Таймер: корректный pause/resume
- `usePhaseTimer`: разделены `start()` (с нуля) и `resume()` (продолжить с текущей фазы).
- `toggle`: running→stop, done→start, иначе resume. Пауза/старт не перезапускает блок.

### 8.4 📋 Фоновое исполнение таймера — задокументировано
- Worker не реализован. Ограничение: звук/beep только при активной вкладке.
- Время корректно при возврате (Date.now + visibilitychange).

### 8.5 ✅ Автопары при добавлении упражнений
- `GlobalExerciseAdder` показывает до 3 предложенных партнёров (suggestPartners) с пометкой ⚠ при warn.
- CSS: `.global-exercise-adder__suggestions`.

### 8.6 📋 Один экран — частично
- «Программа» убрана как отдельная вкладка (выполнение по умолчанию).
- Остаётся переключатель «Разбор/Конструктор» (2 кнопки). Полный коллапс в один экран — отложен.

## 5. Выполнено дополнительно (по замечаниям пользователя)

- Tab bar: 2 вкладки заполняют ширину (grid 4→2).
- Журнал убран из навигации (код сохранён).
- Фазы маршрута: «База / Дополнительно / Здоровье».
- THROUGHLINE.md убран из 15 статей.
- Схема в статье O: подписи сокращены, ярче, фон подложки улучшен.
- Конструктор: упрощённый вид + расширенный режим.
- Таб «Программа» упразднён (выполнение по умолчанию).
- Шапка конструктора: лейблы ярче, контейнеры, радиусы по memory-bank.
- Калькулятор: мышечные карты + инсайты на 18 упражнений, привязка к выбранному.
- Мобильный калькулятор: исправлен нулевой content-width полей.
- Тексты: copy-lint 0 нарушений.
- Тема-переключатель: квадратный (8px/6px).
- Сплит mode switch: 12px radius (вместо pill).

## 6. Открытые вопросы

- Web Worker для таймера: не реализован (setInterval + visibilitychange достаточно функционально).
- autoPairDay в UI: движок готов и показывает предложенных партнёров, но не применяет автоматически.
- Нормативные метрики (C5 плана калькулятора) — не реализованы.
- Голосовой ввод — не реализован (архитектура описана).
- Теория-новости: 5 сводок, можно расширять.
# Слияние калькулятора со сплитом · план от 2026-11-15 (карточка №1)

Статус на 2026-11-15: **M0 выполнен** (3 вкладки, редирект `?tab=calculator` → `?tab=split&view=breakdown`, переключатель 3 режимов, биллинг проброшен). Код коммитов нет.

Связанные документы:
- `docs/split-training-pairing-plan-2026-11-11.md` (S1–S3 выполнены)
- `docs/calculator-exercise-breakdown-plan-2026-11-14.md` (C0–C5)
- `docs/lectures-copy-plan-2026-11-10.md` (L0–L4 выполнены)

---

## 0. Решение владельца (зафиксировано ранее)

1. Калькулятор пока остаётся отдельной вкладкой; слияние (карточка №1) — отдельный шаг после стабилизации S2.
2. Калькулятор переосмысливается: «разбор конкретного упражнения» — выбери упражнение → 1ПМ → 8-недельная волна → мышечная карта и инсайты. Теория остаётся общим справочником.
3. Биллинг/paywall (premium, лимиты расчётов) не затрагиваются — переезжают вместе с калькулятором.

---

## 1. Текущее состояние (замерено 2026-11-15)

- Вкладки: `APP_TABS = ['split', 'calculator', 'theory', 'journal']` (4).
- `CalculatorTab` (`src/screens/CalculatorTab.tsx`) — отдельный экран: биллинг-панель, тестовый подход (вес/повторы/тело/доп. вес), расчёт 1ПМ, сохранённые, история, объём (`VolumeDonut`), мышечная карта (`MuscleMap` + инсайты).
- Состояние калькулятора живёт в `useCalculatorState` (хук), подключается в `AppShell` и пробрасывается в `TabPanel` через проп `calculator`.
- `selectedExercise` синхронизирован с `activeResult?.exerciseKey` (через `useCalculatorState`).
- `MuscleMap` принимает `selectedExercise` и автопереключается.
- `onGoCalculator` в `TrainingTabContainer` переключает вкладку на `calculator` (используется из заблокированного состояния тренировки и из диалогов).
- Deep links: `?tab=calculator`, `?tab=calculator&exercise=bench` (если поддерживается).
- `TabNav` — 4 кнопки; `TabPanelFallback` и `hero-tips`/`heroCopy` знают 4 вкладки.

---

## 2. Целевая архитектура

### 2.1. Вкладки: 5 → 3

```
APP_TABS = ['split', 'theory', 'journal']
```

- **Тренировка** (id `split`) — объединяет Программу, Конструктор и Разбор упражнения.
- **Теория** (id `theory`) — без изменений.
- **Журнал** (id `journal`) — без изменений.

### 2.2. Режимы вкладки «Тренировка»

Внутри `SplitTab` — переключатель из 3 режимов (вместо 2):

| Режим | URL | Содержимое |
|---|---|---|
| `Программа` | `?view=program` | выполнение программы (как сейчас) |
| `Конструктор` | `?view=constructor` | редактор сплита (как сейчас) |
| `Разбор` | `?view=breakdown` | калькулятор как разбор упражнения |

Переключатель — `segmented` (3 кнопки) или выпадающий список на узких экранах. По умолчанию для нового пользователя — `Программа` (или `Разбор`, если нет сохранённых 1ПМ).

### 2.3. Компоненты

- `SplitTab` расширяется: добавляется ветка `view === 'breakdown'` → рендер `CalculatorTab` (или переименованного `ExerciseBreakdownTab`) с пропами из `AppShell`.
- `CalculatorTab` переезжает в `src/screens/` (уже там) и импортируется в `SplitTab` лениво.
- Биллинг/paywall остаётся в `AppShell` и пробрасывается через `SplitTab` → `CalculatorTab`.

### 2.4. Данные

- `UserData.exercises` (1ПМ) — общий, не меняется.
- `selectedExercise` и тестовые поля — состояние `useCalculatorState`, переезжает в `SplitTab` или остаётся в `AppShell` и пробрасывается.
- История расчётов (`getCalculationHistory`) — без изменений.
- `VolumeDonut` и `MuscleMap` — без изменений, просто рендерятся в режиме «Разбор».

---

## 3. Навигация и deep links

### 3.1. Редиректы

- `?tab=calculator` → `?tab=split&view=breakdown`.
- `?tab=calculator&exercise=bench` → `?tab=split&view=breakdown&exercise=bench` (если параметр `exercise` поддерживается; иначе через `selectedExercise` в состоянии).
- Старые ссылки `?tab=training` → `?tab=split&view=program` (как сейчас).

### 3.2. `onGoCalculator` / `onGoBreakdown`

- `TrainingTabContainer` и `LockedState` вызывают `onGoCalculator` → переключение на `calculator`. После мержа — переключение на `split` + `view=breakdown` (с выбранным упражнением, если контекст есть).
- Контекстные ссылки в теории («Как считается 1ПМ →») — обновить на `?tab=split&view=breakdown`.

### 3.3. `TabNav`

- 3 кнопки: Тренировка, Теория, Журнал.
- `TabPanelFallback` — убрать `calculator`.
- `hero-tips` — объединить `calculator` + `split` подсказки в `split`.
- `heroCopy` в `AppShell` — убрать ветку `calculator`.

---

## 4. План реализации (этапы)

### Этап M0 · Подготовка (S)
- Добавить `LEGACY_CALCULATOR_TAB = 'calculator'` в `tabs.ts`, `normalizeTab` маппит `calculator` → `split` (с параметром `view=breakdown`).
- Обновить `AppTabs` → 3 элемента.
- Обновить тест `tests/app-tabs.test.ts`: 3 вкладки, редирект `calculator` → `split&view=breakdown`.

### Этап M1 · Расширение `SplitTab` (M)
- Добавить тип `SplitView = 'program' | 'constructor' | 'breakdown'`.
- Добавить ленивый импорт `CalculatorTab` (или `ExerciseBreakdownTab`).
- Добавить пропсы `calculator` в `SplitTabProps`.
- Рендерить `CalculatorTab` в ветке `breakdown`.
- Переключатель — 3 кнопки (или segmented). На узких экранах — горизонтальный скролл или компактный вид.

### Этап M2 · Перенос состояния (M)
- `AppShell`: передавать `calculator`-пропсы в `SplitTab` (как сейчас в `TabPanel`).
- `TabPanel`: убрать ветку `calculator`; `calculator`-пропсы передаются через `split` (или отдельный ключ `breakdown`).
- `training.onGoCalculator` → `training.onGoBreakdown` (переключает `tab=split&view=breakdown`).
- `LockedState` и `TrainingTabContainer` обновить вызов.

### Этап M3 · Редиректы и ссылки (S)
- `useEffect` в `AppShell`: `tabState.value === 'calculator'` → `navigateSearch({tab: 'split', view: 'breakdown'})`.
- `ContextTheoryLink` и другие ссылки на калькулятор → `?tab=split&view=breakdown`.
- `hero-tips`: объединить.
- `TabPanelFallback`, `TabNav`: убрать `calculator`.

### Этап M4 · Биллинг и paywall (S)
- Проверить, что `BillingPanel` и `LockedCalculationResult` рендерятся в режиме `breakdown`.
- `onCheckout`, `onRefreshBilling` пробрасываются.
- Тест: премиум-статус сохраняется при переключении режимов.

### Этап M5 · Тесты и приёмка (M)
- Обновить `tests/app-tabs.test.ts`: 3 вкладки.
- Добавить e2e: `?tab=calculator` → `?tab=split&view=breakdown`, рендер карты стимула.
- DOM 393/430px: переключатель 3 кнопок не переполняет, чипы карты скроллятся.
- Консоль 0 ошибок.
- `npm run typecheck && npm test && npm run lint && npm run build`.

### Этап M6 · Документация и очистка (S)
- Обновить `AGENTS.md` (3 вкладки).
- Обновить планы (S2 и этот).
- Удалить неиспользуемые импорты/пропсы `calculator` из `TabPanel` (если полностью переехали).

---

## 5. Риски

1. **Биллинг:** paywall-состояние и `pendingLockedResult` должны корректно работать в новом режиме. Проверить вручную.
2. **selectedExercise:** состояние живёт в `useCalculatorState`. При переключении режимов `Программа` ↔ `Разбор` состояние не должно сбрасываться (хук поднят в `AppShell`).
3. **Bundle size:** `CalculatorTab` уже lazy в `TabPanel`. После мержа — lazy в `SplitTab`. Убедиться, что чанк не попадает в initial bundle.
4. **Deep links:** старые ссылки `?tab=calculator` должны редиректить. Проверить e2e.
5. **Обратная совместимость:** `onGoCalculator` используется в нескольких местах. Переименовать аккуратно.
6. **Мышечная карта:** `MuscleMap` использует `selectedExercise` (ключ калькулятора). При мерже ключи те же (`bench`, `squat`, …), ничего не меняется.

---

## 6. Что не делаем (отложено)

- Слияние `VolumeDonut` с сплитом (остаётся в режиме «Разбор»).
- Нормативные метрики (C5) — уже частично (ориентиры в инсайтах).
- Переименование `CalculatorTab` в `ExerciseBreakdownTab` — можно оставить имя, переименовать позже.

---

## 7. Критерии приёмки

- [ ] 3 вкладки: Тренировка, Теория, Журнал.
- [ ] Режим «Разбор» открывает калькулятор (1ПМ, 8 недель, карта, инсайты).
- [ ] `?tab=calculator` редиректит на `?tab=split&view=breakdown`.
- [ ] Биллинг/paywall работает в режиме «Разбор».
- [ ] Контекстный переход из тренировки «Как считается 1ПМ →» ведёт в «Разбор».
- [ ] `npm run typecheck && npm test && npm run lint && npm run build` зелёные.
- [ ] DOM 393/430px без горизонтального скролла, консоль 0.
- [ ] e2e «расчёт → сохранение → выбор в сплите» проходит.

---

## 8. Оценка

M (3–5 дней). Самый рискованный поток — биллинг и deep links. Рекомендуется делать веткой с отдельным коммитом по этапам M0–M6.

---

## 9. Открытые вопросы

1. Название режима: «Разбор» или «Калькулятор»? Рекомендую «Разбор» (соответствует видению).
2. Порядок режимов: Программа → Конструктор → Разбор, или Разбор → Программа → Конструктор? Рекомендую Программа → Разбор → Конструктор (по частоте использования).
3. Нужен ли быстрый переход «посчитать 1ПМ для этого упражнения» прямо из карточки упражнения в конструкторе? Рекомендую да — кнопка «Разобрать» в `MuscleDayGrid`.
EOF
echo "written"
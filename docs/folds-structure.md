# Сворачиваемые блоки `<details>` («складки») — обновлённый анализ структуры и функций

Дата обновления: 2026-11-16. Цель: дать детальную структуру всех `<details>`-блоков для передачи в более сильные модели.

## 0. Сводка

- Всего `<details>` в `src/`: **5**.
- Контролируемых через состояние: **2** (Fold 1 через `useDetailsState`, Fold 3 через локальный `useState`).
- Нативных (uncontrolled): **3** (Fold 2, 4, 5).
- Компонентов-«складок» без подключения (dead code): **2** (`JournalMetricsHelp`, `JournalRpeHelp`).
- Общий хук состояния: `src/hooks/useDetailsState.ts` (используется только Fold 1).

## 1. Карта размещения (где живут складки)

| # | Компонент | Файл | Место использования | Состояние |
|---|-----------|------|---------------------|-----------|
| 1 | `ScienceDetailsGroup` | `src/components/StrengthFormulaSection.tsx` | `StrengthFormulaSection` → секция `#science` | Контролируемое (`useDetailsState`) |
| 2 | `LectureCheckInBlock` | `src/components/theory/LectureSection.tsx` | `chapterContent.tsx` (9 глав) + `ReadingLecturePage.tsx` | Нативное |
| 3 | `ProgressionPreviewChart` (обёртка `<details>`) | `src/components/calculator/ProgressionPreviewChart.tsx` | `ProgressionPresetPicker` → калькулятор | Контролируемое (локальный `useState`) |
| 4 | `JournalMetricsHelp` | `src/components/journal/JournalMetricsHelp.tsx` | **не подключён** (dead code) | Нативное |
| 5 | `JournalRpeHelp` | `src/components/journal/JournalRpeHelp.tsx` | **не подключён** (dead code) | Нативное |

## 2. Fold 1 — `ScienceDetailsGroup`

### 2.1. Файл и компонент
- **Файл:** `src/components/StrengthFormulaSection.tsx`
- **Компонент:** внутренний `ScienceDetailsGroup({ group, cards, defaultOpen })`.
- **Рендер:** `StrengthFormulaSection` → `<StrengthBlock id="science" …>` → `SCIENCE_CARD_GROUPS.map(([group, cards], index) => <ScienceDetailsGroup … defaultOpen={index === 0} />)`.

### 2.2. DOM-структура
```tsx
<details className={`ta-strength-science-group${open ? ' is-open' : ''}`} open={open}>
  <summary className="ta-strength-science-group__summary"
           aria-expanded={open} aria-controls={contentId}
           onClick={handleSummaryClick}>
    <span className="ta-strength-science-group__title">{group}</span>
    <span className="ta-strength-science-group__count">
      {cards.length} {cards.length === 1 ? 'карточка' : 'карточек'}
    </span>
  </summary>
  <div id={contentId} className="ta-strength-science-group__content">
    <div className="ta-strength-science-group__inner">
      {cards.map(card => (
        <article key={card.id} className="ta-strength-science-card">
          <div className="ta-strength-science-card__meta">
            <span>{card.category}</span>
            <span>Diff {card.difficulty}/3</span>
          </div>
          <h4 className="ta-strength-science-card__question">{card.question}</h4>
          <p className="ta-strength-copy">{card.answer}</p>
          <p className="ta-strength-science-card__apply">
            <strong>Как применить:</strong> {card.application}
          </p>
          <footer className="ta-strength-science-card__source">
            <span>{card.source}</span>
            <span>{card.tags.map(tag => `#${tag}`).join(' ')}</span>
          </footer>
        </article>
      ))}
    </div>
  </div>
</details>
```

### 2.3. Состояние и логика
- `const [open, setOpen] = useDetailsState(groupStorageId(group), defaultOpen);`
- `handleSummaryClick(event)` → `event.preventDefault()` + `setOpen(current => !current)`.
- `contentId = strength-science-${groupStorageId(group)}`.
- `groupStorageId(group)` — нормализация имени группы в slug (lowercase, замена не-алфанумерических на `-`).

### 2.4. Данные (контракт)
- `group: string` — имя группы (ключ `Map`).
- `cards: StrengthScienceCard[]`:
  ```ts
  type StrengthScienceCard = {
    id: string; group: string; category: 'Сила' | 'Техника' | 'Восстановление';
    difficulty: 1 | 2 | 3; question: string; answer: string;
    application: string; source: string; tags: string[]; color: string;
  }
  ```
- `defaultOpen: boolean` — `index === 0`.

### 2.5. Источник данных
- `STRENGTH_SCIENCE_CARDS` (из `@training/shared/data/strength-formula`).
- Группировка: `Array.from(STRENGTH_SCIENCE_CARDS.reduce(...))` → `Map<string, StrengthScienceCard[]>`.

### 2.6. Функция
Сворачиваемая группа научных карточек по теме в разделе «Доказательная база» (глава 09). Сохраняет состояние открытости в `sessionStorage` на время сессии.

### 2.7. Персистентность
- `sessionStorage` ключ `strength:details:{slug}` (через `useDetailsState`).

### 2.8. Стили
- `src/styles/components/theory-apple.css`: `.ta-strength-science-group`, `__summary`, `__summary::after`, `__title`, `__count`, `__content`, `__inner`, `is-open`/`[open]` состояния, адаптивные блоки.

### 2.9. A11y
- `aria-expanded={open}`, `aria-controls={contentId}`, `id` на контенте.

## 3. Fold 2 — `LectureCheckInBlock`

### 3.1. Файл и компонент
- **Файл:** `src/components/theory/LectureSection.tsx`.
- **Экспорт:** `LectureCheckInBlock({ checkIn })`, alias `MtorCheckInBlock`.
- **Рендер:** `chapterContent.tsx` (9 глав) и `ReadingLecturePage.tsx`:
  `{group.checkIn ? <LectureCheckInBlock checkIn={group.checkIn} /> : null}`.

### 3.2. DOM-структура
```tsx
<details className="ta-lecture-checkin">
  <summary>{checkIn.question}</summary>
  <p>{checkIn.answer}</p>
</details>
```

### 3.3. Состояние и логика
- Нативное (uncontrolled), без React-state.

### 3.4. Данные (контракт)
```ts
type LectureCheckIn = { question: string; answer: string; }
```
Берётся из `group.checkIn` у `LectureLessonGroup`.

### 3.5. Функция
Блок «Проверь себя» — вопрос/ответ для самопроверки после темы урока. Сворачиваемый, чтобы не перегружать чтение.

### 3.6. Стили
- `src/styles/components/theory-apple.css`: `.ta-lecture-checkin`, `summary`, `summary::-webkit-details-marker`, `summary:focus-visible`, `p`. Также селектор `.ta-chapter-panel__body[data-chapter] .ta-lecture-checkin`.

### 3.7. A11y
- Нативная семантика `<details>`/`<summary>`.

## 4. Fold 3 — `ProgressionPreviewChart` (обёртка `<details>`)

### 4.1. Файл и компонент
- **Файл:** `src/components/calculator/ProgressionPreviewChart.tsx` (default export).
- **Использование:** `ProgressionPresetPicker` → `src/screens/CalculatorTab.tsx` (настройки программы).

### 4.2. DOM-структура (обёртка)
```tsx
<section className="progression-preview ta-period" aria-label={sectionLabel}>
  <details className="progression-preview__details" open={expanded}
           onToggle={e => setExpanded(e.currentTarget.open)}>
    <summary className="progression-preview__summary">
      <span className="progression-preview__summary-text">
        <span className="progression-preview__summary-action">
          {expanded ? 'Скрыть пример прогрессии' : 'Показать пример прогрессии'}
        </span>
        <span className="progression-preview__summary-title">{meta.title}</span>
        <span className="progression-preview__summary-meta">{meta.subtitle}</span>
      </span>
    </summary>
    <div className="progression-preview__content">
      <div className="progression-preview__inner">
        <header className="progression-preview__head">
          <p className="progression-preview__note">{testWeekExplanation}</p>
        </header>
        <p id="progression-preview-list-desc" className="progression-preview__sr-only">
          {presetMeta.description}. {listDesc}
        </p>
        <div className="ta-period__phases" aria-hidden="true">…фазы…</div>
        <div className="ta-period__scroll">
          <svg className="ta-period__svg" …>…график…</svg>
        </div>
        <div className="ta-period__weeks ta-period__weeks--preview" role="listbox" …>
          …недели…
        </div>
      </div>
    </div>
  </details>
</section>
```

### 4.3. Состояние и логика
- `const [expanded, setExpanded] = useState(false);`
- `const [activeIndex, setActiveIndex] = useState<number | null>(null);`
- Сброс `activeIndex` и `expanded` при смене `settings.progressionPreset` или `settings.daysPerWeek` (через сравнение с `prevPreset`/`prevDays`).
- `onToggle` синхронизирует `expanded` с DOM.

### 4.4. Данные (контракт)
- `settings: ProgramSettings` (пресет, дней/нед).
- Использует:
  - `getProgressionPreviewMeta(settings)` → `meta` (`title`, `subtitle`).
  - `useProgressionPreview(settings)` → `weeks`, `phases`, `linePath`, `areaPath`, `viewBox`, `grid`, `deloadWeek`.
  - `PROGRESSION_PRESET_META[settings.progressionPreset]` → `presetMeta` (`label`, `description`).
  - `getTestWeekExplanation(settings.progressionPreset)`.

### 4.5. Функция
Сворачиваемый пример прогрессии на 8 недель с графиком веса/объёма и фазами. По умолчанию свёрнут; при смене пресета/дней сбрасывается.

### 4.6. Стили
- `src/styles/components/training/progression-controls.css`: `.progression-preview__details`, `__summary`, `__summary-text`, `__summary-action`, `__summary-title`, `__summary-meta`, `__content`, `__inner`, `__head`, `__note`, `__sr-only`, `[open]` состояния, анимация через grid.

### 4.7. A11y
- `aria-label` на секции; `aria-hidden` на фазах; `role="listbox"` для недель; `aria-describedby` для описания.

## 5. Fold 4 — `JournalMetricsHelp`

### 5.1. Файл и компонент
- **Файл:** `src/components/journal/JournalMetricsHelp.tsx`.
- **Экспорт:** `JournalMetricsHelp()` (без пропсов).
- **Использование:** **не подключён** нигде в `src/` (dead code). По доке должен быть под легендой графика.

### 5.2. DOM-структура
```tsx
<details className="journal-metrics-help">
  <summary className="journal-metrics-help__summary">Как считаются метрики</summary>
  <div className="journal-metrics-help__body">
    <p><strong>e1RM · линия</strong> — Epley: вес × (1 + повторения ÷ 30). Лучший подход сессии. Линия по последним 8 записям. RPE не учитывается.</p>
    <p><strong>Объём · столбцы</strong> — сумма кг × повторения по всем подходам. Высота — доля от максимальной сессии.</p>
    <p className="journal-metrics-help__note">«За 4 нед» сравнивает пик e1RM последней даты с записью ~4 недели назад.</p>
  </div>
</details>
```

### 5.3. Состояние и логика
- Нативное (uncontrolled).

### 5.4. Данные
- Статический текст (формулы e1RM и объёма).

### 5.5. Функция
Справка по метрикам журнала (e1RM, объём, сравнение «за 4 нед»).

### 5.6. Стили
- **Нет** (классы не найдены в `src/styles`).

### 5.7. Статус
Реализован, но не wired и не стилизован.

## 6. Fold 5 — `JournalRpeHelp`

### 6.1. Файл и компонент
- **Файл:** `src/components/journal/JournalRpeHelp.tsx`.
- **Экспорт:** `JournalRpeHelp()` (без пропсов).
- **Использование:** **не подключён** нигде в `src/` (dead code).

### 6.2. DOM-структура
```tsx
<details className="journal-rpe-help">
  <summary className="journal-rpe-help__summary">Что такое RPE?</summary>
  <div className="journal-rpe-help__body">
    <p><strong>RPE</strong> (Rate of Perceived Exertion) — субъективная оценка тяжести подхода. Шкала 6–10.</p>
    <ul className="journal-rpe-help__scale">
      <li><span>6</span> — легко, запас 4+</li>
      <li><span>7</span> — умеренно, запас ~3</li>
      <li><span>8</span> — тяжело, запас ~2</li>
      <li><span>9</span> — очень тяжело, запас ~1</li>
      <li><span>10</span> — максимум, отказ</li>
    </ul>
    <p className="journal-rpe-help__note">RPE необязателен, но помогает сравнивать сессии. e1RM считается по весу и повторениям, без RPE.</p>
  </div>
</details>
```

### 6.3. Состояние и логика
- Нативное (uncontrolled).

### 6.4. Данные
- Статический текст шкалы RPE 6–10.

### 6.5. Функция
Справка по RPE в журнале.

### 6.6. Стили
- **Нет** (классы не найдены в `src/styles`).

### 6.7. Статус
Реализован, но не wired и не стилизован.

## 7. Общий хук состояния

- **Файл:** `src/hooks/useDetailsState.ts`.
- **Сигнатура:** `useDetailsState(groupId: string, defaultOpen: boolean): [boolean, (value: boolean) => void]`.
- **Логика:**
  - Инициализация: читает `sessionStorage.getItem('strength:details:${groupId}')`; если валидный boolean — использует, иначе `defaultOpen`.
  - `useEffect` записывает `JSON.stringify(open)` в `sessionStorage` при изменении.
  - Возвращает `[open, setOpen]`.
- **Использование:** только `ScienceDetailsGroup` (Fold 1).

## 8. Граф использования (imports)

- `StrengthFormulaSection` → `ScienceDetailsGroup` (внутренний, не экспортируется).
- `LectureSection` → `LectureCheckInBlock` (экспортируется), alias `MtorCheckInBlock`.
- `ProgressionPreviewChart` → default export, используется `ProgressionPresetPicker`.
- `JournalMetricsHelp`, `JournalRpeHelp` → **не импортируются** нигде.

## 9. Сводная таблица функций

| Fold | Компонент | Функция | Персистентность | Стилизация |
|------|-----------|---------|-----------------|------------|
| 1 | `ScienceDetailsGroup` | Группа научных карточек (доказательная база) | sessionStorage (сессия) | Есть |
| 2 | `LectureCheckInBlock` | Самопроверка (вопрос/ответ) | Нет (DOM-state) | Есть |
| 3 | `ProgressionPreviewChart` | Пример прогрессии 8 недель | Сброс при смене settings | Есть |
| 4 | `JournalMetricsHelp` | Справка по метрикам журнала | Нет | Нет (dead code) |
| 5 | `JournalRpeHelp` | Справка по RPE | Нет | Нет (dead code) |

## 10. Наблюдения и рекомендации

1. **Нет единого паттерна:** Fold 1 — контролируемый через хук + sessionStorage; Fold 3 — контролируемый через локальный state; Folds 2/4/5 — нативные uncontrolled.
2. **Dead code:** `JournalMetricsHelp` и `JournalRpeHelp` реализованы, но не подключены и не стилизованы. По доке должны быть под легендой графика журнала.
3. **Персистентность:** только Fold 1 сохраняет состояние; Fold 3 сбрасывается при смене settings; остальные держат DOM-state до ремонта.
4. **Доступность:** Fold 1 имеет `aria-expanded`/`aria-controls`; остальные полагаются на нативную семантику.
5. **Стилизация:** Fold 4/5 не имеют CSS — при подключении нужна стилизация.
6. **Рекомендация:** унифицировать складки через общий компонент/хук (например, расширить `useDetailsState` на все складки) и подключить dead-code help-компоненты в журнал.
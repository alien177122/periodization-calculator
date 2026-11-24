# UI-эталон: вкладка «Калькулятор»

Источник — живые компоненты/CSS вкладки `calculator` в `AppShell` (~412px), не скрин. Quiet UI, системный шрифт (`-apple-system, …, system-ui`), токены `--color-*` / `--ta-*`. Внешность этой вкладки не менять без бага.

## Карта

| Зона | Компонент | Стили |
|------|-----------|--------|
| Primary CTA «Рассчитать» | `Button` + `calc-test__submit` | `calc-test-approach.css` → `.btn.calc-test__submit` |
| Степперы −/+ | `PremiumStepper` `.pi-stepper__btn` | `calc-test-approach.css` |
| Ghost шапки (Безлимит, Выйти) | `UserBar` `btn-sm btn-ghost` / `.user-bar__billing-badge` | `app-layout.css` |
| Дропдаун упражнения | `ExercisePicker` `.ew-trigger` | `calc-test-approach.css`, `exercise-select.css` |
| Бейджи секций 01/03 | `SectionBlock` variant=`apple` `.ta-section-pill` | `theory-apple.css` |
| Карточка-подсказка | `NoteBox` → `.ta-calc-note` | `theory-apple.css` + override в `calc-test-approach.css` |
| Выбранный таб | `TabNav` `.tab-btn.tab-active` | `app-layout.css` |
| График периодизации | `PeriodizationChart` / `ProgressionPreviewChart` `.ta-period` | `theory-apple.css` § Periodization chart |

База `.btn` в `buttons.css` — **legacy**, не эталон.

## Кнопки

### Primary CTA

Классы: `btn calc-test__submit`. **Не** `btn-primary` (класса нет) и **не** голый `.btn`.

| Свойство | Значение |
|----------|----------|
| Фон | сплошной `--color-accent` → `--ta-calc-accent` → `--ta-sec-01` `#ffb020` |
| Текст | `--accent-fg` `#0a0a0b`, 16px / 600, sentence case, `letter-spacing: 0` |
| Размер | `width: 100%`, `min-height: 3rem` (на ≤430px — 44px, 14px) |
| Радиус | `0.75rem` (12px) |
| Padding | `0.75rem 1.5rem` |
| Тень | inset highlight + мягкий accent-glow (`color-mix` с accent), не плоский жёлтый box |
| Hover (fine pointer) | accent 92% + inverse 8%, сильнее glow |
| Active | `opacity: 0.92`, `scale(0.98)` |
| Focus-visible | двойное кольцо: bg + accent 72% |
| Disabled | `opacity: 0.45`, без тени |
| Шрифт | `inherit` (системный), **не** Inter, **не** Bebas Neue |

### Степперы −/+

`.calc-test .pi-stepper`: радиус 12px, border `--border-subtle`, фон `--surface-elevated`. Кнопки 44×44, без собственной заливки, hairline между кнопкой и полем. Hover: accent 8%. Active: accent 12%, opacity 0.75. Focus-within степпера: accent border + 3px ring 24%. Значение: 20px / 600, `tabular-nums`, по центру.

### Ghost шапки

`UserBar`: «Безлимит» — `.user-bar__billing-badge`; «Выйти» — `Button size="sm" variant="ghost"`. Квадрат **84×84**, `border-radius: var(--radius-sm)` (8px), **не капсула**. Фон `--overlay-subtle`, border `--border-subtle`, цвет `--text-soft`, sentence case. Hover: `--overlay-soft`, `--text-strong`.

Вторичные действия на других экранах: `split-toolbar__action` / `btn-ghost` — `--surface-raised`, `--border`, `font-weight: 500`, без заливки accent. Не `--save` (плоский amber) для обычных «+».

### Дропдаун упражнения

`.ew-trigger` / `.ta-calc-select`: min-height 44px, радиус 12px, elevated surface, hairline border. Hover: accent 35% в border. Active: opacity 0.88, `scale(0.99)`. Focus: outline 2px accent. Выбранная строка `.ew-option.is-active`: accent 10% фон + 28% border — **не** сплошная жёлтая заливка.

## Секции, подсказки, таб

- **Pill 01/03:** `.ta-section-pill` — uppercase 16px / 600, tracking `0.22em`, padding 6×12 (+14px inline у calc), tint фон, border `currentColor`, радиус `--glass-radius-badge` (6px). Номер бейджа — да, капс. Заголовок секции — нет: 20–32px / 600, tracking −0.02em, sentence case.
- **NoteBox:** `.ta-calc-note` — 14px / 1.65, радиус 12px, border subtle, фон mix elevated 80% (в форме) или glass surface. Без тяжёлой тени.
- **Выбранный таб:** `.tab-bar.ta-mode-nav` — glass, радиус `--glass-radius-panel` 12px (на iPhone dock — 0). Кнопка 44px+ (mobile 64px). Неактивный: `--ta-text-dim`. Активный `.tab-active`: `--ta-text`, иконка `--ta-calc-accent`, `::before` surface с accent 32% в border, `scale(1)`. Иконки SVG 16–20px, `currentColor`, не emoji.

## Графики `.ta-period`

Соседи: `.ta-period__phases`, `__scroll`, `__svg` (viewBox `0 0 800 280`), `__grid`, `__axis` / `__week-label` (mono 12px), `__area`, `__line` (stroke 3, `--ta-sec-01`), `__bar` (`--ta-sec-02`, active opacity 1), `__point` r=4, `__tip` + `__cursor`, `__weeks` / `.ta-period-week`.

| Слой | Правило |
|------|---------|
| Контейнер | `--ta-calc-surface`, border `--ta-calc-border`, радиус 12px, padding 16px (на ≤720px горизонтальный pad 0, фазы/svg 16px) |
| Сетка | 7 линий, stroke text 5%, x 56–744 |
| Area/line | area `--ta-sec-01-tint`; line `--ta-sec-01`; без drop-shadow на карточке |
| Неделя | border по периметру (не left-rail); active: `--ta-calc-accent-tint` + accent border |
| Пояснение | короткий текст по-русски рядом (Epley / тоннаж = кг×повторы×подходы) |
| Motion | только transform/opacity 150–360ms; `prefers-reduced-motion` отключает |

Другие графики (журнал, прогноз сплита, program v3) **наследуют эти классы**, а не рисуют отдельный bar-chart.

## Запрещено

- Uppercase yellow `.btn` (gradient 180°, Inter 12px, tracking 0.1em)
- `btn-primary`, голый `.btn` на CTA, `split-toolbar__action--save` для обычных «+»
- Градиенты на кнопках и графиках
- Emoji-иконки (🗑 и т.п.) — только SVG `currentColor` / 16×16
- Hex в компонентах, произвольные yellow `box-shadow`
- Bebas Neue / Inter как лицо кнопок
- Капс на CTA и заголовках секций (капс только у pill 01 и фаз графика)

## Куда применять

Primary → `className="calc-test__submit"` (как Auth «Войти», SplitHub «База силовых», журнал «Сохранить», сплит «Сохранить структуру», тренировка «Завершить»). Secondary → ghost / `split-toolbar__action`. Графики → `.ta-period` (+ `__bar` / `__line` / `__weeks`).

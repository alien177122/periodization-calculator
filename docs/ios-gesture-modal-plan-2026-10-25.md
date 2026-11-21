# План: iPhone-подача — шиты, жесты, адаптив

**Дата:** 2026-10-25 · **Репо:** Web_Calculator · **Статус:** план; исполнение только по команде (код/статьи не трогаем до запуска волны).

Одна фраза цели: **открылось снизу быстро по пружине · зажал и потянул · отпустил — закрылось. Шит = единственная модальная форма, свайп = главный способ управления.**

---

## 1. Опенсорс-база (что найдено и откуда берём)

| Источник | Что берём | Лицензия / комментарий |
|---|---|---|
| **`.cursor/skills/apple-design/` (уже в репо)** — копия [naplesblue/apple-design-skill](https://github.com/naplesblue/apple-design-skill) | `app.md`: точный iOS-шелл — device frame 393×852, safe areas 59/34, large-title collapse, tab bar (glass, 1 акцент), **edge-anchored bottom sheet** (grabber 38×5, радиус верхних 22, scrim 0.28, same-path пружина `cubic-bezier(0.32,0.72,0,1)` ~400ms, home-indicator выше шита, detents half/full, reduced-motion = кросс-фейд). `motion.md`: физика жестов — damping 0.8 / response 0.3 для шитов, velocity handoff, momentum projection `d≈0.998`, rubber-band `(overshoot·dim·0.55)/(dim+0.55·|overshoot|)`, гистерезис 10px, `:active scale(.97)`, materialize (blur+scale+opacity вместе). `tokens.css`/`components.md`/`icons.md`/`checklist.md` — токены, 44px, Lucide-иконки | **MIT**, LICENSE приложен в skill; portions `motion.md` — из [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT, distilled из WWDC «Designing Fluid Interfaces») |
| [vaul](https://github.com/emilkowalski/vaul) (MIT) | Паттерны drag-to-dismiss: velocity-порог для закрытия, snap-точки, aria-настройки, скролл-взаимодействие внутри шита | **README: «unmaintained»** → **не берём как dependency**, только как референс алгоритмов; физика уже воспроизведена в нашем `motion.md` |
| [iOS HIG — Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) (концептуальный стандарт, не код) | Поведение: детенты, интерактивное свайп-закрытие, grabber, «не модальность ради модальности» | Apple — не опенсорс, но поведенческая цель |
| [lucide-react](https://github.com/lucide-icons/lucide) | Управление иконками (уже в deps) — иконки шитов/строк | ISC |
| react-spring-bottom-sheet / @gorhom/bottom-sheet | Идеи snap-детентов (использовать как референс при отладке) | MIT / Apache-2.0 — тоже не dependency, физика наша |

**Вывод по зависимостям:** новых пакетов не добавляем. Есть `framer-motion` (Velocity Handoff: `type:'spring', bounce:0, duration:0.4, velocity`) + существующие токены. Всё собирается из skill-спеков без чужого кода → меньше AUDIT-поверхность, полный контроль.

---

## 2. Аудит текущего состояния (репо, 25.10)

### 2.1 Модальные поверхности (все на `createPortal`)

| Поверхность | Файл | Сейчас | Разрыв с планом |
|---|---|---|---|
| Создание сплита (bottom sheet) | `src/components/split/SplitCreateDialog.tsx` | портал, backdrop-кнопка, «Закрыть», центрирование input, ремоунт-ключ | нет grabber, нет drag-закрытия, открыт/закрыт CSS-транзишеном? — единая физика нужна |
| База силовых (sheet) | `src/components/split/ProfileWeightBaseSheet.tsx` | sheet `.split-hub__sheet`, backdrop, scroll-lock | нет grabber/detents; длинный контент (GlobalExerciseAdder) — нужен high-detent |
| Справка пирамиды | `src/components/training/PyramidHelpDialog.tsx` | центр-диалог с backdrop | должен стать sheet'ом по iPhone-модели |
| Подтверждение удаления расчёта | `src/components/split/SplitCalculationHistory.tsx` | backdrop + мини-диалог | iOS alert-стиль (не sheet): кнопки в ряд, без drag |

4 разных CSS-семейства одного паттерна (`split-create-dialog*`, `split-hub__sheet*`, `progression-dialog*`, `split-calculation-delete*`) — фрагментация, против правила №1 skill («unified surface»).

### 2.2 Жесты и адаптив (что уже есть)
- `--sal/--sat/--sar/--sab` safe-area vars — подключены в ios-adaptation.css ✓
- `useKeyboardAvoid` (клавиатура → `--keyboard-inset` на .app-shell) ✓ — шит обязан уважать этот var
- `useBodyScrollLock` для шитов ✓ · framer-motion — tab-переходы ✓
- Тач ≥44px частично: `.split-hub__icon-btn` 2.75rem ✓ — пройтись по всем строкам
- ≤899 full-bleed / ≥900 framed ✓ · AGENTS: проверка 390–430px

### 2.3 Разрывы → три колонны работы
1. **AppSheet engine** (гл. 3) — единственный шит-компонент с жестом.
2. **Миграция 4 поверхностей** + iOS-alert для подтверждений.
3. **Жесты списков** (свайп-действия) + адаптив-QA.

---

## 3. Целевой стандарт: `AppSheet` (один движок)

### 3.1 Спецификация
- **DOM:** портал в `document.body` → `<button class="app-sheet-backdrop">` + `<section class="app-sheet" role="dialog" aria-modal="true">` + grabber (38×5, `:focus-visible` у grabber = тоже «Закрыть»).
- **Открытие/закрытие (same path):** `translateY(100%) → 0` и обратно; spring по motion.md: **bounce 0, duration 0.4s** (framer: `{type:'spring', bounce:0, duration:0.4}`); materialize: `opacity + scale(0.98) + blur(0→20px)` одной волной; scrim — фейд 0.25s.
- **Детенты:** по умолчанию medium ≈ `min(560px, 72vh)`; проп `detents='high'` → `min(860px, 92vh)`; перетаскивание между ними — snap к ближайшему по проекции (`current + velocity·Δ/(1-d)`, `d=0.998`).
- **Жест:** `drag='y'` (framer-motion) **только с grabber/шапки** (не со всего контента — иначе конфликт скролла внутри шита; референс — vaul scatter-логика); release: `dy > 88px || velocityY > 500px/s` → закрыть; иначе — пружина назад в позицию; у верхней детенты — rubber-band formula; гистерезис 10px.
- **Interruptible (прерываемость):** закрытие по свайпу можно перехватить возвратом вверх — motion.md §3, framer animate from presentation value ✓ (даёт vaul-подобное поведение).
- **Клавиатура:** панель `bottom: max(env(safe-area-inset-bottom), var(--keyboard-inset, 0px))`.
- **A11y:** Escape-закрытие, фокус в первое поле, возврат фокуса на триггер, `aria-labelledby`, тач-таргеты 44px, `:active` scale(.98), `:hover` — только прогрессивное усиление, не единственный affordance.
- **Токены (из apple-design skill):** гласс-фон шита только потому, что поверх контента (glass-on-overlap); радиус 22 сверху; hairline-борд; скрим `rgba(0,0,0,.28)`; один акцент на главной кнопке.
- **Reduced motion/transparency/contrast:** три медия-блока из motion.md §8.
- **Бюджет:** enter ≤400ms, dismiss ≤250ms, только `transform/opacity/backdrop-filter`.

### 3.2 iOS-алерт (вторая форма, без drag)
Подтверждения (удаление расчёта) — компактный центр-алерт: заголовок, 1 строка тела, 2 кнопки (отмена / destructive — красный акцент), no sheet, spring 0.3s.

---

## 4. Жестовые расширения (после волны шитов)

1. **Свайп-действия строк (iOS list rows):** история расчётов и строки профилей/сплитов — свайп влево высвечивает «Удалить» (red-фон), свайп вправо — «Повторить» (accent); threshold 88px/скорость, реверс по velocity; для мыши — кнопка «…» появляется по hover, для клавиатуры — Focus + Enter (жест — усиление, не замена).
2. **Быстрое открытие:** все «+» действия открывают шит без стаггеров — единственная привычка «быстро натыкал».
3. Свайп между секциями сплита (01→04) — отложено (риск конфликтов со скроллом); revisit в адаптив-волне.

## 5. Адаптив-волна (после жестов)

- Размеры: 390 / 393 / 430 / 768 / 900 / 1440 — DOM-замеры (нет скриншот-инструмента): отступы, 44px-таргеты, отсутствие горизонтальных скроллов, `--keyboard-inset` при фокусе input.
- Центр-выравнивание текста секций (решение пользователя 25.10) — **отдельная задача-эксперимент** с A/B на секции 01 и откатом, не в текстовой S1-волне.
- Home-indicator: z-index шитов должен быть ниже индикатора на реальном устройстве — проверить в PWA-режиме.

---

## 6. Волны и задачи (формат: ID · поверхность · файлы · действие · проверка · оценка · риск)

**Волна 0 — движок (2 задачи, ~0.5 дня)**
| ID | Задача | Файлы | Приёмка |
|---|---|---|---|
| IOS-01 | `AppSheet` компонент + CSS-токены + типы + микро-док | `src/components/ui/AppSheet.tsx`, `src/styles/components/ui/app-sheet.css` | чек-лист: Esc / открытие / закрытие; DOM-замеры (translateY 100→0, spring-кривая по кадрам) |
| IOS-02 | Пилот: миграция `SplitCreateDialog` → AppSheet (детент medium; ремоунт-ключ сохранить) | тот же диалог | Флоу «+ Новый» идентичен, + свайп-вниз закрывает; go/no-go |

**Волна 1 — все шиты (3 задачи)**
| IOS-03 | `ProfileWeightBaseSheet` → AppSheet, `detents='high'`, внутренний скролл | тот файл | контент скроллится независимо; drag за шапку ведёт панель 1:1 |
| IOS-04 | `PyramidHelpDialog` → AppSheet | тот файл | детент medium для чтения |
| IOS-05 | Удаление истории → `AppAlert` (панель + backdrop) | `SplitCalculationHistory.tsx`, `AppAlert.tsx` | Enter = отмена (по умолчанию), destructive-кнопка красная |

**Волна 2 — жесты списков (2 задачи)**
| IOS-06 | SwipeRow-хелпер + история расчётов (влево удалить / вправо повторить) | `SplitCalculationHistory.tsx`, `useSwipeActions.ts` | порог 88px, реверс по velocity, «…» для мыши |
| IOS-07 | Строки профилей/сплитов — свайп (вправо: повторить сплит; ✎/🗑 упрятать в свайп-детали) | `SplitProfilePanel.tsx`, `SplitHub.tsx` | a11y: кнопки остаются фокусируемыми |

**Волна 3 — адаптив + чистка (2 задачи)**
| IOS-08 | Адаптив-QA по точкам из гл. 5 + контроль safe/keyboard | css-файлы списка | замеры — в отчёт |
| IOS-09 | Удаление устаревших CSS-семейств диалогов + z-унификация (1200/1201/1300) | старые css-куски | grep: нет orphan-классов |

**Пилот: IOS-02** — запуск волны 1 только после вашего go/no-go по свайп-закрытию.

## 7. Открытые вопросы
1. Детенты medium/high — нужны оба сразу со старта? (дефолт: да, prop)
2. Свайп-экшены: включить сразу оба направления (влево/вправо) или пусть сначала только «удалить»? (дефолт: оба)
3. Центр-выравнивание секций: эксперимент на секции 01 — запускать в этой серии или после S1-текстов? (дефолт: после S1)

## 8. Риски
- Скролл внутри шита vs drag: решается ограничением drag на grabber/шапке + overscroll-behavior.
- iOS Safari scroll-расширенные жесты (pan+scroll одновременно) — native-проверка на устройство обязательна в IOS-08.
- Мышь: drag на десктопе работает, но UI не должен требовать жест → кнопки остаются.
- Не коммитим без просьбы (AGENTS.md); волны идут по одному только с зелёными typecheck/lint/tests/build.

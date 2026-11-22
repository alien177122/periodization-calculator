

# STYLE GUIDE


## `memory-bank/style-guide.md`

# Style Guide (краткая выжимка)

Полный источник: **`CLAUDE.md`** в корне репозитория. Ниже — токены и правила, которые агент должен соблюдать при UI-работе.

**Design standards hook:** перед новым UI — **`memory-bank/reference/README.md`** → matching эталон из `memory-bank/reference/`.

## Принципы

- Ясность важнее эффектов; контент — король; минимум элементов на экране
- Один экран — одна задача; тишина по умолчанию (без лишних popup/badge)
- Accessibility обязательна: keyboard, focus-visible, `prefers-reduced-motion`, `prefers-color-scheme`

## Типографика

- System stack: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif`
- Размеры только: 12 / 14 / 16 / 18 / 20 / 24 / 32 / 48 / 64 / 80
- Веса: 400 / 500 / 600 (макс. 3 на проект)
- Контраст body: минимум WCAG AA (#6B6B6B на белом — нижняя граница)

## Цвет (semantic tokens)

Использовать CSS custom properties, не hex в компонентах:

- `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-elevated`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- `--color-border-subtle`, `--color-border-default`
- `--color-accent`, `--color-accent-hover`, `--color-destructive`, `--color-success`, `--color-warning`

Dark mode: фон `#0A0A0B` / `#111113`, не чистый `#000`.

## Spacing & radius

- Spacing: кратно 4px (4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96 / 128)
- Radius: 6 / 8 / 12 / 16 / 20 / 24; nested radius = outer − padding

## Motion

- Только `transform` и `opacity` для частых анимаций
- Durations: micro 150–250ms, components 200–300ms, sections 400–600ms
- Easing: `--ease-out`, `--ease-in-out`, `--ease-micro`
- `@media (prefers-reduced-motion: reduce)` — отключить анимации в CSS

## React / TS

- Functional components + hooks; логика в `hooks/` и `utils/`
- Discriminated unions для async state
- `strict: true`, без `any`
- Компонент ≤150 строк

## Theory tab (`ta-*`)

Для UI в визуальном языке вкладки Theory (dark editorial shell, section accents) — отдельный namespace `--ta-*`. Канон: `.cursor/rules/theory-design-reference.mdc`, JS-хелперы `src/hooks/useTheoryDesign.ts`, CSS-эталон `src/styles/components/theory-apple.css`. В компонентах — только `var(--ta-*)`, не raw hex.

## Calculator tab (umbrella)

Эталон **всей вкладки «Калькулятор»** (preset picker, hero, Program 2.0 и 3.0): `memory-bank/reference/calculator-tab-standard.md`. Точка входа перед любой правкой Calculator tab; partial standards — для отдельных секций.

## Calculator section 02 — Прогрессия (Program 2.0)

Эталон **composite блока после расчёта** (insight, ResultCard, PlateDiagram?, PeriodizationChart, NoteBox): `memory-bank/reference/calc-progression-result-standard.md`. Геометрия чарта — `periodization-chart-standard.md`.

## Calculator forms (Program 2.0)

Эталон секции ввода «Тестовый подход»: `memory-bank/reference/calc-test-approach-standard.md` — labels sentence case 14px, unified stepper 44px, CTA с divider, `@container calc-test`. Не использовать legacy `.ta-calc-form` для новых форм.

## Calculator saved list (Program 2.0)

Эталон sec **03 Сохранённые (N/12)**: `memory-bank/reference/calc-saved-exercises-standard.md` — SectionBlock apple → `.ta-calc-saved-list` (gap 10px) → card grid `1fr auto`, padding 14×16, radius 12px; `__name` 600 / `__meta` 12px muted; `__one-rm` 16px `--ta-calc-accent`; `.is-active` = focus tint + full perimeter accent border; delete scoped 44px; empty = section hidden. **MUST** для journal/training rows в `.ta-shell` (см. §13 эталона).

## Web tokens в проекте

- `src/styles/base/variables.css` — основные CSS variables
- `src/theme/animations.ts` — shared animation config (web)
- Mobile (`apps/mobile`): `src/theme/Theme.ts`, `tokens` — aligned с web design tokens

## Язык

- UI copy: русский (sentence case)
- Код, типы, идентификаторы: English



# REFERENCE INDEX


## `memory-bank/reference/README.md`

# Эталонные design-промты (Design Standards Hook)

> **Обязательный хук для агентов:** перед созданием **любой новой UI-структуры** (секция, компонент, форма, чарт, список) в калькуляторе, тренировках, журнале или Theory shell — **MUST** прочитать этот индекс и применить подходящий эталон из таблицы ниже.

Связанные документы: `memory-bank/style-guide.md`, `CLAUDE.md`, `.cursor/rules/theory-design-reference.mdc`, `.cursor/rules/react-training-memory-bank.mdc` (секция **Design standards hook**).

---

## Когда читать (WHEN)

| Триггер                                                                      | Действие                                                                                                                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Любая работа на вкладке «Калькулятор»** (layout, preset, секции)           | **`calculator-tab-standard.md`** (umbrella) **+** matching partial                                                                                                             |
| Новая секция калькулятора / Program 2.0                                      | Открыть matching reference **до** `/plan` или `/build`                                                                                                                         |
| **Секция 02 «Прогрессия»** (insight + 1ПМ + chart + legend, после calculate) | `calc-progression-result-standard.md` + **`periodization-chart-standard.md` (MAX `.ta-period`)**                                                                               |
| Новый SVG-чарт, график прогрессии, dual-axis                                 | **`periodization-chart-standard.md` (MAX etalon)**                                                                                                                             |
| Новая форма ввода (stepper, picker, CTA)                                     | `calc-test-approach-standard.md`                                                                                                                                               |
| **Exercise dropdown** (trigger + listbox + 1RM badge)                        | `calc-exercise-select-standard.md`                                                                                                                                             |
| Selectable list, карточки метрик, journal/training rows (03 Сохранённые)     | `calc-saved-exercises-standard.md` — MAX: SectionBlock→card grid, 1RM accent, delete 44px                                                                                      |
| **Journal progress chart** (факт из записей, не план калькулятора)           | `journal-progress-chart-standard.md`                                                                                                                                           |
| UI в визуальном языке Theory (`--ta-*`, `.ta-shell`)                         | `.cursor/rules/theory-design-reference.mdc` + `useTheoryDesign.ts`                                                                                                             |
| **Theory lesson copy / restructuring**                                       | **`theory-article-algorithm.md`** (дизайн + алгоритм + лексикон + prompt) + skill `theory-content-structurer` + pedagogy + lecture-page + **`theory-frac-volume-standard.md`** |
| Mobile parity (`apps/mobile/`)                                               | Тот же эталон web + `apps/mobile/src/theme/Theme.ts`                                                                                                                           |
| **Mobile bottom TabNav + ambient shell** (frosted glass, glow through nav)   | `mobile-tab-nav-background-standard.md`                                                                                                                                        |
| Багфикс в существующем эталонном компоненте                                  | Reference doc — контекст; не менять паттерн без задачи                                                                                                                         |

**Не начинать** верстку «с нуля» и не копировать legacy siblings (см. «Sibling (не эталон)» в каждом reference).

---

## Как применять (HOW)

1. **MUST** прочитать полный matching reference doc (не только эту таблицу).
2. **MUST** использовать те же токены (`--ta-*`, `--color-*`), spacing (кратно 4px), типографику и a11y-паттерны из эталона.
3. **MUST** наследовать структуру: hook + parts + co-located CSS; `SectionBlock variant="apple"` где указано в reference.
4. **MUST NOT** дублировать геометрию чартов, legacy `.ta-calc-form` или ad hoc list cards.
5. После `/creative` или `/build` — превью через MCP `cursor-ide-browser` (`http://localhost:5173`).
6. **Расширение канона:** если пользователь явно утвердил новый gold standard — зафиксировать в `memory-bank/reference/<name>-standard.md`, добавить строку в таблицу ниже, обновить `systemPatterns.md` и `activeContext.md`.

---

## Каталог эталонов

| Эталон                                  | Назначение (одна строка)                                                                                       | Путь                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Calculator tab (umbrella)**           | Вся вкладка: picker, hero, 2.0/3.0 секции, переходы; partial standards внутри                                  | `memory-bank/reference/calculator-tab-standard.md`                |
| **Секция 02 Прогрессия (2.0)**          | Composite после calculate: insight, ResultCard, plates?, chart, NoteBox legend                                 | `memory-bank/reference/calc-progression-result-standard.md`       |
| **PeriodizationChart**                  | **MAX** dual-axis SVG: phase strip `--ta-sec-*`, **orange** `%` line, **blue** bars; locked palette 2026-07-09 | `memory-bank/reference/periodization-chart-standard.md`           |
| **TestApproachSection**                 | Форма ввода калькулятора: stepper 44px, sentence-case labels, CTA с divider                                    | `memory-bank/reference/calc-test-approach-standard.md`            |
| **ExercisePicker**                      | Dropdown упражнения: trigger + listbox, accent bar, 1RM badge, checkmark                                       | `memory-bank/reference/calc-exercise-select-standard.md`          |
| **Saved exercises list**                | Sec 03 «Сохранённые (N/12)»: `.ta-calc-saved-*`, counter in title, empty=hide section                          | `memory-bank/reference/calc-saved-exercises-standard.md`          |
| **Journal progress chart**              | Тренд из `userData.journal`; палитра `.ta-period` orange/blue (**без** cyan), **без** плана                    | `memory-bank/reference/journal-progress-chart-standard.md`        |
| **Theory article algorithm**            | **Система статей:** дизайн (01/02/frac), алгоритм сборки, лексикон, agent prompt. Locked 01+02+frac            | `memory-bank/reference/theory-article-algorithm.md`               |
| **Theory textbook pedagogy**            | Facts/definitions only; silent structure; body ≥16px; no «просто→сложнее» headlines                            | `memory-bank/reference/theory-textbook-pedagogy-standard.md`      |
| **Theory lecture page**                 | Playbook: prose first, one interactive; **locked gold 01 stack + 02 body**; applied 03–06, 08–10               | `memory-bank/reference/theory-lecture-page-standard.md`           |
| **Theory frac volume (visual gold)**    | Весь `.ta-frac` в гл. 01: left titles, stacked term/rule cards, bronze callouts; hero 0.5 — единственный центр | `memory-bank/reference/theory-frac-volume-standard.md`            |
| **Theory textbook cards**               | Vertical elevated lesson cards: intro + Определение / Схема / Как применять (`RevealTimeline`)                 | `memory-bank/reference/theory-textbook-cards-standard.md`         |
| **Theory tab shell**                    | Dark editorial UI, `--ta-*` tokens, section accents, motion                                                    | `.cursor/rules/theory-design-reference.mdc`                       |
| **Ionic + Capacitor**                   | Web bootstrap, native iOS/Android shells, API URL patterns                                                     | `memory-bank/reference/ionic-capacitor-standard.md`               |
| **Taste Skill (design-taste-frontend)** | Anti-slop frontend design canon (layout variance, motion, density dials, design-systems)                       | `memory-bank/reference/design-taste-frontend.md`                  |
| **Redesign Existing Projects**          | Protocol for auditing and upgrading existing layouts to premium quality                                        | `memory-bank/reference/redesign-existing-projects.md`             |
| **High-end Visual Design**              | Calm, polished luxury visual aesthetics rules and spring motion                                                | `memory-bank/reference/high-end-visual-design.md`                 |
| **Minimalist UI**                       | Notion/Linear warm monochrome flat-bento editorial aesthetics                                                  | `memory-bank/reference/minimalist-ui.md`                          |
| **Mobile TabNav + ambient**             | Fixed bottom frosted glass, squarer 8–12px radius, `--glass-*` tokens; amber active only @≤899px               | `memory-bank/reference/mobile-tab-nav-background-standard.md`     |
| **Section elevation**                   | Soft lift inner card ≈1140: `--section-elevation` from Theory chapter-panel; outer section transparent         | `memory-bank/reference/section-elevation-standard.md`             |
| **Wallpaper background pipeline**       | Isolate B&W wallpapers, amber glow, 4× upscale, WebP для `AppAmbientBackground`                                | `memory-bank/reference/wallpaper-background-pipeline-standard.md` |

---

## Быстрая матрица «тип UI → эталон»

```
calculator tab (any block / preset switch) → calculator-tab-standard.md (+ partial below)
section 02 progression result block (2.0)  → calc-progression-result-standard.md
chart / progression graph (calculator plan) → periodization-chart-standard.md
journal chart (logged sessions only)      → journal-progress-chart-standard.md
form / input section          → calc-test-approach-standard.md
exercise dropdown / picker    → calc-exercise-select-standard.md
list / selectable cards       → calc-saved-exercises-standard.md
theory-aligned shell / section → theory-design-reference.mdc
general frontend design / layout → design-taste-frontend.md
redesign audits / UI overhaul   → redesign-existing-projects.md
calm / luxury design / spring motion → high-end-visual-design.md
minimalist / warm mono design   → minimalist-ui.md
mobile bottom tab nav / shell ambient / frosted glass / squarer panels → mobile-tab-nav-background-standard.md
```

При нескольких типах в одной секции — читать **все** matching references (например, umbrella + форма + список в Calculator tab).



# REFERENCE / ETALON FILES


## `memory-bank/reference/animejs-getting-started.md`

# Anime.js v4 — Getting started (канон для агента)

> **Полный банк docs (410 страниц):** [`animejs/README.md`](./animejs/README.md) · sitemap [`animejs/SITEMAP.md`](./animejs/SITEMAP.md)  
> **Версия API:** v4 (ESM-first, modular). v3 `anime()` **не использовать** — см. § Migration.  
> **Статус в проекте:** `animejs@^4.4.1` установлен; facade `src/lib/anime/`, hook `src/hooks/useAnimeScope.ts`, первое использование — `JournalProgressChart`. framer-motion остаётся основным для React UI.

---

## Когда применять (WHEN)

| Триггер                                                        | Действие                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| Пользователь просит anime.js / animejs                         | Прочитать этот doc + `.cursor/skills/animejs/SKILL.md`              |
| DOM-анимация вне React tree (SVG path, canvas, vanilla widget) | Anime.js + subpath imports                                          |
| React-компонент с anime.js                                     | `createScope` + `useEffect` cleanup (§ React)                       |
| Любая анимация в проекте                                       | **MUST** `useReducedMotion()` — не запускать `animate` при `reduce` |

**Не заменять** существующий framer-motion в `TabPanel`, Theory, hero без задачи на миграцию.

---

## Установка

```sh
npm install animejs
```

### Bundler (Vite — наш стек)

```typescript
import {animate} from 'animejs';
```

CommonJS: `const { animate } = require('animejs')`

### CDN (ESM)

| CDN          | URL                                         |
| ------------ | ------------------------------------------- |
| esm.sh       | `https://esm.sh/animejs`                    |
| JsDelivr ESM | `https://cdn.jsdelivr.net/npm/animejs/+esm` |

```javascript
import {animate} from 'https://esm.sh/animejs';
```

### CDN (UMD global)

```html
<script src="https://cdn.jsdelivr.net/npm/animejs/dist/bundles/anime.umd.min.js"></script>
<script>
  const {animate} = anime;
</script>
```

### Прямая загрузка (GitHub)

| Файл                            | Тип             |
| ------------------------------- | --------------- |
| `dist/modules/index.js`         | ESM entry       |
| `dist/modules/index.cjs`        | CJS entry       |
| `dist/bundles/anime.esm.js`     | Bundled ESM     |
| `dist/bundles/anime.esm.min.js` | Bundled ESM min |
| `dist/bundles/anime.umd.js`     | UMD             |
| `dist/bundles/anime.umd.min.js` | UMD min         |

---

## Импорты (tree shaking)

### Из главного модуля

```typescript
import {animate, splitText, stagger, random, globals} from 'animejs';

const split = splitText('p');
animate(split.words, {
  opacity: () => random(0, 1, 2),
  delay: stagger(50),
});
```

### Subpaths (только нужные модули)

```typescript
import {animate} from 'animejs/animation';
import {splitText} from 'animejs/text';
import {stagger, random} from 'animejs/utils';
import {createScope} from 'animejs/scope';
import {createDraggable} from 'animejs/draggable';
import {createTimeline} from 'animejs/timeline';
import {createTimer} from 'animejs/timer';
import {createAnimatable} from 'animejs/animatable';
import {createLayout} from 'animejs/layout';
import {engine} from 'animejs/engine';
import * as events from 'animejs/events';
import * as easings from 'animejs/easings';
import * as utils from 'animejs/utils';
import * as svg from 'animejs/svg';
import * as text from 'animejs/text';
import * as waapi from 'animejs/waapi';
```

### Import map (без bundler)

```html
<script type="importmap">
  {
    "imports": {
      "animejs": "/node_modules/animejs/dist/modules/index.js",
      "animejs/animation": "/node_modules/animejs/dist/modules/animation/index.js",
      "animejs/timer": "/node_modules/animejs/dist/modules/timer/index.js",
      "animejs/timeline": "/node_modules/animejs/dist/modules/timeline/index.js",
      "animejs/animatable": "/node_modules/animejs/dist/modules/animatable/index.js",
      "animejs/draggable": "/node_modules/animejs/dist/modules/draggable/index.js",
      "animejs/layout": "/node_modules/animejs/dist/modules/layout/index.js",
      "animejs/scope": "/node_modules/animejs/dist/modules/scope/index.js",
      "animejs/engine": "/node_modules/animejs/dist/modules/engine/index.js",
      "animejs/events": "/node_modules/animejs/dist/modules/events/index.js",
      "animejs/easings": "/node_modules/animejs/dist/modules/easings/index.js",
      "animejs/utils": "/node_modules/animejs/dist/modules/utils/index.js",
      "animejs/svg": "/node_modules/animejs/dist/modules/svg/index.js",
      "animejs/text": "/node_modules/animejs/dist/modules/text/index.js",
      "animejs/waapi": "/node_modules/animejs/dist/modules/waapi/index.js"
    }
  }
</script>
```

---

## Vanilla JS (базовый паттерн)

```typescript
import {animate, utils, createDraggable, spring} from 'animejs';

const [$logo] = utils.$('.logo.js');
const [$button] = utils.$('button');
let rotations = 0;

animate('.logo.js', {
  scale: [
    {to: 1.25, ease: 'inOut(3)', duration: 200},
    {to: 1, ease: spring({bounce: 0.7})},
  ],
  loop: true,
  loopDelay: 250,
});

createDraggable('.logo.js', {
  container: [0, 0, 0, 0],
  releaseEase: spring({bounce: 0.7}),
});

const rotateLogo = () => {
  rotations++;
  $button.innerText = `rotations: ${rotations}`;
  animate($logo, {
    rotate: rotations * 360,
    ease: 'out(4)',
    duration: 1500,
  });
};

$button.addEventListener('click', rotateLogo);
```

**Ключевые API:** `animate(targets, params)`, `utils.$(selector)`, `spring({ bounce })`, `createDraggable`.

---

## React (обязательный паттерн)

> **Полный каталог API/JSX со страницы docs + phased rollout:** `memory-bank/reference/animejs-react-integration-plan.md`

Anime.js + React = **`useEffect` + `createScope` + cleanup `revert()`**.

```tsx
import {animate, createScope, spring, createDraggable} from 'animejs';
import {useEffect, useRef, useState} from 'react';

function AnimatedBlock() {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const [rotations, setRotations] = useState(0);

  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({root}).add(self => {
      // Все селекторы scoped к root
      animate('.logo', {
        scale: [
          {to: 1.25, ease: 'inOut(3)', duration: 200},
          {to: 1, ease: spring({bounce: 0.7})},
        ],
        loop: true,
        loopDelay: 250,
      });

      createDraggable('.logo', {
        container: [0, 0, 0, 0],
        releaseEase: spring({bounce: 0.7}),
      });

      self.add('rotateLogo', (i: number) => {
        animate('.logo', {
          rotate: i * 360,
          ease: 'out(4)',
          duration: 1500,
        });
      });
    });

    return () => scope.current?.revert();
  }, []);

  const handleClick = () => {
    setRotations(prev => {
      const next = prev + 1;
      scope.current?.methods.rotateLogo(next);
      return next;
    });
  };

  return (
    <div ref={root}>
      <img src="/logo.svg" className="logo" alt="" />
      <button type="button" onClick={handleClick}>
        rotations: {rotations}
      </button>
    </div>
  );
}
```

### React checklist

- [ ] `root` ref на контейнер scope
- [ ] `createScope({ root })` внутри `useEffect`
- [ ] Cleanup: `return () => scope.current?.revert()`
- [ ] Методы наружу — через `self.add('name', fn)` → `scope.current.methods.name()`
- [ ] `useReducedMotion()` — при `true` не вызывать `animate` / `createDraggable`
- [ ] Анимируй **transform и opacity** (см. `CLAUDE.md` § Motion)

---

## Engine (глобальные настройки)

```typescript
import {engine} from 'animejs';

// Defaults для всех Timer / Animation / Timeline
engine.defaults.duration = 500;
```

### Свойства engine

| Свойство                | Описание                           |
| ----------------------- | ---------------------------------- |
| `timeUnit`              | `'ms'` \| `'s'` для duration/delay |
| `currentTime`           | Текущее время движка               |
| `deltaTime`             | Δ с прошлого кадра                 |
| `precision`             | Округление строковых значений      |
| `speed`                 | Глобальный playback rate           |
| `fps`                   | Глобальный frame rate              |
| `useDefaultMainLoop`    | Свой rAF loop                      |
| `pauseOnDocumentHidden` | Пауза при скрытой вкладке          |

### Defaults (на `engine.defaults`)

| Свойство                                                             | Тип                |
| -------------------------------------------------------------------- | ------------------ |
| `playbackEase`                                                       | string \| function |
| `playbackRate`                                                       | number             |
| `frameRate`                                                          | number             |
| `loop`                                                               | number \| boolean  |
| `reversed`                                                           | boolean            |
| `alternate`                                                          | boolean            |
| `autoplay`                                                           | boolean            |
| `duration`                                                           | number \| function |
| `delay`                                                              | number \| function |
| `composition`                                                        | string \| function |
| `ease`                                                               | string \| function |
| `loopDelay`                                                          | number             |
| `modifier`                                                           | function           |
| `onBegin`, `onUpdate`, `onRender`, `onLoop`, `onComplete`, `onPause` | callbacks          |

---

## v3 → v4 (краткая миграция)

| v3                               | v4                                           |
| -------------------------------- | -------------------------------------------- |
| `import anime from 'animejs'`    | `import { animate } from 'animejs'`          |
| `anime({ targets: 'div', ... })` | `animate('div', { ... })`                    |
| `easing: 'easeOutExpo'`          | `ease: 'outExpo'`                            |
| `easing: 'spring(...)'`          | `ease: spring({ ... })` или `createSpring()` |
| `direction: 'reverse'`           | `reversed: true`                             |
| `direction: 'alternate'`         | `alternate: true`                            |
| `loop: 1` (один цикл)            | `loop: 0`                                    |
| `begin`, `update`, `complete`    | `onBegin`, `onUpdate`, `onComplete`          |
| `change`                         | `onRender`                                   |
| `animation.finished`             | `animation.then()`                           |
| `round: 100`                     | `modifier: utils.round(2)`                   |

Полный migration guide: [GitHub v4 migration](https://github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4).

---

## Интеграция с проектом Training Calculator

| Правило проекта           | Применение с Anime.js                                 |
| ------------------------- | ----------------------------------------------------- |
| `useReducedMotion()`      | Guard перед любым `animate`                           |
| `CLAUDE.md` Motion        | transform/opacity; 150–600ms; без width/height/margin |
| `src/theme/animations.ts` | Тайминги framer-motion — ориентир для duration/ease   |
| iPhone web                | Проверка 390px после UI-анимаций                      |
| Quiet UI                  | Без декоративных loop без функции                     |

### JournalTab — цвета для анимаций

Эталон: `journal-progress-chart-standard.md` § «Цветовая гамма».

| Контекст                     | CSS token                        | Hex                   |
| ---------------------------- | -------------------------------- | --------------------- |
| Shell UI, дельта «+N кг»     | `--accent`                       | `#ff6b35`             |
| e1RM line/points, active tab | `--ta-calc-accent`               | `#ff9f40`             |
| Volume bars                  | `--ta-sec-02`                    | `#5ba4ff`             |
| Surfaces                     | `--surface` / `--surface-raised` | `#141415` / `#1d1d1d` |

**Правило:** anime.js — transform/opacity; **цвет в CSS** через tokens, не raw hex в `animate()`.

---

## Связанные инструменты агента

| Инструмент       | Путь                              |
| ---------------- | --------------------------------- |
| Skill            | `.cursor/skills/animejs/SKILL.md` |
| Rule             | `.cursor/rules/animejs.mdc`       |
| Официальная docs | https://animejs.com/documentation |


## `memory-bank/reference/animejs-react-integration-plan.md`

# Anime.js × React — канон docs + план внедрения в проект

> **Источник (канон):** [Using with React | Getting started | Anime.js](https://animejs.com/documentation/getting-started/using-with-react)  
> **Дата:** 2026-05-31  
> **Статус:** план (не `/build`); пакет `animejs@^4.4.1` установлен; facade `src/lib/anime/`, hook `src/hooks/useAnimeScope.ts`; первый consumer — `JournalProgressChart` (stat enter).

Связанные документы: `animejs-getting-started.md`, `.cursor/skills/animejs/SKILL.md`, `.cursor/rules/animejs.mdc`, `journal-progress-chart-standard.md` § цвета.

---

## 1. Тезис docs (официальный)

> Anime.js can be used with React by combining React's `useEffect()` and Anime.js `createScope()` methods.

Паттерн: **`useEffect` + `createScope({ root })` + cleanup `revert()`**. Селекторы внутри scope ограничены DOM-поддеревом `ref={root}`.

---

## 2. Абсолютный каталог компонентов со страницы Using with React

Ниже — **все** импорты, API, refs, state, JSX-узлы, CSS-классы, параметры анимаций и lifecycle-вызовы **как на странице docs** (ничего не опущено).

### 2.1 Импорты — Anime.js (`'animejs'`)

| Export            | Роль на странице                                                   |
| ----------------- | ------------------------------------------------------------------ |
| `animate`         | Основная анимация `.logo` (scale loop + rotate по клику)           |
| `createScope`     | Создание scope, привязка к React `root` ref                        |
| `spring`          | Easing: `spring({ bounce: .7 })` в scale и `releaseEase` draggable |
| `createDraggable` | Drag `.logo` с spring на release                                   |

### 2.2 Импорты — React (`'react'`)

| Export      | Роль на странице                                        |
| ----------- | ------------------------------------------------------- |
| `useEffect` | Mount scope + animations; cleanup `revert()`            |
| `useRef`    | `root` — DOM-контейнер scope; `scope` — экземпляр Scope |
| `useState`  | `rotations` — счётчик для label кнопки                  |

### 2.3 Импорты — ассеты / стили

| Import      | Путь                   |
| ----------- | ---------------------- |
| `reactLogo` | `'./assets/react.svg'` |
| CSS         | `'./App.css'`          |

### 2.4 React-компонент (официальный пример)

| Идентификатор        | Тип                | Назначение                 |
| -------------------- | ------------------ | -------------------------- |
| `App`                | function component | Корневой компонент примера |
| `export default App` | default export     | Entry компонента           |

### 2.5 Refs (useRef)

| Ref     | Initial | Назначение                                                                 |
| ------- | ------- | -------------------------------------------------------------------------- |
| `root`  | `null`  | `<div ref={root}>` — корень scope; передаётся в `createScope({ root })`    |
| `scope` | `null`  | Хранит return value `createScope(...).add(...)` для `methods` и `revert()` |

### 2.6 State (useState)

| State          | Initial | Назначение                                        |
| -------------- | ------- | ------------------------------------------------- |
| `rotations`    | `0`     | Отображается в `button`: `rotations: {rotations}` |
| `setRotations` | —       | Обновление в `handleClick`                        |

### 2.7 useEffect — тело (mount)

| Шаг | Код / API                                                    | Детали                                                                  |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 1   | `scope.current = createScope({ root }).add(self => { ... })` | Scope на React ref `root`                                               |
| 2   | `animate('.logo', { scale: [...], loop, loopDelay })`        | Bounce loop                                                             |
| 3   | scale keyframe 1                                             | `{ to: 1.25, ease: 'inOut(3)', duration: 200 }`                         |
| 4   | scale keyframe 2                                             | `{ to: 1, ease: spring({ bounce: .7 }) }`                               |
| 5   | loop                                                         | `true`                                                                  |
| 6   | loopDelay                                                    | `250`                                                                   |
| 7   | `createDraggable('.logo', { container, releaseEase })`       | Draggable logo                                                          |
| 8   | container                                                    | `[0, 0, 0, 0]`                                                          |
| 9   | releaseEase                                                  | `spring({ bounce: .7 })`                                                |
| 10  | `self.add('rotateLogo', (i) => { ... })`                     | Метод scope для вызова снаружи effect                                   |
| 11  | rotateLogo body                                              | `animate('.logo', { rotate: i * 360, ease: 'out(4)', duration: 1500 })` |
| 12  | cleanup                                                      | `return () => scope.current.revert()`                                   |
| 13  | deps                                                         | `[]` (только mount)                                                     |

### 2.8 Обработчики вне useEffect

| Handler       | Поведение                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `handleClick` | `setRotations(prev => { const newRotations = prev + 1; scope.current.methods.rotateLogo(newRotations); return newRotations; })` |

### 2.9 Scope methods (runtime API со страницы)

| Path                                  | Вызов                            |
| ------------------------------------- | -------------------------------- |
| `scope.current.methods.rotateLogo(i)` | Из `handleClick` после increment |

### 2.10 JSX-дерево (все узлы и классы)

```
div                    ref={root}
  div.large.centered.row
    img.logo.react     src={reactLogo}  alt="React logo"
  div.medium.row
    fieldset.controls
      button           onClick={handleClick}  children: rotations: {rotations}
```

| CSS class (JSX) | Элемент        |
| --------------- | -------------- |
| `large`         | wrapper row    |
| `centered`      | wrapper row    |
| `row`           | wrapper row    |
| `logo`          | img            |
| `react`         | img (modifier) |
| `medium`        | controls row   |
| `controls`      | fieldset       |

### 2.11 CSS из примера (`App.css`)

```css
.logo.react {
  width: 150%;
  height: 150%;
}
```

### 2.12 Easing / параметры (сводная таблица)

| Контекст          | Параметр    | Значение                 |
| ----------------- | ----------- | ------------------------ |
| scale in          | ease        | `'inOut(3)'`             |
| scale in          | duration    | `200`                    |
| scale out         | ease        | `spring({ bounce: .7 })` |
| draggable release | releaseEase | `spring({ bounce: .7 })` |
| rotate            | ease        | `'out(4)'`               |
| rotate            | duration    | `1500`                   |
| rotate            | property    | `rotate: i * 360`        |

### 2.13 Соседние разделы (навигация страницы docs)

| Ссылка                | URL path                                               |
| --------------------- | ------------------------------------------------------ |
| Engine defaults       | `/documentation/engine/engine-defaults`                |
| Using with vanilla JS | `/documentation/getting-started/using-with-vanilla-js` |
| Imports               | `/documentation/getting-started/module-imports`        |

---

## 3. Маппинг официального примера → проект

| Docs                                                  | Проект (канон)                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `import { animate, createScope, ... } from 'animejs'` | `import { animate, createScope, ... } from '../../lib/anime/index.ts'`             |
| `root` ref + `scope` ref + manual `useEffect`         | **`useAnimeScope(rootRef, setup, deps, options)`** — обёртка с `revert()`          |
| —                                                     | **`useReducedMotion()`** — guard (нет в официальном примере; обязателен в проекте) |
| `self.add('name', fn)`                                | Тот же API внутри callback `useAnimeScope`                                         |
| `scope.current.methods.name()`                        | `scopeRef.current?.methods.name()` из hook                                         |
| `configureAppAnimeEngine()`                           | `index.tsx` — engine defaults                                                      |
| framer-motion табы                                    | **Не заменять** без задачи                                                         |

---

## 4. План внедрения (phased rollout)

**Принцип:** anime.js — DOM/SVG/data-driven; framer-motion — React enter/exit табов и Theory hero.

### Фаза 0 — Foundation ✅ (done)

| #   | Задача                | Артеfact                                                | Статус |
| --- | --------------------- | ------------------------------------------------------- | ------ |
| 0.1 | `npm install animejs` | `package.json`                                          | ✅     |
| 0.2 | Facade subpaths       | `src/lib/anime/index.ts`                                | ✅     |
| 0.3 | Engine defaults       | `src/lib/anime/configureAppAnimeEngine.ts`, `index.tsx` | ✅     |
| 0.4 | React scope hook      | `src/hooks/useAnimeScope.ts`                            | ✅     |
| 0.5 | Тест                  | `tests/anime-lib.test.ts`                               | ✅     |
| 0.6 | Memory + skill + rule | `memory-bank/reference/`, `.cursor/skills/animejs/`     | ✅     |

### Фаза 1 — Journal (приоритет ★★★)

**Цель:** анимации привязаны к **данным** (смена exercise, новые sessions), цвета через CSS tokens.

| #   | Компонент проекта      | Anime API (из docs + module)            | Что анимировать                                                                       | Файлы                             |
| --- | ---------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------- |
| 1.1 | `JournalProgressChart` | `useAnimeScope` + `animate` + `stagger` | Перерисовка SVG: line `strokeDashoffset`, bars `scaleY` при `[exerciseKey, sessions]` | `JournalProgressChart.tsx`        |
| 1.2 | `JournalProgressChart` | `animate` + `spring({ bounce })`        | Pulse `.journal-chart-delta` при изменении `delta`                                    | same                              |
| 1.3 | `JournalProgressChart` | `animate` `translateX`                  | Tooltip `.ta-period__tip` follow `activeIndex`                                        | same                              |
| 1.4 | `JournalProgressChart` | ✅ частично                             | Stat cards enter — уже `stagger(80)`                                                  | same                              |
| 1.5 | `ExerciseWheel`        | `animate` scale                         | Pulse `.ew-trigger` при смене exercise                                                | `ExerciseWheel.tsx` + journal CSS |
| 1.6 | `JournalSessionList`   | `useAnimeScope` + `animate`             | Expand detail: `opacity` + `translateY` (без height)                                  | `JournalSessionList.tsx`          |

**Чеклист фазы 1:**

- [ ] `useAnimeScope` на `.journal-chart-shell` / `liveRef`
- [ ] deps: `exerciseKey`, `sessions.length`, `chart.journalLinePath`
- [ ] `prefers-reduced-motion` → skip (hook)
- [ ] iPhone 390px preview
- [ ] Не дублировать CSS `@keyframes ta-period-*` — либо anime, либо CSS (решить в 1.1)

### Фаза 2 — Calculator charts (★★★)

| #   | Компонент                 | Anime API                    | Что анимировать                              | Файлы                         |
| --- | ------------------------- | ---------------------------- | -------------------------------------------- | ----------------------------- |
| 2.1 | `PeriodizationChart`      | `createTimeline` + `stagger` | Phase strip → line draw → bars               | `PeriodizationChart.tsx`      |
| 2.2 | `ProgressionPreviewChart` | `animate` + timeline         | Redraw при смене `progressionPreset`         | `ProgressionPreviewChart.tsx` |
| 2.3 | Секция 02 progression     | `stagger`                    | Result chips / plates вместо фикс. CSS delay | `CalculatorTab.tsx`, parts    |

**Чеклист фазы 2:**

- [ ] Timeline после `handleCalculate` / появление `activeResult`
- [ ] Scope root = `.ta-period` section ref
- [ ] Сохранить `--ta-sec-01` / `--ta-sec-02` в CSS

### Фаза 3 — Polish (★★)

| #   | Компонент         | Anime API                                | Примечание                                                               |
| --- | ----------------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| 3.1 | Shared chart hook | `usePeriodChartAnimation(rootRef, deps)` | DRY для Journal + Periodization                                          |
| 3.2 | `createDraggable` | —                                        | **Не планируется** (нет drag UX в продукте; есть в docs только как demo) |
| 3.3 | `splitText`       | `animejs/text`                           | **Отложено** (против Quiet UI)                                           |

### Фаза 4 — Не трогать (explicit exclude)

| Комponent                                         | Причина                        |
| ------------------------------------------------- | ------------------------------ |
| `TabPanel` / `AnimatePresence`                    | framer-motion exit enter канон |
| `HeroSection`, `TheoryChapterPanel`               | framer-motion variants         |
| `AuthScreen`                                      | framer-motion                  |
| `TabNav` + `useSlidingIndicator`                  | CSS transform достаточно       |
| `RevealSection`, `StaggerGrid`, `useScrollReveal` | CSS + IntersectionObserver     |
| Кнопки `:active` / hover                          | CSS micro                      |

---

## 5. Шаблон внедрения (по официальному React-паттерну)

```tsx
import {useRef} from 'react';
import {animate, createScope, stagger} from '../../lib/anime/index.ts';
import {useAnimeScope} from '../../hooks/useAnimeScope.ts';

export function ExampleChartBlock() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Эквивалент docs: useEffect + createScope({ root }).add(self => ...)
  useAnimeScope(
    rootRef,
    self => {
      animate('.target-line', {
        strokeDashoffset: [1, 0],
        duration: 900,
        ease: 'out(3)',
      });

      self.add('emphasizePoint', (index: number) => {
        animate(`.point-${index}`, {
          scale: [1, 1.25, 1],
          duration: 300,
          ease: 'out(3)',
        });
      });
    },
    [dataRevision],
  );

  return <div ref={rootRef}>{/* scoped selectors only inside rootRef */}</div>;
}
```

**Cleanup:** `useAnimeScope` вызывает `scope.revert()` — как `return () => scope.current.revert()` в docs.

---

## 6. Критерии готовности (Stop Criteria) по фазам

| Фаза | Done when                                                                             |
| ---- | ------------------------------------------------------------------------------------- |
| 1    | Journal chart re-animates on exercise change; typecheck + tests pass; iPhone 390px OK |
| 2    | Calculator chart timeline on calculate; preview on preset change                      |
| 3    | Shared hook; docs updated in `progress.md`                                            |

---

## 7. Риски

| Риск                           | Митигация                                                     |
| ------------------------------ | ------------------------------------------------------------- |
| Двойная анимация CSS + anime   | Убрать `@keyframes ta-period-*` там, где anime берёт enter    |
| Loop как в docs (`loop: true`) | **Запрещено** в продукте (Quiet UI); только functional motion |
| `createDraggable` из примера   | Не использовать в training app                                |
| StrictMode double mount        | `revert()` в cleanup hook (как docs)                          |

---

## 8. Следующая команда Memory Bank

```
/plan  → детализировать фазу 1 в tasks.md
/build → JournalProgressChart redraw (1.1–1.3)
```


## `memory-bank/reference/calc-exercise-select-standard.md`

# Эталон: ExercisePicker (`.calc-test__exercise` / `.ew-*`)

> **Статус:** канонический reference implementation для **выбора упражнения** в калькуляторе (Program 2.0 и Program 3.0).  
> **Дата фиксации:** 2026-05-28  
> **Не модифицировать** без явной задачи; новые exercise pickers — наследовать паттерны отсюда.

## Карта файлов

| Слой                | Путь                                                      | Символы / классы                                                |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| Shared picker       | `src/components/calculator/ExercisePicker.tsx`            | `ExercisePicker`, `ExercisePickerItem`, `ExercisePickerOption`  |
| Program 2.0 adapter | `src/components/ExerciseWheel.tsx`                        | thin wrapper → `WHEEL_ORDER` + `EXERCISES` + type A–D           |
| Program 2.0 usage   | `src/components/calculator/TestApproachSection.tsx`       | `.calc-test__exercise` + `ExerciseWheel`                        |
| Program 3.0 usage   | `src/screens/CalculatorTabV3.tsx`                         | `.calc-test__exercise` + `ExercisePicker` + V3 items            |
| V3 data             | `packages/shared/src/program/v3/exercises.ts`             | `EXERCISE_ORDER_V3`, `CATEGORY_LABELS_V3`, `CATEGORY_COLORS_V3` |
| **Стили dropdown**  | `src/styles/components/calculator/exercise-select.css`    | `.ew-select`, `.ew-trigger`, `.ew-menu`, `.ew-option`           |
| Calc overrides      | `src/styles/components/calculator/calc-test-approach.css` | `.calc-test .ew-trigger*`, placeholder state                    |
| Parent form         | `memory-bank/reference/calc-test-approach-standard.md`    | section shell, label rhythm, keyboard inset                     |

**Sibling (не эталон):** native `<select.ta-calc-select>` в `.calc-test__select-wrap` — legacy Program 3.0 control, **заменён** на ExercisePicker. Не использовать для новых секций.

---

## 1. Архитектура

```
ExercisePicker (generic listbox dropdown)
        │
        ├── Program 2.0: ExerciseWheel → EXERCISES + TYPE_LABELS A–D
        └── Program 3.0: CalculatorTabV3 → EXERCISES_V3 + CATEGORY_LABELS barbell/dumbbell/…
```

- **ExercisePicker** — UI + a11y + saved 1RM badge; **без** привязки к конкретному каталогу упражнений.
- **ExerciseWheel** — adapter для Program 2.0; сохраняет backward-compatible default export.
- **CSS scope** — базовые `.ew-*` в `exercise-select.css`; calculator trigger overrides под `.calc-test`.

### Props surface

```ts
interface ExercisePickerItem {
  key: string;
  name: string;
  typeLabel: string; // subtitle: «Тип А — Штанга крупная» или «Гантели»
  typeColor: string; // accent bar + active tint source
}

interface ExercisePickerProps {
  value: string; // '' allowed (placeholder trigger)
  onChange: (key: string) => void;
  items: ExercisePickerItem[];
  savedExercises?: SavedExercise[]; // optional 1RM badge by exerciseKey
  placeholder?: string; // default «Выберите упражнение»
  menuTitle?: string; // default «Выбери упражнение»
  triggerId?: string; // for <label htmlFor>
  ariaLabelledBy?: string; // section heading id
}
```

---

## 2. Trigger (`.ew-trigger`)

| Element     | Spec                                                             |
| ----------- | ---------------------------------------------------------------- |
| Layout      | flex, space-between; copy left, chevron right                    |
| Min height  | 44px (2.75rem in calc-test override)                             |
| Radius      | 12px (0.75rem) in calculator context                             |
| Border      | 1px `--border-subtle` + `--shadow-elevated`                      |
| Name        | 16px / 500 primary                                               |
| Meta (type) | 14px secondary, sentence case                                    |
| Chevron     | `⌄`, rotates 180° when `.ew-trigger-icon.is-open`                |
| Placeholder | `.ew-trigger--placeholder` → name 14–16px secondary, no meta row |

**States:** hover accent border 35% mix; active opacity 0.88 + scale 0.99; focus-visible 2px accent outline offset 2px.

---

## 3. Panel (`.ew-menu-panel` → `.ew-menu`)

| Element        | Spec                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| Open animation | `grid-template-rows: 0fr → 1fr`; menu opacity + translateY slide                   |
| Container      | radius 16px, layered shadow, max-height `min(520px, 100svh - 160px)`               |
| Title          | `.ew-menu-title` — 12px / 600, **UPPERCASE**, tracking 0.16em, «ВЫБЕРИ УПРАЖНЕНИЕ» |
| List           | `.ew-options` — scroll, overscroll contain, gap 6px                                |
| Option row     | min-height 60px (56px mobile), grid: swatch \| copy \| rm badge \| check           |

### Option row (`.ew-option`)

| Column    | Spec                                                               |
| --------- | ------------------------------------------------------------------ |
| Swatch    | 4px × stretch bar (radius 2px), `--ew-option-color` from item.typeColor |
| Copy      | strong 16px name + 12px type label                                      |
| 1RM badge | `.ew-option-rm` rounded rectangle (`--glass-radius-badge` 6px), not pill |
| Check     | 20px squircle accent (`--glass-radius-badge`) + ✓ when selected         |
| Active    | `.is-active` — accent tint background + border mix                 |

**Stagger:** nth-child delays 24ms+ on open (exercise-select.css only).

**Mobile ≤600px:** check hidden when `.ew-option-check.has-rm` (1RM badge takes space).

---

## 4. Data sources

### Program 2.0 (ExerciseWheel)

| Field      | Source                                                  |
| ---------- | ------------------------------------------------------- |
| Order      | `WHEEL_ORDER` (`packages/shared/src/data/exercises.ts`) |
| Names      | `EXERCISES[key].name`                                   |
| Type label | `TYPE_LABELS[A\|B\|C\|D]`                               |
| Type color | `TYPE_COLORS`                                           |
| Saved 1RM  | `userData.exercises` by `exerciseKey`                   |

### Program 3.0 (CalculatorTabV3)

| Field         | Source                                                                       |
| ------------- | ---------------------------------------------------------------------------- |
| Order         | `EXERCISE_ORDER_V3` — flat unique keys from `TRAINING_DAYS_V3`               |
| Names         | `EXERCISES_V3[key].name`                                                     |
| Type label    | `CATEGORY_LABELS_V3[category]` — barbell / dumbbell / bodyweight / machine   |
| Type color    | `CATEGORY_COLORS_V3`                                                         |
| Saved 1RM     | `userData.exercises` when key overlap (optional; no badge if no saved data)  |
| Initial value | `''` — placeholder until pick; **section 03 hidden** until `selectedKey` set |

---

## 5. Accessibility

| Requirement | Implementation                                                                |
| ----------- | ----------------------------------------------------------------------------- |
| Trigger     | `button`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`         |
| Menu        | `role="listbox"`, options `role="option"` + `aria-selected`                   |
| Label       | `<label htmlFor={triggerId}>` + optional `aria-labelledby` section heading    |
| Close       | Escape → close + focus trigger; pointerdown outside closes                    |
| Focus       | `:focus-visible` rings on trigger and options                                 |
| Motion      | `prefers-reduced-motion: reduce` — no stagger/transform (exercise-select.css) |

---

## 6. Integration checklist

1. Wrap in `.calc-test__exercise` inside `.calc-test` (see calc-test-approach-standard).
2. Pass `items` from domain catalog — **не** hardcode options in JSX.
3. Use `triggerId` matching label `htmlFor`.
4. For conditional sections (V3 chart): gate on `value !== ''`.
5. Do **not** duplicate `.ew-*` styles — extend via calc-test overrides only for trigger shell.

---

## 7. Copy (RU)

| Context     | Text                  |
| ----------- | --------------------- |
| Field label | «Упражнение»          |
| Placeholder | «Выберите упражнение» |
| Menu title  | «Выбери упражнение»   |
| 1RM badge   | `{oneRM} кг`          |

---

## 8. Related standards

- Form shell + metrics: [`calc-test-approach-standard.md`](./calc-test-approach-standard.md)
- Calculator tab layout: [`calculator-tab-standard.md`](./calculator-tab-standard.md)
- Saved list (separate): [`calc-saved-exercises-standard.md`](./calc-saved-exercises-standard.md)


## `memory-bank/reference/calc-progression-result-standard.md`

# Эталон: секция 02 «Прогрессия» (Program 2.0)

> **Статус:** partial standard (composite) внутри Calculator tab umbrella.  
> **Umbrella:** [`calculator-tab-standard.md`](./calculator-tab-standard.md)  
> **Дата фиксации:** 2026-05-28  
> **Условие рендера:** `activeResult !== null` в `CalculatorTab.tsx`.

---

## 1. Карта блоков

```
SectionBlock num="02" title={`Прогрессия — ${config.name}`} variant="apple"
├── [02a] .insight                    — §4
├── [02b] ResultCard                  — §5
├── [02c] PlateDiagram (conditional)  — §6
├── [02d] PeriodizationChart          — §7 → periodization-chart-standard.md (MAX)
└── [02e] NoteBox variant="apple"     — §8
```

**Scroll anchor:** `div[ref=resultRef]` → `scrollIntoView` на смену `activeResult.exerciseKey`; `scroll-margin-top: 88px` на `.ta-calc-section`.

**Порядок в `.ta-calc-section__body`:** insight → ResultCard → PlateDiagram? → PeriodizationChart → NoteBox (`gap: 20px`).

---

## 2. Файлы

| Блок    | Компонент / класс                       | Исходники                                                                          |
| ------- | --------------------------------------- | ---------------------------------------------------------------------------------- |
| Shell   | `SectionBlock variant="apple" num="02"` | `SectionBlock.tsx`, `CalculatorTab.tsx`                                            |
| 02a     | `.insight`                              | `insight.css`, `CalculatorTab.tsx`                                                 |
| 02b     | `.ta-result-card`                       | `ResultCard.tsx`, `theory-apple.css` L3208+                                        |
| 02c     | `.ta-calc-plates`                       | `PlateDiagram.tsx`                                                                 |
| **02d** | **`section.ta-period`**                 | **`PeriodizationChart.tsx`, `usePeriodization.ts`, `theory-apple.css` L3432–3709** |
| 02e     | `.ta-calc-note`                         | `NoteBox`, `note-box.css`                                                          |

---

## 3. Условия рендера

| Блок               | Условие                                    |
| ------------------ | ------------------------------------------ |
| Секция 02 целиком  | `activeResult !== null`                    |
| PlateDiagram       | `!config.isPullup && (type A \|\| type B)` |
| PeriodizationChart | всегда внутри sec 02 (Program 2.0 only)    |

---

## 4. Insight (02a)

**CSS:** `src/styles/components/shared/insight.css` — bg `var(--insight-bg)`, left accent 3px, radius 8px, pad 16px 20px, 12px lh 1.75.

**Copy:** lead `<strong>` + dynamic `<code>` для нед 1→8, % роста веса, коэффициент объёма.

### 4.3 Preset vs chart (документированное расхождение)

- Insight `weekRows` в `CalculatorTab` может учитывать `progressionPreset` через `applyProgressionPresetToPercent/Scheme`.
- **`PeriodizationChart` / `usePeriodization`** — raw `config.percentages` / `weekSchemes` **без preset**.
- Preset сейчас **no-op** в `progressionPresets.ts`; при будущей активации — sync hook или явная immutability в docs.

---

## 5. ResultCard (02b)

Hero «Расчётный 1ПМ» — surface, left accent 2px, value 32px tabular-nums, chips ×4 (test, type, step, date). Count-up 250ms; `aria-live="polite"`.

**→ Детали:** `calculator-tab-standard.md` (legacy §02b table).

---

## 6. PlateDiagram (02c)

Условный SVG раскладки блинов; viewBox 400×120; `--plate-*` tokens; `ta-plate-in` stagger 80ms.

**→ Детали:** `calculator-tab-standard.md` (legacy §02c table).

---

## 7. PeriodizationChart (02d) — dual-axis etalon

**→ MAX detail (phase strip, SVG, listbox, keyboard, reduced motion, CSS):** [`periodization-chart-standard.md`](./periodization-chart-standard.md)

### Краткая роль в composite

| Aspect        | Spec                                                                                  |
| ------------- | ------------------------------------------------------------------------------------- |
| Root          | `section.ta-period`                                                                   |
| Phase strip   | EN uppercase: ACCUMULATION / DELOAD / INTENSIFICATION / PEAK + `--ta-sec-02/03/06/01` |
| SVG left      | **%** — orange line `--ta-sec-01` + area tint                                         |
| SVG right     | **повт** — blue bars `--ta-sec-02`                                                    |
| Deload        | **Week 5** — pct dip + volume restore; sync с NoteBox §8                              |
| Listbox       | `Нед` · `кг` · `sets×reps` · `повт` · **`<em>{phase EN}</em>`**                       |
| Tooltip       | RU `phaseHint()` on line 3; phase name EN on line 1                                   |
| Keyboard      | `ArrowLeft/Right`, `Escape` on listbox                                                |
| Mobile ≤600px | SVG readonly; listbox primary                                                         |

**Policy:** phase в listbox/strip — **English per code**; локализация только по явной задаче.

---

## 8. NoteBox legend (02e)

**Markup:** сразу после `<PeriodizationChart />` в `CalculatorTab.tsx`.

**Copy (канон):**

- «↺ **Нед 5 — волновой откат:** вес снижается, объём восстанавливается.»
- «**Жирный** в «Схема» = отклонение от 4 подходов.»
- **Цвет объёма:** `.vol-legend--high` ≥28 · `.vol-legend--mid` 17–27 · `.vol-legend--low` ≤16

**CSS:** `note-box.css`, `NoteBox variant="apple"` → `.ta-calc-note`.

**Gap:** vol-legend colors не применяются к bars chart (mono `--ta-sec-02`) — см. `periodization-chart-standard.md` §15.

---

## 9. Cross-links

| Документ                                                                 | Связь                       |
| ------------------------------------------------------------------------ | --------------------------- |
| [`calculator-tab-standard.md`](./calculator-tab-standard.md)             | Umbrella                    |
| [`periodization-chart-standard.md`](./periodization-chart-standard.md)   | **MAX** chart etalon        |
| [`calc-test-approach-standard.md`](./calc-test-approach-standard.md)     | Sec 01 → calculate → sec 02 |
| [`calc-saved-exercises-standard.md`](./calc-saved-exercises-standard.md) | Sec 03 → scroll sec 02      |

---

## 10. Чеклист агента

- [ ] Umbrella + **этот файл** + **`periodization-chart-standard.md`** перед правками chart
- [ ] NoteBox W5 copy согласован с chart deload
- [ ] Не дублировать SVG geometry вне `usePeriodization`
- [ ] Превью MCP `cursor-ide-browser` @ `:5173`


## `memory-bank/reference/calc-saved-exercises-standard.md`

# Эталон: Saved Exercises list (`.ta-calc-saved-*`)

> **Статус:** канонический reference implementation для **selectable list cards** в калькуляторе (Program 2.0) — секция **«03 Сохранённые (N/12)»**.  
> **Дата фиксации:** 2026-05-28 (синхронизация с кодом `CalculatorTab.tsx` L187–234, `theory-apple.css` L3711–3837)  
> **Не модифицировать** без явной задачи; новые list UIs (журнал, тренировка, файлы) — наследовать паттерны отсюда.

## Оглавление

1. [Карта файлов](#1-карта-файлов)
2. [Полное дерево DOM / компонентов](#2-полное-дерево-dom--компонентов)
3. [React: props, handlers, условия рендера](#3-react-props-handlers-условия-рендера)
4. [SectionBlock shell (03) — все классы и CSS](#4-sectionblock-shell-03--все-классы-и-css)
5. [List container `.ta-calc-saved-list`](#5-list-container-ta-calc-saved-list)
6. [Card `.ta-calc-saved-card` — grid, states, responsive](#6-card-ta-calc-saved-card--grid-states-responsive)
7. [Ячейки карточки: name, meta, actions, one-rm](#7-ячейки-карточки-name-meta-actions-one-rm)
8. [Delete: Button + scoped `.btn-sm`](#8-delete-button--scoped-btnsm)
9. [Counter `(N/M)` и empty state](#9-counter-nm-и-empty-state)
10. [Motion, stagger, reduced-motion](#10-motion-stagger-reduced-motion)
11. [Accessibility](#11-accessibility)
12. [Copy patterns](#12-copy-patterns)
13. [MUST / SHOULD / MUST NOT (journal, training, reuse)](#13-must--should--must-not-journal-training-reuse)
14. [Sibling comparison](#14-sibling-comparison)
15. [Чеклист для новых lists](#15-чеклист-для-новых-lists)

---

## 1. Карта файлов

| Слой                  | Путь                                                      | Символы / классы                                                                             |
| --------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Parent shell**      | `src/screens/CalculatorTab.tsx` L93–94                    | `.ta-shell` → `.ta-stack.ta-stack--calc`                                                     |
| **Section shell**     | `src/components/SectionBlock.tsx`                         | `variant="apple"` → dual classes Theory + calc                                               |
| **List markup**       | `src/screens/CalculatorTab.tsx` L187–234                  | inline `map`; **нет** `SavedExercisesList.tsx`                                               |
| **Delete control**    | `src/components/ui/Button.tsx`                            | `size="sm"` + `variant="danger"` → `.btn-sm.btn-danger`                                      |
| **State / handlers**  | `packages/shared/src/hooks/useCalculatorState.ts` L89–105 | `handleDelete`, `handleSelectSaved`                                                          |
| **Wiring**            | `src/components/app/TabPanel.tsx`                         | props в `CalculatorTab`                                                                      |
| **Domain type**       | `packages/shared/src/types/index.ts`                      | `SavedExercise`                                                                              |
| **Exercise catalog**  | `packages/shared/src/data/exercises.ts`                   | `EXERCISES`, `EX_COUNT` (= 12)                                                               |
| **Re-export**         | `src/data/exercises.ts`                                   | `export *` из shared                                                                         |
| **Стили эталона**     | `src/styles/components/theory-apple.css` **L3711–3837**   | `.ta-calc-saved-list`, `.ta-calc-saved-card`, `__*`                                          |
| **Section rhythm**    | `theory-apple.css` **L2944–2975**, mobile **L3180–3187**  | `.ta-shell .ta-calc-section`, `__head`, `__body`, `__pill`, `__title`                        |
| **Theory tokens**     | `theory-apple.css` **L57–62**, **L71–75**                 | `--ta-calc-accent`, `--ta-calc-accent-tint`, `--ta-calc-surface`, `--ta-calc-border`, motion |
| **Pill / title base** | `theory-apple.css` **L370–393**                           | `.ta-section-pill`, `.ta-section-title`                                                      |
| **Global btn**        | `src/styles/components/shared/buttons.css`                | `.btn-sm`, `.btn-danger` (scoped override в `__actions`)                                     |
| **Scroll reveal**     | `src/hooks/useScrollReveal.ts` + SectionBlock             | `.reveal-section` + `.is-visible`                                                            |

**Sibling (не эталон):**

- `training-app-mobile/app/(tabs)/calculator.tsx` — Pressable + StyleSheet; 1RM **без** orange accent; title `Сохранённые · N/M`
- `apps/macos/src/screens/CalculatorScreen.tsx` — legacy SectionBlock без `variant="apple"`; title с `·`
- `apps/mobile/app/(tabs)/index.tsx` — FlatList saved exercises, другой layout

---

## 2. Полное дерево DOM / компонентов

### 2.1 Ancestry (от корня вкладки)

```
div.ta-shell                          ← CalculatorTab root
└── div.ta-stack.ta-stack--calc       ← vertical stack секций (gap 28px, ta-stack-in на children)
    ├── TestApproachSection           ← [01] (отдельный standard)
    ├── [optional] SectionBlock 02    ← activeResult → Прогрессия
    ├── [optional] SectionBlock 03    ← userData.exercises.length > 0 → Сохранённые  ★ ЭТАЛОН
    └── SectionBlock 04               ← VolumeDonut (всегда)
```

Секция **03** рендерится **только** при `userData.exercises.length > 0`. Между 02 и 04 — когда есть сохранённые упражнения; порядок в DOM фиксирован.

### 2.2 SectionBlock → inner containers (точные классы из кода)

```tsx
<SectionBlock num="03" title={`Сохранённые (${n}/${EX_COUNT})`} variant="apple">
```

Рендер `SectionBlock` (`variant="apple"`):

```
section.ta-section.ta-calc-section.reveal-section[.is-visible]
└── div.ta-section-inner.ta-calc-section__inner
    ├── header.ta-section-head.ta-calc-section__head
    │   ├── span.ta-section-pill.ta-calc-section__pill[aria-hidden="true"]
    │   │     └── text: "03"
    │   └── h2.ta-section-title.ta-calc-section__title[id?]
    │         └── text: "Сохранённые (8/12)"
    └── div.ta-calc-section__body
        └── div.ta-calc-saved-list
            └── (N × card rows)
```

| Узел        | Классы                                                        | Примечание                                                  |
| ----------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| `<section>` | `ta-section` `ta-calc-section` `reveal-section` `is-visible?` | `useScrollReveal` на `<section ref>`                        |
| Inner       | `ta-section-inner` **+** `ta-calc-section__inner`             | dual naming Theory + calc                                   |
| Header      | `ta-section-head` **+** `ta-calc-section__head`               | flex column; calc overrides gap/margin                      |
| Pill        | `ta-section-pill` **+** `ta-calc-section__pill`               | calc: `padding-inline: 14px`                                |
| Title       | `ta-section-title` **+** `ta-calc-section__title`             | calc: `font-size: 32px` (base уже 32px)                     |
| Body        | `ta-calc-section__body` only                                  | `flex column; gap: 20px` — для 03 единственный child = list |

**Секция 03 не передаёт `titleId`** — в отличие от некоторых секций с якорями; `h2` без `id` по умолчанию.

### 2.3 List row (одна карточка) — полная разметка

```tsx
<div
  key={saved.exerciseKey}
  className={`ta-calc-saved-card${isActive ? ' is-active' : ''}`}
  role="button"
  tabIndex={0}
  aria-current={isActive ? 'true' : undefined}
  onClick={() => handleSelectSaved(saved)}
  onKeyDown={… Enter|Space …}
>
  <div>                                    ← ★ anonymous wrapper, БЕЗ BEM-класса
    <div className="ta-calc-saved-card__name">{ex.name}</div>
    <div className="ta-calc-saved-card__meta">…</div>
  </div>
  <div className="ta-calc-saved-card__actions">
    <span className="ta-calc-saved-card__one-rm">{saved.oneRM} кг</span>
    <Button size="sm" variant="danger" aria-label={`Удалить ${ex.name}`} onClick={stopPropagation → handleDelete}>
      <span aria-hidden="true">×</span>
    </Button>
  </div>
</div>
```

**Grid cells (desktop):**

| Grid area       | Содержимое       | DOM                                                     |
| --------------- | ---------------- | ------------------------------------------------------- |
| Column 1 `1fr`  | Primary block    | anonymous `<div>` → `__name` + `__meta`                 |
| Column 2 `auto` | Metrics + action | `__actions` → `__one-rm` + `<button.btn-sm.btn-danger>` |

`isActive` = `activeResult?.exerciseKey === saved.exerciseKey` → класс `.is-active` + `aria-current="true"`.

**Фильтр:** если `EXERCISES[saved.exerciseKey]` отсутствует → `return null` (строка не рендерится).

---

## 3. React: props, handlers, условия рендера

### 3.1 Props `CalculatorTab`

| Prop                | Тип                              | Роль для секции 03                          |
| ------------------- | -------------------------------- | ------------------------------------------- |
| `userData`          | `UserData`                       | `userData.exercises` — источник списка      |
| `activeResult`      | `SavedExercise \| null`          | синхронизация `.is-active` / `aria-current` |
| `handleSelectSaved` | `(saved: SavedExercise) => void` | клик / Enter / Space на row                 |
| `handleDelete`      | `(key: string) => void`          | delete button                               |

### 3.2 Handler semantics (`useCalculatorState`)

| Handler                    | Поведение                                                                  | Побочные эффекты                                                                                         |
| -------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `handleSelectSaved(saved)` | `setActiveResult(saved)`, `setSelectedExercise(saved.exerciseKey)`         | Секция 02 появляется/обновляется; `useEffect` в CalculatorTab scroll к `resultRef` при смене `activeKey` |
| `handleDelete(key)`        | filter exercises; `saveUser`; если удалён active → `setActiveResult(null)` | Секция 03 исчезает при `length === 0`; секция 02 скрывается без active                                   |

**Select row не вызывает** `stopPropagation` на card — только delete останавливает всплытие.

### 3.3 Условие видимости секции

```tsx
{userData.exercises.length > 0 && (
  <SectionBlock num="03" …>
```

**Empty state = отсутствие всей секции.** Нет placeholder «Нет сохранённых», нет zero-state card внутри list.

---

## 4. SectionBlock shell (03) — все классы и CSS

### 4.1 Pill `03` (Theory editorial)

Базовые правила `.ta-section-pill` (L370–384):

| Property         | Value                                               |
| ---------------- | --------------------------------------------------- |
| `display`        | `inline-flex`                                       |
| `align-items`    | `center`                                            |
| `gap`            | `8px`                                               |
| `align-self`     | `flex-start`                                        |
| `font-size`      | `12px`                                              |
| `font-weight`    | `600`                                               |
| `letter-spacing` | `0.22em`                                            |
| `text-transform` | `uppercase`                                         |
| `padding`        | `6px 12px` (+ calc override `padding-inline: 14px`) |
| `border-radius`  | `var(--ta-radius-pill)`                             |
| `background`     | `var(--ta-sec-tint, var(--ta-sec-01-tint))`         |
| `color`          | `var(--ta-sec, var(--ta-sec-01))`                   |
| `border`         | `1px solid currentColor`                            |
| `aria-hidden`    | `"true"` на `<span>`                                |

**Отличие от TestApproach (01):** секция 03 **не** использует quiet bordered pill `.calc-test-section .ta-calc-section__pill` — цветной Theory pill осознанно.

### 4.2 Title `h2`

| Property         | Source                                            |
| ---------------- | ------------------------------------------------- |
| `font-family`    | `var(--ta-display-font)`                          |
| `font-size`      | `32px` (`.ta-calc-section__title` дублирует base) |
| `font-weight`    | `600`                                             |
| `line-height`    | `1.05`                                            |
| `letter-spacing` | `0`                                               |
| `margin`         | `0`                                               |
| `color`          | `var(--ta-text)`                                  |

**Copy:** `` `Сохранённые (${userData.exercises.length}/${EX_COUNT})` `` — скобки `()`, слэш без пробелов: `8/12`.

### 4.3 Section container `.ta-shell .ta-calc-section`

| Property            | Desktop                                                         | Mobile `max-width: 760px` |
| ------------------- | --------------------------------------------------------------- | ------------------------- |
| `padding`           | `40px 28px`                                                     | `32px 20px`               |
| `scroll-margin-top` | `88px`                                                          | same                      |
| Separator           | `+ .ta-calc-section` → `border-top: 1px solid var(--ta-border)` | same                      |

### 4.4 Head / body

| Selector                  | Properties                                                          |
| ------------------------- | ------------------------------------------------------------------- |
| `.ta-calc-section__inner` | `max-width: 1140px`                                                 |
| `.ta-calc-section__head`  | `gap: 14px`; `margin-bottom: 28px` (22px @760px); `max-width: none` |
| `.ta-calc-section__body`  | `display: flex`; `flex-direction: column`; `gap: 20px`              |

---

## 5. List container `.ta-calc-saved-list`

**Файл:** `theory-apple.css` L3714–3717

| Property  | Value  | 4px scale                                   |
| --------- | ------ | ------------------------------------------- |
| `display` | `grid` | vertical stack rows                         |
| `gap`     | `10px` | ≈ 2.5×4px (допустимое отклонение в эталоне) |

**Не** `flex`, **не** `<ul>` — plain `div` list для простоты a11y (rows = `role="button"`).

---

## 6. Card `.ta-calc-saved-card` — grid, states, responsive

**Файл:** L3719–3749, L3776–3785, L3830–3837

### 6.1 Base layout (desktop)

| Property                | Value                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `display`               | `grid`                                                                                                  |
| `grid-template-columns` | `1fr auto`                                                                                              |
| `gap`                   | `12px`                                                                                                  |
| `align-items`           | `center`                                                                                                |
| `padding`               | `14px 16px`                                                                                             |
| `border-radius`         | `12px`                                                                                                  |
| `background`            | `var(--ta-calc-surface)` → alias `var(--ta-surface)`                                                    |
| `border`                | `1px solid var(--ta-calc-border)` (uniform all sides — no left rail)                                    |
| `color`                 | `var(--ta-text-muted)` (baseline на card; name overrides)                                               |
| `cursor`                | `pointer`                                                                                               |
| `transition`            | `transform`, `border-color`, `background` — each `var(--ta-duration-micro)` `var(--ta-ease-transition)` |

### 6.2 States (полная матрица)

| State           | Selector                | `background`                 | `border`                            | `transform`        | `outline` |
| --------------- | ----------------------- | ---------------------------- | ----------------------------------- | ------------------ | --------- |
| default         | `.ta-calc-saved-card`   | surface                      | `1px calc-border`                   | —                  | —         |
| hover           | `@media (hover: hover)` | unchanged                    | `var(--ta-border-strong)`           | `translateY(-2px)` | —         |
| focus-visible   | `:focus-visible`        | `var(--ta-calc-accent-tint)` | `1px var(--ta-calc-accent)` (full)  | —                  | `none`    |
| active/selected | `.is-active`            | **same as focus-visible**    | `1px var(--ta-calc-accent)` (full)  | —                  | `none`    |

**Правило:** keyboard focus и selected row **визуально идентичны** — tint + orange **full perimeter** border. Never left-only rail.

### 6.3 Mobile `max-width: 600px`

| Property                | Value                                                                       |
| ----------------------- | --------------------------------------------------------------------------- |
| `grid-template-columns` | `1fr` (single column)                                                       |
| `align-items`           | `start`                                                                     |
| `__actions`             | `justify-content: space-between` — 1RM слева, delete справа в нижней строке |

Mobile **не** складывает delete под name вертикально в узкой колонке — actions остаются **horizontal strip**.

---

## 7. Ячейки карточки: name, meta, actions, one-rm

### 7.1 `.ta-calc-saved-card__name` (L3751–3755)

| Property         | Value                          |
| ---------------- | ------------------------------ |
| `color`          | `var(--ta-text)`               |
| `font-weight`    | `600`                          |
| `letter-spacing` | `0`                            |
| Size             | inherit (~16px body контекста) |
| Case             | sentence case из `ex.name`     |

### 7.2 `.ta-calc-saved-card__meta` (L3757–3761)

| Property      | Value                  |
| ------------- | ---------------------- |
| `font-size`   | `12px`                 |
| `font-weight` | `400`                  |
| `color`       | `var(--ta-text-muted)` |
| `margin-top`  | `3px`                  |

**Шаблон copy (канон):**

```
{testWeight} кг × {testReps} повт · {date}
```

- Separator: middle dot `·` (U+00B7)
- «повт», не «повторений»
- `date` — as stored, без reformat в UI

### 7.3 `.ta-calc-saved-card__actions` (L3763–3767)

| Property      | Value    |
| ------------- | -------- |
| `display`     | `flex`   |
| `align-items` | `center` |
| `gap`         | `10px`   |

### 7.4 `.ta-calc-saved-card__one-rm` (L3769–3774) — hero metric

| Property               | Value                                                    |
| ---------------------- | -------------------------------------------------------- |
| `color`                | `var(--ta-calc-accent)` → `var(--ta-sec-01)` Peak orange |
| `font-size`            | `16px`                                                   |
| `font-weight`          | `600`                                                    |
| `font-variant-numeric` | `tabular-nums`                                           |
| Content                | `{saved.oneRM} кг` — integer + пробел + « кг»            |

**Accent rule:** orange **только** на 1ПМ; name/meta/delete **без** accent color.

---

## 8. Delete: Button + scoped `.btn-sm`

### 8.1 React

```tsx
<Button
  size="sm"
  variant="danger"
  aria-label={`Удалить ${ex.name}`}
  onClick={e => {
    e.stopPropagation();
    handleDelete(saved.exerciseKey);
  }}>
  <span aria-hidden="true">×</span>
</Button>
```

### 8.2 Global `.btn-danger` (`buttons.css`)

| Property               | Value                                               |
| ---------------------- | --------------------------------------------------- |
| `background`           | `transparent`                                       |
| `color`                | `var(--red)`                                        |
| `border`               | `1px solid #3a1a1a`                                 |
| hover (fine pointer)   | `border-color: var(--red)`                          |
| focus-visible (global) | box-shadow ring red — **перекрывается** scoped rule |

### 8.3 Scoped `.ta-shell .ta-calc-saved-card__actions .btn-sm` (L3815–3828)

| Property                          | Value                                                             | Зачем                           |
| --------------------------------- | ----------------------------------------------------------------- | ------------------------------- |
| `min-width`                       | `44px`                                                            | iOS HIG touch target            |
| `min-height`                      | `44px`                                                            | same                            |
| `padding`                         | `0 12px`                                                          | square-ish hit area             |
| `display`                         | `inline-flex`                                                     | center glyph                    |
| `align-items` / `justify-content` | `center`                                                          |                                 |
| `font-size`                       | `16px`                                                            | glyph × readable                |
| `line-height`                     | `1`                                                               |                                 |
| `:focus-visible`                  | `outline: 2px solid var(--ta-calc-accent)`; `outline-offset: 2px` | calc accent ring, не red global |

Global `.btn-sm`: `min-height: 36px`, `font-size: 12px`, UPPERCASE — **переопределено** в saved actions.

`:active` → global `transform: scale(0.97)` (unless reduced-motion).

---

## 9. Counter `(N/M)` и empty state

| Symbol                  | Источник                       | Смысл                                                       |
| ----------------------- | ------------------------------ | ----------------------------------------------------------- |
| **N**                   | `userData.exercises.length`    | сколько упражнений сохранено                                |
| **M**                   | `EX_COUNT` (= 12, Program 2.0) | слоты программы                                             |
| Format web              | `Сохранённые (8/12)`           | в `title` prop SectionBlock                                 |
| Tab meta (другое место) | `TabNav`                       | `savedCount/EX_COUNT` на вкладке — не дублировать в pill 03 |

**MUST NOT:** counter в pill `03` или отдельном badge — только в `h2` title.

**Empty:** `length === 0` → секция не в DOM; при удалении последнего — секция исчезает без toast / aria-live.

---

## 10. Motion, stagger, reduced-motion

### 10.1 Card micro-interactions

| Interaction       | Duration                      | Easing                 |
| ----------------- | ----------------------------- | ---------------------- |
| hover lift        | `--ta-duration-micro` (200ms) | `--ta-ease-transition` |
| border/background | same                          | same                   |

### 10.2 Stagger on list children (L3791–3811)

```css
.ta-shell .ta-calc-saved-list > * {
  animation: ta-stack-in var(--ta-duration-component, 400ms) var(--ta-ease) both;
}
```

| Child | `animation-delay` |
| ----- | ----------------- |
| 1     | `60ms`            |
| 2     | `120ms`           |
| 3     | `180ms`           |
| 4     | `240ms`           |
| 5     | `300ms`           |
| 6+    | `360ms` (cap)     |

**Keyframe `ta-stack-in` (L2891–2899):** `opacity 0→1`, `translateY(18px)→0`.

**Ограничение (комментарий в CSS):** stagger только при **первом** mount; карточки, добавленные позже, появляются **без** анимации.

### 10.3 `prefers-reduced-motion: reduce` (L3830–3837)

| Target                    | Override                                                    |
| ------------------------- | ----------------------------------------------------------- |
| `.ta-calc-saved-card`     | `transition: none !important`; `transform: none !important` |
| `.ta-calc-saved-list > *` | `animation: none !important`                                |
| hover lift                | suppressed via transform none                               |

---

## 11. Accessibility

| Паттерн               | Реализация                                                | Статус                                  |
| --------------------- | --------------------------------------------------------- | --------------------------------------- |
| Section heading       | `<h2 class="ta-section-title">`                           | ✅                                      |
| Pill decorative       | `aria-hidden="true"`                                      | ✅                                      |
| Row activation        | `role="button"`, `tabIndex={0}`, Enter/Space              | ✅                                      |
| Selected row          | `aria-current="true"` when `.is-active`                   | ✅                                      |
| Delete                | `aria-label="Удалить {name}"`; glyph `aria-hidden`        | ✅                                      |
| Focus card            | `:focus-visible` tint + full perimeter accent border      | ✅                                      |
| Focus delete          | scoped outline accent 2px + offset 2px                    | ✅                                      |
| Touch targets         | delete 44×44; row height ≈ padding 14×2 + content ≥ ~52px | ✅                                      |
| Nested interactive    | card `role="button"` + inner `<button>`                   | ⚠️ тестировать tab order (row → delete) |
| Live region on delete | нет                                                       | gap minor — silent removal by design    |
| `titleId` / skip link | не задан на 03                                            | gap minor                               |

**Tab order:** card (focusable) → delete button внутри row — два stop на строку допустимы при `stopPropagation` на delete.

---

## 12. Copy patterns

| Тип           | Пример                         | Правило                          |
| ------------- | ------------------------------ | -------------------------------- |
| Section title | «Сохранённые (8/12)»           | sentence case; counter в скобках |
| Name          | «Жим лёжа»                     | `EXERCISES[key].name`            |
| Meta          | «120 кг × 5 повт · 24.05.2026» | шаблон фиксированный             |
| 1RM           | «137 кг»                       | integer + « кг»                  |
| Delete aria   | «Удалить Жим лёжа»             | глагол + имя                     |
| Empty         | (секция скрыта)                | без «Нет сохранённых»            |

Tone: factual; без «1ПМ» в label если значение self-evident через orange metric.

---

## 13. MUST / SHOULD / MUST NOT (journal, training, reuse)

### 13.1 MUST (любой `.ta-shell` selectable list)

- [ ] `SectionBlock variant="apple"` + numbered pill + title с **semantic counter** `(done/total)` если применимо
- [ ] List wrapper: vertical grid/flex, gap **8–12px**
- [ ] Row: `--ta-calc-surface` + `--ta-calc-border`, radius **12px**, padding **14px 16px**
- [ ] Desktop grid **`1fr auto`**: primary left, metrics+actions right
- [ ] **Один** hero metric с `var(--ta-calc-accent)` на row
- [ ] Secondary meta **12px** `var(--ta-text-muted)` под title
- [ ] Active: `--ta-calc-accent-tint` + full `border-color: --ta-calc-accent`
- [ ] Destructive: `Button danger sm`, `aria-label` с именем сущности, `stopPropagation`
- [ ] Delete/control **≥44×44px** на touch
- [ ] `:focus-visible`, `@media (hover: hover)`, `prefers-reduced-motion`
- [ ] Tokens `var(--ta-calc-*)` / `var(--ta-text*)` — **no raw hex in TSX**

### 13.2 SHOULD

- [ ] Hover `translateY(-2px)` только `@media (hover: hover)`
- [ ] Stagger `ta-stack-in` 60ms steps, cap 360ms (≤12 items)
- [ ] `tabular-nums` на числовых метриках
- [ ] Скрывать секцию при пустом списке (или empty **вне** row pattern)
- [ ] Вынести `SavedExerciseRow` при 2+ экранах с идентичной разметкой

### 13.3 MUST NOT

- [ ] Orange на name/meta/delete (только hero metric)
- [ ] `×` без `aria-label`
- [ ] Delete без `stopPropagation` на row click handler
- [ ] ALL CAPS в row titles (только editorial pills)
- [ ] Toast при delete
- [ ] Animate width/height/margin при reorder

### 13.4 Journal / Training mapping

| Saved exercises (эталон) | Journal session row      | Training day row      |
| ------------------------ | ------------------------ | --------------------- |
| `ex.name`                | session / exercise title | day name / «День N»   |
| meta: test × reps · date | sets × reps · date       | week · muscle groups  |
| `oneRM` accent           | tonnage / e1RM           | completion % / volume |
| delete ×                 | delete entry             | remove from plan      |
| `.is-active`             | editing session          | active day            |

Reuse `.ta-calc-saved-*` или extracted `calc-saved-list.css` — не ad hoc `.journal-row` без связи с эталоном.

---

## 14. Sibling comparison

| Критерий   | **CalculatorTab (эталон)**         | Mobile RN / macOS legacy |
| ---------- | ---------------------------------- | ------------------------ |
| 1RM accent | `--ta-calc-accent`                 | text/mono, no accent     |
| Active     | full perimeter accent + tint       | border only              |
| Delete     | 44×44 scoped                       | ActionButton varies      |
| Shell      | `SectionBlock apple` + Theory pill | plain / RN               |
| Title      | `(N/M)`                            | `· N/M`                  |
| Hover      | translateY -2px                    | opacity press            |
| Stagger    | ta-stack-in 60ms                   | none                     |
| CSS        | theory-apple L3711+                | StyleSheet / inline      |

**Соседи в Calculator tab:** 01 form (`calc-test-approach-standard.md`), 02 chart (`periodization-chart-standard.md`), 03 list (**этот файл**), 04 donut (`calculator-tab-standard.md` §04).

---

## 15. Чеклист для новых lists

- [ ] Прочитать этот файл + `calculator-tab-standard.md` §03 + section shell из `calc-test-approach-standard.md`
- [ ] Сверить title `(N/M)` и meta template с доменом
- [ ] Tab: row → delete; Enter/Space select; 320px; delete 44px
- [ ] Active: tint + full perimeter accent border в dark shell
- [ ] `prefers-reduced-motion`: no lift, no stagger
- [ ] Превью: MCP `cursor-ide-browser` @ `http://localhost:5173` → Calculator → сохранить ≥1 упражнение
- [ ] При изменении паттерна — обновить этот reference + `activeContext.md` + `README.md`

---

## Связанные артефакты Memory Bank

- Umbrella: `memory-bank/reference/calculator-tab-standard.md` (§ Program 2.0 — секция 03)
- Form sibling: `memory-bank/reference/calc-test-approach-standard.md`
- Chart sibling: `memory-bank/reference/periodization-chart-standard.md`
- Picker: `memory-bank/reference/calc-exercise-select-standard.md`
- Style summary: `memory-bank/style-guide.md`
- Design canon: `memory-bank/activeContext.md`
- Patterns table: `memory-bank/systemPatterns.md`
- Theory tokens: `.cursor/rules/theory-design-reference.mdc`, `useTheoryDesign.ts`


## `memory-bank/reference/calc-test-approach-standard.md`

# Эталон: TestApproachSection (`.calc-test-section`)

> **Статус:** канонический reference implementation для **форм ввода калькулятора** (Program 2.0) — секция «01 Тестовый подход».  
> **Дата фиксации:** 2026-05-25  
> **Не модифицировать** без явной задачи; новые calculator/training forms — наследовать паттерны отсюда.

## Карта файлов

| Слой                | Путь                                                            | Символы / классы                                                                  |
| ------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Section shell       | `src/components/SectionBlock.tsx`                               | `variant="apple"` → `.ta-section.ta-calc-section` + scroll reveal                 |
| Form orchestrator   | `src/components/calculator/TestApproachSection.tsx`             | `TestApproachSection`, `TestApproachFootnote`, `<form class="calc-test">`         |
| Metrics fields      | `src/components/calculator/TestApproachMetrics.tsx`             | `PremiumInput variant="stepper"` для веса/повторов                                |
| Exercise picker     | `src/components/calculator/ExercisePicker.tsx`                  | `.ew-select`, `.ew-trigger`, `.ew-menu-panel` (см. calc-exercise-select-standard) |
| Program 2.0 adapter | `src/components/ExerciseWheel.tsx`                              | thin wrapper → ExercisePicker + WHEEL_ORDER                                       |
| Input primitive     | `src/components/ui/PremiumInput.tsx`                            | `PremiumInput`, `PremiumStepper`                                                  |
| **Стили эталона**   | `src/styles/components/calculator/calc-test-approach.css`       | `.calc-test-section`, `.calc-test`, `.calc-test__*`                               |
| Shared inputs       | `src/styles/components/shared/stepper.css`, `premium-input.css` | базовые `.pi-*` (переопределяются в calc-test)                                    |
| Exercise dropdown   | `src/styles/components/calculator/exercise-select.css`          | `.ew-*` (trigger/menu; calc-test локально переопределяет trigger)                 |
| Section rhythm      | `src/styles/components/theory-apple.css` L2944+                 | `.ta-shell .ta-calc-section`, `.ta-calc-note`                                     |
| Theory tokens       | `src/styles/components/theory-apple.css` L57–62                 | `--ta-calc-accent`, `--ta-calc-surface`, `--ta-calc-border`                       |
| Parent              | `src/screens/CalculatorTab.tsx`                                 | первый блок в `.ta-stack--calc` внутри `.ta-shell`                                |

**Sibling (не эталон):** legacy `.ta-calc-form` в `theory-apple.css` L2994–3200 — старый grid-layout с ALL CAPS labels, крупными stepper-кнопками (68px) и отдельными rounded controls. **Не использовать** для новых форм.

---

## 1. Архитектура (тонкий UI)

```
CalculatorTab (state: exercise, weights, reps, keyboard inset)
        │
        ▼
TestApproachSection ──► SectionBlock num="01" variant="apple"
        │
        ├── form.calc-test[--pullup?]
        │     ├── exercise: label + ExerciseWheel
        │     ├── TestApproachMetrics (PremiumInput steppers)
        │     └── calc-test__action (submit + kbd hint)
        └── NoteBox variant="apple" → footnote (domain copy)
```

- **SectionBlock** — нумерация, заголовок, scroll-reveal; без бизнес-логики.
- **TestApproachMetrics** — только mapping полей (pullup vs barbell); без submit/validation UI.
- **CSS scope** — все overrides под `.calc-test-section` / `.calc-test`, не глобально на `.ta-calc-form`.

### Props surface

```ts
interface TestApproachSectionProps {
  userData: UserData;
  selectedExercise: string;
  selectExercise: (key: string) => void;
  testWeight / testBodyWeight / testExtraWeight / testReps: string + setters;
  keyboardInsetPx: number;  // --calc-test-keyboard-inset для iOS keyboard
  onCalculate: () => void;
}
```

Форма: `noValidate`, submit через `preventDefault` + `onCalculate`. Enter на любом поле → submit (native form behavior).

---

## 2. Визуальная система

### 2.1 Локальные CSS-алиасы (section scope)

На `.calc-test-section.ta-calc-section` объявлены semantic aliases — **не raw hex в TSX**:

| Alias                | Источник                         | Назначение                          |
| -------------------- | -------------------------------- | ----------------------------------- |
| `--text-primary`     | `var(--ta-text, #f3efe6)`        | Заголовок, значения input           |
| `--text-secondary`   | `var(--ta-text-muted, #99a1ad)`  | Labels, meta, footnote, placeholder |
| `--color-accent`     | `var(--ta-calc-accent, #007aff)` | CTA, focus ring, hover tint         |
| `--surface-elevated` | `var(--ta-surface-2, #1c222c)`   | Trigger, stepper, kbd chip          |
| `--border-subtle`    | `var(--ta-border, #232934)`      | Borders controls                    |
| `--shadow-elevated`  | layered inset + drop             | Карточность полей (не декор)        |

Accent калькулятора: `--ta-calc-accent: var(--ta-sec-01)` (#ff9f40 Peak orange в Theory palette) — **один акцент** на CTA и focus.

### 2.2 Typography scale (этalon vs legacy form)

| Элемент             | TestApproach (эталон)                    | Legacy `.ta-calc-form` (не эталон)      |
| ------------------- | ---------------------------------------- | --------------------------------------- |
| Section title       | `clamp(1.25rem, 3.5vw, 1.5rem)` / 600    | 32px fixed                              |
| Section pill `01`   | 12px / 600, **sentence**, bordered muted | 12px ALL CAPS, colored tint pill        |
| Field label         | 14px / 500, sentence, secondary          | 12px ALL CAPS, `letter-spacing: 0.16em` |
| Input value         | 20px (1.25rem) / 600, tabular-nums       | 32px                                    |
| Unit suffix         | 12px / 500, sentence                     | 12px uppercase                          |
| Trigger name        | 16px / 500                               | 16px                                    |
| Trigger meta (type) | 14px secondary                           | 12px dim                                |
| CTA                 | 16px / 600                               | inherited large                         |
| Footnote            | 14px / 1.5, lead 600 primary             | `.ta-calc-note` 14px                    |

**Правило:** labels — **sentence case**, без tracking на labels; tracking только у Theory editorial (не у calculator forms).

### 2.3 Spacing (4px scale)

| Token / gap        | px equivalent       | Где                                  |
| ------------------ | ------------------- | ------------------------------------ |
| Section padding    | clamp 24–32 / 16–28 | `.calc-test-section` outer           |
| Head gap           | 12px                | pill ↔ title                         |
| Head margin-bottom | 20px                | header ↔ body                        |
| Form stack gap     | 16px                | `.calc-test` flex column             |
| Label → control    | 8px                 | `.calc-test__label`, `.pi-group` gap |
| Metrics grid gap   | 12px                | `.calc-test__metrics`                |
| Action top pad     | 16px (+4 margin)    | border-top divider before CTA        |
| Note padding       | 14px 16px           | `.ta-calc-note` override in section  |

### 2.4 Radius & borders

| Surface          | Radius | Border                                       |
| ---------------- | ------ | -------------------------------------------- |
| Section pill     | 8px    | 1px `--border-subtle`                        |
| ew-trigger       | 12px   | 1px + `--shadow-elevated`                    |
| pi-stepper shell | 12px   | 1px unified container (buttons flush inside) |
| CTA button       | 12px   | none (filled accent)                         |
| kbd hint         | 6px    | 1px subtle                                   |
| Note box         | 12px   | 1px, flat shadow (no layered card shadow)    |

**Nested radius rule:** stepper inner `.pi-wrapper--stepper` — `border-radius: 0` внутри 12px shell; кнопки ± без скругления, только dividers.

### 2.5 Shadows

- **Fields (trigger, stepper):** inset highlight 4% white + drop `0 8px 24px -12px` 48% black — сигнал elevation, не decoration.
- **CTA:** inset 14% white + subtle drop + **accent-tinted** glow `color-mix(accent 42%)`.
- **Hover CTA:** усиленный glow 48%, без transform на hover (только color/shadow).
- **Active CTA:** `scale(0.98)` + inset pressed shadow.
- **Note:** `box-shadow: none` — footnote тише полей ввода.

### 2.6 Motion

| Interaction        | Duration                                                       | Easing                                     |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------ |
| Border/color hover | 200ms                                                          | `cubic-bezier(0.4, 0, 0.2, 1)`             |
| Press scale        | 150ms                                                          | `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out) |
| Dropdown panel     | shared `--duration-short` / `--ease-out` (exercise-select.css) |

`@media (prefers-reduced-motion: reduce)` в calc-test-approach.css: transitions off, CTA active без scale.

Dropdown options: stagger 24ms+ на `.ew-option` (exercise-select.css) — **не дублировать** в calc-test.

---

## 3. Layout

### 3.1 Section frame

```html
<section class="ta-section ta-calc-section reveal-section calc-test-section">
  <div class="ta-section-inner ta-calc-section__inner">
    <header class="ta-section-head ta-calc-section__head">
      <span class="ta-section-pill ta-calc-section__pill" aria-hidden="true">01</span>
      <h2 id="calc-test-heading" class="ta-section-title ta-calc-section__title">
        Тестовый подход
      </h2>
    </header>
    <div class="ta-calc-section__body">…</div>
  </div>
</section>
```

- Pill **aria-hidden** — номер декоративен; смысл в `<h2 id="calc-test-heading">`.
- `titleId="calc-test-heading"` — якорь для in-page nav / a11y.

**Override vs base `.ta-section-pill`:** эталон заменяет colored uppercase Theory pill на **quiet numbered badge** (bordered, muted) — меньше визуального шума в рабочей форме.

### 3.2 Form grid (container queries)

Контейнер: `.calc-test { container-name: calc-test; container-type: inline-size; }`.

| Breakpoint (container) | Layout                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| default / ≤22rem       | metrics **1 col**; CTA full width                                                              |
| ≥36rem (576px)         | metrics **2 col** (weight + reps); pullup **3 col**; CTA centered max 22rem + kbd hint visible |
| ≥48rem (768px)         | CTA max-width 24rem, min-width 12.5rem                                                         |

Wide non-pullup grid: `minmax(0,1fr) minmax(0,1fr) auto` — reps column может сжиматься (`auto`).

**Keyboard inset:** `--calc-test-keyboard-inset` из `useKeyboardAvoid` → `padding-bottom` на form — контент не прячется под iOS keyboard.

### 3.3 Field order

1. **Упражнение** — full width, always first (`calc-test__exercise`).
2. **Метрики** — weight (or body+extra for pullup) + reps.
3. **CTA** — отделён `border-top` divider (visual «commit zone»).
4. **Footnote** — вне `<form>`, в `NoteBox` ниже.

### 3.4 CTA placement pattern

```html
<div class="calc-test__action" role="group" aria-label="Расчёт результата">
  <div class="calc-test__action-inner">
    <button type="submit" class="calc-test__submit">Рассчитать</button>
    <span class="calc-test__action-hint" aria-hidden="true"><kbd>↵</kbd></span>
  </div>
</div>
```

- Mobile: CTA `flex: 1`, full width, hint hidden.
- Desktop (container ≥36rem): centered cluster, hint `↵` as quiet affordance (decorative, `aria-hidden`).
- Min height CTA: **48px** (3rem) — touch target.

---

## 4. Component states

### 4.1 Exercise dropdown (`.ew-trigger`)

| State         | Visual                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| default       | elevated surface, subtle border, layered shadow                                                                           |
| hover (fine)  | border `color-mix(accent 35%, border)`                                                                                    |
| active        | opacity 0.88, `scale(0.99)`                                                                                               |
| focus-visible | 2px outline accent, offset 2px                                                                                            |
| open          | `aria-expanded=true`; icon `.ew-trigger-icon.is-open` rotate 180°; menu `.ew-menu-panel.is-open` grid expand + fade/slide |

Menu: `role="listbox"`, options `role="option"`, Escape closes + focus return to trigger.

calc-test **не переопределяет** open menu styles — наследует `exercise-select.css` внутри `.ta-shell`.

### 4.2 Stepper (`.pi-stepper`)

| State             | Visual                                                                           |
| ----------------- | -------------------------------------------------------------------------------- |
| default           | unified 12px bordered box, ± buttons 44×44px, vertical dividers                  |
| focus-within      | border accent 55%; outer glow `0 0 0 3px accent 24%` (на **shell**, не на input) |
| btn hover         | bg accent 8%                                                                     |
| btn active        | opacity 0.75, bg accent 12%                                                      |
| btn focus-visible | 2px outline accent, offset -2px, z-index 1                                       |
| btn disabled      | opacity 0.4, not-allowed                                                         |
| input             | center aligned, no own outline (focus ring on container)                         |
| selection         | accent tint 32%                                                                  |

**Отличие от legacy:** focus ring на **весь stepper**, не на inner wrapper с transform — стабильный layout, нет CLS.

Step size: `config.step` для kg fields, `1` для reps. Hold-to-repeat via `useStepperHold`.

### 4.3 Submit button

| State         | Visual                                                           |
| ------------- | ---------------------------------------------------------------- |
| default       | filled `--color-accent`, text on `--ta-bg`, accent glow shadow   |
| hover         | accent lightened 8% white mix, stronger shadow                   |
| active        | scale 0.98, inset shadow                                         |
| focus-visible | double ring: 2px bg + 4px accent 72% + glow (no default outline) |
| disabled      | opacity 0.45, no shadow/transform                                |

### 4.4 Note / footnote

- Note surface: 80% mix elevated, flat — **secondary** to inputs.
- Footnote lead (`calc-test__footnote-lead`): semibold primary — «Как считать.» / «Подтягивания.»
- Body: secondary 14px, line-height 1.5.

---

## 5. Accessibility

| Паттерн             | Реализация                                                                   |
| ------------------- | ---------------------------------------------------------------------------- |
| Section heading     | `<h2 id="calc-test-heading">`                                                |
| Exercise label      | `<label htmlFor="calc-exercise-trigger">` + wrapper `#calc-exercise-trigger` |
| Dropdown            | `aria-haspopup`, `aria-expanded`, `aria-controls`, listbox semantics         |
| Stepper buttons     | `aria-label` «Уменьшить/Увеличить {label}» (PremiumStepper)                  |
| Units               | `aria-hidden="true"` on `.pi-unit` (value + label sufficient)                |
| CTA group           | `role="group" aria-label="Расчёт результата"`                                |
| Enter shortcut hint | decorative kbd, `aria-hidden="true"`                                         |
| Focus               | `:focus-visible` everywhere; no `:focus` outline on click-only               |
| Touch targets       | min 44px trigger/stepper btn; CTA 48px                                       |
| Motion              | CSS `prefers-reduced-motion` in calc-test-approach.css                       |
| Keyboard submit     | native `<form>` + `type="submit"`                                            |
| Pill number         | `aria-hidden="true"` on section pill                                         |

**Gap (minor):** `<label htmlFor="calc-exercise-trigger">` указывает на `<div id=…>`, не на `<button>` — работает как click target proxy, но ideal = `htmlFor` на trigger ref/id кнопки.

---

## 6. Copy patterns

| Тип              | Пример                              | Правило                                               |
| ---------------- | ----------------------------------- | ----------------------------------------------------- |
| Section title    | «Тестовый подход»                   | sentence case, без номера в тексте (номер в pill)     |
| Field labels     | «Упражнение», «Вес», «Повторений»   | коротко, sentence, без единиц в label (unit отдельно) |
| Pullup labels    | «Вес тела», «Доп. вес»              | domain-specific split                                 |
| Placeholders     | «80», «0», «6»                      | format hint, не label                                 |
| CTA              | «Рассчитать»                        | глагол, не «Submit»                                   |
| Footnote lead    | «Как считать.» / «Подтягивания.»    | bold lead + explanation                               |
| Footnote body    | «Отказ на 4–8 повторений → 1ПМ…»    | стрелка → для causal chain; без «!!!»                 |
| Dropdown title   | «Выбери упражнение» (ExerciseWheel) | imperative, friendly                                  |
| aria (CTA group) | «Рассчёт результата»                | describes action zone                                 |

**Tone:** quiet, instructional, no congratulations. Domain terms: 1ПМ, отказ, ассист (pullup).

---

## 7. Почему это gold standard vs другие секции

| Критерий               | **TestApproachSection** (эталон)      | Legacy `.ta-calc-form` / другие секции |
| ---------------------- | ------------------------------------- | -------------------------------------- |
| CSS ownership          | Dedicated `calc-test-approach.css`    | Monolith rules in theory-apple.css     |
| Label typography       | 14px sentence, readable               | 12px ALL CAPS editorial                |
| Control density        | 44px targets, compact                 | 68–72px oversized steppers             |
| Stepper UX             | Unified bordered control              | Separated rounded +/- chips            |
| Focus model            | Container focus-within glow           | Per-wrapper transform/focus            |
| Layout                 | `@container calc-test` responsive     | `@container calc-form` (unused in TSX) |
| Section badge          | Quiet numbered pill                   | Theory colored uppercase pill          |
| CTA                    | Divider + centered desktop + kbd hint | Inline grid cell, no hint              |
| Footnote               | Contextual pullup vs barbell copy     | Generic note only                      |
| Motion discipline      | reduced-motion block in file          | partial                                |
| Separation form / help | `<form>` + NoteBox outside            | often mixed                            |

**PeriodizationChart (секция 02)** — эталон **visualization**; **TestApproachSection** — эталон **data entry form**. Вместе задают Calculator tab: ввод → результат.

---

## 8. Правила применения к новым формам

### 8.1 MUST

- [ ] `SectionBlock variant="apple"` + `num` pill + `titleId` на heading
- [ ] Scope styles: `.your-section.calc-test-section` pattern или extend `.calc-test` BEM
- [ ] Локальные aliases `--text-primary`, `--color-accent` → `--ta-calc-*`
- [ ] Labels 14px/500 sentence; values 20px/600 tabular-nums
- [ ] Controls: 12px radius, `--shadow-elevated`, min-height 44px
- [ ] `PremiumInput variant="stepper"` для numeric gym fields
- [ ] CTA: full-width mobile, centered desktop, `border-top` separator before action
- [ ] Footnote / helper в `NoteBox variant="apple"` **под** формой
- [ ] `@container` для responsive grid, не только viewport media queries
- [ ] `:focus-visible`, `@media (hover: hover)`, `prefers-reduced-motion`
- [ ] Copy на русском, sentence case

### 8.2 SHOULD

- [ ] Keyboard inset CSS var для mobile forms
- [ ] Decorative shortcut hint (`↵`) only desktop, `aria-hidden`
- [ ] Pullup / variant branching via BEM modifier (`calc-test--pullup`)
- [ ] Split metrics into subcomponent ≤90 lines

### 8.3 MUST NOT

- [ ] Raw hex в компонентах
- [ ] ALL CAPS field labels в calculator forms
- [ ] Legacy `.ta-calc-form` classes для нового UI
- [ ] Toast для validation errors (inline near field — будущий паттерн)
- [ ] Disabled CTA while invalid without explanation
- [ ] Animating width/height/margin

---

## 9. DOM reference (compact)

```
section.ta-section.ta-calc-section.calc-test-section
└── div.ta-calc-section__inner
    ├── header.ta-calc-section__head
    │   ├── span.ta-calc-section__pill → "01"
    │   └── h2#calc-test-heading → "Тестовый подход"
    └── div.ta-calc-section__body
        ├── form.calc-test[.calc-test--pullup]
        │   ├── div.calc-test__exercise → label + ExerciseWheel
        │   ├── div.calc-test__metrics → PremiumInput×N
        │   └── div.calc-test__action → Button.submit + kbd hint
        └── div.ta-calc-note → p.calc-test__footnote
```

---

## 10. Чеклист для новых calculator/training forms

- [ ] Прочитать этот файл + `periodization-chart-standard.md` (если рядом chart)
- [ ] Скопировать structure из `TestApproachSection.tsx`, не из legacy markup
- [ ] Стили: новый file в `src/styles/components/calculator/` или extend calc-test BEM
- [ ] Container name уникален или reuse `calc-test` если layout идентичен
- [ ] Verify: keyboard tab order, Enter submit, 320px width, dark shell contrast
- [ ] Update this reference if pattern evolves

---

## Связанные артефакты Memory Bank

- Theory tokens: `.cursor/rules/theory-design-reference.mdc`, `useTheoryDesign.ts`
- Style summary: `memory-bank/style-guide.md`
- Chart sibling standard: `memory-bank/reference/periodization-chart-standard.md`
- Design canon table: `memory-bank/activeContext.md`
- System patterns table: `memory-bank/systemPatterns.md`


## `memory-bank/reference/calculator-tab-standard.md`

# Эталон: вкладка «Калькулятор» (Calculator tab)

> **Статус:** канонический **umbrella reference** для всей вкладки «Калькулятор» — от preset picker до секции 04.  
> **Дата фиксации:** 2026-05-27  
> **Не модифицировать** без явной задачи; любые правки Calculator tab — сверяться с этим документом **и** с дочерними partial standards.

## Назначение

Единая карта **всех UI-блоков** вкладки «Калькулятор» в web (`src/`), для **обоих** треков прогрессии:

| Preset (UI)     | `progressionPreset` | `activeProgram` | Экран тела таба   |
| --------------- | ------------------- | --------------- | ----------------- |
| **Оптимальная** | `general`           | `2.0`           | `CalculatorTab`   |
| **На силу**     | `strength`          | `3.0`           | `CalculatorTabV3` |

Связь preset ↔ program: `packages/shared/src/program/progressionPresets.ts` → `applyProgramSettingsPatch`.

---

## Дерево компонентов (полное)

```
AppShell (tab=calculator)
└── TabPanel
    ├── [L0] div.ta-shell.ta-shell--calc-settings
    │     └── ProgressionPresetPicker
    │           ├── program-settings (segmented: тип + дней/нед)
    │           └── ProgressionPreviewChart (demo, оба preset)
    │
    └── motion.div (AnimatePresence, key=calculator-body-{2.0|3.0})
          ├── activeProgram === '2.0' → CalculatorTab
          │     └── div.ta-shell
          │           ├── [L1] SceneHero (CALCULATOR / 1ПМ и прогрессия)
          │           └── div.ta-stack.ta-stack--calc
          │                 ├── [01] TestApproachSection      → calc-test-approach-standard.md
          │                 ├── [02] SectionBlock «Прогрессия» (if activeResult)
          │                 │     → calc-progression-result-standard.md (composite etalon)
          │                 │     ├── .insight
          │                 │     ├── ResultCard
          │                 │     ├── PlateDiagram (conditional)
          │                 │     ├── PeriodizationChart    → periodization-chart-standard.md
          │                 │     └── NoteBox (legend)
          │                 ├── [03] Saved exercises        → calc-saved-exercises-standard.md
          │                 └── [04] VolumeDonut
          │
          └── activeProgram === '3.0' → CalculatorTabV3
                └── div.ta-shell.program-v3-calculator
                      ├── [L1] SceneHero (Калькулятор / {programLabel})
                      └── div.ta-stack.ta-stack--calc
                            ├── [01] SectionBlock «Упражнение» (ExercisePicker)
                            ├── [02] SectionBlock «Черновой 1ПМ» (steppers + NoteBox)
                            └── [03] SectionBlock «Прогрессия» (ProgramV3ProgressChart + NoteBox)
```

**Файлы оркестрации:**

| Слой        | Путь                                                    |
| ----------- | ------------------------------------------------------- |
| Tab routing | `src/components/app/TabPanel.tsx`                       |
| Program 2.0 | `src/screens/CalculatorTab.tsx`                         |
| Program 3.0 | `src/screens/CalculatorTabV3.tsx`                       |
| Preset UI   | `src/components/calculator/ProgressionPresetPicker.tsx` |
| Demo chart  | `src/components/calculator/ProgressionPreviewChart.tsx` |
| Hero        | `src/components/ui/SceneHero.tsx`                       |
| Section     | `src/components/SectionBlock.tsx`                       |

---

## Общая визуальная система (`.ta-shell`)

### Namespace токенов

Объявлены на `.ta-shell` в `src/styles/components/theory-apple.css` L54–89:

| Token                   | Значение / роль                             |
| ----------------------- | ------------------------------------------- |
| `--ta-calc-accent`      | `var(--ta-sec-01)` — Peak orange (#ff9f40)  |
| `--ta-calc-accent-tint` | tint для active/focus rows                  |
| `--ta-calc-surface`     | фон карточек секций                         |
| `--ta-calc-border`      | границы controls/cards                      |
| `--ta-calc-shadow`      | layered shadow карточек                     |
| `--ta-display-font`     | заголовки hero + result                     |
| `--ta-duration-*`       | micro 200ms, component 400ms, section 500ms |
| `--plate-*`             | цвета блинов для PlateDiagram               |

**Правило:** в TSX — только `var(--ta-*)` / semantic aliases; hex — только в CSS root.

### Shell surface

- Фон: radial gradients (orange 10%, purple 8%) + linear `#0c0f15`
- Border: 1px `var(--ta-border)`, radius `var(--ta-radius-outer)`
- Shadow: layered drop + inset highlight
- `font-feature-settings: 'tnum'` — tabular nums глобально в shell

### Section rhythm (`.ta-calc-section` + `.ta-section-inner`)

| Token / rule               | Value                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| **Elevated surface**       | `.ta-section-inner.ta-calc-section__inner` only                                              |
| Outer `.ta-calc-section`   | transparent layout wrapper — **no** full-bleed tint/shadow                                   |
| `--section-elevation`      | `0 8px 24px rgba(0,0,0,0.2), 0 16px 48px rgba(0,0,0,0.3)` (gold: Theory `.ta-chapter-panel`) |
| Inner bg / border / radius | `--ta-surface` / `--ta-border` / `--ta-radius-card` (max-width **1140**)                     |
| Inner padding              | 40px 28px (32px 20px ≤760px)                                                                 |
| Section separator          | stack `gap` between cards — **not** `border-top`                                             |
| Head gap                   | 14px pill ↔ title                                                                            |
| Head margin-bottom         | 28px (22px mobile)                                                                           |
| Body stack gap             | 20px                                                                                         |
| scroll-margin-top          | 88px (якорь при scrollIntoView)                                                              |
| Title (default)            | 32px / 600 display                                                                           |

**Правило:** одна elevated-карточка на секцию (inner). Не дублировать shadow на `__body` / outer section.

**Два режима pill:**

| Контекст                           | Pill style                                              |
| ---------------------------------- | ------------------------------------------------------- |
| Form-секции (01 test, V3 sections) | Quiet bordered badge (calc-test / V3 override)          |
| Editorial list/chart (02–04)       | Theory colored UPPERCASE pill (base `.ta-section-pill`) |

---

## L0 — Settings bar (`ProgressionPresetPicker`)

**Где:** `TabPanel` — **над** телом таба, в `.ta-shell.ta-shell--calc-settings`.  
**CSS:** `src/styles/components/training/progression-controls.css` (Theory overrides L290+).

### Структура DOM

```html
<div class="progression-controls program-settings">
  <div class="program-settings__fields">
    <div class="program-settings__field">
      <!-- Тип прогрессии -->
      <span class="progression-controls__label program-settings__label">…</span>
      <div class="program-settings__control">
        <div class="progression-controls__segmented" role="group" aria-label="Тип прогрессии">
          <button class="progression-controls__option is-active" aria-pressed="true">
            Оптимальная
          </button>
          <button class="progression-controls__option" aria-pressed="false">На силу</button>
        </div>
        <p class="program-settings__hint">{PROGRESSION_PRESET_META.description}</p>
      </div>
    </div>
    <div class="program-settings__field">
      <!-- Дней в неделю: 3 | 4 -->
      …
    </div>
  </div>
  <section class="progression-preview ta-period">…ProgressionPreviewChart…</section>
</div>
```

### Типографика (scoped под `.ta-shell--calc-settings`)

| Элемент       | Size | Weight | Case / tracking        |
| ------------- | ---- | ------ | ---------------------- |
| Field label   | 14px | 500    | sentence, no tracking  |
| Option button | 14px | 600    | sentence               |
| Hint          | 14px | 400    | line-height 1.5, ≤52ch |

### Spacing & layout

| Token              | px                        |
| ------------------ | ------------------------- |
| Card padding       | clamp 16–20 / 16–24       |
| Card radius        | 16px                      |
| Card margin-bottom | 16px (`--space-4`)        |
| Field grid         | `minmax(108px,132px) 1fr` |
| Field gap          | 12px                      |
| Segmented gap      | 4px                       |
| Option min-height  | **44px**                  |
| Option radius      | 12px                      |

### States (segmented option)

| State         | Visual                                              |
| ------------- | --------------------------------------------------- |
| default       | `--surface-elevated`, border subtle, layered shadow |
| hover (fine)  | border accent 35% mix                               |
| active        | opacity 0.88, scale 0.99                            |
| `.is-active`  | bg accent 14%, border accent 50%                    |
| focus-visible | double ring: 2px bg + 4px accent 72%                |

### a11y

- `role="group"` + `aria-label` на каждой segmented group
- `aria-pressed` на option buttons
- `title={description}` на preset buttons (native tooltip)
- Hint — visible text, не единственный носитель смысла

### Copy (канон)

| Preset   | Label       | Description (hint)                         |
| -------- | ----------- | ------------------------------------------ |
| general  | Оптимальная | 8-недельная волна % по упражнениям         |
| strength | На силу     | 16 недель, Brzycki и тестовые недели       |
| days     | `{N} дня`   | 3 ↔ general, 4 ↔ strength (auto via patch) |

### MUST / SHOULD

- **MUST** scoped overrides только под `.ta-shell--calc-settings`
- **MUST** min-height 44px на preset/days buttons
- **MUST** переключение preset → `applyProgramSettingsPatch` (синхрон program + days)
- **SHOULD** hint под active preset, max-width ~52ch
- **MUST NOT** ALL CAPS labels в calc-settings (override base progression-controls)

---

## L0b — `ProgressionPreviewChart` (demo под picker)

**Sibling etalon** к `PeriodizationChart` — полная спецификация dual-axis в `periodization-chart-standard.md` §7.

### Кратко

| Аспект      | Preview (demo)                      | PeriodizationChart (персональный) |
| ----------- | ----------------------------------- | --------------------------------- |
| Данные      | Demo squat 1ПМ 100 кг               | User `oneRM` + exercise           |
| Левая ось   | **кг**                              | **%**                             |
| Недели      | 8 (general) / 13 visible (strength) | 8 из config                       |
| Test weeks  | `?` markers (strength)              | нет                               |
| Deload      | `.is-deload` нед 5 (general)        | phase Deload W5                   |
| CSS classes | `.progression-preview.ta-period`    | `.ta-period`                      |
| Hook        | `useProgressionPreview`             | `usePeriodization`                |

### Header preview

| Class                         | Content pattern                                 |
| ----------------------------- | ----------------------------------------------- |
| `.progression-preview__title` | `{Exercise} · 1ПМ {N} кг`                       |
| `.progression-preview__meta`  | `{Preset label} · {weeks} нед · {days} дня/нед` |
| `.progression-preview__note`  | `getTestWeekExplanation(preset)` — domain copy  |

### Reset on change

`useEffect` сбрасывает `activeIndex` при смене `progressionPreset` / `daysPerWeek`; `key` на `<section>` форсирует remount.

### a11y

- `aria-label="Пример прогрессии: {title}, {preset}"`
- `#progression-preview-list-desc` — sr-only для listbox
- SVG `role="img"` + dynamic `<desc>` по числу недель / deload

**→ Детали listbox, tooltip, phase strip, mobile:** `periodization-chart-standard.md`.

---

## L1 — `SceneHero` (заголовок сцены)

**Файлы:** `SceneHero.tsx`, `theory-apple.css` L2809–2875.

### Структура

```html
<section
  class="ta-scene-hero"
  role="region"
  aria-labelledby="{titleId}"
  style="--scene-hero-accent: var(--ta-calc-accent)">
  <div class="ta-scene-hero__glow" aria-hidden="true" />
  <div class="ta-scene-hero__content">
    <span class="ta-scene-hero__eyebrow">{eyebrow}</span>
    <h1 id="{titleId}" class="ta-scene-hero__title">{title with optional accent span}</h1>
    <p class="ta-scene-hero__subtitle">{subtitle}</p>
  </div>
</section>
```

### Copy по треку

| Track | eyebrow       | title              | accentWord | subtitle (канон)                                                               |
| ----- | ------------- | ------------------ | ---------- | ------------------------------------------------------------------------------ |
| 2.0   | `Calculator`  | `1ПМ и прогрессия` | `1ПМ`      | «Отказной подход → расчёт 1ПМ → рабочие веса на 8 недель с реальными схемами.» |
| 3.0   | `Калькулятор` | `{programLabel}`   | —          | «График прогрессии по неделям. Веса после тестов — из ваших результатов.»      |

### Typography

| Element  | Size         | Weight | Color / accent                         |
| -------- | ------------ | ------ | -------------------------------------- |
| Eyebrow  | 32px         | 600    | muted, **UPPERCASE**, tracking 0.14em  |
| Title    | 32px display | 600    | `--ta-text`; accent span → calc accent |
| Subtitle | 32px         | 400    | muted, max-width 620px, lh 1.5         |

### Spacing

- Padding: `clamp(32–64, 20–48, 28–48)` vertical / horizontal
- Content gap: **12px**
- Border-bottom: 1px `--ta-border`

### Motion (parallax glow)

- JS: `--scene-hero-y` via rAF scroll (only while in viewport, IO-gated)
- Glow: radial gradient accent 18% opacity, `translate3d` parallax
- `prefers-reduced-motion`: glow static, no scroll listener

### a11y

- `role="region"`, `aria-labelledby` → `<h1>`
- Glow decorative `aria-hidden`

### MUST

- **MUST** один hero на tab body; не дублировать h1 в секциях
- **MUST** `accentWord` только для коротких domain terms («1ПМ»)
- **MUST NOT** parallax без reduced-motion guard

---

## L2 — Stack container (`.ta-stack.ta-stack--calc`)

| Property   | `.ta-stack` default                | `.ta-stack--calc` override                    |
| ---------- | ---------------------------------- | --------------------------------------------- |
| gap        | 28px                               | **0** (sections self-separate via border-top) |
| margin-top | 28px                               | **0** (hero provides rhythm)                  |
| Stagger    | ta-stack-in 500ms, delays 60–620ms | same on direct children                       |

Секции `.ta-calc-section` разделяются `border-top`; padding внутри каждой секции.

---

## Program 2.0 — секция 01: TestApproachSection

**→ Полный этalon:** [`calc-test-approach-standard.md`](./calc-test-approach-standard.md)

Краткая карта в контексте tab:

- `num="01"`, title «Тестовый подход», `titleId="calc-test-heading"`
- Quiet pill (не Theory uppercase)
- `<form class="calc-test">` + `NoteBox` footnote снаружи формы
- ExerciseWheel + PremiumInput steppers + CTA «Рассчитать»
- CSS: `calc-test-approach.css`

**Tab-level behavior:** submit → `handleCalculate` → появление секции 02 + `scrollIntoView` на result (`behavior: smooth`, respect reduced motion).

---

## Program 2.0 — секция 02: Прогрессия (conditional)

**→ Полный composite этalon:** [`calc-progression-result-standard.md`](./calc-progression-result-standard.md) — insight + ResultCard + PlateDiagram + PeriodizationChart + NoteBox, scroll anchor, data flow, copy.

**Условие:** `activeResult !== null` (после «Рассчитать» в секции 01 или выбор из «03 Сохранённые»).  
**Title:** `` `Прогрессия — ${config.name}` `` (напр. «Прогрессия — Разгибания ног»).  
**Scroll:** обёртка `div[ref=resultRef]` → `scrollIntoView` на смену `activeResult.exerciseKey`; `scroll-margin-top: 88px` на `.ta-calc-section`.

### Краткая карта блоков (детали в partial)

| #   | Блок                | Класс / компонент | Partial / примечание                                                              |
| --- | ------------------- | ----------------- | --------------------------------------------------------------------------------- |
| 02a | Insight summary     | `.insight`        | `calc-progression-result-standard.md` §4                                          |
| 02b | Расчётный 1ПМ       | `.ta-result-card` | §5; count-up 250ms, chips ×4                                                      |
| 02c | Раскладка блинов    | `.ta-calc-plates` | §6; только type A/B, не pullup                                                    |
| 02d | График периодизации | `.ta-period`      | **[`periodization-chart-standard.md`](./periodization-chart-standard.md) (MAX)]** |
| 02e | Легенда             | `.ta-calc-note`   | §8; deload W5 + `.vol-legend--*`                                                  |

**Порядок в `ta-calc-section__body`:** insight → ResultCard → PlateDiagram? → PeriodizationChart → NoteBox (`gap: 20px`).

**Расхождение данных (документировано):** insight `weekRows` учитывает `progressionPreset`; chart — нет (`usePeriodization` raw config). См. partial §4.3 / §7.

---

## Program 2.0 — секция 03: Saved exercises

**→ Полный этalon (MAX detail):** [`calc-saved-exercises-standard.md`](./calc-saved-exercises-standard.md) — DOM tree SectionBlock → `.ta-calc-saved-list` → card grid, все CSS L3711–3837, counter `(N/M)`, delete 44px, MUST для journal/training.

| Aspect        | Spec                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Условие**   | `userData.exercises.length > 0` — иначе секция **не в DOM** (empty = hide, не placeholder)                                                         |
| **Markup**    | `CalculatorTab.tsx` L187–234 inline; **нет** `SavedExercisesList`                                                                                  |
| **Shell**     | `SectionBlock num="03" variant="apple"` — dual classes `ta-section` + `ta-calc-section`, pill `03` Theory colored                                  |
| **Title**     | `` `Сохранённые (${n}/${EX_COUNT})` `` — counter **только** в `h2`, скобки `()`                                                                    |
| **List**      | `div.ta-calc-saved-list` — grid gap 10px                                                                                                           |
| **Row**       | `div.ta-calc-saved-card[.is-active]` `role="button"` — grid `1fr auto`; left: `__name` + `__meta`; right: `__one-rm` (accent) + `Button danger sm` |
| **Meta copy** | `{weight} кг × {reps} повт · {date}`                                                                                                               |
| **Handlers**  | `useCalculatorState`: `handleSelectSaved` → sec 02; `handleDelete` + `stopPropagation` на delete                                                   |
| **a11y**      | `aria-current` on active; `aria-label` «Удалить {name}»; focus-visible = active visual                                                             |
| **CSS file**  | `theory-apple.css` `.ta-shell .ta-calc-saved-*` (scoped, не journal globals)                                                                       |

Tab-level: select row → sync секция 02 + scroll `resultRef`; delete → filter + hide 03 if empty.

---

## Program 2.0 — секция 04: VolumeDonut (`VolumeDonut`)

**Файлы:** `VolumeDonut.tsx`, `volume-breakdown.css`.

### Структура блоков

```
div.ta-vol
├── p.ta-vol__lede          (intro copy)
└── div.ta-vol__grid
      ├── div.ta-vol__summary        (3 category cards)
      ├── div.ta-vol__donut          (dual-ring SVG)
      ├── div.ta-vol__list           (ranked muscle rows)
      └── aside.ta-vol__detail       (source breakdown)
```

### Typography

| Element           | Size | Notes                     |
| ----------------- | ---- | ------------------------- |
| Lede              | 14px | muted, bordered intro box |
| Summary strong    | 24px | display font, category %  |
| Summary em        | 12px | mono tabular sets         |
| Row label         | 14px | muscle name               |
| Row value/percent | 12px | mono tabular              |

### Layout

- Grid areas: summary full width → donut + list → detail full width
- Desktop: donut 240px col + list flexible
- Summary: 3-col equal cards, left accent 2px per category color

### Interaction

- Donut inner segments: `role="button"`, `aria-pressed`, keyboard Enter/Space/Escape
- List rows: `<button.ta-vol__row>` sync selection with donut
- Opacity dimming: non-selected categories/muscles fade (0.2–0.96)

### a11y

- SVG `<title>` + `<desc>` for rings
- Each row/segment: verbose `aria-label` with rank, sets, percent
- Detail panel: `aria-label` with muscle name

### Copy

- Lede: «Показывает, какие мышечные группы получают больше всего рабочих подходов в базовом 3-дневном цикле.»
- Detail eyebrow: «Источник объёма» UPPERCASE 12px

### MUST

- **MUST** `--vol-color` per muscle/category via inline CSS var
- **MUST** `prefers-reduced-motion` — no segment scale transitions if reduced
- **MUST NOT** treat as user-specific data (static program breakdown)

---

## Program 3.0 — обзор (`CalculatorTabV3`)

**Shell:** `.ta-shell.program-v3-calculator` — локальные aliases как calc-test (`program-v3.css`).

**Hero:** eyebrow «Калькулятор», title = `PROGRESSION_PRESET_META.strength.programLabel` («На силу»).

### V3-01 — Упражнение

| Aspect      | Spec                                                            |
| ----------- | --------------------------------------------------------------- |
| Shell       | `SectionBlock num="01"`, quiet pill, clamp title                |
| Control     | `ExercisePicker` (`.ew-*`) — parity с Program 2.0 ExerciseWheel |
| Alt copy    | «Альтернатива: {alternativeName}» если есть                     |
| Order       | `EXERCISE_ORDER_V3` из `TRAINING_DAYS_V3`                       |
| Type meta   | `CATEGORY_LABELS_V3` (barbell/dumbbell/…)                       |
| Empty state | placeholder «Выберите упражнение» до выбора                     |

**a11y:** `triggerId` + `ariaLabelledBy="calc-v3-exercise-heading"`.

### V3-02 — Черновой 1ПМ

| Aspect    | Spec                                               |
| --------- | -------------------------------------------------- |
| Fields    | `PremiumInput variant="stepper"` weight + reps     |
| Live est. | «Оценка 1ПМ: **{n} кг**» — accent strong, не saved |
| Footnote  | NoteBox: lead «Справочно.» + Brzycki disclaimer    |

Formula: `calc1RM(w, r, 'brzycki')` — display only.

### V3-03 — Прогрессия (`ProgramV3ProgressChart`)

**Sibling** preview/chart etalons — reuses `.ta-period` + `.progression-preview` patterns.

| Aspect       | V3 chart                                 |
| ------------ | ---------------------------------------- |
| Weeks        | 16                                       |
| Data         | `getPrescription` + user testResults     |
| Test weeks   | `?` weight until logged                  |
| Missing test | `status: missing_test`, muted rows       |
| Empty        | `program-v3-progress__empty` status text |
| Footnote     | «Тестовые недели.» + PR2 hint            |

**Hook:** `useProgramV3Progress.ts` — geometry only, same interaction layer as PeriodizationChart.

**a11y:** `aria-label="Прогрессия: {exerciseName}"`, listbox + keyboard nav.

### V3 vs 2.0 — design divergence (намеренно)

| Element       | Program 2.0                    | Program 3.0                   |
| ------------- | ------------------------------ | ----------------------------- |
| Exercise pick | ExercisePicker (ExerciseWheel) | ExercisePicker (same `.ew-*`) |
| 1RM entry     | Full test approach form        | Draft steppers (reference)    |
| Saved list    | ✅ sec 03                      | ❌ (tests in training)        |
| Volume donut  | ✅ sec 04                      | ❌                            |
| Section pills | Mixed quiet/editorial          | All quiet (calc-test style)   |

---

## Shared: `SectionBlock` + `NoteBox`

**Variant:** always `variant="apple"` in Calculator tab.

```tsx
<SectionBlock num="0N" title="…" variant="apple" titleId? className?>
  {children}
</SectionBlock>

<NoteBox variant="apple">{footnote / legend}</NoteBox>
```

- Scroll reveal: `.reveal-section` + `useScrollReveal` → `.is-visible`
- Note surface: `--ta-surface-2`, radius 16px (12px in calc-test override), 14px muted body, strong → primary text

---

## Tab transition (Framer Motion)

**File:** `TabPanel.tsx`.

| Property | Value                                         |
| -------- | --------------------------------------------- |
| Key      | `calculator-body-{2.0\|3.0}` on preset switch |
| Enter    | opacity 0→1, y 8→0, 200ms ease-in-out         |
| Exit     | opacity 1→0, y 0→-4                           |
| reduced  | duration 0, no exit animation                 |

**MUST** preserve picker outside motion wrapper (settings stay mounted).

---

## Матрица «блок → partial standard»

| Блок                      | Partial standard                            |
| ------------------------- | ------------------------------------------- |
| **Секция 02 (composite)** | `calc-progression-result-standard.md`       |
| TestApproachSection       | `calc-test-approach-standard.md`            |
| PeriodizationChart        | `periodization-chart-standard.md` (**MAX**) |
| ProgressionPreviewChart   | `periodization-chart-standard.md` §7        |
| ProgramV3ProgressChart    | `periodization-chart-standard.md` §7        |
| Saved list                | `calc-saved-exercises-standard.md`          |
| Theory tokens / shell     | `.cursor/rules/theory-design-reference.mdc` |

---

## Global MUST / SHOULD / MUST NOT (Calculator tab)

### MUST

- [ ] Читать **этот файл** перед любой задачей на Calculator tab
- [ ] Preset picker в `.ta-shell--calc-settings` **отдельно** от tab body
- [ ] Оба трека используют `.ta-shell` + `SceneHero` + `.ta-stack--calc`
- [ ] Секции через `SectionBlock variant="apple"` + numbered pills
- [ ] Tokens `--ta-calc-*` / aliases; 4px spacing scale
- [ ] `:focus-visible`, `@media (hover: hover)`, `prefers-reduced-motion`
- [ ] Copy RU, sentence case (кроме hero eyebrow и result label UPPERCASE)
- [ ] Charts: listbox-primary on mobile, SVG secondary ≤600px
- [ ] Touch targets ≥44px на controls

### SHOULD

- [ ] При добавлении секции 05+ — обновить этот umbrella doc
- [ ] ScrollIntoView на result после calculate (2.0)
- [ ] Cross-link partial standards, не дублировать геометрию чартов

### MUST NOT

- [ ] Legacy `.ta-calc-form` для новых секций
- [ ] Ad hoc list/chart/form вне эталонных паттернов
- [ ] Raw hex в TSX
- [ ] Toast для validation (inline near field)
- [ ] Дублировать preset picker внутри CalculatorTab body
- [ ] Animate width/height/margin на tab switch

---

## Sibling (не эталон)

| Surface                          | Почему не канон                          |
| -------------------------------- | ---------------------------------------- |
| `training-app-mobile` calculator | RN StyleSheet, другой saved list format  |
| `apps/macos/CalculatorScreen`    | legacy SectionBlock без apple variant    |
| Legacy `.ta-calc-form`           | ALL CAPS, oversized steppers             |
| `PopChildMeasure`                | не используется в текущем web Calculator |

---

## Чеклист агента (Calculator tab change)

- [ ] Прочитать этот файл + matching partial standard(s)
- [ ] Определить трек: 2.0 vs 3.0 (или shared L0/L1)
- [ ] Verify оба preset в browser (`Оптимальная` + `На силу`)
- [ ] 320px width, keyboard tab order, reduced motion
- [ ] Update partial standard if block pattern evolves; sync this umbrella doc

---

## Связанные артефакты Memory Bank

- Индекс: `memory-bank/reference/README.md`
- Partial: `calc-test-approach-standard.md`, `calc-progression-result-standard.md`, `periodization-chart-standard.md`, `calc-saved-exercises-standard.md`
- Patterns: `memory-bank/systemPatterns.md`
- Context: `memory-bank/activeContext.md`
- Style: `memory-bank/style-guide.md`
- Rule: `.cursor/rules/react-training-memory-bank.mdc`


## `memory-bank/reference/design-taste-frontend.md`

---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.
---

# tasteskill: Anti-Slop Frontend Skill

> Landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product UI.
> Every rule below is **contextual**. None of it fires automatically. First read the brief, then pull only what fits.

---

## 0. BRIEF INFERENCE (Read the Room Before Anything Else)

Before touching code or tweaking dials, **infer what the user actually wants**. Most LLM design output is bad because the model jumps to a default aesthetic instead of reading the room.

### 0.A Read these signals first
1. **Page kind** - landing (SaaS / consumer / agency / event), portfolio (dev / designer / creative studio), redesign (preserve vs overhaul), editorial / blog.
2. **Vibe words** the user used - "minimalist", "calm", "Linear-style", "Awwwards", "brutalist", "premium consumer", "Apple-y", "playful", "serious B2B", "editorial", "agency-y", "glassy", "dark tech".
3. **Reference signals** - URLs they linked, screenshots they pasted, products they named, brands they're competing with.
4. **Audience** - B2B procurement panel vs. design-conscious consumer vs. recruiter scanning a portfolio. The audience picks the aesthetic, not your taste.
5. **Brand assets that already exist** - logo, color, type, photography. For redesigns, these are starting material, not optional input (see Section 11).
6. **Quiet constraints** - accessibility-first audiences, public-sector, regulated industries, trust-first commerce, kids' products. These constraints OVERRIDE aesthetic preference.

### 0.B Output a one-line "Design Read" before generating
Before any code, state in one line: **"Reading this as: \<page kind> for \<audience>, with a \<vibe> language, leaning toward \<design system or aesthetic family>."**

Example reads:
- *"Reading this as: B2B SaaS landing for technical buyers, with a Linear-style minimalist language, leaning toward Tailwind utilities + Geist + restrained motion."*
- *"Reading this as: solo designer portfolio for hiring managers, with an editorial / kinetic-type language, leaning toward native CSS + scroll-driven animation + custom typography."*
- *"Reading this as: redesign of a public-sector service site, with a trust-first language, leaning toward GOV.UK Frontend or USWDS."*

### 0.C If the brief is ambiguous, ask one question, do not guess
Ask exactly **one** clarifying question - never a multi-question dump - and only when the design read genuinely diverges. Example: *"Should this feel closer to Linear-clean or Awwwards-experimental?"*

If you can confidently infer from context, **do not ask**. Just declare the design read and proceed.

### 0.D Anti-Default Discipline
Do not default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism on everything, infinite-loop micro-animations everywhere, Inter + slate-900. These are the LLM defaults. Reach past them deliberately based on the design read.

---

## 1. THE THREE DIALS (Core Configuration)

After the design read, set three dials. Every layout, motion, and density decision below is gated by these.

* **`DESIGN_VARIANCE: 8`** - 1 = Perfect Symmetry, 10 = Artsy Chaos
* **`MOTION_INTENSITY: 6`** - 1 = Static, 10 = Cinematic / Physics
* **`VISUAL_DENSITY: 4`** - 1 = Art Gallery / Airy, 10 = Cockpit / Packed Data

**Baseline:** `8 / 6 / 4`. Use these unless the design read overrides them. Do not ask the user to edit this file - overrides happen conversationally.

### 1.A Dial Inference (design read → dial values)
| Signal | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| "minimalist / clean / calm / editorial / Linear-style" | 5-6 | 3-4 | 2-3 |
| "premium consumer / Apple-y / luxury / brand" | 7-8 | 5-7 | 3-4 |
| "playful / wild / Dribbble / Awwwards / experimental / agency" | 9-10 | 8-10 | 3-4 |
| "landing page / portfolio / marketing site (default)" | 7-9 | 6-8 | 3-5 |
| "trust-first / public-sector / regulated / accessibility-critical" | 3-4 | 2-3 | 4-5 |
| "redesign - preserve" | match existing | +1 | match existing |
| "redesign - overhaul" | +2 | +2 | match existing |

### 1.B Use-Case Presets
| Use case | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| Landing (SaaS, mainstream) | 7 | 6 | 4 |
| Landing (Agency / creative) | 9 | 8 | 3 |
| Landing (Premium consumer) | 7 | 6 | 3 |
| Portfolio (Designer / studio) | 8 | 7 | 3 |
| Portfolio (Developer) | 6 | 5 | 4 |
| Editorial / Blog | 6 | 4 | 3 |
| Public-sector service | 3 | 2 | 5 |
| Redesign - preserve | match | match+1 | match |
| Redesign - overhaul | +2 | +2 | match |

### 1.C How the Dials Drive Output
Use these (or user-overridden values) as global variables. Cross-references throughout this document refer to these exact variable names - never invent aliases like `LAYOUT_VARIANCE` or `ANIM_LEVEL`.

---

## 2. BRIEF → DESIGN SYSTEM MAP

Once you have the design read (Section 0) and dials (Section 1), pick the right foundation. Do not invent CSS for things that have an official package. Do not pretend an aesthetic trend is an official system.

### 2.A When to reach for a real design system (use official packages)
| Brief reads as… | Reach for | Why |
|---|---|---|
| Microsoft / enterprise SaaS / dashboards | `@fluentui/react-components` or `@fluentui/web-components` | Official Fluent UI, Microsoft tokens, accessibility done |
| Google-ish UI, Material-flavored product | `@material/web` + Material 3 tokens | Official, theme-able via Material Theming |
| IBM-style B2B / enterprise analytics | `@carbon/react` + `@carbon/styles` | Official Carbon, mature data-density patterns |
| Shopify app surfaces | `polaris.js` web components / Polaris React | Required for Shopify admin UI |
| Atlassian / Jira-style product | `@atlaskit/*` + `@atlaskit/tokens` | Official Atlassian DS |
| GitHub-style devtool / community page | `@primer/css` or `@primer/react-brand` | Official Primer; Brand variant for marketing |
| Public-sector UK service | `govuk-frontend` | Legally / regulatorily expected |
| US public-sector / trust-first | `uswds` | Same |
| Fast local-business / agency MVP | Bootstrap 5.3 | Boring, fast, works |
| Modern accessible React foundation | `@radix-ui/themes` | Primitives + polished theme |
| Modern SaaS where you own the components | shadcn/ui (`npx shadcn@latest add ...`) | You own the code, easy to customise; never ship default state |
| Tailwind-based modern SaaS / AI marketing | Tailwind v4 utilities + `dark:` variant | Default for indie + small team builds |

**Honesty rule:** if the brief reads as one of the systems above, install and use the **official** package. Do not recreate its CSS by hand. Do not import a system's tokens but then override 90% of them.

**One system per project.** Do not mix Fluent React with Carbon in the same tree. Do not import shadcn/ui components into a Material 3 app.

### 2.B When the brief is an aesthetic, not a system
For these directions, there is **no single official package**. Build with native CSS + Tailwind + a maintained component library. Be honest in code comments about what is borrowed inspiration vs. official material.

| Aesthetic | Honest implementation |
|---|---|
| Glassmorphism / "frosted glass" | `backdrop-filter`, layered borders, highlight overlays. Provide solid-fill fallback for `prefers-reduced-transparency`. |
| Bento (Apple-style tile grids) | CSS Grid with mixed cell sizes. No single library owns this. |
| Brutalism | Native CSS, monospace, raw borders. No library. |
| Editorial / magazine | Serif type, asymmetric grid, generous whitespace. No library. |
| Dark tech / hacker | Mono + accent neon, terminal motifs. No library. |
| Aurora / mesh gradients | SVG or layered radial gradients. No library. |
| Kinetic typography | Native CSS animations, scroll-driven animations, GSAP for hijacks. No library. |
| **Apple Liquid Glass** | Apple documents this for Apple platforms only. **There is no official `liquid-glass.css`.** Web implementations are approximations using `backdrop-filter` + layered borders + highlights. Label clearly as approximation. |

---

## 3. DEFAULT ARCHITECTURE & CONVENTIONS

Unless the design read picks a real design system (Section 2.A), these are the defaults:

### 3.A Stack
* **Framework:** React or Next.js. Default to Server Components (RSC).
  * **RSC SAFETY:** Global state works ONLY in Client Components. In Next.js, wrap providers in a `"use client"` component.
  * **INTERACTIVITY ISOLATION:** Any component using Motion, scroll listeners, or pointer physics MUST be an isolated leaf with `'use client'` at the top. Server Components render static layouts only.
* **Styling:** **Tailwind v4** (default). Tailwind v3 only if the existing project demands it.
  * For v4: do NOT use `tailwindcss` plugin in `postcss.config.js`. Use `@tailwindcss/postcss` or the Vite plugin.
* **Animation:** **Motion** (the library formerly known as Framer Motion). Import from `motion/react` (`import { motion } from "motion/react"`). The `framer-motion` package still works as a legacy alias - prefer `motion/react` in new code.
* **Fonts:** Always use `next/font` (Next.js) or self-host with `@font-face` + `font-display: swap`. Never link Google Fonts via `<link>` in production.

### 3.B State
* Local `useState` / `useReducer` for isolated UI.
* Global state ONLY for deep prop-drilling avoidance - Zustand, Jotai, or React context.
* **NEVER** use `useState` to track continuous values driven by user input (mouse position, scroll progress, pointer physics, magnetic hover). Use Motion's `useMotionValue` / `useTransform` / `useScroll`. `useState` re-renders the React tree on every change and collapses on mobile.

### 3.C Icons
* **Allowed libraries (priority order):** `@phosphor-icons/react`, `hugeicons-react`, `@radix-ui/react-icons`, `@tabler/icons-react`.
* **Discouraged:** `lucide-react`. Acceptable only when the user explicitly asks for it or the project already depends on it.
* **NEVER hand-roll SVG icons.** If a glyph is missing, install a second library or compose from primitives - do not draw icon paths from scratch.
* **One family per project.** Do not mix Phosphor with Lucide in the same component tree.
* **Standardize `strokeWidth` globally** (e.g. `1.5` or `2.0`).

### 3.D Emoji Policy
Discouraged by default in code, markup, and visible text. Replace symbols with icon-library glyphs. **Override:** allow emojis only when the user explicitly asks for a playful / chat-style / social-native vibe - and even then use them sparingly with intent.

### 3.E Responsiveness & Layout Mechanics
* Standardize breakpoints (`sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`).
* Contain page layouts using `max-w-[1400px] mx-auto` or `max-w-7xl`.
* **Viewport Stability:** NEVER use `h-screen` for full-height Hero sections. ALWAYS use `min-h-[100dvh]` to prevent layout jumping on mobile (iOS Safari address bar).
* **Grid over Flex-Math:** NEVER use complex flexbox percentage math (`w-[calc(33%-1rem)]`). ALWAYS use CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`).

### 3.F Dependency Verification (mandatory)
Before importing ANY 3rd-party library, check `package.json`. If the package is missing, output the install command first. **Never** assume a library exists.

---

## 4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)

LLMs default to clichés. Override these defaults proactively. Each rule has a context-aware override path.

### 4.1 Typography
* **Display / Headlines:** Default `text-4xl md:text-6xl tracking-tighter leading-none`.
* **Body / Paragraphs:** Default `text-base text-gray-600 leading-relaxed max-w-[65ch]`.
* **Sans font choice:**
  * **Discouraged as default:** `Inter`. Pick `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, or a brand-appropriate serif first.
  * **Override:** Inter is acceptable when the user explicitly asks for a neutral / standard / Linear-style feel, or when the brief is a public-sector / accessibility-first site.
* **Pairings to know:** `Geist` + `Geist Mono`, `Satoshi` + `JetBrains Mono`, `Cabinet Grotesk` + `Inter Tight`, `GT America` + `IBM Plex Mono`.

* **SERIF DISCIPLINE (VERY DISCOURAGED AS DEFAULT):**
  * Serif is **very discouraged as the default font for any project.** "It feels creative / premium / editorial" is NOT a reason to reach for serif. The agent's default mental model that "creative brief = serif" is the single most-tested AI tell in production rounds.
  * **Serif is only acceptable when ONE of these is explicitly true:**
    - The brand brief literally names a serif font, OR
    - The aesthetic family is genuinely editorial / luxury / publication / manuscript / heritage / vintage AND you can articulate why this specific serif fits this specific brand
  * For everything else (creative agency, design studio, modern brand, premium consumer, portfolio, lifestyle), **default sans-serif display** (Geist Display, ABC Diatype, Söhne Breit, Cabinet Grotesk Display, Migra Sans, GT Walsheim, Inter Display, PP Neue Montreal). Sans display fonts are not "boring" — they are the default for the same reason black is the default in fashion.
  * **EMPHASIS RULE (related):** When you want to emphasize a word within a headline (the kinetic "and `spatial` design" type move), use **italic or bold of the SAME font**. Do NOT inject a random serif word into a sans headline (or vice versa) just to add visual interest. Mixed-family emphasis is amateur. Italic/bold emphasis in the same family is the right move.
  * **Specifically BANNED as defaults:** `Fraunces` and `Instrument_Serif` (the two LLM-favorite display serifs).
  * **If a serif is justified** (rare, per the above), rotate from this pool, do NOT reuse the same serif across consecutive projects: PP Editorial New, GT Sectra Display, Cardinal Grotesque, Reckless Neue, Tiempos Headline, Recoleta, Cormorant Garamond, Playfair Display, EB Garamond, IvyPresto, Migra, Editorial Old, Saol Display, Söhne Breit Kursiv, Domaine Display, Canela, Schnyder, Tobias, NB Architekt, ITC Galliard.

* **ITALIC DESCENDER CLEARANCE (mandatory):** When italic is used in display type and the word contains a descender letter (`y g j p q`), `leading-[1]` or `leading-none` will clip the descender. Use `leading-[1.1]` minimum and add `pb-1` or `mb-1` reserve on the wrapping element. Audit every italic word in display headlines before shipping.

### 4.2 Color Calibration
* Max 1 accent color. Saturation < 80% by default.
* **THE LILA RULE:** The "AI Purple / Blue glow" aesthetic is discouraged as a default. No automatic purple button glows, no random neon gradients. Use neutral bases (Zinc / Slate / Stone) with high-contrast singular accents (Emerald, Electric Blue, Deep Rose, Burnt Orange, etc.).
* **Override:** if the brand or brief explicitly asks for purple / violet / lila, embrace it. But execute with intent: consistent palette, harmonised neutrals, restrained gradients. Not generic AI gradient slop.
* **One palette per project.** Do not fluctuate between warm and cool grays within the same project.
* **COLOR CONSISTENCY LOCK (mandatory):** Once an accent color is chosen for a page, it is used on the WHOLE page. A warm-grey site does not suddenly get a blue CTA in section 7. A rose-accented site does not get a teal status badge in the footer. Pick one accent, lock it, audit every component before shipping.

* **PREMIUM-CONSUMER PALETTE BAN (mandatory, second-most-recurring AI-tell):**
  * For premium-consumer briefs (cookware, wellness, artisan, luxury, heritage craft, DTC home goods, etc.) the LLM default is **warm beige/cream + brass/clay/oxblood/ochre + espresso/ink dark text**. Concretely banned hex families as default backgrounds and accents:
    - Backgrounds: `#f5f1ea`, `#f7f5f1`, `#fbf8f1`, `#efeae0`, `#ece6db`, `#faf7f1`, `#e8dfcb` (all "warm paper / cream / chalk / bone")
    - Accents: `#b08947`, `#b6553a`, `#9a2436`, `#9c6e2a`, `#bc7c3a`, `#7d5621` (all "brass / clay / oxblood / ochre")
    - Text: `#1a1714`, `#1a1814`, `#1b1814` (all "espresso / warm near-black")
  * This palette is BANNED as the default reach for premium-consumer briefs. Every premium-consumer site you have ever shipped uses this exact palette. The brand becomes invisible.
  * **Default alternatives (rotate, do not reuse):**
    - **Cold Luxury:** silver-grey + chrome + smoke (think Tesla, Apple Watch Hermes-without-the-leather)
    - **Forest:** deep green + bone + amber accent (think Filson, Patagonia premium)
    - **Black and Tan:** true off-black + warm tan, sharp contrast, no beige
    - **Cobalt + Cream:** saturated blue against a single neutral, no brass
    - **Terracotta + Slate:** warm rust against cool grey, no brass
    - **Olive + Brick + Paper:** muted olive plus brick-red accent
    - **Pure monochrome + single saturated pop:** off-white + off-black + one bright accent (electric blue, emerald, hot pink, etc.)
  * **Palette-rotation rule:** if the previous premium-consumer project you generated used the beige+brass family, this one MUST use a different family. Do not ship the same warm-craft palette twice in a row.
  * **Override:** the beige+brass+espresso palette is acceptable ONLY when the brand brief explicitly names those colors, or when the brand identity is genuinely vintage / artisan / warm-craft AND you can articulate why this specific palette fits this specific brand. Default-reaching for it because "this is a cookware brief" is banned.

### 4.3 Layout Diversification
* **ANTI-CENTER BIAS:** Centered Hero / H1 sections are avoided when `DESIGN_VARIANCE > 4`. Force "Split Screen" (50/50), "Left-aligned content / right-aligned asset", "Asymmetric white-space", or scroll-pinned structures.
* **Override:** centered hero is OK for editorial / manifesto / launch-announcement briefs where the message itself is the design.

### 4.4 Materiality, Shadows, Cards
* Use cards ONLY when elevation communicates real hierarchy. Otherwise group with `border-t`, `divide-y`, or negative space.
* When a shadow is used, tint it to the background hue. No pure-black drop shadows on light backgrounds.
* For `VISUAL_DENSITY > 7`: generic card containers are banned. Data metrics breathe in plain layout.
* **SHAPE CONSISTENCY LOCK (mandatory):** Pick ONE corner-radius scale for the page and stick to it. Options: all-sharp (radius 0), all-soft (radius 12-16px), all-pill (full radius for interactive). Mixed systems are allowed only when there is a documented rule (e.g. "buttons are full-pill, cards are 16px, inputs are 8px") and that rule is followed everywhere. Round buttons in a square layout, or square cards on a pill-button page, is broken design.

### 4.5 Interactive UI States
LLMs default to "static successful state only." Always implement full cycles:
* **Loading:** Skeletal loaders matching the final layout's shape. Avoid generic circular spinners.
* **Empty States:** Beautifully composed; indicate how to populate.
* **Error States:** Clear, inline (forms), or contextual (toasts only for transient).
* **Tactile Feedback:** On `:active`, use `-translate-y-[1px]` or `scale-[0.98]` to simulate a physical push.
* **BUTTON CONTRAST CHECK (mandatory, a11y):** Before shipping any button, verify the button text is readable against the button background. White button + white text, `bg-white` CTA with `text-white` label, transparent button against the page background with no border → all banned. Audit every CTA: contrast ratio WCAG AA min (4.5:1 for body, 3:1 for large text 18px+). Same rule applies to ghost buttons over photographic backgrounds (use a backdrop, scrim, or stroke).
* **CTA BUTTON WRAP BAN (mandatory):** Button text MUST fit on one line at desktop. If a label like "VIEW SELECTED WORK" wraps to 2 or 3 lines, the button is broken. Fix by EITHER shortening the label (3 words max for primary CTAs, ideally 1-2) OR widening the button (do not artificially constrain `max-width` on CTAs). Wrapped CTAs at desktop are a Pre-Flight Fail.
* **NO DUPLICATE CTA INTENT (mandatory):** Two CTAs with the same intent on one page is a Pre-Flight Fail. Examples of same intent: "Get in touch" + "Contact us" + "Let's talk" + "Start a project" + "Start something" + "Reach out" = all "contact" intent → pick ONE label and use it everywhere on the page (nav, hero, footer). Same for "Try free" + "Get started" + "Sign up free" (all "signup" intent) and "View work" + "See selected work" + "Browse projects" (all "portfolio" intent). One label per intent.
* **FORM CONTRAST CHECK (mandatory, a11y):** Form inputs, placeholder text, focus rings, helper text, and error text all pass WCAG AA contrast against the section background. Light placeholders on a near-white form, white form on white page section, form labels grayer than 4.5:1 contrast → all banned. Audit every form before shipping.

### 4.6 Data & Form Patterns
* Label ABOVE input. Helper text optional but present in markup. Error text BELOW input. Standard `gap-2` for input blocks.
* No placeholder-as-label. Ever.

### 4.7 Layout Discipline (Hard Rules. Failing any of these is shipping broken work)

* **Hero MUST fit in the initial viewport.** Headline max 2 lines on desktop, subtext max **20 words** AND max 3-4 lines, CTAs visible without scroll. If the copy is too long: reduce font scale OR cut copy. If you cannot describe the value-prop in 20 words of subtext, the value-prop is unclear, not the rule too tight. Never let the hero overflow and force scroll to find the CTA.
* **Hero font-scale discipline.** Plan font size and image size *together*. If the hero asset is large and the headline is more than 6 words, do not start at `text-7xl/text-8xl`. Default sensible range: `text-4xl md:text-5xl lg:text-6xl` for most heroes; `text-6xl md:text-7xl` only when the headline is 3-5 words. A 4-line hero headline is always a font-size error, never a copy-length error.
* **HERO TOP PADDING CAP (mandatory):** Hero top padding max `pt-24` (≈6rem) at desktop. More than that means the hero content floats halfway down the viewport and reads as a layout bug, not as intentional space. If your hero needs more breathing room, increase font scale or asset size, not top padding.
* **HERO STACK DISCIPLINE (max 4 text elements).** The hero is a single moment, not a feature list. Allowed text elements, max 4 in total:
  1. Eyebrow (small uppercase label) OR brand strip OR neither - pick zero or one
  2. Headline (max 2 lines, see above)
  3. Subtext (max 20 words, max 4 lines)
  4. CTAs (1 primary + max 1 secondary)
  - **BANNED in the hero:** tiny tagline below CTAs ("Works with GitHub, GitLab, and self-hosted Git"), trust micro-strip ("Used by engineering teams at..."), pricing teaser ("Free for solo, $10/user for teams"), feature bullet list, social-proof avatar row. All of those move to dedicated sections directly below the hero.
  - If you have an eyebrow AND a tagline below CTAs in the same hero, drop the tagline. If you have a brand strip AND a tagline, drop the tagline. One small text element per hero, max.
* **"Used by" / "Trusted by" logo wall belongs UNDER the hero, never inside it.** The hero is for the value prop and primary CTA. The logo wall is a separate section directly below. Do not stuff trust logos into the same flex row as the hero copy.
* **Navigation MUST render on a single line on desktop.** If items don't fit at `lg` (1024px), condense labels, drop secondary items, or move to a hamburger. A two-line nav at desktop is broken design.
* **Navigation height cap: 80px max desktop, default 64-72px.** No huge "agency" nav bars that eat 15% of the viewport.
* **Bento grids MUST have rhythm, not one-sided repetition.** Do not stack 6 left-image / right-text rows. Vary the composition: alternate full-width feature rows, asymmetric tile sizes, vertical breaks.
* **BENTO CELL COUNT RULE (mandatory):** A bento grid has EXACTLY as many cells as you have content for. 3 items → 3 cells (1+2 split, or 2+1, or asymmetric trio). 5 items → 5 cells (2+3, 3+2, hero+4, etc.). If your grid has an empty cell in the middle or at the end, you planned wrong. Re-shape the grid; do not paste a blank tile.
* **Section-Layout-Repetition Ban.** Once you use a layout family for a section (e.g., 3-column-image-cards, full-width-quote, split-text-image), that family can appear at most ONCE on the page. "Selected commissions" must not look like "What we do." A landing page with 8 sections must use at least 4 different layout families.
* **ZIGZAG ALTERNATION CAP (mandatory).** Alternating "left-image + right-text" then "left-text + right-image" zigzag layout = banal. Max 2 sections in a row with this image+text-split pattern. The 3rd consecutive image+text split is a Pre-Flight Fail. Break the pattern with a full-width section, a vertical-stack section, a bento grid, a marquee, or a different layout family.
* **EYEBROW RESTRAINT (mandatory, the #1 violated rule in production tests).** An "eyebrow" is the small uppercase wide-tracking label sitting above a section headline (e.g. `FOUR COLORWAYS`, `SELECTED WORK`, `THE HARDWARE`, `Git-native task management`). Typical CSS signature: `text-[11px] uppercase tracking-[0.18em]`, `font-mono text-[10.5px] uppercase tracking-[0.22em]`. Every AI-built site puts an eyebrow above EVERY section header, producing the same templated rhythm. Hard rule:
  - **Maximum 1 eyebrow per 3 sections.** Hero counts as 1. So a page with 9 sections may use at most 3 eyebrows total.
  - If section A has an eyebrow, the next 2 sections cannot have one.
  - **Pre-Flight Check is mechanical:** count instances of `uppercase tracking` (or similar small-caps mono labels above headlines) across all section components. If count > ceil(sectionCount / 3), the output fails.
  - **What to do instead of an eyebrow:** drop it entirely. The headline alone is enough. If you need to categorize a section, the section's location on the page already categorizes it; no label needed.
* **SPLIT-HEADER BAN (mandatory).** The pattern "left big headline + right small explainer paragraph" as a section header (left col-span-7/8, right col-span-4/5 with a small body paragraph floating in the right column) is **banned as default**. Sections should have ONE focused message. If you genuinely need both a headline and an explainer paragraph, stack them vertically (headline on top, body below, max-width 65ch). Reach for the split-header pattern only when there is a real compositional reason (e.g., the right column carries a visual or interactive element, not just filler text).
* **Bento Background Diversity (mandatory).** Bento and feature-grid sections cannot be 6 white-on-white cards with text inside. At least 2-3 cells in any multi-cell grid need real visual variation: a real image, a brand-appropriate gradient (not AI-purple), a pattern, a tinted background. A cream-on-cream bento with only typography inside reads as boring AI default, even when the rest of the page is good.
* **Mobile collapse must be explicit per section.** For every multi-column layout, declare the `< 768px` fallback in the same component. No "it'll work, Tailwind handles it" assumptions.

### 4.8 Image & Visual Asset Strategy

Landing pages and portfolios are **visual products**. Text-only pages with fake-screenshot divs are slop.

**Priority order for visual assets:**
1. **Image-generation tool first.** If ANY image-gen tool is available in the environment (`generate_image`, MCP image tool, IDE-integrated gen, OpenAI image tools, etc.) you MUST use it to create section-specific assets: hero photography, product shots, texture backgrounds, mood images. Generate at the right aspect ratio for the section. Do not skip this step because hand-rolled CSS feels faster.
2. **Real web images second.** When no gen tool is available, use real photography sources. Acceptable defaults:
   * `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}` for placeholder photography (seed should describe the section, e.g. `marrow-cookware-kitchen`)
   * Actual stock or brand URLs when the brief provides them
   * Open-license sources (Unsplash via direct URL, Pexels) if explicitly allowed
3. **Last resort: tell the user.** If neither is possible, do NOT fill the page with hand-rolled SVG illustrations or div-based "fake screenshots." Instead, leave clearly-labeled placeholder slots (`<!-- TODO: hero product photo, 1600x1200 -->`) and at the end of the response say: *"This page needs real images at: \[list of placements\]. Please generate or provide them."*

**Even minimalist sites need real images.** A pure-text page is not minimalism. It is incomplete work. Even an editorial Linear-style site needs at least 2-3 real images (hero, one product/lifestyle shot, one supporting image). Generate B&W minimalist photography if the brief is restrained; do not skip images entirely because the dial is low.

**Real company logos for social proof.** When the brief calls for a "Trusted by / Used by / Customers" logo wall, do NOT default to plain text wordmarks (`<span>Acme Co</span>` styled in a row). Use real SVG logos:
* **Source: Simple Icons** (`https://cdn.simpleicons.org/{slug}/ffffff` for any color, or `simple-icons` npm package). Covers most known brands.
* **Alternative: devicon** for tech-stack logos (`@svgr/cli` or CDN).
* **Make-up the brand name? Then make-up an SVG mark too.** Generate a simple monogram (one letter in a circle, two-letter ligature, abstract glyph) rendered as an inline `<svg>` matching the page style. Plain text wordmarks for invented brand names look generic.
* **Always** ensure logos render in both light and dark mode (white-on-dark, black-on-light, or single-color theme variable).
* **LOGO-ONLY rule (mandatory):** logo wall = logos and nothing else. Do NOT print industry / category labels below each logo (no `Vercel` + `hosting` underneath, no `Stripe` + `payments`, no `Cloudflare` + `infra`). The logo is the credibility, the label adds nothing the user does not already know. Optional: brand name as alt-text for screen readers, optional link to the brand's site. That is it.

**Hand-rolled illustrations:**
* SVG icons from libraries: fine (see Section 3.C).
* Hand-rolled decorative SVGs (custom illustrations, logos, marks): **strongly discouraged**, never as default. Acceptable only when:
  - The brief explicitly calls for it ("draw me an SVG logo")
  - It's a single, simple geometric mark (a square, a circle, a wordmark in display type)
  - You're confident in the output quality

**Div-based fake screenshots are banned.** A "hand-built product preview" rendered with `<div>` rectangles, fake task lists, fake dashboards, fake terminal windows is a Tell. If you need to show a product:
* Use a real screenshot URL if one exists
* Generate one via image tool
* Use a real component preview (an actual mini-version of the UI inside the page)
* Or skip the preview entirely and use editorial photography

**Hero needs a real visual.** Text + gradient blob is not a hero - it's a placeholder.

### 4.9 Content Density

Landing pages live on the **first impression**, not the full read. Cut ruthlessly.

* **Default content shape per section:** short headline (≤ 8 words) + short sub-paragraph (≤ 25 words) + one visual asset OR one CTA. Anything more must be justified by the section's job.
* **No data-dump sections.** A 20-row publication table, a 30-row award list, a giant pricing matrix on a marketing page = wrong layout. Use:
  - Top 3-5 highlights + "View full list" link
  - Marquee / carousel for breadth
  - Different page entirely if the data is the product
* **Long lists need a different UI component, not a longer list.** Default `<ul>` with bullets / `divide-y` rows is the lazy choice. If you have > 5 items, reach for one of these instead:
  - 2-column split with grouped items
  - Card grid with image + label per item
  - Tabs / accordion if items are categorisable
  - Horizontal scroll-snap pills
  - Carousel for breadth-heavy lists (testimonials, logos, capabilities)
  - Marquee for "lots-of-things-that-don't-need-individual-attention"
  A spec sheet with 10 rows + a hairline under every row is the WORST default. Either group rows into 2-3 chunks with sparse dividers, or move to a card-per-spec layout.
* **Spec sheets specifically (the Marrow-cookware pattern).** A long product specification table with `border-b` on every row is the AI default for cookware / hardware / apparel / artisan-goods briefs. Banned. Concrete alternatives:
  - **2-col card grid:** each spec gets its own card with the spec name, the value (large display number), and a one-line "why it matters" body. Cards arranged 2-col on desktop, 1-col mobile.
  - **Scroll-snap horizontal pills:** each spec is a pill, user can flick through.
  - **Grouped chunks:** group 10 specs into 3 logical clusters (e.g. "Materials", "Cooking", "Warranty"), each cluster gets ONE soft divider and a cluster heading.
  - **Featured-vs-rest:** 3-4 hero specs visualised as large display tiles, the rest collapsed under a "View full specifications" disclosure.

* **COPY SELF-AUDIT (mandatory before ship):** Before declaring any task done, re-read every visible string on the page (headlines, subheads, eyebrows, button labels, body copy, captions, alt text, footer text, error messages). Flag any string that is:
  - **Grammatically broken** ("free on its past", "two plans but one is honest", "to put it on the table" out of context)
  - **Has unclear referents** ("we plan to stay that way" without prior context)
  - **Sounds like AI hallucination** (cute-but-wrong wordplay, forced metaphors that don't track, "elegant nothing" phrases)
  - **Reads like an LLM trying to sound thoughtful** (passive-aggressive humility, fake-craftsman labels, mock-poetic micro-meta)
  Rewrite every flagged string. If unsure whether a string makes sense, replace it with a plain functional sentence. AI-generated cute copy is worse than boring copy.
* **Fake-precise numbers are flagged.** Numbers like `92%`, `4.1×`, `48k`, `5.8 mm`, `13.4 lb` either:
  - Come from real data (brief, brand guidelines, public metrics) - fine
  - Are explicitly labeled as mock (`<!-- mock -->`, "example", "sample data") - fine
  - Are AI-invented spec aesthetics - banned. Don't fake engineering precision the brand doesn't claim.
* **One copy register per page.** Don't mix technical mono ("47 tasks · 0.6 ctx-switches/day"), editorial prose, and marketing punch in the same composition unless the brand voice explicitly calls for it.

### 4.10 Quotes & Testimonials

* **Max 3 lines** of quote body. Never 6. If the original quote is longer → cut it. A landing-page quote is a snippet, not the full review.
* For very small font sizes (e.g. footer-style testimonials), the line cap can stretch slightly. Spirit: "fits in a glance."
* **No em-dashes inside the quote text** as design flourish (long pauses, kinetic em-dashes, em-dash-bullets). See Section 9.G - em-dash is completely banned.
* Attribution: name + role + (optionally) company. Never name only ("- Sarah").
* Quote marks: use real typographic quotes ( " " ) or none at all. Not straight ASCII ( " ).

### 4.11 Page Theme Lock (Light / Dark Mode Consistency)

The page has ONE theme. Sections do not invert.

* If the page is dark mode, ALL sections are dark mode. No light-mode-warm-paper section sandwiched between dark sections (or vice versa). The user must not feel they walked into a different website mid-scroll.
* The exception: if the brief explicitly calls for a "Color Block Story" or "Theme Switch on Scroll" device AND that is a deliberate composition (one full theme switch with a strong transition, not random alternation), it is allowed once per page.
* Default behaviour: pick light, dark, or auto (`prefers-color-scheme`) at the page level and lock it. Section-level background tints within the same theme family are fine (`bg-zinc-950` next to `bg-zinc-900`); flipping to `bg-amber-50` in the middle of a `bg-zinc-950` page is broken.
* When using a design system with built-in theming (Radix Themes, shadcn/ui with `<Theme>`), set the theme ONCE in `layout.tsx` or the page root. Do not let individual sections override.

---

## 5. CONTEXT-AWARE PROACTIVITY

These are tools, not defaults. Use them when the design read calls for them. **None of these fire automatically.**

* **Liquid Glass / Glassmorphism:** Appropriate for premium consumer, Apple-adjacent, luxury brand, or media-overlay vibes. Inappropriate for dashboards, public-sector, or "boring B2B." When used, go beyond `backdrop-blur`: add a 1px inner border (`border-white/10`) and a subtle inner shadow (`shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`) for physical edge refraction. Provide a solid-fill fallback under `prefers-reduced-transparency`.
* **Magnetic Micro-physics:** Use when `MOTION_INTENSITY > 5` AND the brief reads premium / playful / agency. Implement EXCLUSIVELY with Motion's `useMotionValue` / `useTransform` outside the React render cycle. Never `useState`. See Section 3.B.
* **Perpetual Micro-Interactions** (Pulse, Typewriter, Float, Shimmer, Carousel): Use when `MOTION_INTENSITY > 5` AND the section actively benefits from motion (status indicators, live feeds, AI-feel). **Not every card needs an infinite loop.** If a section is informational, leave it still. Apply Spring Physics (`type: "spring", stiffness: 100, damping: 20`) - no linear easing.
* **"Motion claimed, motion shown."** If `MOTION_INTENSITY > 4`, the page must actually move: entry transitions on hero, scroll-reveal on key sections, hover physics on CTAs, at minimum. A static page that claims `MOTION_INTENSITY: 7` is broken. Conversely, if you cannot ship working motion in the available scope, drop the dial to 3 and ship a clean static page. Never half-build motion that breaks (cut-off ScrollTriggers, jumpy enters, missing cleanups).
* **MOTION MUST BE MOTIVATED (mandatory).** Before adding any animation, ask: "what does this animation communicate?" Valid answers: hierarchy (drawing attention to the right thing), storytelling (revealing content in sequence that matches a narrative), feedback (acknowledging a user action), state transition (showing something changed). Invalid answer: "it looked cool". GSAP everywhere because GSAP is available is amateur. Each ScrollTrigger, each marquee, each pinned section needs a reason. If you cannot articulate the reason in one sentence, drop the animation.
* **MARQUEE MAX-ONE-PER-PAGE (mandatory).** Horizontal scrolling text marquees ("logos endlessly scrolling", "manifesto scrolling sideways", "kinetic word strip") are appropriate at most ONCE per page. Two or more marquees on the same page reads as lazy filler. Pick the one section where the marquee actually serves the content; the others get a different layout.
* **GSAP Sticky-Stack Pattern (when scroll-stack is used).** A "card stack on scroll" must be a REAL sticky-stack, not a sequential reveal list. See Section 5.A below for the canonical code skeleton. Common failure: trigger fires halfway through scroll instead of pinning at viewport top. Fix: `start: "top top"` not `start: "top center"` or `"top 80%"`.
* **GSAP Horizontal-Pan Pattern (when horizontal scroll-hijack is used).** See Section 5.B below for the canonical skeleton. Common failure: animation starts before the section is pinned, so the user sees half a slide. Same fix: `start: "top top"`, pin the wrapper, scrub the inner track.

### 5.A Sticky-Stack - Canonical Skeleton

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",                              // pin at viewport top
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div
          key={i}
          className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center"
        >
          {card}
        </div>
      ))}
    </div>
  );
}
```

Critical points: `start: "top top"`, `pin: true`, every card except the last is pinned, the scale/opacity transform is driven by the NEXT card's scroll trigger (so previous card shrinks as next one arrives).

### 5.B Horizontal-Pan - Canonical Skeleton

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalPan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",                              // pin starts when section top hits viewport top
          end: () => `+=${distance}`,                    // scroll distance = track width minus viewport
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={wrap} className="relative overflow-hidden">
      <div ref={track} className="flex h-[100dvh] items-center">
        {children}
      </div>
    </section>
  );
}
```

Critical points: `start: "top top"`, `pin: true`, `end: "+=${distance}"` (scroll length = horizontal travel needed), `scrub: 1`. The wrapper is pinned, the inner track slides horizontally as the user scrolls vertically.

### 5.C Scroll-Reveal Stagger - Canonical Skeleton (lighter alternative)

For simple "items appear as they enter viewport" (no pinning), prefer Motion's `whileInView` over GSAP - lighter, no ScrollTrigger needed:

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function RevealStagger({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: i * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```

Use this for: feature lists, testimonial grids, logo walls, anything that just needs "enter on scroll." Save GSAP for actual pin/scrub work.

### 5.D Forbidden Animation Patterns

* **`window.addEventListener("scroll", ...)`** is banned. It runs on every scroll frame, jank-prone, no batching. Use Motion's `useScroll()`, GSAP's `ScrollTrigger`, IntersectionObserver, or CSS `scroll-driven animations` (`animation-timeline: view()`).
* **Custom scroll progress calculations using `window.scrollY`** in React state. Same reason. Re-renders on every frame.
* **`requestAnimationFrame` loops that touch React state.** Use motion values (`useMotionValue` + `useTransform`) instead.
* **Layout Transitions:** Use Motion's `layout` and `layoutId` props for visible state changes (re-ordering lists, expanding modals, shared elements between routes). Do not wrap static content in `layout` props "for safety" - it costs measurement work.
* **Staggered Orchestration:** Use `staggerChildren` (Motion) or CSS cascade (`animation-delay: calc(var(--index) * 100ms)`) for reveal moments where sequence matters. For `staggerChildren`, parent (`variants`) and children MUST share the same Client Component tree.

---

## 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS

### 6.A Hardware Acceleration
* Animate ONLY `transform` and `opacity`. Never animate `top`, `left`, `width`, `height`.
* Use `will-change: transform` sparingly - only on elements that will actually animate.

### 6.B Reduced Motion (mandatory)
* **Any motion above `MOTION_INTENSITY > 3` MUST honor `prefers-reduced-motion`.** This is non-negotiable.
* In Motion: wrap with `useReducedMotion()` and degrade to static.
* In CSS: gate animations behind `@media (prefers-reduced-motion: no-preference)` or provide an override block under `@media (prefers-reduced-motion: reduce)` that disables.
* Infinite loops, parallax, scroll-hijack, and magnetic physics MUST collapse to static / instant under reduced motion.

### 6.C Dark Mode (mandatory for any consumer-facing page)
* Design for **both modes from the start**. Never ship light-only or dark-only without explicit user instruction.
* Use Tailwind `dark:` variant OR CSS variables for tokens. Pick one strategy per project.
* **Do not prescribe specific dark-mode colors here.** The brief decides. Maintain visual hierarchy, brand identity, and WCAG AA contrast (AAA for body) across both modes.
* Respect `prefers-color-scheme: dark`. Default to system preference unless the brand insists on one mode.

### 6.D Core Web Vitals Targets
* **LCP** < 2.5s. Hero image must be `next/image priority` or preloaded.
* **INP** < 200ms. Heavy work off main thread.
* **CLS** < 0.1. Reserve space for images, fonts, embeds.
* Run Lighthouse before declaring a page done.

### 6.E DOM Cost
* Apply grain / noise filters EXCLUSIVELY to fixed, `pointer-events-none` pseudo-elements (e.g., `fixed inset-0 z-[60] pointer-events-none`). NEVER on scrolling containers - continuous GPU repaints destroy mobile FPS.
* Be aware of bundle size. Motion is not tiny. Three.js is large. Lazy-load anything that's not above-the-fold.

### 6.F Z-Index Restraint
NEVER spam arbitrary `z-50` or `z-10`. Use z-index strictly for systemic layer contexts (sticky navbars, modals, overlays, grain). Document the z-index scale in a project constants file.

---

## 7. DIAL DEFINITIONS (Technical Reference)

### DESIGN_VARIANCE (Level 1-10)
* **1-3 (Predictable):** Symmetrical CSS Grid (12-col, equal fr-units), equal paddings, centered alignment.
* **4-7 (Offset):** `margin-top: -2rem` overlaps, varied image aspect ratios (4:3 next to 16:9), left-aligned headers over center-aligned data.
* **8-10 (Asymmetric):** Masonry layouts, CSS Grid with fractional units (`grid-template-columns: 2fr 1fr 1fr`), massive empty zones (`padding-left: 20vw`).
* **MOBILE OVERRIDE:** For levels 4-10, asymmetric layouts above `md:` MUST collapse to strict single-column (`w-full`, `px-4`, `py-8`) on viewports `< 768px`.

### MOTION_INTENSITY (Level 1-10)
* **1-3 (Static):** No automatic animations. CSS `:hover` and `:active` states only. `prefers-reduced-motion` is the default mode anyway.
* **4-7 (Fluid CSS):** `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`. `animation-delay` cascades for load-ins. Focus on `transform` and `opacity`.
* **8-10 (Advanced Choreography):** Complex scroll-triggered reveals, parallax, scroll-driven animation (CSS `animation-timeline` or GSAP ScrollTrigger). Use Motion hooks. **NEVER use `window.addEventListener('scroll')`** - it is a hard ban, not a "prefer-not." See Section 5.D for the allowed alternatives.

### VISUAL_DENSITY (Level 1-10)
* **1-3 (Art Gallery):** Lots of white space. Huge section gaps (`py-32` to `py-48`). Expensive, clean.
* **4-7 (Daily App):** Standard web app spacing (`py-16` to `py-24`).
* **8-10 (Cockpit):** Tight paddings. No card boxes; 1px lines separate data. Mandatory: `font-mono` for all numbers.

---

## 8. DARK MODE PROTOCOL

Dual-mode by default. Never assume light-only unless the brief is print-emulating editorial.

### 8.A Token Strategy (pick one, stick to it)
* **Tailwind `dark:` variant** (default for utility-first projects): every color utility paired with its dark variant (`bg-white dark:bg-zinc-950`, `text-gray-900 dark:text-gray-100`).
* **CSS variables** (for shadcn/ui, Radix Themes, or component libraries with theming): define semantic tokens (`--surface`, `--surface-elevated`, `--text-primary`, `--accent`) and swap values under `[data-theme="dark"]` or `@media (prefers-color-scheme: dark)`.

### 8.B Do Not Prescribe Specific Colors Here
The brief and brand decide. This skill enforces only:
* **Contrast** - WCAG AA minimum for body text, AAA target for hero copy.
* **Hierarchy parity** - visual hierarchy that works in light must work in dark. If a CTA pops in light, it pops in dark.
* **Brand fidelity** - primary brand color stays recognisable. Don't desaturate the brand into a dark mode.
* **No pure `#000000` and no pure `#ffffff`** - use off-black (zinc-950, near-black warm gray) and off-white. Pure values kill depth.

### 8.C Default Mode
Respect `prefers-color-scheme` unless the brand insists. Add a manual toggle if either mode would lose key brand expression.

### 8.D Test in Both Modes Before Finishing
Open the page in both modes during development. Do not ship a page you've only seen in one mode.

---

## 9. AI TELLS (Forbidden Patterns)

Avoid these signatures unless the brief explicitly asks for them.

### 9.A Visual & CSS
* **NO neon / outer glows** by default. Use inner borders or subtle tinted shadows.
* **NO pure black (`#000000`).** Off-black, zinc-950, or charcoal.
* **NO oversaturated accents.** Desaturate to blend with neutrals.
* **NO excessive gradient text** for large headers.
* **NO custom mouse cursors.** Outdated, accessibility-hostile, perf-hostile.

### 9.B Typography
* **AVOID Inter as default.** See Section 4.1. Override path exists.
* **NO oversized H1s** that just scream. Control hierarchy with weight + color, not raw scale.
* **Serif constraints:** Serif for editorial / luxury / publication. Not for dashboards.

### 9.C Layout & Spacing
* **Mathematically perfect** padding and margins. No floating elements with awkward gaps.
* **NO 3-column equal feature cards.** The generic "three identical cards horizontally" feature row is banned. Use 2-column zig-zag, asymmetric grid, scroll-pinned, or horizontal-scroll alternative.

### 9.D Content & Data ("Jane Doe" Effect)
* **NO generic names.** "John Doe", "Sarah Chan", "Jack Su" → use creative, realistic, locale-appropriate names.
* **NO generic avatars.** No SVG "egg" or Lucide user icons → use believable photo placeholders or specific styling.
* **NO fake-perfect numbers.** Avoid `99.99%`, `50%`, `1234567`. Use organic, messy data (`47.2%`, `+1 (312) 847-1928`).
* **NO startup-slop brand names.** "Acme", "Nexus", "SmartFlow", "Cloudly" → invent contextual, premium names that sound real.
* **NO filler verbs.** "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionize" → concrete verbs only.

### 9.E External Resources & Components
* **NO hand-rolled SVG icons.** Use Phosphor / HugeIcons / Radix / Tabler. Lucide on explicit request only.
* **Hand-rolled decorative SVGs strongly discouraged** as default (see Section 4.8).
* **NO div-based fake screenshots.** Never build a fake product UI out of `<div>` rectangles to simulate a screenshot. Use real images, generated images, or skip the preview.
* **NO broken Unsplash links.** Use `https://picsum.photos/seed/{descriptive-string}/{w}/{h}`, or generated photo placeholders, or actual assets.
* **shadcn/ui customization:** Allowed, but NEVER in default state. Customize radii, colors, shadows, typography to the project aesthetic.
* **Production-Ready Cleanliness:** Code visually clean, memorable, meticulously refined.

### 9.F Production-Test Tells (banned outright)

These patterns came out of real LLM-generated landing-page tests. They are the signatures the model defaults to when it tries to "look designed." Treat them as hard bans unless the brief explicitly calls for one.

**Hero & top-of-page**
* **NO version labels in the hero.** `V0.6`, `v2.0`, `BETA`, `INVITE-ONLY PREVIEW`, `EARLY ACCESS`, `ALPHA` - banned as default eyebrows. Only acceptable when the brief is explicitly about a product launch / preview status.
* **NO "Brand · No. 01"-style sub-eyebrows.** "Marrow · No. 01 · The 6-quart" type micro-meta lines. Skip them.

**Section numbering & micro-labels**
* **NO section-number eyebrows.** `00 / INDEX`, `001 · Capabilities`, `002 · Featured commission`, `06 · how it works`, `05 · The honest table` - banned. Eyebrows should name the topic in plain language, not enumerate.
* **NO `01 / 4`-style pagination on images or bento tiles.** If the user can count, they don't need the label.
* **NO `Scroll · 001 Capabilities`-style scroll cues.** A simple arrow or "Scroll" is enough; no section-number prefix.
* **NO "Index of Work, 2018 - 2026"-style range labels** as eyebrows. Just say what the section is.

**Separators & dots**
* **The middle-dot (`·`) is rationed.** Maximum 1 per line in metadata strips. Do NOT use it as the default separator for everything ("foo · bar · baz · qux · quux"). If you need a separator family, prefer line breaks, hairlines, or columns.
* **NO decorative colored status dots on every list/nav/badge.** A colored dot before "ONE Q4 SLOT OPEN" or before every nav link, or every task row - banned by default. Acceptable only when the dot conveys actual semantic state (a server status, an availability flag) and is used sparingly.

**Em-dashes & typography flourishes**
* **NO em-dash (`—`) as a design element OR anywhere else.** See Section 9.G below for the complete, non-negotiable ban. The em-dash character is forbidden in headlines, eyebrows, pills, body copy, quotes, attribution, captions, button text, and alt text. Use the regular hyphen (`-`).
* **NO `<br>`-broken-and-italicized headlines** as a default "design move." "for thirty\<br\>*years.*" type splits. Headlines should read naturally first, get clever only when the brief demands it.
* **NO vertical rotated text** ("INDEX OF WORK, 2018 - 2026" rotated 90°). Agency-portfolio cliché. Use it only when the brief is explicitly agency / Awwwards / experimental AND it serves a real composition purpose.
* **NO crosshair / hairline grid lines as decoration.** Vertical and horizontal lines drawn just to make the page "feel designed" - banned. Use them only when they organize real content.

**Fake product previews**
* **NO div-based fake product UI in the hero** (fake task list, fake terminal, fake dashboard built from styled divs). It is the #1 LLM-design Tell. Use a real screenshot, a generated image, a real component preview, or none at all.
* **NO fake version footers** ("v0.6.2-rc.1", "last sync 4s ago · main") inside fake screenshots. Adds nothing, screams AI.

**Marketing-copy Tells**
* **NO "Quietly in use at" / "Quietly trusted by"** social-proof headers. Use natural language: "Trusted by", "Used at", "Customers include", or skip the heading entirely if the logos speak.
* **NO "From the field" / "Field notes" / "Currently on the bench" / "On our desks" / "Loose plates" style poetic labels** on quote, blog, or sidebar sections. Reads as performative-craftsman. Use plain functional labels ("Testimonials", "Latest writing", "Now working on") or skip the label.
* **NO "We respect the French ones"-style** mock-humble industry-references in body copy. Cute and AI-y.
* **NO weather / locale strips** ("LIS 14:23 · 18°C") in headers/footers unless the brief is explicitly about a place / time-zone-distributed studio.
* **NO micro-meta-sentences under eyebrows.** Sentences like *"Each of these is a feature we ship today, not a roadmap promise. The list will stay short on purpose."* sitting under a section heading are clutter. Eyebrow + Headline + Body is enough.
* **NO generic step labels.** "Stage 1 / Stage 2 / Stage 3", "Step 1 / Step 2 / Step 3", "Phase 01 / Phase 02 / Phase 03", "Pass One / Pass Two / Pass Three". Banned. The actual step content is the label. If you must show progression, use the verb-noun directly ("Install", "Configure", "Ship") not "Stage 1: Install".

**Pills, labels and version stamps**
* **NO pills/labels/tags overlaid on images.** No `<span>` overlays on photos with tags like `Brand · 02`, `PLATE · BRAND`, `Field notes - journal`. Either let the image speak alone, or add a caption directly below (outside the image).
* **NO photo-credit captions as decoration.** Strings like `Field study no. 12 · Ines Caetano`, `Plate 03 · House archive`, `Frame XII · 35mm` under stock/picsum images are pretentious. Photo credit is allowed ONLY when there is a real photographer being credited for a real photo (with permission). Otherwise: skip the caption or use a one-line functional caption ("The 6-quart, in Sage.").
* **NO version footers on marketing pages.** Footer strings like `v1.4.2`, `Build 0048`, `last sync 4s ago · main` are CLI / devtool fixtures, not landing-page content. Banned on marketing/landing/portfolio pages.
* **NO "Reservation 412 of 800"-style live-stock counters** as decoration. Only if the brief is explicitly a limited-run waitlist with real data.

**Decoration text strips**
* **NO decoration text strip at hero bottom.** Patterns like `BRAND. MOTION. SPATIAL.`, `TYPE / FORM / MOTION`, `DESIGN · BUILD · SHIP`, `ESTD. 2018 · LISBON · BRAND. MOTION. SPATIAL.` as a small mono-caps strip across the bottom of the hero are an agency-portfolio cliché. Banned by default. Only acceptable when the strip carries real, navigable links (sticky bottom nav) or real status info (cookie banner, build info on a docs site).
* **NO floating top-right sub-text in section headings.** Pattern: section has a giant left-aligned headline; in the top-right corner of the same section header there is a small explainer paragraph floating with no clear alignment to anything else. That floater is the Tell. Either put the sub-text directly under the headline, or build a clean 2-column header (left: headline, right: aligned body), but not a tiny corner paragraph.

**Lists, dividers and scoring**
* **NO `border-t` + `border-b` on every row of a long list / spec table.** Pick one (bottom-border between rows OR top-border above the group) and use it sparsely. A 10-row spec table with hairlines under each row is the laziest layout - see Section 4.9 for alternative UI components.
* **NO scoring/progress bars with filled background tracks** as comparison visuals. If you need to show "X out of Y" comparisons, prefer a number + small icon, or a tiny inline bar WITHOUT a background track. Big filled `bg-zinc-200` tracks with a partial fill on top are dashboard-UI clutter on a landing page.

**Locale, time, scroll cues**
* **Locale / city-name / time / weather strips are banned for 99% of briefs.** "Lisbon, working with founders" in the hero, "1200-690 Lisbon, Portugal" in the footer, "Lisbon 14:23 · 18°C" in the nav. These are agency-portfolio decoration tells. Allowed ONLY when: the brief explicitly describes a globally-distributed studio with timezone-relevant work, OR a travel-focused brand, OR a real-world physical venue. A single contact-address mention in the footer is fine; an atmospheric locale strip is not.
* **Scroll cues are banned.** `Scroll`, `↓ scroll`, `Scroll to explore`, `Scroll to walk through it`, animated mouse-wheel icons. If the user has not scrolled yet, they are looking at the hero. They know what scroll is. The bottom of the viewport does not need a label.
* **ZERO decorative status dots by default.** A coloured dot before nav items, before list rows, before badges, before status labels is a Tell. Only acceptable when conveying real semantic state (a live indicator on actual server status, a live availability flag) and limited to one per page section.

### 9.G EM-DASH BAN (the single most-violated Tell)

**Em-dash (`—`) is COMPLETELY banned.** It is the LLM's signature stylistic crutch and it is the #1 visual Tell in production tests. There is no "limited use" allowance, no "natural language frequency" allowance, no "in body copy is fine" allowance. None.

* **Banned in headlines.** Use a period or a comma.
* **Banned in eyebrows / labels / pills / button text / image captions / nav items.** Replace with line breaks, columns, or hairlines.
* **Banned in body copy.** Restructure the sentence: two sentences with a period, OR a comma, OR parentheses, OR a colon.
* **Banned in quote attribution.** Use a normal hyphen with spaces (` - `) or a line break + smaller-weight name.
* **Banned in en-dash form too (`–`) when used as a separator.** Date ranges (`2018-2026`) use a hyphen. Number ranges (`€40-80k`) use a hyphen.

The ONLY permitted dash characters on the page are:
* Regular hyphen `-` (for compound words, ranges, line dividers in markup)
* Minus sign in math (`-5°C`)

If your output contains a single `—` or `–` anywhere visible to the user, the output fails the Pre-Flight Check and must be rewritten.

This rule is non-negotiable. The agent has historically ignored em-dash limits when phrased as "use sparingly." The phrasing here is binary: zero em-dashes.

---

## 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)

This is a vocabulary, not a library. The agent should KNOW these pattern names to communicate about them, design with them in mind, and reach for them when the design read calls for them. **Implementations and code sketches live in the Block Library (Section 12), which is populated iteratively.**

### Hero Paradigms
* **Asymmetric Split Hero** - Text on one side, asset on the other, generous white space.
* **Editorial Manifesto Hero** - Large type, no asset, almost-poster.
* **Video / Media Mask Hero** - Type cut out as mask over video background.
* **Kinetic-Type Hero** - Animated typography as the primary visual.
* **Curtain-Reveal Hero** - Hero parts on scroll like a curtain.
* **Scroll-Pinned Hero** - Hero stays pinned while content scrolls behind.

### Navigation & Menus
* **Mac OS Dock Magnification** - Edge nav, icons scale fluidly on hover.
* **Magnetic Button** - Pulls toward cursor.
* **Gooey Menu** - Sub-items detach like viscous liquid.
* **Dynamic Island** - Morphing pill for status / alerts.
* **Contextual Radial Menu** - Circular menu expanding at click point.
* **Floating Speed Dial** - FAB springing into curved secondary actions.
* **Mega Menu Reveal** - Full-screen dropdown, stagger-fade content.

### Layout & Grids
* **Bento Grid** - Asymmetric tile grouping (Apple Control Center).
* **Masonry Layout** - Staggered grid, no fixed row height.
* **Chroma Grid** - Borders / tiles with subtle animating gradients.
* **Split-Screen Scroll** - Two halves sliding in opposite directions.
* **Sticky-Stack Sections** - Sections that pin and stack on scroll.

### Cards & Containers
* **Parallax Tilt Card** - 3D tilt tracking mouse coordinates.
* **Spotlight Border Card** - Borders illuminate under cursor.
* **Glassmorphism Panel** - Frosted glass with inner refraction.
* **Holographic Foil Card** - Iridescent rainbow shift on hover.
* **Tinder Swipe Stack** - Physical card stack, swipe-away.
* **Morphing Modal** - Button expands into its own dialog.

### Scroll Animations
* **Sticky Scroll Stack** - Cards stick and physically stack.
* **Horizontal Scroll Hijack** - Vertical scroll → horizontal pan.
* **Locomotive / Sequence Scroll** - Video / 3D sequence tied to scrollbar.
* **Zoom Parallax** - Central background image zooming on scroll.
* **Scroll Progress Path** - SVG line drawing along scroll.
* **Liquid Swipe Transition** - Page transition like viscous liquid.

### Galleries & Media
* **Dome Gallery** - 3D panoramic gallery.
* **Coverflow Carousel** - 3D carousel with angled edges.
* **Drag-to-Pan Grid** - Boundless draggable canvas.
* **Accordion Image Slider** - Narrow strips expanding on hover.
* **Hover Image Trail** - Mouse leaves popping image trail.
* **Glitch Effect Image** - RGB-channel shift on hover.

### Typography & Text
* **Kinetic Marquee** - Endless text bands reversing on scroll.
* **Text Mask Reveal** - Massive type as transparent window to video.
* **Text Scramble Effect** - Matrix-style decoding on load / hover.
* **Circular Text Path** - Text curving along spinning circle.
* **Gradient Stroke Animation** - Outlined text with running gradient.
* **Kinetic Typography Grid** - Letters dodging the cursor.

### Micro-Interactions & Effects
* **Particle Explosion Button** - CTA shatters into particles on success.
* **Liquid Pull-to-Refresh** - Reload indicator like detaching droplets.
* **Skeleton Shimmer** - Shifting light reflection across placeholders.
* **Directional Hover-Aware Button** - Fill enters from cursor's exact side.
* **Ripple Click Effect** - Wave from click coordinates.
* **Animated SVG Line Drawing** - Vectors drawing themselves in real time.
* **Mesh Gradient Background** - Organic lava-lamp blobs.
* **Lens Blur Depth** - Background UI blurred to focus foreground action.

### Animation Library Choice
* **Motion (`motion/react`)** - default for UI / Bento / state-change motion.
* **GSAP + ScrollTrigger** - for full-page scrolltelling and scroll hijacks. Isolate in dedicated leaf components with `useEffect` cleanup.
* **Three.js / WebGL** - for canvas backgrounds and 3D scenes. Same isolation rule.
* **NEVER mix GSAP / Three.js with Motion in the same component tree.** They fight over the same frames.

---

## 11. REDESIGN PROTOCOL

This skill handles **greenfield builds AND redesigns**. Misclassifying the mode is the single biggest source of bad redesign output.

### 11.A Detect the Mode (first action)
* **Greenfield** - no existing site, or full overhaul approved. Dial baseline from Section 1.
* **Redesign - Preserve** - modernise without breaking the brand. Audit first, extract brand tokens, evolve gradually.
* **Redesign - Overhaul** - new visual language on top of existing content. Treat as greenfield for visuals; preserve content and IA.

If ambiguous, ask **once**: *"Should this redesign preserve the existing brand, or are we starting visually from scratch?"*

### 11.B Audit Before Touching
Document the current state before proposing changes:
* **Brand tokens** - primary / accent colors, type stack, logo treatment, radii.
* **Information architecture** - page tree, primary nav, key conversion paths.
* **Content blocks** - what exists, what's doing work, what's filler.
* **Patterns to preserve** - signature interactions, recognisable hero, copy voice.
* **Patterns to retire** - AI-slop tells, broken layouts, dead links, generic stock imagery, perf traps.
* **Dial reading of the existing site** - infer current `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY`. That's your starting point, not the baseline.
* **SEO baseline** - current ranking pages, meta titles, structured data, OG cards. **SEO migration is the #1 redesign risk.**

### 11.C Preservation Rules
* **Do not change information architecture** unless asked. Keep page slugs, anchor IDs, primary nav labels stable for SEO and muscle memory.
* **Extract brand colors before applying Section 4.2.** A brand that is already purple stays purple - apply the LILA RULE's override.
* **Preserve copy voice** unless asked for a rewrite. Visual modernisation ≠ content rewrite.
* **Honor existing accessibility wins.** Do not regress focus states, alt text, keyboard nav, contrast.
* **Respect existing analytics events.** Do not rename buttons, form fields, section IDs that downstream tracking depends on.

### 11.D Modernisation Levers (priority order)
Apply in order - stop when the brief is satisfied:
1. **Typography refresh** - biggest visual lift per unit of risk.
2. **Spacing & rhythm** - increase section padding, fix vertical rhythm.
3. **Color recalibration** - desaturate, unify neutrals, keep brand accent.
4. **Motion layer** - add `MOTION_INTENSITY`-appropriate micro-interactions to existing components.
5. **Hero & key-section recomposition** - restructure top-of-funnel using Section 10 vocabulary.
6. **Full block replacement** - only when the existing block is unsalvageable.

### 11.E Decision Tree: Targeted Evolution vs Full Redesign
* IA, content, and SEO sound → **targeted evolution** (Levers 1-4). ~70% of value at ~40% of risk.
* Visual debt is structural (broken IA, no design system, broken mobile) → **full redesign** with strict content preservation.
* Brand itself is changing → **greenfield**.

### 11.F What Never Changes Silently
Never modify without explicit user approval:
* URL structure / route slugs.
* Primary nav labels.
* Form field names or order (breaks analytics + autofill).
* Brand logo or wordmark.
* Existing legal / consent / cookie copy.

---

## 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)

The Reference Vocabulary (Section 10) names patterns. The Block Library implements them with real props, real motion specs, and real code sketches.

**Status:** schema defined here. Blocks will be added iteratively. Do not freelance new blocks without following this schema.

### 12.A File Location
```
skills/taste-skill/blocks/
  hero/
    asymmetric-split.md
    editorial-manifesto.md
    kinetic-type.md
    ...
  feature/
    bento-grid.md
    sticky-scroll-stack.md
    zig-zag.md
    ...
  social-proof/
  pricing/
  cta/
  footer/
  navigation/
  portfolio/
  transition/
```

### 12.B Required Frontmatter
```yaml
---
name: asymmetric-split-hero
category: hero
dial_compatibility:
  variance: [6, 10]
  motion: [3, 10]
  density: [2, 5]
when_to_use: "Landing pages with one strong asset and one strong message. Default hero for SaaS, agency, premium consumer."
not_for: "Editorial / manifesto launches where the message IS the design."
stack: ["react", "next", "tailwind", "motion"]
---
```

### 12.C Required Body Sections
1. **Visual sketch** - short ASCII or description of the layout.
2. **Props API** - the component's interface.
3. **Code sketch** - minimal working implementation (Server Component default, Client island for motion).
4. **Mobile fallback** - explicit collapse rules for `< 768px`.
5. **Motion variants** - one variant per `MOTION_INTENSITY` band (1-3, 4-7, 8-10). Reduced-motion fallback explicit.
6. **Dark-mode notes** - token strategy specific to this block.
7. **Anti-patterns** - common ways this block goes wrong.
8. **References** - links to real examples in production.

### 12.D Block-Library Discipline
* One block per file. No multi-block files.
* Every block must work standalone (drop it into a page, it renders).
* Every block must pass the Pre-Flight Check (Section 14).
* Blocks that depend on a design system from Section 2.A live under `blocks/<category>/<name>--<system>.md` (e.g. `feature/bento-grid--material.md`).

---

## 13. OUT OF SCOPE

This skill is NOT for:
* Dashboards / dense product UI / admin panels (use Fluent, Carbon, Atlassian, or Polaris from Section 2.A).
* Data tables (use TanStack Table or AG Grid).
* Multi-step forms / wizards (use Form-specific patterns; this skill won't make them better).
* Code editors (use Monaco / CodeMirror with their official skinning).
* Native mobile (use Apple HIG / Material directly).
* Realtime collab UIs (presence, cursors, OT-aware - different problem class).

If the brief is one of the above, **say so explicitly**, point to the right tool, and only apply this skill's marketing-page / about-page / landing-page parts to the surfaces where they apply.

---

## 14. FINAL PRE-FLIGHT CHECK

Run this matrix before outputting code. This is the last filter.

**THIS IS NOT OPTIONAL. Run every box. If any box fails, the output is not done.**

- [ ] **Brief inference** declared (Section 0.B one-liner)?
- [ ] **Dial values** explicit and reasoned from the brief, not silently using baseline?
- [ ] **Design system** chosen from Section 2 if applicable, or aesthetic labeled honestly?
- [ ] **Redesign mode** detected and audit performed (if applicable, Section 11)?
- [ ] **ZERO em-dashes (`—`) anywhere on the page.** Headlines, eyebrows, pills, body, quotes, attribution, captions, buttons, alt text. Zero. (Section 9.G - non-negotiable.)
- [ ] **Page Theme Lock**: ONE theme (light, dark, or auto) for the whole page. No section flips to inverted mode mid-page (Section 4.11)?
- [ ] **Color Consistency Lock**: one accent color used identically across all sections (Section 4.2)?
- [ ] **Shape Consistency Lock**: one corner-radius system applied consistently (Section 4.4)?
- [ ] **Button Contrast Check**: every CTA text is readable against its background (no white-on-white, WCAG AA 4.5:1)?
- [ ] **CTA Button Wrap**: no CTA label wraps to 2+ lines at desktop?
- [ ] **Form Contrast Check**: form inputs, placeholders, focus rings, labels all pass WCAG AA against the section background?
- [ ] **Serif discipline**: if a serif is used, it is NOT Fraunces or Instrument_Serif (or it is, with explicit brand justification)? Different serif from your previous project?
- [ ] **Premium-consumer palette check**: if the brief is premium-consumer (cookware / wellness / artisan / luxury), the palette is NOT the AI-default beige+brass+oxblood+espresso family? Different family from your previous premium-consumer project?
- [ ] **Italic descender clearance**: every italic word with `y g j p q` has `leading-[1.1]` min + `pb-1` reserve?
- [ ] **Hero fits the viewport**: headline ≤ 2 lines, subtext ≤ 20 words AND ≤ 4 lines, CTA visible without scroll, font scale planned around image?
- [ ] **Hero top padding**: max `pt-24` at desktop, hero content does not float halfway down the viewport?
- [ ] **Hero stack discipline**: max 4 text elements in hero (eyebrow OR brand strip, headline, subtext, CTAs)? No tiny tagline below CTAs, no trust micro-strip in hero?
- [ ] **EYEBROW COUNT (mechanical)**: count instances of `uppercase tracking` micro-labels above section headlines across all components. Count ≤ ceil(sectionCount / 3)? Hero counts as 1.
- [ ] **Split-Header Ban**: no "left big headline + right small explainer paragraph" pattern as a section header (vertical stack instead)?
- [ ] **Zigzag Alternation Cap**: no 3+ consecutive sections with the same image+text-split layout?
- [ ] **No Duplicate CTA Intent**: no two CTAs with the same intent ("Get in touch" + "Let's talk" both on page = Fail)?
- [ ] **Logo wall = logo only**: no industry / category labels printed below logos?
- [ ] **Bento Background Diversity**: at least 2-3 bento cells have real visual variation (image, gradient, pattern), not all white-on-white text cards?
- [ ] **"Used by / Trusted by" logo wall** lives UNDER the hero, not inside it, uses REAL SVG logos (Simple Icons / devicon) or generated SVG marks, NOT plain text wordmarks?
- [ ] **Copy Self-Audit**: every visible string re-read, no grammatically-broken or AI-hallucinated phrases ("free on its past" type) shipped?
- [ ] **Motion motivated**: every animation can be justified in one sentence (hierarchy / storytelling / feedback / state transition), no GSAP-for-show?
- [ ] **Marquee max-one-per-page**: no two horizontal marquees on the same page?
- [ ] **Navigation on ONE line** at desktop, height ≤ 80px?
- [ ] **Section-Layout-Repetition** check: no two sections share the same layout family (at least 4 different families across 8 sections)?
- [ ] **Bento has rhythm AND exact cell count** (N items → N cells, no empty cells in middle or at end)?
- [ ] **Long lists use the right UI component** (not default `<ul>` with `divide-y` for > 5 items - see Section 4.9 alternatives)?
- [ ] **Real images used** (gen-tool first, then Picsum-seed, then explicit placeholder slots) - NO div-based fake screenshots, NO hand-rolled decorative SVGs, NO pure-text minimalism?
- [ ] **No pills/labels overlaid on images** (no `Plate · Brand`, no `Field notes - journal`)?
- [ ] **No photo-credit captions as decoration** (`Field study no. 12 · Ines Caetano`)?
- [ ] **No version footers** (`v1.4.2`, `Build 0048`) on marketing pages?
- [ ] **No micro-meta-sentences** under eyebrows ("Each of these is a feature we ship today...")?
- [ ] **No decoration text strip at hero bottom** (`BRAND. MOTION. SPATIAL.`)?
- [ ] **No floating top-right sub-text** in section headings?
- [ ] **No scoring/progress bars with filled background tracks** as comparison visuals?
- [ ] **No locale / city-name / time / weather strips** unless brief is genuinely globally-distributed or place-focused?
- [ ] **No scroll cues** (`Scroll`, `↓ scroll`, `Scroll to explore`)?
- [ ] **No version labels in hero** (V0.6, BETA, INVITE-ONLY) unless the brief is a launch?
- [ ] **No section-numbering eyebrows** (`00 / INDEX`, `001 · Capabilities`, `06 · how it works`)?
- [ ] **No decorative dots** (zero by default, only for real semantic state)?
- [ ] **No `border-t` + `border-b` on every row** of long lists / spec tables?
- [ ] **Content density** sane: no 20-row data tables, no fake-precise specs without justification, ≤ 25-word sub-paragraphs by default?
- [ ] **Quotes ≤ 3 lines** of body, attribution clean (no em-dash)?
- [ ] **Motion claimed = motion shown**: if `MOTION_INTENSITY > 4`, page actually animates, not just claimed?
- [ ] **GSAP sticky-stack / horizontal-pan** implemented per Section 5.A / 5.B canonical skeleton (`start: "top top"`, `pin: true`, correct scrub)?
- [ ] **No `window.addEventListener('scroll')`** - using Motion `useScroll()` / ScrollTrigger / IntersectionObserver / CSS scroll-driven animations only?
- [ ] **Reduced motion** wrapped for everything `MOTION_INTENSITY > 3`?
- [ ] **Dark mode** tokens defined and tested in both modes?
- [ ] **Mobile collapse** explicit (`w-full`, `px-4`, `max-w-7xl mx-auto`) for high-variance layouts?
- [ ] **Viewport stability**: `min-h-[100dvh]`, never `h-screen`?
- [ ] **`useEffect` animations** have strict cleanup functions?
- [ ] **Empty / loading / error** states provided?
- [ ] **Cards omitted** in favor of spacing where possible?
- [ ] **Icons** from an allowed library only (Phosphor / HugeIcons / Radix / Tabler), no hand-rolled SVG paths?
- [ ] **Motion** isolated in client-leaf components with `'use client'` at the top, memoized?
- [ ] **No AI Tells** from Section 9 (Inter as default, AI-purple, three-equal cards, Jane Doe, Acme, "Quietly in use at")?
- [ ] **Core Web Vitals** plausibly hit (LCP < 2.5s, INP < 200ms, CLS < 0.1)?
- [ ] **One design system** per project (no Material + shadcn mixed)?

If a single checkbox cannot be honestly ticked, the page is not done. Fix it before delivering.

---

# APPENDICES - Real Source-Backed Reference Material

The sections below are vendored reference content. They give the agent real install commands, real canonical doc links, and real working starter snippets for each design system named in Section 2. Use them to ground decisions in production reality, not training-data fiction.

## Appendix A - Install Commands per Design System

```bash
# Material Web (Material 3)
npm install @material/web

# Fluent UI React (v9)
npm install @fluentui/react-components

# Fluent UI Web Components (framework-free)
npm install @fluentui/web-components @fluentui/tokens

# IBM Carbon
npm install @carbon/react @carbon/styles

# Radix Themes
npm install @radix-ui/themes

# shadcn/ui (open code, owned components)
npx shadcn@latest init
npx shadcn@latest add button card badge separator input

# Primer CSS (GitHub product/devtool UI)
npm install --save @primer/css

# Primer Brand (GitHub marketing UI)
npm install @primer/react-brand

# GOV.UK Frontend
npm install govuk-frontend

# USWDS (US Web Design System)
npm install uswds

# Atlassian Design System (Atlaskit)
yarn add @atlaskit/css-reset @atlaskit/tokens @atlaskit/button @atlaskit/badge @atlaskit/section-message @atlaskit/card

# Bootstrap 5.3
npm install bootstrap

# Shopify Polaris Web Components (Shopify apps only)
# Add this to your app HTML head:
#   <meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
#   <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
```

## Appendix B - Canonical Sources (read these before reinventing)

### Material Web
- https://github.com/material-components/material-web
- https://material-web.dev/theming/material-theming/
- https://m3.material.io/develop/web

### Fluent UI
- https://fluent2.microsoft.design/get-started/develop
- https://fluent2.microsoft.design/components/web/react/
- https://github.com/microsoft/fluentui
- https://learn.microsoft.com/en-us/fluent-ui/web-components/

### Carbon
- https://carbondesignsystem.com/
- https://github.com/carbon-design-system/carbon
- https://carbondesignsystem.com/developing/react-tutorial/overview/
- https://carbondesignsystem.com/developing/web-components-tutorial/overview/

### Shopify Polaris
- https://shopify.dev/docs/api/app-home/web-components
- https://github.com/Shopify/polaris-react
- https://polaris-react.shopify.com/components

### Atlassian
- https://atlassian.design/get-started/develop
- https://atlassian.design/components/button/examples
- https://atlaskit.atlassian.com/packages/design-system/button/example/disabled
- https://atlassian.design/tokens/design-tokens

### Primer
- https://primer.style/
- https://github.com/primer/css
- https://github.com/primer/brand

### GOV.UK
- https://design-system.service.gov.uk/components/button/
- https://design-system.service.gov.uk/styles/layout/
- https://github.com/alphagov/govuk-frontend

### USWDS
- https://designsystem.digital.gov/documentation/developers/
- https://designsystem.digital.gov/components/button/
- https://designsystem.digital.gov/components/card/
- https://github.com/uswds/uswds

### Bootstrap
- https://getbootstrap.com/docs/5.3/layout/grid/
- https://getbootstrap.com/docs/5.3/components/card/

### Tailwind
- https://tailwindcss.com/docs/dark-mode
- https://tailwindcss.com/blog/tailwindcss-v4

### Radix
- https://www.radix-ui.com/themes/docs/components/theme
- https://www.radix-ui.com/themes/docs/components/card
- https://github.com/radix-ui/themes

### shadcn/ui
- https://ui.shadcn.com/docs
- https://ui.shadcn.com/docs/components/card
- https://github.com/shadcn-ui/ui

### Native CSS / W3C standards
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- https://drafts.csswg.org/scroll-animations-1/

### Apple Liquid Glass (Apple platforms only)
- https://developer.apple.com/design/human-interface-guidelines/materials
- https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass
- https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass
- https://developer.apple.com/documentation/SwiftUI/Material

---

## Appendix C - Apple Liquid Glass: Honest Web Approximation

Do **not** treat random CSS snippets as official Apple Liquid Glass.

### What is official
Apple documents Liquid Glass inside Apple's Human Interface Guidelines and Developer Documentation for **Apple platforms**. It is a dynamic material used across Apple platform UI. Apple's native implementation belongs to Apple platform APIs and system components, **not a public web CSS package**.

Relevant official docs:
- Apple Human Interface Guidelines → Materials
- Apple Developer Documentation → Liquid Glass
- Apple Developer Documentation → Adopting Liquid Glass
- SwiftUI → Material

### What is NOT official
There is no `liquid-glass.css` from Apple for normal websites.

A web approximation can use:
- `backdrop-filter`
- transparent backgrounds
- layered borders
- highlight overlays
- gradients
- motion
- strong contrast fallbacks

But that is **web glassmorphism / frosted-glass approximation**, not official Apple Liquid Glass. Label it as such in comments.

### Safer web approximation skeleton

```css
.liquid-glass-web-approx {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / .32);
  background:
    linear-gradient(135deg, rgb(255 255 255 / .30), rgb(255 255 255 / .08)),
    rgb(255 255 255 / .12);
  backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  -webkit-backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .48),
    inset 0 -1px 0 rgb(255 255 255 / .12),
    0 18px 60px rgb(0 0 0 / .18);
}

.liquid-glass-web-approx::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background:
    radial-gradient(circle at 20% 0%, rgb(255 255 255 / .55), transparent 34%),
    linear-gradient(90deg, rgb(255 255 255 / .18), transparent 42%, rgb(255 255 255 / .14));
  pointer-events: none;
}

.liquid-glass-web-approx::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  border: 1px solid rgb(255 255 255 / .14);
  pointer-events: none;
}

@media (prefers-color-scheme: dark) {
  .liquid-glass-web-approx {
    border-color: rgb(255 255 255 / .18);
    background:
      linear-gradient(135deg, rgb(255 255 255 / .16), rgb(255 255 255 / .04)),
      rgb(15 23 42 / .42);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / .22),
      0 18px 60px rgb(0 0 0 / .42);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .liquid-glass-web-approx {
    background: rgb(255 255 255 / .96);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

**Important:** `prefers-reduced-transparency` has uneven browser support; test it. Always provide enough contrast even without blur.

---

**End of appendices.** Install commands above are reality anchors. The Apple Liquid Glass skeleton is a labeled approximation, not an Apple-issued package. For canonical docs per design system, consult the system's official docs (links in Section 2 plus Appendix B).


## `memory-bank/reference/hallmark-integration.md`

# Hallmark + agentmemory

> **Primary:** agentmemory (`react-training-journal-split`) · **Backup:** этот файл  
> **Hallmark project log:** `.hallmark/log.json` (создаётся при первом page-run)

## Установка (глобально, 2026-06-04)

- Skill: `~/.cursor/skills/hallmark/`
- Rule: `~/.cursor/rules/hallmark-design.mdc`
- Вызов: `@hallmark` или «hallmark redesign …»

## Три слоя памяти

| Слой | Роль |
|------|------|
| agentmemory | Решения, темы, anti-slop предпочтения — `memory_smart_search` / `memory_save` |
| memory-bank/ | Git-friendly снимки, reference |
| `.hallmark/log.json` | Ротация macrostructure / theme / nav / footer внутри проекта |

Hallmark **не** заменяет agentmemory и **не** пишет в Cursor Memories автоматически.


## `memory-bank/reference/high-end-visual-design.md`

---
name: high-end-visual-design
description: Teaches the AI to design like a high-end agency. Defines the exact fonts, spacing, shadows, card structures, and animations that make a website feel expensive. Blocks all the common defaults that make AI designs look cheap or generic.
---

# Agent Skill: Principal UI/UX Architect & Motion Choreographer (Awwwards-Tier)

## 1. Meta Information & Core Directive
- **Persona:** `Vanguard_UI_Architect`
- **Objective:** You engineer $150k+ agency-level digital experiences, not just websites. Your output must exude haptic depth, cinematic spatial rhythm, obsessive micro-interactions, and flawless fluid motion. 
- **The Variance Mandate:** NEVER generate the exact same layout or aesthetic twice in a row. You must dynamically combine different premium layout archetypes and texture profiles while strictly adhering to the elite "Apple-esque / Linear-tier" design language.

## 2. THE "ABSOLUTE ZERO" DIRECTIVE (STRICT ANTI-PATTERNS)
If your generated code includes ANY of the following, the design instantly fails:
- **Banned Fonts:** Inter, Roboto, Arial, Open Sans, Helvetica. (Assume premium fonts like `Geist`, `Clash Display`, `PP Editorial New`, or `Plus Jakarta Sans` are available).
- **Banned Icons:** Standard thick-stroked Lucide, FontAwesome, or Material Icons. Use only ultra-light, precise lines (e.g., Phosphor Light, Remix Line).
- **Banned Borders & Shadows:** Generic 1px solid gray borders. Harsh, dark drop shadows (`shadow-md`, `rgba(0,0,0,0.3)`). 
- **Banned Layouts:** Edge-to-edge sticky navbars glued to the top. Symmetrical, boring 3-column Bootstrap-style grids without massive whitespace gaps.
- **Banned Motion:** Standard `linear` or `ease-in-out` transitions. Instant state changes without interpolation.

## 3. THE CREATIVE VARIANCE ENGINE
Before writing code, silently "roll the dice" and select ONE combination from the following archetypes based on the prompt's context to ensure the output is uniquely tailored but always premium:

### A. Vibe & Texture Archetypes (Pick 1)
1. **Ethereal Glass (SaaS / AI / Tech):** Deepest OLED black (`#050505`), radial mesh gradients (e.g., subtle glowing purple/emerald orbs) in the background. Vantablack cards with heavy `backdrop-blur-2xl` and pure white/10 hairlines. Wide geometric Grotesk typography.
2. **Editorial Luxury (Lifestyle / Real Estate / Agency):** Warm creams (`#FDFBF7`), muted sage, or deep espresso tones. High-contrast Variable Serif fonts for massive headings. Subtle CSS noise/film-grain overlay (`opacity-[0.03]`) for a physical paper feel.
3. **Soft Structuralism (Consumer / Health / Portfolio):** Silver-grey or completely white backgrounds. Massive bold Grotesk typography. Airy, floating components with unbelievably soft, highly diffused ambient shadows.

### B. Layout Archetypes (Pick 1)
1. **The Asymmetrical Bento:** A masonry-like CSS Grid of varying card sizes (e.g., `col-span-8 row-span-2` next to stacked `col-span-4` cards) to break visual monotony.
   - **Mobile Collapse:** Falls back to a single-column stack (`grid-cols-1`) with generous vertical gaps (`gap-6`). All `col-span` overrides reset to `col-span-1`.
2. **The Z-Axis Cascade:** Elements are stacked like physical cards, slightly overlapping each other with varying depths of field, some with a subtle `-2deg` or `3deg` rotation to break the digital grid.
   - **Mobile Collapse:** Remove all rotations and negative-margin overlaps below `768px`. Stack vertically with standard spacing. Overlapping elements cause touch-target conflicts on mobile.
3. **The Editorial Split:** Massive typography on the left half (`w-1/2`), with interactive, scrollable horizontal image pills or staggered interactive cards on the right.
   - **Mobile Collapse:** Converts to a full-width vertical stack (`w-full`). Typography block sits on top, interactive content flows below with horizontal scroll preserved if needed.

**Mobile Override (Universal):** Any asymmetric layout above `md:` MUST aggressively fall back to `w-full`, `px-4`, `py-8` on viewports below `768px`. Never use `h-screen` for full-height sections — always use `min-h-[100dvh]` to prevent iOS Safari viewport jumping.

## 4. HAPTIC MICRO-AESTHETICS (COMPONENT MASTERY)

### A. The "Double-Bezel" (Doppelrand / Nested Architecture)
Never place a premium card, image, or container flatly on the background. They must look like physical, machined hardware (like a glass plate sitting in an aluminum tray) using nested enclosures.
- **Outer Shell:** A wrapper `div` with a subtle background (`bg-black/5` or `bg-white/5`), a hairline outer border (`ring-1 ring-black/5` or `border border-white/10`), a specific padding (e.g., `p-1.5` or `p-2`), and a large outer radius (`rounded-[2rem]`).
- **Inner Core:** The actual content container inside the shell. It has its own distinct background color, its own inner highlight (`shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`), and a mathematically calculated smaller radius (e.g., `rounded-[calc(2rem-0.375rem)]`) for concentric curves.

### B. Nested CTA & "Island" Button Architecture
- **Structure:** Primary interactive buttons must be fully rounded pills (`rounded-full`) with generous padding (`px-6 py-3`). 
- **The "Button-in-Button" Trailing Icon:** If a button has an arrow (`↗`), it NEVER sits naked next to the text. It must be nested inside its own distinct circular wrapper (e.g., `w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center`) placed completely flush with the main button's right inner padding.

### C. Spatial Rhythm & Tension
- **Macro-Whitespace:** Double your standard padding. Use `py-24` to `py-40` for sections. Allow the design to breathe heavily.
- **Eyebrow Tags:** Precede major H1/H2s with a microscopic, pill-shaped badge (`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium`).

## 5. MOTION CHOREOGRAPHY (FLUID DYNAMICS)
Never use default transitions. All motion must simulate real-world mass and spring physics. Use custom cubic-beziers (e.g., `transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]`).

### A. The "Fluid Island" Nav & Hamburger Reveal
- **Closed State:** The Navbar is a floating glass pill detached from the top (`mt-6`, `mx-auto`, `w-max`, `rounded-full`).
- **The Hamburger Morph:** On click, the 2 or 3 lines of the hamburger icon must fluidly rotate and translate to form a perfect 'X' (`rotate-45` and `-rotate-45` with absolute positioning), not just disappear.
- **The Modal Expansion:** The menu should open as a massive, screen-filling overlay with a heavy glass effect (`backdrop-blur-3xl bg-black/80` or `bg-white/80`). 
- **Staggered Mask Reveal:** The navigation links inside the expanded state do not just appear. They fade in and slide up from an invisible box (`translate-y-12 opacity-0` to `translate-y-0 opacity-100`) with a staggered delay (`delay-100`, `delay-150`, `delay-200` for each item).

### B. Magnetic Button Hover Physics
- Use the `group` utility. On hover, do not just change the background color.
- Scale the entire button down slightly (`active:scale-[0.98]`) to simulate physical pressing.
- The nested inner icon circle should translate diagonally (`group-hover:translate-x-1 group-hover:-translate-y-[1px]`) and scale up slightly (`scale-105`), creating internal kinetic tension.

### C. Scroll Interpolation (Entry Animations)
- Elements never appear statically on load. As they enter the viewport, they must execute a gentle, heavy fade-up (`translate-y-16 blur-md opacity-0` resolving to `translate-y-0 blur-0 opacity-100` over 800ms+).
- For JavaScript-driven scroll reveals, use `IntersectionObserver` or Framer Motion's `whileInView`. Never use `window.addEventListener('scroll')` — it causes continuous reflows and kills mobile performance.

## 6. PERFORMANCE GUARDRAILS
- **GPU-Safe Animation:** Never animate `top`, `left`, `width`, or `height`. Animate exclusively via `transform` and `opacity`. Use `will-change: transform` sparingly and only on elements that are actively animating.
- **Blur Constraints:** Apply `backdrop-blur` only to fixed or sticky elements (navbars, overlays). Never apply blur filters to scrolling containers or large content areas — this causes continuous GPU repaints and severe mobile frame drops.
- **Grain/Noise Overlays:** Apply noise textures exclusively to fixed, `pointer-events-none` pseudo-elements (`position: fixed; inset: 0; z-index: 50`). Never attach them to scrolling containers.
- **Z-Index Discipline:** Do not use arbitrary `z-50` or `z-[9999]`. Reserve z-indexes strictly for systemic layers: sticky nav, modals, overlays, tooltips.

## 7. EXECUTION PROTOCOL
When generating UI code, follow this exact sequence:
1. **[SILENT THOUGHT]** Roll the Variance Engine (Section 3). Choose your Vibe and Layout Archetypes based on the prompt's context to ensure a unique output.
2. **[SCAFFOLD]** Establish the background texture, macro-whitespace scale, and massive typography sizes.
3. **[ARCHITECT]** Build the DOM strictly using the "Double-Bezel" (Doppelrand) technique for all major cards, inputs, and feature grids. Use exaggerated squircle radii (`rounded-[2rem]`).
4. **[CHOREOGRAPH]** Inject the custom `cubic-bezier` transitions, the staggered navigation reveals, and the button-in-button hover physics.
5. **[OUTPUT]** Deliver flawless, pixel-perfect React/Tailwind/HTML code. Do not include basic, generic fallbacks.

## 8. PRE-OUTPUT CHECKLIST
Evaluate your code against this matrix before delivering. This is the last filter.
- [ ] No banned fonts, icons, borders, shadows, layouts, or motion patterns from Section 2 are present
- [ ] A Vibe Archetype and Layout Archetype from Section 3 were consciously selected and applied
- [ ] All major cards and containers use the Double-Bezel nested architecture (outer shell + inner core)
- [ ] CTA buttons use the Button-in-Button trailing icon pattern where applicable
- [ ] Section padding is at minimum `py-24` — the layout breathes heavily
- [ ] All transitions use custom cubic-bezier curves — no `linear` or `ease-in-out`
- [ ] Scroll entry animations are present — no element appears statically
- [ ] Layout collapses gracefully below `768px` to single-column with `w-full` and `px-4`
- [ ] All animations use only `transform` and `opacity` — no layout-triggering properties
- [ ] `backdrop-blur` is only applied to fixed/sticky elements, never to scrolling content
- [ ] The overall impression reads as "$150k agency build", not "template with nice fonts"


## `memory-bank/reference/ionic-capacitor-standard.md`

# Ionic + Capacitor — web bootstrap & native shells

## Architecture

| Layer | Path | Role |
| ----- | ---- | ---- |
| Web UI | `src/` | Single Vite+React source of truth |
| Ionic bootstrap | `index.tsx`, `src/ionic/setupIonic.ts` | `setupIonicReact({ mode: 'ios' })`, core CSS |
| Theme bridge | `src/styles/base/ionic-theme.css` | `--ion-*` ← project tokens |
| Native shell | `ios/`, `android/` | Capacitor 7 wrappers over `dist/` |
| API | `src/platform/resolveApiBase.ts` | `buildApiConfig` with platform `ios`/`android`/`web` |
| Expo (parallel) | `apps/mobile/`, `apps/macos/` | RN Readiness / release track — **not replaced** |

**Primary mobile path:** Capacitor wraps the same web app as PWA/Electron. Expo remains for React Native–specific screens until migrated.

## Usage patterns

### When to use Ionic components

- **Prefer existing app components** (`SectionBlock`, `Button`, tab shell) for current tabs.
- **Use `@ionic/react`** for new native-feel surfaces: `IonModal`, `IonActionSheet`, `IonRefresher`, `IonToast`, `IonHeader`/`IonToolbar` if adding stack navigation later.
- **Do not** add `@ionic/react-router` unless migrating routing away from `useURLState` + `AppShell`.

### Bootstrap (already wired)

```tsx
// index.tsx
import { initIonicReact } from './src/ionic/setupIonic';
initIonicReact();
void initNativeShell();
```

```tsx
// App.tsx
<IonApp><AppShell /></IonApp>
```

### Detect native

```ts
import { isNativeShell, getNativePlatform } from '@/platform/detectPlatform';
```

## npm scripts

| Script | Action |
| ------ | ------ |
| `npm run cap:sync` | `build` + `cap sync` |
| `npm run cap:ios` | sync + open Xcode |
| `npm run cap:android` | sync + open Android Studio |
| `npm run cap:open:ios` | open Xcode only |
| `npm run cap:open:android` | open Android Studio only |

## Dev workflow

1. `npm run dev` — API + Vite
2. Copy `.env.capacitor.example` → set `VITE_API_URL` (emulator: `10.0.2.2`, device: LAN IP)
3. Optional live reload: `CAP_DEV_SERVER_URL=http://<LAN-IP>:5173 npm run cap:sync`
4. `npm run cap:open:ios` or `cap:open:android`

## Production build

```sh
VITE_API_URL=https://your-api.example.com/api npm run cap:sync
```

## Local prerequisites

- **iOS:** Xcode, CocoaPods (`sudo gem install cocoapods`), iOS Simulator
- **Android:** Android Studio, SDK, emulator or device with USB debugging

## Physical iPhone (LAN API)

**Verified device (2026-06-21):** `iPhone Steve Gordiyenko` — iPhone SE (iPhone12,8), iOS 26.5, UDID `00008030-001130501EC3802E`.

**Mac LAN IP (Wi‑Fi en0):** use `ipconfig getifaddr en0` (example: `192.168.18.22`).

### Build for device (not simulator)

`127.0.0.1` in `VITE_API_URL` points at the **phone**, not the Mac. Rebuild with LAN IP baked in:

```sh
# optional: persist in .env.capacitor.local
# VITE_API_URL=http://192.168.18.22:3002/api

VITE_API_URL=http://<MAC-LAN-IP>:3002/api npm run build
npx cap sync ios
```

Start backend on the Mac (`npm run dev` or `npm run server`). API already listens on `0.0.0.0` (`server/index.js`). Vite dev server uses `host: true` for LAN access to `:5173`.

**Optional live reload:**

```sh
CAP_DEV_SERVER_URL=http://<MAC-LAN-IP>:5173 npx cap sync ios
# npm run dev must be running
```

### Deploy to connected device

```sh
npx cap run ios --list
npx cap run ios --target 00008030-001130501EC3802E --no-sync
# or open Xcode: npm run cap:open:ios → select iPhone → Run (⌘R)
```

### Prerequisites on the iPhone (required)

1. **Developer Mode:** Settings → Privacy & Security → **Developer Mode** → On → restart. Without this, `xcodebuild` fails: *Developer Mode disabled*.
2. **Trust Mac:** unlock phone, tap Trust when connecting USB.
3. **Signing in Xcode:** open `ios/App/App.xcworkspace` → target **App** → **Signing & Capabilities** → **Team** (Apple ID) → Automatic signing. Bundle ID: `com.stevegordiyenko.trainingcalculator`.
4. **Trust app (first install):** Settings → General → VPN & Device Management → trust your developer certificate.

### Firewall

If login/API fails on device but works in Simulator: allow incoming connections for Node/Xcode or temporarily disable macOS firewall for port **3002** (and **5173** if using live reload). Phone and Mac must be on the same Wi‑Fi.

### CLI deploy status (2026-06-21)

- `npm run build` + `npx cap sync ios`: **OK**
- `npx cap run ios --target 00008030-001130501EC3802E`: **blocked** until Developer Mode is enabled on the device (signing Team may also be required in Xcode on first run).


## `memory-bank/reference/journal-progress-chart-standard.md`

# Эталон: график прогрессии в Журнале (факт, не план)

> **Статус:** продуктовое правило + реализация (2026-07-09).  
> **Не путать** с `PeriodizationChart` / `ProgressionPreviewChart` — те **планируют** нагрузку; журнал **фиксирует** факт.  
> **Палитра:** наследует locked gold из [`periodization-chart-standard.md`](./periodization-chart-standard.md) §3.5 — orange line (`--ta-sec-01`), blue bars (`--ta-sec-02`). **Без** cyan overrides.

---

## Продуктовая граница

|                 | **Калькулятор** (`CalculatorTab` / `CalculatorTabV3`)                 | **Журнал** (`JournalTab`)                        |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| Назначение      | План: недели, фазы, %, тестовые «?»                                   | Справочник: что реально сделано в зале           |
| Источник данных | `getPrescription`, `weekSchemes`, presets «Оптимальная» / «На силу»   | `userData.journal[]` — вес, повторы, RPE по дате |
| Таблица 16 нед  | ✅ `CalculatorTabV3` — «03 Таблица весов»                             | ❌ **Запрещено** дублировать план калькулятора   |
| График          | Плановая кривая / preview preset                                      | **Только** из сохранённых сессий                 |
| Связь модулей   | **Нет** импорта journal → calculator или наоборот для отрисовки плана |                                                  |
| Палитра SVG     | `.ta-period` orange/blue etalon                                       | **Та же** `.ta-period` палитра (не cyan)         |

Пользователь: выбирает упражнение → вводит подходы (вес × повторы) → график строится **постфактум** из истории.

---

## Текущая реализация (код)

| Слой    | Путь                                                           | Поведение                                                                                                           |
| ------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Экран   | `src/screens/JournalTab.tsx`                                   | `useJournal`, секция «Тренд 1ПМ»                                                                                    |
| Хук     | `packages/shared/src/hooks/useJournalProgressChart.ts`         | Геометрия как `usePeriodization`; домен из `JournalSession[]`                                                       |
| Метрики | `packages/shared/src/utils/journalMetrics.ts`                  | e1RM Brzycki-подобный `weight * (1 + reps/30)`, пик по сессии                                                       |
| График  | `src/components/journal/JournalProgressChart.tsx`              | `.ta-period`: orange e1RM-линия + blue bars объёма, listbox «Сесс N»; **7** Y-grid линий + подписи (`Y_GRID_COUNT`) |
| CSS     | `theory-apple.css` `.ta-period*` + layout-only в `journal.css` | **Нет** перекраски line/bar/point — только margin/padding секции                                                    |

---

## UI (наследование эталона без плана)

Наследовать **язык и палитру** из `periodization-chart-standard.md`:

- `.ta-period` / горизонтальная ось = **хронология сессий** (дата `DD.MM` или «Сесс N»), не «Нед 1…16» из программы
- Оранжевая линия (`--ta-sec-01`) = **фактический** пик 1ПМ по сессии
- Синие столбцы (`--ta-sec-02`) = **объём** сессии (нормализованная высота bars)
- Правая ось label: «объём» (не «повт» плана) — смысл данных журнала, визуал bars тот же
- Listbox: дата · 1ПМ кг · схема (из записанных подходов) · повторы — **без** колонки «Фаза»
- **Без** phase strip ACCUMULATION/… — фазы программы не показывать
- Markers: orange stroke + surface fill (как калькулятор), active → orange fill

---

## Empty / copy (канон)

- Заголовок секции: «Тренд 1ПМ» (или «Прогресс по записям»)
- Hint вкладки: факт в зале, не план калькулятора
- Empty: «Запиши первый подход» — без отсылки к неделям программы

---

## Sibling (не эталон данных)

- `PeriodizationChart` — план Program 2.0 (**MAX visual etalon**)
- `ProgressionPreviewChart` — demo preset до расчёта
- `ProgramV3ProgressChart` — 16 нед V3
- Таблица `CalculatorTabV3` — prescription table, не журнал

---

## Чеклист для `/build`

- [x] `useJournalProgressChart(sessions)` + компонент на `.ta-period` CSS
- [x] Listbox из реальных `JournalSet[]`
- [x] Нет импортов `getPrescription`, `progressionPresets`, `getWeekScheduleV3` в `src/components/journal/`
- [x] Палитра = etalon orange/blue (удалены cyan overrides в `journal.css`)
- [x] a11y: listbox, keyboard, `prefers-reduced-motion`
- [x] Превью `cursor-ide-browser` на вкладке Журнал с 2+ сессиями


## `memory-bank/reference/minimalist-ui.md`

---
name: minimalist-ui
description: Clean editorial-style interfaces. Warm monochrome palette, typographic contrast, flat bento grids, muted pastels. No gradients, no heavy shadows.
---

# Protocol: Premium Utilitarian Minimalism UI Architect

## 1. Protocol Overview
Name: Premium Utilitarian Minimalism & Editorial UI
Description: An advanced frontend engineering directive for generating highly refined, ultra-minimalist, "document-style" web interfaces analogous to top-tier workspace platforms. This protocol strictly enforces a high-contrast warm monochrome palette, bespoke typographic hierarchies, meticulous structural macro-whitespace, bento-grid layouts, and an ultra-flat component architecture with deliberate muted pastel accents. It actively rejects standard generic SaaS design trends.

## 2. Absolute Negative Constraints (Banned Elements)
The AI must strictly avoid the following generic web development defaults:
- DO NOT use the "Inter", "Roboto", or "Open Sans" typefaces.
- DO NOT use generic, thin-line icon libraries like "Lucide", "Feather", or standard "Heroicons".
- DO NOT use Tailwind's default heavy drop shadows (e.g., `shadow-md`, `shadow-lg`, `shadow-xl`). Shadows must be practically non-existent or heavily customized to be ultra-diffuse and low opacity (< 0.05).
- DO NOT use primary colored backgrounds for large elements or sections (e.g., no bright blue, green, or red hero sections).
- DO NOT use gradients, neon colors, or 3D glassmorphism (beyond subtle navbar blurs).
- DO NOT use `rounded-full` (pill shapes) for large containers, cards, or primary buttons.
- DO NOT use emojis anywhere in code, markup, text content, headings, or alt text. Replace with proper icons or clean SVG primitives.
- DO NOT use generic placeholder names like "John Doe", "Acme Corp", or "Lorem Ipsum". Use realistic, contextual content.
- DO NOT use AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer", "Delve". Write plain, specific language.

## 3. Typographic Architecture
The interface must rely on extreme typographic contrast and premium font selection to establish an editorial feel.
- Primary Sans-Serif (Body, UI, Buttons): Use clean, geometric, or system-native fonts with character. Target: `font-family: 'SF Pro Display', 'Geist Sans', 'Helvetica Neue', 'Switzer', sans-serif`.
- Editorial Serif (Hero Headings & Quotes): Target: `font-family: 'Lyon Text', 'Newsreader', 'Playfair Display', 'Instrument Serif', serif`. Apply tight tracking (`letter-spacing: -0.02em` to `-0.04em`) and tight line-height (`1.1`).
- Monospace (Code, Keystrokes, Meta-data): Target: `font-family: 'Geist Mono', 'SF Mono', 'JetBrains Mono', monospace`.
- Text Colors: Body text must never be absolute black (`#000000`). Use off-black/charcoal (`#111111` or `#2F3437`) with a generous `line-height` of `1.6` for legibility. Secondary text should be muted gray (`#787774`).

## 4. Color Palette (Warm Monochrome + Spot Pastels)
Color is a scarce resource, utilized only for semantic meaning or subtle accents.
- Canvas / Background: Pure White `#FFFFFF` or Warm Bone/Off-White `#F7F6F3` / `#FBFBFA`.
- Primary Surface (Cards): `#FFFFFF` or `#F9F9F8`.
- Structural Borders / Dividers: Ultra-light gray `#EAEAEA` or `rgba(0,0,0,0.06)`.
- Accent Colors: Exclusively use highly desaturated, washed-out pastels for tags, inline code backgrounds, or subtle icon backgrounds.
  - Pale Red: `#FDEBEC` (Text: `#9F2F2D`)
  - Pale Blue: `#E1F3FE` (Text: `#1F6C9F`)
  - Pale Green: `#EDF3EC` (Text: `#346538`)
  - Pale Yellow: `#FBF3DB` (Text: `#956400`)

## 5. Component Specifications
- Bento Box Feature Grids:
  - Utilize asymmetrical CSS Grid layouts.
  - Cards must have exactly `border: 1px solid #EAEAEA`.
  - Border-radius must be crisp: `8px` or `12px` maximum.
  - Internal padding must be generous (e.g., `24px` to `40px`).
- Primary Call-To-Action (Buttons):
  - Solid background `#111111`, text `#FFFFFF`. 
  - Slight border-radius (`4px` to `6px`). No box-shadow. 
  - Hover state should be a subtle color shift to `#333333` or a micro-scale `transform: scale(0.98)`.
- Tags & Status Badges:
  - Pill-shaped (`border-radius: 9999px`), very small typography (`text-xs`), uppercase with wide tracking (`letter-spacing: 0.05em`).
  - Background must use the defined Muted Pastels.
- Accordions (FAQ):
  - Strip all container boxes. Separate items only with a `border-bottom: 1px solid #EAEAEA`.
  - Use a clean, sharp `+` and `-` icon for the toggle state.
- Keystroke Micro-UIs:
  - Render shortcuts as physical keys using `<kbd>` tags: `border: 1px solid #EAEAEA`, `border-radius: 4px`, `background: #F7F6F3`, using the Monospace font.
- Faux-OS Window Chrome:
  - When mocking up software, wrap it in a minimalist container with a white top bar containing three small, light gray circles (replicating macOS window controls).

## 6. Iconography & Imagery Directives
- System Icons: Use "Phosphor Icons (Bold or Fill weights)" or "Radix UI Icons" for a technical, slightly thicker-stroke aesthetic. Standardize stroke width across all icons.
- Illustrations: Monochromatic, rough continuous-line ink sketches on a white background, featuring a single offset geometric shape filled with a muted pastel color.
- Photography: Use high-quality, desaturated images with a warm tone. Apply subtle overlays (`opacity: 0.04` warm grain) to blend photos into the monochrome palette. Never use oversaturated stock photos. Use reliable placeholders like `https://picsum.photos/seed/{context}/1200/800` when real assets are unavailable.
- Hero & Section Backgrounds: Sections should not feel empty and flat. Use subtle full-width background imagery at very low opacity, soft radial light spots (`radial-gradient` with warm tones at `opacity: 0.03`), or minimal geometric line patterns to add depth without breaking the clean aesthetic.

## 7. Subtle Motion & Micro-Animations
Motion should feel invisible — present but never distracting. The goal is quiet sophistication, not spectacle.
- Scroll Entry: Elements fade in gently as they enter the viewport. Use `translateY(12px)` + `opacity: 0` resolving over `600ms` with `cubic-bezier(0.16, 1, 0.3, 1)`. Use `IntersectionObserver`, never `window.addEventListener('scroll')`.
- Hover States: Cards lift with an ultra-subtle shadow shift (`box-shadow` transitioning from `0 0 0` to `0 2px 8px rgba(0,0,0,0.04)` over `200ms`). Buttons respond with `scale(0.98)` on `:active`.
- Staggered Reveals: Lists and grid items enter with a cascade delay (`animation-delay: calc(var(--index) * 80ms)`). Never mount everything at once.
- Background Ambient Motion: Optional. A single, very slow-moving radial gradient blob (`animation-duration: 20s+`, `opacity: 0.02-0.04`) drifting behind hero sections. Must be applied to a `position: fixed; pointer-events: none` layer. Never on scrolling containers.
- Performance: Animate exclusively via `transform` and `opacity`. No layout-triggering properties (`top`, `left`, `width`, `height`). Use `will-change: transform` sparingly and only on actively animating elements.

## 8. Execution Protocol
When tasked with writing frontend code (HTML, React, Tailwind, Vue) or designing a layout:
1. Establish the macro-whitespace first. Use massive vertical padding between sections (e.g., `py-24` or `py-32` in Tailwind).
2. Constrain the main typography content width to `max-w-4xl` or `max-w-5xl`.
3. Apply the custom typographic hierarchy and monochromatic color variables immediately.
4. Ensure every card, divider, and border adheres strictly to the `1px solid #EAEAEA` rule.
5. Add scroll-entry animations to all major content blocks.
6. Ensure sections have visual depth through imagery, ambient gradients, or subtle textures — no empty flat backgrounds.
7. Provide code that reflects this high-end, uncluttered, editorial aesthetic natively without requiring manual adjustments.


## `memory-bank/reference/mobile-tab-nav-background-standard.md`

# Эталон: mobile bottom TabNav + ambient shell background

> **Статус:** утверждённый gold standard (2026-07-06, обновлён 2026-08-25). Пользователь явно одобрил визуал: frosted glass, ambient просвечивает через chrome, **ближе к квадратным** углам (tab 4px, cards 8–12px, не pill 20px).  
> **Не путать** с desktop pill-tab bar — на `≥900px` навигация sticky, с карточным `.tab-bar.ta-mode-nav`, без fixed bottom glass.

---

## Визуальный замысел

| Слой                    | Что видит пользователь                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Фон**                 | Мягкие cool/warm orbs + лёгкая сетка + анимированные кривые периодизации — «живой», но не отвлекающий                       |
| **Нижняя nav (mobile)** | Полупрозрачное матовое стекло; ambient просвечивает; верхняя граница и тень отделяют от контента                            |
| **Активная вкладка**    | Только **amber** (`--ta-calc-accent` / `--accent`) на иконке и squarer подложке `::before` (8px radius); неактивные — muted |
| **Карточки / панели**   | Тот же glass: `color-mix(92%)` + `blur(20px)` + `--border-subtle`; radius **8px inner / 12px outer**; без glow shadow       |
| **Общий тон**           | 90% нейтраль, один акцент; без «лимонных заливок» и непрозрачных плит                                                       |

Цель: iOS-style bottom bar + squarer frosted panels, через которые читается глубина приложения.

---

## Шкала radius (squarer, не pill)

| Токен                  | Значение               | Применение                                                              |
| ---------------------- | ---------------------- | ----------------------------------------------------------------------- |
| `--glass-radius-tab`   | `4px`                  | Active tab `::before`, tab-btn — squarer chip, not card 8px             |
| `--glass-radius-inner` | `8px`                  | user-bar, note boxes, inner chips                                       |
| `--glass-radius-panel` | `12px` (`--radius-md`) | auth-card, app-tab-section, ta-shell outer, desktop tab-bar, hero glass |
| `--glass-radius-badge` | `6px`                  | Meta-badges, RM chips, check squircles, filter chips — **не** capsule   |
| `--radius-pill`        | `999px`                | Только toggle tracks (theme/split switch) — **не** chips/badges         |

**Запрещено:** `border-radius: 20px` / `999px` на chips, RM badges, check indicators. «Ближе к квадратным» = 6–12px rounded rect, не 0px и не pill.

---

## Frosted glass formula (app-wide etalon)

| Свойство            | Значение                                                      | Файл-токены           |
| ------------------- | ------------------------------------------------------------- | --------------------- |
| `background`        | `color-mix(in srgb, var(--bg) 92%, transparent)`              | `--glass-bg`          |
| Card variant        | `color-mix(in srgb, var(--card) 92%, transparent)`            | `--glass-bg-card`     |
| `backdrop-filter`   | `blur(20px)`                                                  | `--glass-blur`        |
| Chrome (sticky nav) | `blur(12px)`                                                  | `--glass-blur-chrome` |
| `border`            | `1px solid var(--border-subtle)`                              | `--glass-border`      |
| `box-shadow`        | `none` (nav lift: `--glass-shadow-lift` только mobile bottom) | `--glass-shadow`      |

Утилита: `.glass-surface` в `src/styles/components/shared/glass-surface.css`.

Поверхности с etalon: `.app-shell__nav`, `.tab-btn` active, `.auth-card`, `.user-bar`, `.app-tab-section`, `.ta-shell`, `.app-hero__glass`, calculator sections.

---

## Архитектура (слои снизу вверх)

```
z-index 0   AppAmbientBackground (SVG curves, parallax)
z-index -1  .app-shell::before / ::after (shell orbs + texture grid)
z-index 0   body::before / ::after (tab-tinted large orbs, reset.css)
z-index 1   .app-shell__main + content
z-index 50  .app-shell__nav (mobile: fixed bottom frosted glass)
```

| Компонент / селектор         | Файл                                                   | Роль                                                     |
| ---------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| `AppAmbientBackground`       | `src/components/app/AppAmbientBackground.tsx`          | Декоративные кривые; `prefers-reduced-motion` → static   |
| `.app-ambient-bg*`           | `src/styles/components/app/app-ambient-background.css` | Fixed layer, mask, tab-colored stroke via `--glow-orb-*` |
| `.app-shell::before/::after` | `src/styles/base/ios-adaptation.css`                   | Radial orbs + subtle grid; `appAmbientDrift`             |
| `html[data-active-tab]`      | `src/styles/base/reset.css`                            | Переключение `--glow-orb-1/2` по вкладке                 |
| `.app-shell__nav`            | `src/styles/base/ios-adaptation.css`                   | **Glass chrome** — sticky (desktop) / fixed (mobile)     |
| `.tab-bar.ta-mode-nav`       | `src/styles/layouts/app-layout.css`                    | Pill bar (desktop); **transparent** на mobile            |
| `TabNav`                     | `src/components/app/TabNav.tsx`                        | `nav.tab-bar.ta-mode-nav.app-shell__nav`                 |

Монтирование: `AppShell` рендерит `<AppAmbientBackground />` первым дочерним элементом `.app-shell`.

---

## Mobile bottom bar (≤899px) — канон CSS

**Контейнер** — `.app-shell > nav.tab-bar.ta-mode-nav.app-shell__nav` (`ios-adaptation.css`, high specificity so app-layout cannot wipe chrome):

| Свойство                | Значение                                             | Зачем                                               |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| `position`              | `fixed; left: 0; right: 0; bottom: 0`                | iOS-style dock flush to physical bottom             |
| `z-index`               | `50`                                                 | Над контентом, под модалками по необходимости       |
| `background`            | `var(--glass-bg)`                                    | Полупрозрачная база — ambient виден                 |
| `backdrop-filter`       | `blur(20px)` + `-webkit-backdrop-filter`             | Frosted glass                                       |
| `border-top`            | `1px solid var(--glass-border)`                      | Тихое отделение                                     |
| `box-shadow`            | `var(--glass-shadow-lift)`                           | Мягкий подъём, не цветной glow                      |
| Safe-area padding       | `padding-*: max(var(--space-1), var(--sal/sar/sab))` | Home indicator **inside** bar — never `bottom: sab` |
| `#root:has(.app-shell)` | `padding-bottom: 0`                                  | No double bottom inset under fixed dock             |

**Внутренний tab layout** — `.app-shell > nav…` @mobile in `app-layout.css`: only gap/radius/scroll — **do not** set `padding: 0` / `background: transparent` (that caused the floating gap bug 2026-07-10).

**Отступ контента:**

- `.app-shell__main { padding-bottom: calc(56px + max(var(--space-3), var(--sab)) + var(--space-2)) }`
- `.app-toast` — поднят над nav: `bottom: calc(72px + max(var(--space-2), var(--sab)))`

---

## Desktop (≥900px) — sibling, не mobile etalon

- `.app-shell__nav`: `position: sticky`, `backdrop-filter: blur(12px)`, `background: color-mix(..., var(--bg) 88%, transparent)`
- `.tab-bar.ta-mode-nav`: frosted card `border-radius: var(--glass-radius-panel)` (12px), **без** heavy glow shadow
- `.tab-btn` / active `::before`: `border-radius: var(--glass-radius-tab)` (4px)
- Не переносить desktop card-shadow на mobile fixed bar

---

## Токены и акцент

| Токен                                 | Использование                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| `--glass-bg`, `--glass-bg-card`       | Frosted surface fill (92% opaque)                                                  |
| `--glass-blur`, `--glass-blur-chrome` | 20px panels / 12px sticky chrome                                                   |
| `--glass-radius-tab/inner/panel`      | Squarer 4px / 8px / 12px scale (tabs sharper than cards)                           |
| `--glass-border`, `--glass-shadow`    | `border-subtle`; shadow `none` (lift only on mobile nav)                           |
| `--bg`                                | База glass-mix (88–92% opaque)                                                     |
| `--border-subtle`                     | `border-top` nav                                                                   |
| `--glow-orb-1`, `--glow-orb-2`        | Tab-tinted ambient (per-tab overrides в `variables.css` + `html[data-active-tab]`) |
| `--accent-glow`                       | Третий radial в `.app-shell::before`                                               |
| `--ta-calc-accent` / `--accent`       | **Только** active tab: icon, `::before` border/shadow, focus ring                  |
| `--sat`, `--sar`, `--sab`, `--sal`    | Safe-area (`variables.css`)                                                        |

Активная вкладка (`.tab-active`):

- `color: var(--ta-text)`
- `::before` opacity 1 — squarer chip (`border-radius: 4px`) с `border: 1px solid color-mix(..., accent 28%)`; **без** amber glow shadow
- `.tab-active .tab-btn-icon { color: var(--ta-calc-accent) }`

Неактивные: `color: var(--ta-text-dim)`; без amber fill на всей полосе.

---

## Breakpoint и DOM

- Mobile glass: `@media (max-width: 899px)`
- iPhone touch tweaks: `@media (max-width: 430px)` — padding `#root`, не менять glass-формулу nav
- Классы nav: `tab-bar ta-mode-nav app-shell__nav` (все три обязательны для каскада)

---

## Что НЕ делать (anti-patterns)

| Запрещено                                                                                  | Почему                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Непрозрачный `background: var(--bg)` или `#fff` на mobile nav                              | Убивает ambient; выглядит как плитка              |
| Ярко-жёлтые / lemon заливки всей полосы или `body`                                         | Нарушает quiet UI; акцент только на active        |
| `backdrop-filter` без полупрозрачного `color-mix`                                          | Стекло без глубины или артефакты на старых WebKit |
| Дублировать box-shadow pill-bar на mobile                                                  | Конфликт с upward shell shadow                    |
| `position: relative` на `.tab-bar.ta-mode-nav`                                             | Ломает fixed/sticky от `.app-shell__nav`          |
| Убирать `AppAmbientBackground` / `.app-shell::before` ради «производительности» без замера | Etalon = связка фон + glass                       |
| Amber на всех tab-btn по умолчанию                                                         | Акцент теряет смысл                               |

---

## a11y и motion

- `nav` с `aria-label="Разделы приложения"`; `aria-current="page"` на active
- `prefers-reduced-motion`: `AppAmbientBackground` → `app-ambient-bg--static`; drift/pulse off в `app-ambient-background.css`
- Touch targets: `min-height: 48px` на mobile `.tab-btn`
- Focus: `focus-visible` ring через `color-mix(..., accent 24%)` — не убирать

---

## Чеклист для `/build` (новый chrome / shell)

- [ ] Прочитать этот doc + `ios-adaptation.css` + mobile block в `app-layout.css`
- [ ] Glass на `.app-shell__nav`, не на inner tab items
- [ ] `padding-bottom` main + toast согласованы с высотой nav + `--sab`
- [ ] Превью `cursor-ide-browser` @390px: ambient виден через nav, active tab amber only
- [ ] Light + dark theme; нет horizontal overflow
- [ ] Не регрессировать `html[data-active-tab]` orb transitions

---

## Sibling (не эталон для mobile nav glass)

- Expo `apps/mobile/` tab bar — native navigation theme; web etalon здесь
- Desktop pill `.tab-bar.ta-mode-nav` @`min-width: 900px`
- Auth hero gradients (`app-hero.css`) — отдельный контекст

---

## Связанные документы

- `memory-bank/style-guide.md` — quiet UI, один акцент
- `memory-bank/reference/high-end-visual-design.md` — calm luxury motion
- `.cursor/rules/iphone-responsive-verification.mdc` — verify @390–430px


## `memory-bank/reference/periodization-chart-standard.md`

# Эталон: PeriodizationChart (`section.ta-period`)

> **Статус:** канонический reference implementation для dual-axis SVG-чартов периодизации в web-калькуляторе (Program 2.0).  
> **Дата фиксации:** 2026-05-25 · **MAX expansion:** 2026-05-28 · **refresh:** 2026-07-07 · **palette lock:** 2026-07-09  
> **Не модифицировать** без явной задачи; новые чарты — копировать паттерны отсюда.  
> **Locked gold (dark UI screenshot 2026-07-09):** orange `%` line + markers (`--ta-sec-01`), solid blue volume bars (`--ta-sec-02`), phase chips ACCUMULATION/DELOAD/INTENSIFICATION/PEAK, dual axis `%` / `повт`, footer week listbox. All progression surfaces share this palette — **no cyan / Ghost overrides**.

**Родительский partial:** [`calc-progression-result-standard.md`](./calc-progression-result-standard.md) (секция 02 «Прогрессия»).  
**Umbrella tab:** [`calculator-tab-standard.md`](./calculator-tab-standard.md) §02d.

---

## 0. Quick reference

| Что            | Значение                                                                |
| -------------- | ----------------------------------------------------------------------- |
| Root class     | `section.ta-period`                                                     |
| Scope CSS      | `.ta-shell .ta-period*` (`theory-apple.css` L3438–3712)                 |
| viewBox        | `0 0 800 280`                                                           |
| Левая ось SVG  | `%` (интенсивность, **оранжевая** линия `--ta-sec-01`)                  |
| Правая ось SVG | `повт` (объём, **синие** bars `--ta-sec-02`)                            |
| Phase strip    | 4 сегмента EN uppercase: ACCUMULATION / DELOAD / INTENSIFICATION / PEAK |
| Deload         | **Неделя 5** (index 4), pct dip + volume restore                        |
| Listbox cols   | Нед · кг · scheme · повт · **phase (EN)**                               |
| Tooltip phase  | RU hint via `phaseHint()`                                               |
| Mobile ≤600px  | SVG readonly; listbox = primary UI                                      |
| Reduced motion | CSS `@media (prefers-reduced-motion: reduce)` — animations off          |

---

## 1. Карта файлов

| Слой                  | Путь                                                             | Экспорт / символы                                                                            |
| --------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **UI**                | `src/components/PeriodizationChart.tsx`                          | default export; `formatWeight`, `weightLabel`, `phaseHint`; constants `TIP_*`, `CHART_WIDTH` |
| **Data / geometry**   | `src/hooks/usePeriodization.ts`                                  | `usePeriodization`, `PeriodWeek`, `PeriodPhase`, `phaseFor`, `VIEW`, `linePath`, `areaPath`  |
| **Расчёт веса**       | `packages/shared/src/utils/calc.ts` (re-export `src/utils/calc`) | `calcWorkingWeight`, `roundWeight`                                                           |
| **Источник % и схем** | `packages/shared/src/data/exercises.ts`                          | `EXERCISES[*].percentages`, `weekSchemes`                                                    |
| **Стили**             | `src/styles/components/theory-apple.css` **L3438–3712**          | `.ta-period`, `.ta-period-*`, `.ta-period-week`, `@keyframes ta-period-*`                    |
| **Родитель**          | `src/screens/CalculatorTab.tsx`                                  | `<PeriodizationChart config={config} result={activeResult} />` в `SectionBlock num="02"`     |
| **Оболочка**          | `src/components/SectionBlock.tsx`                                | `variant="apple"` → `.ta-section` + scroll reveal                                            |

**Единственное место использования (Program 2.0):** `CalculatorTab` при `activeProgram !== '3.0'` (`TabPanel.tsx`).

**CSS modifiers для siblings (не используются в PeriodizationChart, но в том же блоке `.ta-period`):** `.ta-period__point--muted`, `--test`, `.ta-period__bar.is-test`, `.ta-period-week.is-test`, `.ta-period__test-mark` — см. §12.

---

## 2. Архитектура

### 2.1 Разделение ответственности

```
ExerciseConfig + SavedExercise
        │
        ▼
 usePeriodization (useMemo) ──► weeks[], phases[], linePath, areaPath, viewBox, grid
        │
        ▼
 PeriodizationChart ──► activeIndex: number | null + phase strip / SVG / listbox
```

| Слой                 | Ответственность                                      | Запрещено                                   |
| -------------------- | ---------------------------------------------------- | ------------------------------------------- |
| `usePeriodization`   | Pure geometry, domain mapping, paths                 | React state, DOM, i18n strings              |
| `PeriodizationChart` | Selection state, a11y, event handlers, label helpers | Пересчёт координат, дублирование `phaseFor` |

Hook пересчитывается при смене `config` или `result` (`useMemo` deps: `[config, result]`).

### 2.2 Props

```ts
interface PeriodizationChartProps {
  config: ExerciseConfig; // percentages[], weekSchemes[], step, type, isPullup?
  result: SavedExercise; // oneRM, bodyWeight? (pullups), exerciseKey, testWeight, testReps
}
```

**Не принимает** `ProgramSettings` / `progressionPreset`. Данные — напрямую из `config.percentages` и `config.weekSchemes` **без** `applyProgressionPresetToPercent/Scheme` (preset сейчас no-op в `progressionPresets.ts`).

### 2.3 Parent context

```tsx
<SectionBlock num="02" title={`Прогрессия — ${config.name}`} variant="apple">
  <div className="insight">…</div>
  <ResultCard … />
  <PlateDiagram … />                        // !isPullup && type A/B
  <PeriodizationChart config={config} result={activeResult} />
  <NoteBox variant="apple">↺ Нед 5… vol-legend</NoteBox>
</SectionBlock>
```

---

## 3. Phase strip (`.ta-period__phases`)

### 3.1 DOM и data

```tsx
<div className="ta-period__phases" aria-hidden="true">
  {phases.map(phase => (
    <span
      className="ta-period__phase"
      style={{
        flexGrow: phase.weeks,
        '--phase-color': `var(${phase.colorVar})`,
        '--phase-bg': `var(${phase.tintVar})`,
      }}>
      {phase.label} // EN, rendered UPPERCASE via CSS
    </span>
  ))}
</div>
```

**`aria-hidden="true"`** — декоративная полоса; семантика фаз дублируется в listbox + tooltip.

### 3.2 Mapping index → phase (`phaseFor`)

Жёстко в `usePeriodization.ts`, **не из config**:

| Index | Week  | Phase (internal + strip label) | `flexGrow` (weeks in strip) |
| ----- | ----- | ------------------------------ | --------------------------- |
| 0–3   | 1–4   | `Accumulation`                 | 4                           |
| 4     | **5** | **`Deload`**                   | 1                           |
| 5–6   | 6–7   | `Intensification`              | 2                           |
| 7     | 8     | `Peak`                         | 1                           |

Пропорции strip: **4 : 1 : 2 : 1** (50% : 12.5% : 25% : 12.5% ширины).

### 3.3 Цвета фаз (`--ta-sec-*`)

Определены в `theory-apple.css` L9–20; на phase pill через inline CSS vars:

| Phase           | `label` (strip)   | `colorVar`    | `tintVar`          | Hex accent           | Tint formula       |
| --------------- | ----------------- | ------------- | ------------------ | -------------------- | ------------------ |
| Accumulation    | `Accumulation`    | `--ta-sec-02` | `--ta-sec-02-tint` | `#5ba4ff` (blue)     | 6% mix → `--ta-bg` |
| Deload          | `Deload`          | `--ta-sec-03` | `--ta-sec-03-tint` | `#3affb8` (mint)     | 6% mix             |
| Intensification | `Intensification` | `--ta-sec-06` | `--ta-sec-06-tint` | `#ff6b6b` (red/pink) | 6% mix             |
| Peak            | `Peak`            | `--ta-sec-01` | `--ta-sec-01-tint` | `#ffb020` (orange)   | 6% mix             |

**Pill styling** (`.ta-period__phase`):

- `background: var(--phase-bg)`; `color: var(--phase-color)`
- `border: 1px solid color-mix(in srgb, var(--phase-color) 30%, transparent)`
- `border-radius: 8px`; `padding: 7px 8px`; `gap` между pills **4px**
- Typography: **12px**, **600**, `letter-spacing: 0.08em`, **`text-transform: uppercase`**

**Важно:** цвет **активной фазы** не красит line/bars chart. Line/area = **`--ta-sec-01`** (Peak orange `#ffb020`); bars = **`--ta-sec-02`** (Accumulation blue `#5ba4ff`) — отдельная visual encoding.

### 3.5 Locked progression palette (все `.ta-period` surfaces)

| Element                     | Token / rule                                      | Locked look (dark gold)                        |
| --------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| Line + area                 | `stroke/fill: var(--ta-sec-01)` / `-tint`         | Bright orange/gold                             |
| Markers `.ta-period__point` | `stroke: --ta-sec-01`; `fill: --ta-calc-surface`  | Orange ring, dark center; active → orange fill |
| Bars `.ta-period__bar`      | `fill: var(--ta-sec-02)`; opacity 0.72 → 1 active | Solid mid-blue                                 |
| Phase chips                 | `--ta-sec-02/03/06/01` + tints                    | Blue / mint / red / orange outlines            |
| Axes                        | Left `%` (or кг for siblings); right `повт`       | Dim mono labels                                |
| Footer listbox              | `.ta-period-week` 5 cols                          | Нед · кг · scheme · повт · phase               |

**Запрещено:** перекрашивать line/bars/points в `--accent-cyan` или иные Ghost accents в journal/settings. Layout-only overrides (margin/padding) допустимы.

### 3.4 Язык: EN strip vs RU hints

| Место                | Язык                        | Пример                                                                                   |
| -------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| Phase strip text     | **English** (CSS uppercase) | `ACCUMULATION`, `DELOAD`, …                                                              |
| Tooltip line 1       | Mixed RU + EN phase         | `Неделя 5 · Deload`                                                                      |
| Tooltip line 3       | **Russian** hint            | `24 повт · восстановление`                                                               |
| Listbox col 5 `<em>` | **English** per code        | `Deload`                                                                                 |
| `phaseHint()` map    | RU                          | Deload→«восстановление», Peak→«пик», Intensification→«интенсификация», else→«накопление» |

**Policy:** listbox phase **English per code** — documented gap, не баг; локализация только по явной задаче.

---

## 4. SVG chart (`.ta-period__scroll` → `.ta-period__svg`)

### 4.1 Container

| Property          | Value                                                      |
| ----------------- | ---------------------------------------------------------- |
| Scroll wrapper    | `overflow-x: auto`, `-webkit-overflow-scrolling: touch`    |
| SVG               | `viewBox="0 0 800 280"`, `preserveAspectRatio="none"`      |
| Desktop min-width | **720px** (`width: 100%`)                                  |
| a11y              | `role="img"`, `aria-labelledby="period-title period-desc"` |

### 4.2 VIEW constants (`usePeriodization.ts`)

```ts
const VIEW = {left: 56, right: 56, top: 28, bottom: 238, width: 800, barWidth: 40};
```

| Derived       | Formula                         | Numeric                        |
| ------------- | ------------------------------- | ------------------------------ |
| `chartWidth`  | `800 - 56 - 56`                 | **688**                        |
| `chartHeight` | `238 - 28`                      | **210**                        |
| `stepX`       | `chartWidth / max(1, N-1)`      | 688/7 ≈ **98.29** для 8 нед    |
| Plot X range  | `x1=56` … `x2=744` (grid lines) | matches `left` / `width-right` |

### 4.3 Grid (7 horizontal lines)

```ts
grid: Array.from({length: 7}, (_, i) => VIEW.top + i * ((VIEW.bottom - VIEW.top) / 6));
```

Y positions: **28**, **63**, **98**, **133**, **168**, **203**, **238** (равные шестые plot height). Синхрон с `useJournalProgressChart` (`Y_GRID_COUNT = 7`).

CSS `.ta-period__grid`: `stroke: color-mix(in srgb, var(--ta-text) 5%, transparent)`, `stroke-width: 1`, `x1="56"` `x2="744"`.

### 4.4 Axis labels

| Label  | x   | y   | Class              | Meaning                               |
| ------ | --- | --- | ------------------ | ------------------------------------- |
| `%`    | 12  | 34  | `.ta-period__axis` | Left — **intensity** scale (line Y)   |
| `повт` | 748 | 34  | `.ta-period__axis` | Right — **volume** scale (bar height) |

Font: `ui-monospace, SFMono-Regular, Menlo, Consolas`, **12px**, `fill: var(--ta-text-dim)`.

Week numbers under points: `.ta-period__week-label`, `y="264"`, `textAnchor="middle"`, same mono 12px.

### 4.5 Orange line + area (`--ta-sec-01`)

**Line** (`.ta-period__line`):

- `stroke: var(--ta-sec-01)` (#ffb020)
- `stroke-width: 3`; `stroke-linecap/join: round`
- `pathLength={1}` + `stroke-dasharray: 1` + animated `stroke-dashoffset` → draw effect
- Animation: `ta-period-line-in` **900ms** `var(--ta-ease)` delay **120ms**

**Area** (`.ta-period__area`):

- `fill: var(--ta-sec-01-tint)`; closed path via `areaPath()` to baseline `VIEW.bottom` (238)
- Animation: `ta-period-area-in` **500ms** delay **700ms** (fade in after line starts)

**Y mapping (%):**

```ts
minPct = min(percentages) - 5;
maxPct = max(percentages) + 5;
y = VIEW.bottom - ((pct - minPct) / (maxPct - minPct)) * chartHeight;
```

Example bench wave `[68,73,78,83,75,79,85,90]` → minPct=63, maxPct=95.

### 4.6 Blue bars (`--ta-sec-02`)

Per week rect:

| Attr        | Source                                          |
| ----------- | ----------------------------------------------- |
| `x`         | `barX = x - barWidth/2` (center on line point)  |
| `y`         | `barY = VIEW.bottom - barHeight`                |
| `width`     | **40** (`VIEW.barWidth`, also hardcoded in JSX) |
| `height`    | `(totalReps / maxVolume) * chartHeight`         |
| `className` | `ta-period__bar` + `is-active` when selected    |

CSS:

- `fill: var(--ta-sec-02)` (#5ba4ff)
- Default `opacity: 0.72`; **`.is-active` → 1**
- Entry: `transform: scaleY(0)` → `scaleY(1)`, `transform-origin: bottom`, `transform-box: fill-box`
- Animation: `ta-period-bar-in` **360ms**; stagger **`animationDelay: index * 60ms`** (inline style)

**maxVolume:** `max(...weekSchemes.map(s => s.sets * s.reps), 1)` — нормализация высоты bars.

### 4.7 Points (line markers)

`<circle class="ta-period__point">`:

- `r="4"`; `cx/cy` = line point
- Default: `fill: var(--ta-calc-surface)`, `stroke: var(--ta-sec-01)`, `stroke-width: 2`
- `.is-active`: `fill: var(--ta-sec-01)`
- Pointer events: `onPointerEnter/Leave` → sync `activeIndex`

### 4.8 Tooltip + cursor line (desktop only)

Shown when `activeIndex !== null`. Group `.ta-period__tip` at `transform="translate(tipX, 14)"`.

**Constants** (`PeriodizationChart.tsx`):

```ts
TIP_WIDTH = 232;
TIP_HEIGHT = 78;
TIP_MARGIN = 16;
CHART_WIDTH = 800;
tipX = clamp(active.x - TIP_WIDTH / 2, TIP_MARGIN, CHART_WIDTH - TIP_WIDTH - TIP_MARGIN);
```

**Cursor line** (`.ta-period__cursor`):

- Vertical dashed line from tooltip top to plot bottom
- `x1 = x2 = active.x - tipX` (relative to tip group)
- `y1="0"` `y2="228"`
- `stroke: var(--ta-calc-accent)` (= `--ta-sec-01`); `stroke-dasharray: 4 5`

**Tooltip card** (`rect` rx=10):

- Fill `var(--ta-surface-2)`; stroke `var(--ta-calc-border)`
- `pointer-events: none` on group

**Three text lines** (mono 12px):

| Line | y   | Content                                 | Weight/color      |
| ---- | --- | --------------------------------------- | ----------------- |
| 1    | 21  | `Неделя {week} · {phase}`               | 600, `--ta-text`  |
| 2    | 42  | `{weightLabel} · {sets} × {reps}`       | regular           |
| 3    | 63  | `{totalReps} повт · {phaseHint(phase)}` | `--ta-text-muted` |

### 4.9 `<title>` / `<desc>` (a11y)

- **title:** «График периодизации»
- **desc (hardcoded):** «8 недель: интенсивность в процентах и объём в повторениях. Неделя 5 — разгрузка.»
- **Gap:** desc не derived from `weeks.length` — см. §15.

---

## 5. Listbox (`.ta-period__weeks`)

### 5.1 Structure

```tsx
<div className="ta-period__weeks" role="listbox" aria-label="Недели периода" onKeyDown={keyDown}>
  <button role="option" aria-selected={…} className="ta-period-week" id={`period-week-${week}`}>
    <span>Нед {week}</span>
    <strong>{weightLabel}</strong>
    <span>{sets} × {reps}</span>
    <span>{totalReps} повт</span>
    <em>{week.phase}</em>   // English: Accumulation | Deload | …
  </button>
</div>
```

### 5.2 Grid columns (desktop)

`.ta-period-week` → `grid-template-columns: **54px 1fr 80px 80px 140px**`; gap **10px**; padding **10px 12px**.

| Col | Element    | Copy pattern                      |
| --- | ---------- | --------------------------------- |
| 1   | `<span>`   | `Нед {n}`                         |
| 2   | `<strong>` | `{weight} кг` or pullup `+/-X кг` |
| 3   | `<span>`   | `{sets} × {reps}`                 |
| 4   | `<span>`   | `{totalReps} повт`                |
| 5   | `<em>`     | **`{phase}` English**             |

### 5.3 Active / focus / hover states

`.ta-period-week` uses a **uniform 1px border** on all sides (no left rail).

| State | Selector | Visual |
| ----- | -------- | ------ |
| default | `.ta-period-week` | `border: 1px solid var(--ta-calc-border)` |
| hover (pointer) | `@media (hover: hover) :hover:not(.is-active):not(:focus-visible)` | `border-color: var(--ta-calc-accent)` |
| active / focus-visible | `.is-active`, `:focus-visible` | `background: var(--ta-calc-accent-tint)` + `border-color: var(--ta-calc-accent)` + `outline: none` |

**Правило:** selection/hover = full perimeter accent border (+ tint when active/focus). Never `border-left` as the only highlight cue.

Sync with chart: `onFocus` / `onMouseEnter` → `setActiveIndex(index)`; `onMouseLeave` → null; `onClick` → toggle (click active again → deselect).

---

## 6. Deload — неделя 5

### 6.1 Data signature (typical type A exercise)

From `EXERCISES.bench` / `squat` / `row`:

| Week  | pct    | sets×reps | totalReps | Phase           |
| ----- | ------ | --------- | --------- | --------------- |
| 4     | 83     | 4×5       | 20        | Accumulation    |
| **5** | **75** | **4×6**   | **24**    | **Deload**      |
| 6     | 79     | 4×5       | 20        | Intensification |

**Deload pattern:** % **drops** (83→75) while **volume rises** (20→24 reps) — «волновой откат» в NoteBox.

### 6.2 Visual cues

- Line point ** dips** at week 5 on orange trajectory
- Bar ** taller** at week 5 (more reps)
- Phase strip: single **Deload** segment (mint `--ta-sec-03`)
- Tooltip/list: phase `Deload` + hint «восстановление»

### 6.3 Cross-ref NoteBox

`CalculatorTab` footnote: «↺ **Нед 5 — волновой откат:** вес снижается, объём восстанавливается.» — must stay aligned with chart behavior.

---

## 7. Interaction & keyboard

### 7.1 State machine

Single state: `activeIndex: number | null`.

| Event                      | Handler                       | Result                                           |
| -------------------------- | ----------------------------- | ------------------------------------------------ |
| Pointer enter bar/circle   | `setActiveIndex(i)`           | tooltip + cursor + `.is-active` on bar/point/row |
| Pointer leave bar/circle   | `setActiveIndex(null)`        | clear                                            |
| List focus / mouseenter    | `setActiveIndex(i)`           | chart sync                                       |
| List mouseleave            | `setActiveIndex(null)`        | clear                                            |
| List click                 | toggle i / null               | sticky selection                                 |
| `Escape` on listbox        | `setActiveIndex(null)`        | clear                                            |
| `ArrowLeft` / `ArrowRight` | `preventDefault`; clamp 0…N-1 | keyboard week nav                                |

**Arrow key baseline:** if `activeIndex === null`, starts from **0** then moves.

### 7.2 Keyboard scope

`onKeyDown` on **listbox container** only (not SVG). SVG bars/circles — pointer only; on mobile SVG has `pointer-events: none`.

### 7.3 Section landmark

`section[aria-label="График периодизации, ${weeks.length} недель"]`

---

## 8. Расчёт данных

### 8.1 `PeriodWeek` shape

```ts
interface PeriodWeek {
  week: number; // index + 1
  pct: number;
  weight: number; // display (pullup: raw - bodyWeight)
  rawWeight: number;
  sets;
  reps;
  totalReps;
  phase: 'Accumulation' | 'Deload' | 'Intensification' | 'Peak';
  x;
  y; // line point
  barX;
  barY;
  barHeight;
}
```

### 8.2 Weight formula

```ts
calcWorkingWeight(oneRM, pct, cfg) = roundWeight(oneRM * (pct / 100), cfg.step, cfg.type);
```

- type **A/B:** ceil to step
- type **C/D:** floor to step

### 8.3 Pullups

```ts
displayWeight = rawWeight - result.bodyWeight   // signed
weightLabel → "+X кг" / "-X кг"
```

### 8.4 Source arrays

Length of `config.percentages` drives week count (typically **8**). Each index pairs `percentages[i]` + `weekSchemes[i]`.

### 8.5 Объяснение метрик (канон `metrics-explanations`)

Каждая метрика на графике должна иметь **формулу в коде** (JSDoc/комментарий в pure-функции) и **краткую подпись в UI** (ось, tooltip, listbox или sibling NoteBox).

| Метрика                | Поле / функция                       | Формула                                                                 | Где в UI                                                             |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Интенсивность**      | `week.pct` ← `config.percentages[i]` | Заданный **% от расчётного 1ПМ** (не вычисляется на графике)            | Левая ось `%`; оранжевая линия (Y по шкале minPct…maxPct)            |
| **Рабочий вес**        | `calcWorkingWeight(oneRM, pct, cfg)` | `roundWeight(oneRM × pct/100, step, type)` — type A/B: ceil, C/D: floor | Tooltip стр. 2; listbox `<strong>`; pullup: `rawWeight − bodyWeight` |
| **Объём (повторения)** | `totalReps = sets × reps`            | Сумма повторений за неделю (**не** тоннаж kg×reps)                      | Правая ось `повт`; высота синего bar ∝ `totalReps / maxVolume`       |
| **Схема**              | `weekSchemes[i]`                     | `{sets} × {reps}` из конфига упражнения                                 | Tooltip стр. 2; listbox col 3                                        |
| **Фаза**               | `phaseFor(index)`                    | Жёсткая 8-недельная модель 4+1+2+1                                      | Phase strip; listbox `<em>`; tooltip `phaseHint()` на стр. 3         |
| **Источник 1ПМ**       | `SavedExercise.oneRM`                | **Epley** (Program 2.0) из тестового подхода в калькуляторе — вне hook  | Не на SVG; см. `ResultCard` в composite sec 02                       |

**Подписи для пользователя (RU):**

- `<title>` / `aria-label` секции: «График периодизации, N недель»
- `<desc>` SVG: «N недель: интенсивность в процентах и объём в повторениях. Неделя 5 — разгрузка.» (сейчас N=8 hardcoded — §15)
- Tooltip стр. 3: `{totalReps} повт · {phaseHint}` — phaseHint переводит фазу на русский
- Sibling **NoteBox** (не внутри chart): «↺ Нед 5 — волновой откат: вес снижается, объём восстанавливается» + легенда объёма (high/mid/low по `volumeClass()`)

**Различать в copy:** «повт» = **число повторений**; не путать с тоннажем (кг×повт) — тоннаж на этом чарте не показывается.

**Расширяемость:** при добавлении второй метрики на ось — `<details>` в NoteBox или под legend, имя формулы (Epley / Brzycki) если меняется источник 1ПМ.

### 8.6 Footer stats (listbox `.ta-period__weeks`)

Таблица под SVG — **канонический footer** недельных статистик (не отдельный `<tfoot>` в SVG):

| Col | Содержимое         | Метрика            |
| --- | ------------------ | ------------------ |
| 1   | `Нед {n}`          | Номер недели       |
| 2   | `{weight} кг`      | Рабочий вес (§8.2) |
| 3   | `{sets} × {reps}`  | Схема              |
| 4   | `{totalReps} повт` | Объём повторений   |
| 5   | `<em>{phase}</em>` | Фаза (EN per code) |

На mobile ≤600px listbox — **единственный** интерактивный слой данных; SVG декоративен.

---

## 9. CSS inventory (`theory-apple.css` L3438–3712)

### 9.1 Container `.ta-period`

- `background: var(--ta-calc-surface)`; `border: 1px solid var(--ta-calc-border)`
- `border-radius: var(--glass-radius-panel)`; `padding: 16px`; `margin-bottom: 24px`

### 9.2 List container `.ta-period__weeks`

- `display: grid`; `gap: 6px`; `margin-top: 12px`

### 9.3 Row `.ta-period-week`

- `border: 1px solid var(--ta-calc-border)` (uniform; hover/active recolor full perimeter — no left rail)
- `border-radius: 8px`; `color: var(--ta-text-muted)`; `cursor: pointer`
- `strong`: `font-variant-numeric: tabular-nums`; `color: var(--ta-text)`
- `em`: `font-style: normal`; `color: var(--ta-text-dim)`; `justify-self: end`

### 9.4 Keyframes

| Name                | Effect                     | Used by            |
| ------------------- | -------------------------- | ------------------ |
| `ta-period-line-in` | `stroke-dashoffset: 1 → 0` | `.ta-period__line` |
| `ta-period-area-in` | `opacity: 0 → 1`           | `.ta-period__area` |
| `ta-period-bar-in`  | `scaleY(0) → scaleY(1)`    | `.ta-period__bar`  |

Easing: **`var(--ta-ease)`** for all.

---

## 10. Responsive breakpoints

### 10.1 `@media (max-width: 600px)`

| Element                       | Change                                                        |
| ----------------------------- | ------------------------------------------------------------- |
| `.ta-period__phases`          | `display: grid`; **2 columns**; gap 8px                       |
| `.ta-period__phase`           | `white-space: normal`; min-height 32px; letter-spacing 0.05em |
| `.ta-period__scroll`          | `overflow: hidden`                                            |
| `.ta-period__svg`             | height **180px**; min-width **0**; **`pointer-events: none`** |
| axis, week-label, **tooltip** | `display: none`                                               |
| `.ta-period-week`             | **2-col grid** (stacked pairs)                                |
| `.ta-period-week em`          | `justify-self: start`                                         |

**Strategy:** chart decorative; **listbox carries full data + interaction**.

### 10.2 `@media (max-width: 340px)`

- Phase strip → **1 column**

---

## 11. `prefers-reduced-motion: reduce`

```css
.ta-shell .ta-period__area,
.ta-shell .ta-period__line,
.ta-shell .ta-period__bar {
  animation: none !important;
  opacity: 1 !important;
  stroke-dashoffset: 0 !important;
  transform: none !important;
}
```

**CSS-only** — no JS `matchMedia`. Instant final state: full line, visible area, full-height bars.

---

## 12. Sibling CSS modifiers (shared `.ta-period` block)

Used by **`ProgressionPreviewChart`**, **`ProgramV3ProgressChart`**, not by base `PeriodizationChart`:

| Class                            | Purpose                          |
| -------------------------------- | -------------------------------- |
| `.ta-period__point--muted`       | Dimmed point                     |
| `.ta-period__point--test`        | Test week marker (dashed stroke) |
| `.ta-period__test-mark`          | `?` label on test weeks          |
| `.ta-period__bar.is-test`        | Muted dashed bar                 |
| `.ta-period-week.is-test strong` | Dimmed weight in list            |

When extending PeriodizationChart — reuse these classes rather than new ad hoc styles.

---

## 13. Program 2.0 vs 3.0

| Аспект      | PeriodizationChart      | Program 3.0                                          |
| ----------- | ----------------------- | ---------------------------------------------------- |
| Surface     | `CalculatorTab`         | `CalculatorTabV3` — table + `ProgramV3ProgressChart` |
| Weeks       | 8 from `EXERCISES`      | 16, `WEEK_SCHEDULE_V3`                               |
| 1RM         | Epley from user test    | Brzycki, test weeks 4/8/12/16                        |
| Phase model | Fixed `phaseFor` 8-week | V3 schedule phases                                   |

---

## 14. Sibling charts — кого выравнивать

| Критерий      | **PeriodizationChart** (MAX эталон) | ProgressionPreviewChart          | ProgramV3ProgressChart           | JournalProgressChart                                   |
| ------------- | ----------------------------------- | -------------------------------- | -------------------------------- | ------------------------------------------------------ |
| Hook          | `usePeriodization`                  | `useProgressionPreview`          | `useProgramV3Progress`           | `useJournalProgressChart` (цель)                       |
| Left axis     | **%**                               | **кг**                           | **кг**                           | **кг** (факт 1ПМ)                                      |
| Right axis    | **повт** (bar height)               | **повт**                         | **повт**                         | **повт** / тоннаж (цель)                               |
| Data          | User oneRM + `EXERCISES`            | Demo 100 kg squat                | V3 prescription                  | `userData.journal[]`                                   |
| Phase strip   | ✅ 4 фазы                           | ✅ preset phases                 | ✅ V3 schedule                   | ❌ без фаз программы                                   |
| Deload W5     | phase + data dip                    | `.is-deload` class               | schedule-based                   | n/a                                                    |
| Test weeks    | none                                | `?` markers (strength)           | test weeks                       | n/a                                                    |
| CSS root      | `.ta-period`                        | `.progression-preview.ta-period` | `.program-v3-progress.ta-period` | `.ta-period` (shared palette; layout-only journal CSS) |
| Reference doc | **этот файл**                       | §12 modifiers                    | §12 + `program-v3.css`           | `journal-progress-chart-standard.md`                   |

**→ Копировать:** `VIEW` geometry, `.ta-period__scroll` → `.ta-period__svg`, listbox keyboard, tooltip clamp, stagger 60ms, `prefers-reduced-motion`.  
**→ Не копировать слепо:** `phaseFor`, ось `%`, phase strip — только если домен = 8-недельный план Program 2.0.

---

## 15. Known gaps (documented, not bugs)

| Gap                                | Risk                                   | Recommendation                                     |
| ---------------------------------- | -------------------------------------- | -------------------------------------------------- |
| Hardcoded `<desc>` «8 недель» / W5 | Wrong a11y if N≠8                      | Derive from `weeks.length` + deload index          |
| Phase EN in list `<em>`            | RU/EN mix                              | Localize only on explicit task; tooltip already RU |
| Bars mono `--ta-sec-02`            | NoteBox vol-legend colors not on chart | Optional `barColor(totalReps)`                     |
| No preset in hook                  | Future preset may change %             | Pass preset or document immutability               |
| v3 separate model                  | Don't copy `phaseFor` to v3            | New hook from `getPrescription`                    |

---

## 16. Agent checklist (new dual-axis chart)

- [ ] Hook: `useMemo`, `VIEW` constants, `linePath`/`areaPath` helpers
- [ ] Component: **only** `activeIndex` + a11y listbox
- [ ] CSS under `.ta-shell`, mobile + `prefers-reduced-motion`
- [ ] Phase strip via `--phase-color` / `--phase-bg`, not inline hex
- [ ] Tooltip X clamp; cursor line relative math
- [ ] Pullup `weightLabel` edge cases
- [ ] Stagger **60ms** on bars
- [ ] Update **this file** + `calc-progression-result-standard.md` if parent context changes
- [ ] Preview MCP `cursor-ide-browser` @ `:5173`

---

## 17. Связанные артефакты Memory Bank

| Документ                                                                       | Связь                                |
| ------------------------------------------------------------------------------ | ------------------------------------ |
| [`calc-progression-result-standard.md`](./calc-progression-result-standard.md) | Partial sec 02, link to this MAX doc |
| [`calculator-tab-standard.md`](./calculator-tab-standard.md)                   | Umbrella §02d                        |
| [`README.md`](./README.md)                                                     | Index → PeriodizationChart row       |
| `memory-bank/systemPatterns.md`                                                | Reference implementations table      |
| `memory-bank/activeContext.md`                                                 | Design canon + session notes         |
| `memory-bank/style-guide.md`, `CLAUDE.md`                                      | Global tokens / motion               |
| `.cursor/rules/theory-design-reference.mdc`                                    | `--ta-*` Theory shell                |
| `docs/claude-designer-brief.md`                                                | Designer brief row                   |


## `memory-bank/reference/redesign-existing-projects.md`

---
name: redesign-existing-projects
description: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.
---

# Redesign Skill

## How This Works

When applied to an existing project, follow this sequence:

1. **Scan** — Read the codebase. Identify the framework, styling method (Tailwind, vanilla CSS, styled-components, etc.), and current design patterns.
2. **Diagnose** — Run through the audit below. List every generic pattern, weak point, and missing state you find.
3. **Fix** — Apply targeted upgrades working with the existing stack. Do not rewrite from scratch. Improve what's there.

## Design Audit

### Typography

Check for these problems and fix them:

- **Browser default fonts or Inter everywhere.** Replace with a font that has character. Good options: `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`. For editorial/creative projects, pair a serif header with a sans-serif body.
- **Headlines lack presence.** Increase size for display text, tighten letter-spacing, reduce line-height. Headlines should feel heavy and intentional.
- **Body text too wide.** Limit paragraph width to roughly 65 characters. Increase line-height for readability.
- **Only Regular (400) and Bold (700) weights used.** Introduce Medium (500) and SemiBold (600) for more subtle hierarchy.
- **Numbers in proportional font.** Use a monospace font or enable tabular figures (`font-variant-numeric: tabular-nums`) for data-heavy interfaces.
- **Missing letter-spacing adjustments.** Use negative tracking for large headers, positive tracking for small caps or labels.
- **All-caps subheaders everywhere.** Try lowercase italics, sentence case, or small-caps instead.
- **Orphaned words.** Single words sitting alone on the last line. Fix with `text-wrap: balance` or `text-wrap: pretty`.

### Color and Surfaces

- **Pure `#000000` background.** Replace with off-black, dark charcoal, or tinted dark (`#0a0a0a`, `#121212`, or a dark navy).
- **Oversaturated accent colors.** Keep saturation below 80%. Desaturate accents so they blend with neutrals instead of screaming.
- **More than one accent color.** Pick one. Remove the rest. Consistency beats variety.
- **Mixing warm and cool grays.** Stick to one gray family. Tint all grays with a consistent hue (warm or cool, not both).
- **Purple/blue "AI gradient" aesthetic.** This is the most common AI design fingerprint. Replace with neutral bases and a single, considered accent.
- **Generic `box-shadow`.** Tint shadows to match the background hue. Use colored shadows (e.g., dark blue shadow on a blue background) instead of pure black at low opacity.
- **Flat design with zero texture.** Add subtle noise, grain, or micro-patterns to backgrounds. Pure flat vectors feel sterile.
- **Perfectly even gradients.** Break the uniformity with radial gradients, noise overlays, or mesh gradients instead of standard linear 45-degree fades.
- **Inconsistent lighting direction.** Audit all shadows to ensure they suggest a single, consistent light source.
- **Random dark sections in a light mode page (or vice versa).** A single dark-background section breaking an otherwise light page looks like a copy-paste accident. Either commit to a full dark mode or keep a consistent background tone throughout. If contrast is needed, use a slightly darker shade of the same palette — not a sudden jump to `#111` in the middle of a cream page.
- **Empty, flat sections with no visual depth.** Sections that are just text on a plain background feel unfinished. Add high-quality background imagery (blurred, overlaid, or masked), subtle patterns, or ambient gradients. Use reliable placeholder sources like `https://picsum.photos/seed/{name}/1920/1080` when real assets are not available. Experiment with background images behind hero sections, feature blocks, or CTAs — even a subtle full-width photo at low opacity adds presence.

### Layout

- **Everything centered and symmetrical.** Break symmetry with offset margins, mixed aspect ratios, or left-aligned headers over centered content.
- **Three equal card columns as feature row.** This is the most generic AI layout. Replace with a 2-column zig-zag, asymmetric grid, horizontal scroll, or masonry layout.
- **Using `height: 100vh` for full-screen sections.** Replace with `min-height: 100dvh` to prevent layout jumping on mobile browsers (iOS Safari viewport bug).
- **Complex flexbox percentage math.** Replace with CSS Grid for reliable multi-column structures.
- **No max-width container.** Add a container constraint (around 1200-1440px) with auto margins so content doesn't stretch edge-to-edge on wide screens.
- **Cards of equal height forced by flexbox.** Allow variable heights or use masonry when content varies in length.
- **Uniform border-radius on everything.** Vary the radius: tighter on inner elements, softer on containers.
- **No overlap or depth.** Elements sit flat next to each other. Use negative margins to create layering and visual depth.
- **Symmetrical vertical padding.** Top and bottom padding are always identical. Adjust optically — bottom padding often needs to be slightly larger.
- **Dashboard always has a left sidebar.** Try top navigation, a floating command menu, or a collapsible panel instead.
- **Missing whitespace.** Double the spacing. Let the design breathe. Dense layouts work for data dashboards, not for marketing pages.
- **Buttons not bottom-aligned in card groups.** When cards have different content lengths, CTAs end up at random heights. Pin buttons to the bottom of each card so they form a clean horizontal line regardless of content above.
- **Feature lists starting at different vertical positions.** In pricing tables or comparison cards, the list of features should start at the same Y position across all columns. Use consistent spacing above the list or fixed-height title/price blocks.
- **Inconsistent vertical rhythm in side-by-side elements.** When placing cards, columns, or panels next to each other, align shared elements (titles, descriptions, prices, buttons) across all items. Misaligned baselines make the layout look broken.
- **Mathematical alignment that looks optically wrong.** Centering by the math doesn't always look centered to the eye. Icons next to text, play buttons in circles, or text in buttons often need 1-2px optical adjustments to feel right.

### Interactivity and States

- **No hover states on buttons.** Add background shift, slight scale, or translate on hover.
- **No active/pressed feedback.** Add a subtle `scale(0.98)` or `translateY(1px)` on press to simulate a physical click.
- **Instant transitions with zero duration.** Add smooth transitions (200-300ms) to all interactive elements.
- **Missing focus ring.** Ensure visible focus indicators for keyboard navigation. This is an accessibility requirement, not optional.
- **No loading states.** Replace generic circular spinners with skeleton loaders that match the layout shape.
- **No empty states.** An empty dashboard showing nothing is a missed opportunity. Design a composed "getting started" view.
- **No error states.** Add clear, inline error messages for forms. Do not use `window.alert()`.
- **Dead links.** Buttons that link to `#`. Either link to real destinations or visually disable them.
- **No indication of current page in navigation.** Style the active nav link differently so users know where they are.
- **Scroll jumping.** Anchor clicks jump instantly. Add `scroll-behavior: smooth`.
- **Animations using `top`, `left`, `width`, `height`.** Switch to `transform` and `opacity` for GPU-accelerated, smooth animation.

### Content

- **Generic names like "John Doe" or "Jane Smith".** Use diverse, realistic-sounding names.
- **Fake round numbers like `99.99%`, `50%`, `$100.00`.** Use organic, messy data: `47.2%`, `$99.00`, `+1 (312) 847-1928`.
- **Placeholder company names like "Acme Corp", "Nexus", "SmartFlow".** Invent contextual, believable brand names.
- **AI copywriting cliches.** Never use "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer", "Delve", "Tapestry", or "In the world of...". Write plain, specific language.
- **Exclamation marks in success messages.** Remove them. Be confident, not loud.
- **"Oops!" error messages.** Be direct: "Connection failed. Please try again."
- **Passive voice.** Use active voice: "We couldn't save your changes" instead of "Mistakes were made."
- **All blog post dates identical.** Randomize dates to appear real.
- **Same avatar image for multiple users.** Use unique assets for every distinct person.
- **Lorem Ipsum.** Never use placeholder latin text. Write real draft copy.
- **Title Case On Every Header.** Use sentence case instead.

### Component Patterns

- **Generic card look (border + shadow + white background).** Remove the border, or use only background color, or use only spacing. Cards should exist only when elevation communicates hierarchy.
- **Always one filled button + one ghost button.** Add text links or tertiary styles to reduce visual noise.
- **Pill-shaped "New" and "Beta" badges.** Try square badges, flags, or plain text labels.
- **Accordion FAQ sections.** Use a side-by-side list, searchable help, or inline progressive disclosure.
- **3-card carousel testimonials with dots.** Replace with a masonry wall, embedded social posts, or a single rotating quote.
- **Pricing table with 3 towers.** Highlight the recommended tier with color and emphasis, not just extra height.
- **Modals for everything.** Use inline editing, slide-over panels, or expandable sections instead of popups for simple actions.
- **Avatar circles exclusively.** Try squircles or rounded squares for a less generic look.
- **Light/dark toggle always a sun/moon switch.** Use a dropdown, system preference detection, or integrate it into settings.
- **Footer link farm with 4 columns.** Simplify. Focus on main navigational paths and legally required links.

### Iconography

- **Lucide or Feather icons exclusively.** These are the "default" AI icon choice. Use Phosphor, Heroicons, or a custom set for differentiation.
- **Rocketship for "Launch", shield for "Security".** Replace cliche metaphors with less obvious icons (bolt, fingerprint, spark, vault).
- **Inconsistent stroke widths across icons.** Audit all icons and standardize to one stroke weight.
- **Missing favicon.** Always include a branded favicon.
- **Stock "diverse team" photos.** Use real team photos, candid shots, or a consistent illustration style instead of uncanny stock imagery.

### Code Quality

- **Div soup.** Use semantic HTML: `<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`.
- **Inline styles mixed with CSS classes.** Move all styling to the project's styling system.
- **Hardcoded pixel widths.** Use relative units (`%`, `rem`, `em`, `max-width`) for flexible layouts.
- **Missing alt text on images.** Describe image content for screen readers. Never leave `alt=""` or `alt="image"` on meaningful images.
- **Arbitrary z-index values like `9999`.** Establish a clean z-index scale in the theme/variables.
- **Commented-out dead code.** Remove all debug artifacts before shipping.
- **Import hallucinations.** Check that every import actually exists in `package.json` or the project dependencies.
- **Missing meta tags.** Add proper `<title>`, `description`, `og:image`, and social sharing meta tags.

### Strategic Omissions (What AI Typically Forgets)

- **No legal links.** Add privacy policy and terms of service links in the footer.
- **No "back" navigation.** Dead ends in user flows. Every page needs a way back.
- **No custom 404 page.** Design a helpful, branded "page not found" experience.
- **No form validation.** Add client-side validation for emails, required fields, and format checks.
- **No "skip to content" link.** Essential for keyboard users. Add a hidden skip-link.
- **No cookie consent.** If required by jurisdiction, add a compliant consent banner.

## Upgrade Techniques

When upgrading a project, pull from these high-impact techniques to replace generic patterns:

### Typography Upgrades
- **Variable font animation.** Interpolate weight or width on scroll or hover for text that feels alive.
- **Outlined-to-fill transitions.** Text starts as a stroke outline and fills with color on scroll entry or interaction.
- **Text mask reveals.** Large typography acting as a window to video or animated imagery behind it.

### Layout Upgrades
- **Broken grid / asymmetry.** Elements that deliberately ignore column structure — overlapping, bleeding off-screen, or offset with calculated randomness.
- **Whitespace maximization.** Aggressive use of negative space to force focus on a single element.
- **Parallax card stacks.** Sections that stick and physically stack over each other during scroll.
- **Split-screen scroll.** Two halves of the screen sliding in opposite directions.

### Motion Upgrades
- **Smooth scroll with inertia.** Decouple scrolling from browser defaults for a heavier, cinematic feel.
- **Staggered entry.** Elements cascade in with slight delays, combining Y-axis translation with opacity fade. Never mount everything at once.
- **Spring physics.** Replace linear easing with spring-based motion for a natural, weighty feel on all interactive elements.
- **Scroll-driven reveals.** Content entering through expanding masks, wipes, or draw-on SVG paths tied to scroll progress.

### Surface Upgrades
- **True glassmorphism.** Go beyond `backdrop-filter: blur`. Add a 1px inner border and a subtle inner shadow to simulate edge refraction.
- **Spotlight borders.** Card borders that illuminate dynamically under the cursor.
- **Grain and noise overlays.** A fixed, pointer-events-none overlay with subtle noise to break digital flatness.
- **Colored, tinted shadows.** Shadows that carry the hue of the background rather than using generic black.

## Fix Priority

Apply changes in this order for maximum visual impact with minimum risk:

1. **Font swap** — biggest instant improvement, lowest risk
2. **Color palette cleanup** — remove clashing or oversaturated colors
3. **Hover and active states** — makes the interface feel alive
4. **Layout and spacing** — proper grid, max-width, consistent padding
5. **Replace generic components** — swap cliche patterns for modern alternatives
6. **Add loading, empty, and error states** — makes it feel finished
7. **Polish typography scale and spacing** — the premium final touch

## Rules

- Work with the existing tech stack. Do not migrate frameworks or styling libraries.
- Do not break existing functionality. Test after every change.
- Before importing any new library, check the project's dependency file first.
- If the project uses Tailwind, check the version (v3 vs v4) before modifying config.
- If the project has no framework, use vanilla CSS.
- Keep changes reviewable and focused. Small, targeted improvements over big rewrites.


## `memory-bank/reference/section-elevation-standard.md`

# Эталон: elevation секций (Theory chapter-panel)

> **Статус:** канон soft-lift для контентных секций  
> **Дата:** 2026-07-12  
> **Gold source:** `section#chapter-panel.ta-chapter-panel`

## Модель

| Слой     | Селектор                                      | Роль                                                                 |
| -------- | --------------------------------------------- | -------------------------------------------------------------------- |
| Outer    | `section.ta-section.ta-calc-section`          | Только layout — transparent, без shadow/tint на full-bleed (~1600px) |
| **Card** | `div.ta-section-inner.ta-calc-section__inner` | Единая elevated-поверхность (~1140 max-width): pill + title + body   |
| Nested   | `.app-tab-section` внутри inner               | Без второго lift                                                     |

## Токен

```css
--section-elevation: 0 8px 24px rgba(0, 0, 0, 0.2), 0 16px 48px rgba(0, 0, 0, 0.3);
--section-radius: var(--glass-radius-inner);
```

На inner: `background: var(--ta-surface)`, `border: 1px solid var(--ta-border)`, `border-radius: var(--ta-radius-card)`, `box-shadow: var(--section-elevation)`.

## Где применяется

- Calculator / Training / Split — `SectionBlock` (variant apple)
- Journal — тот же inner; glass-surface elevates inner, не outer
- Theory chapter panel — тот же `--section-elevation`

## Запрещено

- Full-bleed shadow на outer `.ta-calc-section`
- Double elevation (section + body / section + inner)
- Ломать journal `1fr 1fr` top-row grid


## `memory-bank/reference/theory-article-algorithm.md`

# Theory article system — дизайн, алгоритм, лексикон

> **Canon (2026-08-26).** Одна система на все статьи вкладки «Теория».  
> Источник редакции: аудит фитнес-контента (Downloads). Источник UI: живые главы 01, 02 и блок `.ta-frac`.  
> Не редизайнить locked surfaces. Не смешивать с SEO-блогом.

**Locked (не трогать CSS/markup/copy без явной просьбы):**

- Глава 01 `.ta-chapter-stack`: ГЛАВА 01 / Базовые понятия / TOC 1–4 / 1.1–1.4
- Глава 02 тело лекции mTOR (пользователь утвердил 2026-08-26)
- `section.ta-frac` / `FractionalVolumeSection` — визуальный gold виджета

Смежные каноны: `theory-lecture-page-standard.md`, `theory-frac-volume-standard.md`, `theory-textbook-pedagogy-standard.md`, `.cursor/skills/theory-content-structurer/SKILL.md`.

---

## 1. Мнение об алгоритме из Downloads

Файл — сильный **редакционный конвейер** для публичного фитнес-сайта: диагностика → реконструкция → стиль → самопроверка. Для вкладки «Теория» калькулятора тренировок его нельзя копировать целиком.

### Принять (адаптировать под продукт)

- **Диагностика до правки:** логика, повторы абзацев, неестественные обороты, нехватка фактов.
- **Короткие предложения, активный залог, без слов-паразитов** («конкретно», «так сказать», «по сути»).
- **Термин раскрыть при первом появлении**, дальше можно аббревиатуру.
- **Мостик между блоками** — причинно-следственный, не «далее / кроме того».
- **Вывод в конце секции** — у нас это check-in (вопрос + короткий ответ), не маркетинговый абзац.
- **Самопроверка:** что узнал / зачем это в плане / что открыть дальше (see-also, не CTA «скачайте чеклист»).
- **Стоп-лист абстракций:** «реализовать потенциал», «максимизировать результат» → конкретные числа из `theory.ts`.

### Отвергнуть (ломает канон Теории)

- **Крючок боли:** «вы ходите в зал три раза, а весы стоят». Теория — учебник приложения, не блог.
- **Видимый «слоёный контент»:** бейджи «для новичков / для профи / научная справка». Слои есть в данных (`lecture` → `definition` / `pattern` / `bullets`), **не** в UI-подписях метода.
- **Мета-педагогика в заголовках:** «сначала просто», «как в учебнике», «лекция не копирует подписи».
- **CTA и вовлечение:** скачать гайд, комментарии, запись к тренеру, восклицания.
- **Упрощение терминов в ноль:** Direct, Fractional, PUOS, RPE, mTORC1, 1ПМ остаются именами. Рядом — короткая русская расшифровка, не замена.
- **Красть метафору стройки** из главы 02 в другие главы.
- **FKGL 6–8 как жёсткий гейт.** Аудитория считает подходы, а не читает буклет ВОЗ.
- **Запрет англицизмов вслепую.** Direct-сет / Fractional / PUOS / RPE — канон продукта.

---

## 2. Дизайн (рецепт с живого UI)

Не выдумывать новый вид. Копировать язык глав 01–02 и `.ta-frac`.

### Шапка панели `.ta-chapter-panel__head`

- Заголовок + lede **слева**
- Пилюля «Глава N» / «Интересная статья для чтения» **справа** (`justify-self: end`)
- Не колонка «пилюля → заголовок» по центру
- Без `text-align: center` на title-wrap

### Intro-карточка `.ta-lesson-intro`

- Eyebrow: 14px / 600 / 0.08em / uppercase / accent главы (`--ta-sec`)
- Title: display font, ~24px, белый, слева
- Lede: 16px / 1.65, фактический тезис (не метод преподавания)
- TOC `.ta-lesson-plan`: нумерованные шаги 1…n, accent badge, **strong** имя секции + короткое уточнение

### Секция `.ta-lesson-section`

- Step: `1.1` / `2.1` — uppercase accent, 14px
- Title: 20–24px, слева
- Lede: 16px, слева, на всю ширину панели (не 42em)

### Карточка темы `.ta-lecture-topic` (`LectureSection`)

- Карточка: surface, accent-tint border, elevation, padding 18×16, gap 14
- Title: 18px / 600
- Проза: 16px / 1.65, 3–6 коротких абзацев
- Callout (если есть): bronze/accent tint, крупное значение + caption
- Case: inset row, label «Случай»
- Glossary под прозой: **Определение / Схема / Как применять** (locked UI; не менять в 01/02)
- Check-in секции: `<details>` вопрос / ответ, без счёта

### Виджет `.ta-frac` (единственный gold интерактива объёма)

- Outer: surface + radial tint, border, gap 32px, padding 32/24/28
- Eyebrow + title «Определения» + intro
- Term rows: золотое имя / белый value / muted note
- Rule cards: title 18px + body
- **Один** centered hero: огромная цифра (у 01 — `0.5`), затем заголовок + 2 строки
- Всё ниже hero — слева
- Tabs (один интерактив), lens: label слева / значение справа
- Bronze callout, dose cards, source footer

### Токены

- 4px сетка. Радиусы 12/14. Body ≥16px. Touch ≥44px.
- Акцент главы: `--ta-sec` / `--ta-sec-tint`. Нейтральный текст, один accent.
- Ширина = body панели, **без** колонки 42em.
- Hero-цифра — единственный центр. Остальное left-aligned.
- iPhone 390–430px: без overflow-x.

### Backlog (не делать сейчас)

Переименовать glossary dt «Определение / Схема / Как применять» в золотые имена терминов как в frac — **только** если пользователь явно попросит. Сейчас 01 и 02 так утверждены.

---

## 3. Алгоритм сборки каждой статьи

Одна глава = один проход → взгляд в браузере → следующая. Факты только из `theory.ts` (или уже сверенного источника в репо). Новые проценты не выдумывать.

### A. Диагностика (до правок)

1. Где рвётся логика между секциями?
2. Где один тезис повторён двумя абзацами?
3. Где термин без расшифровки или чужая метафора?
4. Где вода / SEO / мета-метод вместо факта?

### B. Инвентарь

5. Выписать термины, числа, якоря из текущих групп главы.
6. Отделить: что учит **лекция**, что уже учит **виджет** (не дублировать).
7. Назначить **одну** метафору главы (таблица в `theory-lecture-page-standard.md`).

### C. Каркас (4–5 секций)

8. Intro: eyebrow «Глава NN» + title + тезис + TOC имён секций.
9. Секции `N.1` … с lede-фактом.
10. В каждой секции 1–3 topic cards (`LectureSection`).
11. Check-in в конце секции.
12. **Один** интерактив на главу (01: frac lenses; 02: day timeline; иначе существующий виджет).
13. Source + see-also (`ChapterLink` по `chapterId`).

### D. Слои темы (в данных, не в заголовках UI)

14. **Лекция** — обычный язык, затем термин; 3–6 абзацев; предложения в основном ≤20 слов.
15. **Определение** — одна точная фраза.
16. **Схема** — `pattern` (чипы `×`/`=` только для конъюнкции входов; `→` для каскада).
17. **Как применять** — нюансы, ограничения, ошибки.
18. Callout/case — максимум 2–3 на главу.

### E. Стиль

19. Активный залог. Sentence case. Без восклицаний и эмодзи.
20. Аббревиатуру раскрыть один раз (RPE — шкала усилия).
21. Мостик = причина, не канцелярит.
22. Числа — только канон главы (см. `theory-lecture-page-standard.md` § Numbers).

### F. Гейты

23. Заголовки называют термины, не метод.
24. Нет «сначала просто», «лекция не копирует», крючков боли, CTA блога.
25. Метафора главы не украдена у соседней.
26. `npm run typecheck`; тесты затронутых данных; превью `http://localhost:5173/?tab=theory&chapter=<id>` desktop + 390px.

### G. Самопроверка «закрыл статью»

27. **Что узнал?** Один-два предложения тезиса.
28. **Зачем в приложении?** Какой экран/число считает этот термин.
29. **Что дальше?** See-also, не «оставьте комментарий».

---

## 4. Лексикон

Голос: короткий, активный, факты первыми. Русский в UI; идентификаторы в коде — English.

### Разрешённые термины (канонические определения)

| Термин                   | Канон (из `theory.ts`)                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| 1ПМ                      | Максимальный вес на одно повторение. Метр рабочих процентов, не обязательный конкурс на тренировке.     |
| Формула Эпли             | Оценка 1ПМ из отказного подхода; в приложении коэффициенты 1.3 / 1.2 / 1.1. Лучший тест 5–8 повторений. |
| Тестовый вес             | Отказной подход для оценки 1ПМ.                                                                         |
| Рабочий вес              | Процент от 1ПМ на конкретную неделю (старт ~68–70%, пик ~85–90%).                                       |
| Прогрессивная перегрузка | Нагрузка должна расти: вес, объём или плотность.                                                        |
| Волновая периодизация    | Вес и объём идут волной; неделя 5 — откат, не потеря.                                                   |
| RPE                      | Шкала усилия 1–10. 10 — отказ; рабочие сеты цикла 8–9, не 10.                                           |
| Direct-сет               | В зачёт силы — только целевое движение.                                                                 |
| Fractional-сет           | Для гипертрофии: цель 1.0, синергист 0.5.                                                               |
| Total-сет                | Всем полный сет; обычно завышает синергисты.                                                            |
| PUOS                     | Point of Undetectable Outcome Superiority — ориентир убывающей отдачи по объёму, не запрет.             |
| Синергист                | Мышца-помощник, не главный движитель.                                                                   |
| mTORC1                   | Сбор заявок с нагрузки, белка и энергии; не выключатель роста. Метафора прораба — **только глава 02**.  |
| MPS / MPB                | Синтез и распад белка; рост — сальдо за сутки.                                                          |
| S6K1 / 4E-BP1            | «Газ» / «ручник» — **только 2.1**, рядом с именем белка.                                                |
| Макро / мезо / микро     | Этажи времени: год → фаза → неделя (глава 10).                                                          |
| Сессия / метод           | Нижние этажи иерархии 10.                                                                               |

Ориентиры объёма (только блок frac, не дублировать лекцией 1.1–1.4): гипертрофия ~11 fractional/сессия, ~31/неделя; сила ~2 direct/сессия, ~4–6/неделя.

### Якоря по главам (не тащить в чужую)

- **01:** без метра проценты гадают; откат — не потеря; цвет сессии ≠ доза на мышцу.
- **02:** прораб не работает без материалов и сметы; рост — сальдо за сутки; три входа, не один рычаг.
- **03:** tier — фильтр, не каталог.
- **04:** три слота, не витрина.
- **05:** %ПМ планирует, RPE проверяет.
- **06:** мышца растёт быстрее сухожилия; окно 4,5–6,5%.
- **08:** цифра на грифе ≠ момент в суставе.
- **09:** усталость вычитается.
- **10:** метод — нижний этаж.

### Запрещено в UI

- «Сначала просто, потом сложнее», «как в учебнике», «лекция не копирует подписи»
- «Для новичков / для профи» как бейджи слоёв
- SEO: «вы устали от зала», «не знаете что делать дальше»
- CTA: скачать чеклист, оставьте комментарий, запишитесь
- Эмодзи; восклицания; канцелярит («осуществлять», «является наиболее»)
- Метафора стройки **вне** главы 02
- Метр плана / Эпли **вне** главы 01 (кроме явной отсылки see-also)
- PUOS / Direct / Fractional числа внутри топиков 1.1–1.4 — они живут в `.ta-frac`

### Подписи UI (locked)

Определение · Схема · Как применять. Смена на золотые имена терминов — backlog.

---

## 5. Agent prompt (копировать в задачу)

```text
Роль: академический редактор вкладки «Теория» (калькулятор тренировок), не автор фитнес-блога.

Визуальный эталон ЛЕКЦИИ (не менять):
- глава 01 `.ta-chapter-stack` (intro + TOC + 1.1–1.4);
- глава 02 тело mTOR;
- шапка: title+lede слева, пилюля «Глава N» справа.

Визуальный эталон ВИДЖЕТА (не менять): весь `section.ta-frac`.

Подача текста:
1. Диагностика: логика, повторы, неестественные обороты, дыры в фактах.
2. Факты и числа только из theory.ts этой главы.
3. Intro = тезис + TOC имён секций. 4–5 секций. Одна метафора на главу.
4. Тема: обычный язык → термин; 3–6 коротких абзацев; затем glossary
   (Определение / Схема / Как применять).
5. Один интерактив. Не дублировать лекцией то, что уже считает виджет.
6. Активный залог, предложения в основном ≤20 слов, без воды и SEO-крючков.
7. В UI запрещено: «сначала просто», «лекция не копирует», боль-крючок,
   CTA блога, эмодзи, чужая метафора главы.
8. Одна глава = один проход, потом браузер 5173 desktop + 390px.

Самопроверка: что узнал / зачем в приложении / какой see-also.
```

---

## Файлы

- UI: `src/components/theory/LectureSection.tsx`, `chapterContent.tsx`, `FractionalVolumeSection.tsx`
- CSS: `src/styles/components/theory-apple.css` — `.ta-lesson-*`, `.ta-lecture-*`, `.ta-shell .ta-frac*`
- Данные: `packages/shared/src/data/theory.ts`
- Skill: `.cursor/skills/theory-content-structurer/SKILL.md`


## `memory-bank/reference/theory-frac-volume-standard.md`

# Theory visual gold — весь блок «Объём за сессию»

> **Canon (2026-08-26):** визуальный эталон **виджета объёма** — **весь** `section.ta-frac` / `FractionalVolumeSection` в главе 01, не только hero «0.5».  
> **LOCKED:** не редизайнить `.ta-frac`. Лекция главы 01 (intro + 1.1–1.4) и лекция главы 02 — отдельные эталоны, тоже locked; см. `theory-lecture-page-standard.md`.  
> Playbook лекции: `theory-lecture-page-standard.md`. Педагогика: `theory-textbook-pedagogy-standard.md`. Система: `theory-article-algorithm.md`. Промпт: `.cursor/skills/theory-content-structurer/SKILL.md`.

## Gold source

| Слой      | Путь                                                             |
| --------- | ---------------------------------------------------------------- |
| Component | `src/components/FractionalVolumeSection.tsx`                     |
| CSS       | `src/styles/components/theory-apple.css` — `.ta-shell .ta-frac*` |
| Data      | `FRACTIONAL_VOLUME_GUIDE` в `packages/shared/src/data/theory.ts` |

**Запрещено** редизайнить этот блок «под остальную Теорию» и **запрещено** переписывать лекцию 01 (1.1–1.4), чтобы она «стала как frac». Frac — виджет **ниже** лекции. Остальные главы **наследуют** язык виджета только в unique volume/dose UI.

## Visual language (извлечь, не выдумывать)

| Часть          | Правило                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------ |
| Outer card     | surface + radial tint от chapter accent, border, radius card, gap 32px, padding 32/24/28   |
| Eyebrow        | 14px / 600 / 0.08em / uppercase / chapter accent                                           |
| Section titles | display font, 20–28px, white, **LEFT**                                                     |
| Prose          | 16px / 1.65; muted для вторичного                                                          |
| Term cards     | stacked rows, gold term name, white value, muted note, hairline separators                 |
| Rule cards     | surface, accent-tinted border, elevation, 18px title                                       |
| Hero           | **единственный** centered block: huge gradient figure, затем white heading + muted 2 lines |
| Below hero     | всё left-aligned, stacked                                                                  |
| Callouts       | bronze/accent tint bg + border                                                             |
| Walk / dose    | inset surface rows                                                                         |
| Lens           | label left / value right                                                                   |
| Tabs           | один интерактив (Сила / Гипертрофия)                                                       |

## Chapter panel header

Не колонка «пилюля → заголовок» по центру.

- `.ta-chapter-panel__title-wrap`: grid `1fr auto`
- title + lede **слева**
- `.ta-section-pill` **справа** (`justify-self: end`)
- без `text-align: center` / `align-self: center` / `margin-inline: auto`

## Shared lecture mapping

| Lecture class          | Frac analog                          |
| ---------------------- | ------------------------------------ |
| `.ta-lesson-section`   | `.ta-frac__section` (gap 14)         |
| `.ta-lecture-topic`    | `.ta-frac__rule` cards               |
| `.ta-lecture-glossary` | `.ta-frac__terms` / `__term`         |
| `.ta-lecture-callout`  | `.ta-frac__callout` (не hero figure) |
| body                   | full panel width, **без** 42em       |

## Copy

Facts first. Titles name terms. Hard ban: «лекция не копирует…», «сначала просто», анонс метода.

## Sibling (не эталон)

- Centered lecture chrome / centered section titles
- Skinny 42em left column
- Pedagogy-method headlines
- Редизайн `.ta-frac` «чтобы было как в главе 10»
- Перестройка locked-лекции 01/02 «под frac»


## `memory-bank/reference/theory-lecture-page-standard.md`

# Theory lecture page

> **Canon (2026-08-25, lock 2026-08-26):** A Theory chapter is a **lecture page** when prose is the reading layer, glossary sits under it, and there is **one** interactive.  
> **Lecture gold (LOCKED, user-approved 2026-08-26):** chapter **02 mTOR** body **and** chapter **01** intro/stack as they are now (`.ta-lesson-intro` «Глава 01 / Базовые понятия» + TOC 1–4 + sections 1.1–1.4). Do not restyle either. Do not change `LectureSection` markup/CSS in a way that alters 01 or 02.  
> **Widget gold (separate):** `.ta-frac` — `theory-frac-volume-standard.md`.  
> **System (design + algorithm + lexicon + agent prompt):** `theory-article-algorithm.md`.  
> Applied to remaining numbered chapters: **03–06**, **08–10**. Chapter **07** is vascular cards. Egorov conspects live in `THEORY_READING_ARTICLES` (`diabetes-habits`, `late-dinner`, `anabolic-vessels`), not in the 10-chapter grid.

## How to rewrite a chapter

Copy this sequence. Do not invent new percents, doses, or citations.

1. **Inventory facts** from the current cards / `theory.ts` (and overlapping `THEORY_CONCEPTS` paragraphs if they already teach the same terms). New numbers only if freshly sourced in-repo.
2. **Group into 4–5 named sections.** Separate practice (how the app uses the term) from limits (what belongs in another chapter).
3. **One metaphor per chapter.** Do not reuse the previous chapter’s through-line (mTOR construction site stays in 02; Основы uses the meter of the plan).
4. **Per topic:** 3–6 short paragraphs. Ordinary language first, term second. Under the prose: glossary `definition` / `pattern` / `bullets`.
5. **Density caps:** at most 2–3 callouts and 2–3 cases for the whole chapter. Check-in at the **end of each section** — static question + short answer, no score.
6. **One interactive per chapter.** Pattern chips: `×` / `=` only for a conjunction of inputs; `→` for a cascade; otherwise one chip.
7. **Native derivative** only if that contract already exists (`MTOR_CONCEPTS`, `BASICS_CORE`, …): `flatMap` of `{ title, definition, pattern?, bullets }`. Do not redesign macos/mobile Theory. Do not rewrite other chapters in the same pass.
8. **Checks:** `npm run typecheck`, `npm test`, iPhone viewport **390–430px** on the rewritten chapter.

## Checklist (copy for 03, 04, …)

```text
[ ] Facts inventoried from current theory.ts / cards; no new percents
[ ] 4–5 named sections; practice vs limits split
[ ] One chapter metaphor; previous chapter’s metaphor not imported
[ ] Topics: 3–6 paragraphs; term after ordinary language
[ ] Glossary under prose: definition / pattern / bullets
[ ] ≤2–3 callouts, ≤2–3 cases; section check-in (no score)
[ ] One interactive only (keep existing widget if it already teaches the skill)
[ ] Do not lecture-duplicate what the interactive already teaches
[ ] Compact native derivative if the contract exists; macos THEORY_CONCEPTS untouched
[ ] Other chapters / mobile Theory not rewritten
[ ] See-also bridges use chapterId + LectureSection (no hardcoded «01 ·»)
[ ] typecheck + tests + 390–430 preview
```

## Reading layers

1. **Lecture** — 3–6 short paragraphs per topic. Ordinary language first, term second.
2. **Glossary** — `definition` / `pattern` / `bullets` under the prose, quieter.
3. **One interactive** — chapter-specific widget (02: day timeline; 01: fractional lenses). Not a second lecture of the same terms.
4. **Check-in** — static question + short answer at the end of each section. No score.

## Metaphor (per chapter)

| Chapter           | Through-line                                                                  | Do not mix in                                                    |
| ----------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 02 mTOR           | Construction site: mTORC1 = foreman; amino acids = materials; energy = budget | Thermostat; «зарплата» for calories; 01 meter language           |
| 01 Основы         | Meter of the plan: 1RM measures, wave is relief, RPE is the cost of the set   | Construction site from 02; clusters / tendons / «три зоны»       |
| 03 Tier List      | Filter, not catalog: S–F = how often it pays off for a natural                | Construction site; meter of the plan; Top-3 doses                |
| 04 Топ-3          | Three slots, not a cabinet: daily / session / deficit                         | Filter-as-catalog; construction; 01 meter                        |
| 05 %ПМ + RPE      | Two scales: % plans the load, RPE checks the cost of the set                  | 01 meter/Epley; 03 filter; 10 RPE-stop                           |
| 06 Сухожилия      | Strain window: muscle grows on volume, tendon remodels in a narrow band       | 01 meter/Epley; 05 two scales; 02 construction; 10 clusters      |
| 08 Механика       | Levers, not effort: position and moment beat «trying harder»                  | 02 construction; 06 strain window; 05 two scales; 10 clusters    |
| 09 Формула силы   | Order of factors: heavy specific practice more often than surplus fatigue     | 02 construction; 01 meter; 05 two scales; 08 levers; 10 methods  |
| 10 Прогрессия 2.0 | Nested floors of time: year → phase → week → session → method                 | 02 construction; 01 meter/Epley; 09 formula chips; 05 table rows |

S6K1 «газ» and 4E-BP1 «ручник» — **local to 2.1**, always next to the protein name.

## Anchors (repeatable)

**02**

- «Прораб не работает без материалов и сметы»
- «Рост — сальдо за сутки, не пик после банки»
- «Три входа, не один рычаг»

**01**

- «Без метра проценты гадают»
- «Откат — не потеря»
- «Цвет сессии ≠ доза на мышцу»

**03**

- «Tier — не каталог, а фильтр»
- «S работает часто, E — только при дефиците»
- «F — деньги на ветер»

**04**

- «Три слота, не витрина»
- «Два из S, один из E — не три S»
- «Доза на карточке, не на слух»

**05**

- «%ПМ планирует, RPE проверяет»
- «RPE 10 не рабочий слот»
- «Короткий отдых поднимает RPE»

**06**

- «Мышца растёт быстрее сухожилия»
- «Окно 4,5–6,5%, не отказ»
- «Многоповторка слабо грузит сухожилие»

**08**

- «Механика важнее мотивации»
- «Цифра на грифе ≠ момент в суставе»
- «Чужая техника — чужие рычаги»

**09**

- «Сначала специфичность, потом тяжесть»
- «Усталость вычитается»
- «Отказ в каждом сете крадёт пик»

**10**

- «Метод — нижний этаж»
- «Форма = тренированность − усталость»
- «Модель меняет вес во времени»

## Numbers

Use only figures already in `theory.ts` (or freshly sourced).

**02:** leucine **2–3 g**, **80–90% 1RM**, **24–48 h**, **4–5** protein feedings, **2–2.2 g/kg** protein, sleep **7–9 h**. Do **not** ship bare percents like «пиво = −25%». AMPK is a limiter under energy stress, not «always harmful». The day timeline total («N of 5») is a **scenario**, not a hypertrophy metric.

**01:** test set **4–8** (ideal **5–8**) reps; Epley coefficients **1.3 / 1.2 / 1.1**; week 1 **68–70%** 1RM → cycle peak **85–90%**; **+2.5 кг** per cycle as progression; volume color **≥28 / 17–27 / ≤16**; RPE work sets **8–9**, not **10**. Do not move PUOS / Direct / Fractional numbers into lecture topics — they live in `FractionalVolumeSection`.

**03:** magnesium need **+20%** at high activity (from the E-tier note). Do **not** put Top-3 doses (`3–5 g`, `~200 mg`, loading) into the chapter 03 lecture — they live in chapter 04. Chip lists stay on `TierPyramid`.

**04:** creatine **3–5 g/day**, accumulation **2–4 weeks**, optional load **20 g/day × 5–7 days**; caffeine **~200 mg** / **3–6 mg/kg** / **150–300 mg**, **30–60 min** pre-session; magnesium **~200–400 mg** elemental, **+20%** at high load. PCr / adenosine stay on `Top3Podium` cards, not in lecture prose.

**05:** table bands **100% / 90–95 / 80–89 / 70–79 / 65–69 / 60–64 / &lt;60**; RPE **10→0, 9→~1, 8→~2, 7→~3, 6→~4, &lt;6**; cycle **4–5 / 6–7 / 8–9**, not **10** on work sets; rest **≥5 min** at **80–90%+**, **2–3 min** at **8–12**. Three-zone summary **80–100 / 67–80 / &lt;65**. Do not lecture Epley or every table row — rows stay on `SpecsTables`.

**06:** strain **&lt;4.5% / 4.5–6.5% / ~9%**; compliant **10–12%** start **~60%** 1RM then **85–90%**; entry **&gt;70%** 1RM; hold **3–6 s** at peak moment; **5×4**, **~3×/week**; TUT not failure. Stretching lowers stiffness — one limit, not a stretching chapter. Do not lecture Epley, two-scale bands, or every protocol card — cards stay on `TendonProtocolSection`.

**08:** **мышцы × техника = результат**; farther from joint axis → larger moment; external moment = bar + gravity, internal = muscle + tendon. No new percents. Do not lecture squat/bench/deadlift rows or the mistakes list — they stay on `RevealTimeline` / `MECHANICAL_CONCEPTS`.

**09:** zone **80–90%** 1RM; **2–3** exposures of key lifts per week; rest **5+ min**; sleep **7–9 h**; wave **накопление → интенсификация → откат → пик**. Rounding `CEILING(вес / 2.5) × 2.5` and the squat 120 kg example stay on `StrengthFormulaSection`. Do not lecture pyramid chips, wave week rows, warmup stack, or science Q&A.

**10:** hierarchy durations **3–12 months / 3–12 weeks / ≈ 1 week / 60–120 min / one or several sets**; fitness–fatigue peak **1–2 weeks** after easier work; block phases **3–4 weeks**; emergent deload if e1RM drops **2 weeks**. Do not lecture PUOS doses, linear week recipes, or all 14 method patterns — they stay on `TierPyramid` + three `RevealTimeline`s.

## Pattern chips

- `×` / `=` — only a conjunction of inputs (`нагрузка × белок × энергия = …`).
- `→` — cascade. Never rewrite a cascade as multiplication.
- Otherwise one chip.

## Data

Shared types: `LectureTopic` / `LectureLessonGroup` / `LectureCheckIn` (aliases `Mtor*` remain). UI: `LectureSection`.

| Chapter | Primary                          | Derivative                                 | Interactive                           |
| ------- | -------------------------------- | ------------------------------------------ | ------------------------------------- |
| 02      | `MTOR_LESSON_GROUPS`             | `MTOR_CONCEPTS`                            | `MtorDayTimeline` (2.4 only)          |
| 01      | `BASICS_LESSON_GROUPS`           | `BASICS_CORE`                              | `FractionalVolumeSection`             |
| 03      | `TIER_LESSON_GROUPS`             | — (macos keeps `SUPPLEMENT_TIERS`)         | `TierPyramid`                         |
| 04      | `TOP3_LESSON_GROUPS`             | — (macos keeps `TOP_THREE_SUPPLEMENTS`)    | `Top3Podium`                          |
| 05      | `SPECS_LESSON_GROUPS`            | —                                          | `SpecsTables`                         |
| 06      | `TENDONS_LESSON_GROUPS`          | — (macos keeps `TENDON_PROTOCOL_CONCEPTS`) | `PullQuote` + `TendonProtocolSection` |
| 07      | `CARDIO_CONCEPTS`                | —                                          | vascular cards only                   |
| 08      | `MECHANICS_LESSON_GROUPS`        | — (macos keeps `MECHANICAL_CONCEPTS`)      | `RevealTimeline`                      |
| 09      | `STRENGTH_LESSON_GROUPS`         | — (`strength-formula.ts` unchanged)        | `StrengthFormulaSection`              |
| 10      | `PROGRESSION_LESSON_GROUPS`      | — (macos keeps hierarchy/models/methods)   | `TierPyramid` + 3× `RevealTimeline`   |
| reading | `DIABETES_HABITS_LESSON_GROUPS`  | `DIABETES_HABITS_CONCEPTS`                 | none; hub block «Интересные статьи»   |
| reading | `LATE_DINNER_LESSON_GROUPS`      | `LATE_DINNER_CONCEPTS`                     | none; source `JMbwy3zP7Ws`            |
| reading | `ANABOLIC_VESSELS_LESSON_GROUPS` | `ANABOLIC_VESSELS_CONCEPTS`                | none; source `2kKssc-FqzY`            |

Do **not** break `THEORY_CONCEPTS` (macos + mobile still consume it).

## UI

- Shell: `.ta-lesson-intro`, plan, `.ta-lesson-section`
- `LectureSection`, `LectureCheckInBlock`; chapter links resolve `num` via `getTheoryChapter` (no hardcoded «01 ·»)
- `MtorDayTimeline` remains a **chapter 02** widget
- Body ≥16px. Панель с `data-chapter`: ширина = body минус padding, без `42em`; заголовки и шапка **слева** (пилюля справа). Визуальный gold: `theory-frac-volume-standard.md` (весь `.ta-frac`). Уникальные виджеты проверяются отдельно на каждую главу.
- Touch ≥44px; 390px must not overflow-x
- No meta headlines about the teaching method

## Sibling (не эталон)

- Twelve equal `RevealTimeline` cards as the only reading surface for a lecture chapter
- Quiz engine / scored check-ins
- Dashboard of callouts on every topic
- Second interactive, or lecturing the same three lenses the interactive already teaches
- Importing another chapter’s metaphor


## `memory-bank/reference/theory-textbook-cards-standard.md`

# Theory textbook cards (RevealTimeline)

> **Gold pattern (2026-07-16):** dense Theory lesson cards → vertical elevated stack, not horizontal carousel / tiny muted prose.
>
> **Lecture chapters (2026-08-25):** 01 Основы and 02 mTOR use the lecture page, not equal timeline cards. Keep this card pattern for mechanics / special methods until those chapters are rewritten. Compact derivatives remain for macOS.

## When

- Theory chapter with 5+ concept cards that need to be _read_, not skimmed
- Replacing `.ta-carousel` / flat body-only slides
- Same family as special methods, mechanics (08). Chapter 02 mTOR uses the lecture page instead.

## Structure

1. **Intro card** — eyebrow + quote + short note (`RevealTimeline` aside\*)
2. **Numbered cards** — `01…N` step badge (accent `--ta-sec-*`)
3. Per card blocks:
   - **Определение** — 1–2 sentences, ~16px readable color
   - **Схема** (optional) — mono/inset one-liner formula
   - **Как применять** — 2–5 bullets

## Data shape (`packages/shared`)

```ts
{ id, title, definition, pattern?: string, bullets?: string[] }
```

Wire via `RevealTimeline` + `TimelineNode` in `chapterContent.tsx`. Set `--ta-sec` / `--ta-sec-tint` to chapter accent on a wrapper.

## Visual

- Soft elevation: layered shadow on intro + cards (see `.ta-timeline-*`)
- No horizontal scroll carousel for lesson text
- Content-first; Quiet UI — accent only on step badge / labels

## Sibling (не эталон)

- Deleted `MechanicsCarousel` + `.ta-carousel-*` — truncated 12px slides
- Flat `title` + `body` only cards without definition/pattern/bullets

## Files

- `src/components/RevealTimeline.tsx`
- `src/styles/components/theory-apple.css` (`.ta-timeline*`)
- Example data: `MECHANICAL_CONCEPTS`, `SPECIAL_METHODS` (mTOR web lesson: `MTOR_LESSON_GROUPS`)


## `memory-bank/reference/theory-textbook-pedagogy-standard.md`

# Theory textbook pedagogy

> **Canon (2026-07-16):** Theory copy = **facts and definitions only**. Structure the lesson silently; never announce the teaching method in the UI.
>
> **Lecture pages (2026-08-26):** reading surface = **lecture page**. Locked gold: chapter **01 stack** + chapter **02** body. Widget gold: `.ta-frac`. System: `theory-article-algorithm.md`. Applied: 03–06, 08–10. Compact derivatives (`MTOR_CONCEPTS`, `BASICS_CORE`) are for native/glossary, not the web lesson. Chapter **07** stays vascular cards.

## Hard ban in product UI

Do **not** write headlines or ledes like:

- «Сначала просто, потом сложнее»
- «first easy, then harder»
- «как в учебнике», «порядок учебника», «не сетка красивых карточек»
- Meta plans: «словарь по уровням», «попробуй сам» as pedagogy theater

Intro / plan / section titles name **topics and terms**, not the arc.

## Content unit (каждое понятие)

1. **Основные понятия** — термины и короткие определения (`definition`)
2. **Суть** — главная идея и схема (`pattern` + ключевые bullets)
3. **Уточнения** — нюансы, ограничения, ошибки (остальные `bullets` / practice)

UI labels in `RevealTimeline`: Определение · Схема · Как применять.

Agent skill: `.cursor/skills/theory-content-structurer/SKILL.md`

## When

- Any Theory chapter that teaches concepts (not just a lookup table)
- Especially chapter 01 Basics + volume dose blocks
- Replacing flat bento dumps or dense wall-of-text

## Lesson arc (authoring only — not shown as copy)

1. `.ta-lesson-intro` — chapter title + factual lede + TOC of named sections
2. Grouped sections (`.ta-lesson-section`) — e.g. 1.1 / 2.1; lecture chapters use `LectureSection`; remaining chapters may still use `RevealTimeline`
3. Rules + **one interactive** shared example (tabs that change numbers, or mTOR day-input map)
4. Dose cards / numbers + source
5. See also

**Not:** equal-weight bento. Structure beats ornament — without saying so on screen.

## Interactive rules

- Prefer **one** meaningful control (tabs on the same example)
- Keyboard: `role="tab"` / `aria-selected` / focus-visible
- Touch targets ≥44px
- No code metaphors; no emojis in product UI

## Typography

- Body / list / dose detail: **≥16px**, readable contrast
- Eyebrow labels: ≥14px uppercase OK

## Data shapes

```ts
{ id, title, definition, pattern?, bullets? }
{ id, label, headline, workout, rows, takeaway }
```

## Sibling (не эталон)

- Meta pedagogy headlines
- Horizontal carousel of tiny slides
- All concepts equal weight in a bento with no order

## Files

- `memory-bank/reference/theory-article-algorithm.md` — design + algorithm + lexicon + agent prompt
- `.cursor/skills/theory-content-structurer/SKILL.md`
- `memory-bank/reference/theory-textbook-cards-standard.md`
- `memory-bank/reference/theory-lecture-page-standard.md`
- `memory-bank/reference/theory-frac-volume-standard.md` — visual gold = весь `.ta-frac`
- `BASICS_LESSON_GROUPS`, `MTOR_LESSON_GROUPS`, `FRACTIONAL_VOLUME_GUIDE` in `packages/shared/src/data/theory.ts`
- `FractionalVolumeSection.tsx`, `RevealTimeline.tsx`, `LectureSection.tsx`, `.ta-lesson-*` / `.ta-lecture-*` / `.ta-frac*` CSS


## `memory-bank/reference/wallpaper-background-pipeline-standard.md`

# Wallpaper background pipeline (asset processing)

> **Когда читать:** подготовка фоновых изображений для `AppAmbientBackground`, hero-ambient слоёв, mobile shell. Не UI-компонент — **asset pipeline** (как `generate-pwa-icons.mjs`, Pipeline D для видео).

Связанные файлы: `scripts/process-wallpaper-backgrounds.mjs`, `scripts/README.md`, `audit/wallpaper-background-pipeline-report.md`, `~/.cursor/shared-knowledge/MEDIA-OPTIMIZE.md` (видео; изображения — этот doc).

---

## Цель

Превратить мотивационные обои (ч/б на чёрном фоне) в **тихие ambient-слои** приложения:

- изоляция силуэта от `#000` фона;
- подсветка **amber/peach** (`#ffb020`, не лимонный жёлтый);
- 4× upscale (Lanczos3) → delivery resize → WebP/PNG < 500 KB;
- интеграция в `AppAmbientBackground` с opacity **≤ 0.10** (mobile) и radial mask + hero top-fade;

---

## Быстрый запуск

```bash
npm run backgrounds:process
# или
node scripts/process-wallpaper-backgrounds.mjs
```

Кастомный файл:

```bash
node scripts/process-wallpaper-backgrounds.mjs --input path/to/source.png --slug my-wallpaper
```

---

## Toolchain

| Инструмент            | Роль                            | Установка                              |
| --------------------- | ------------------------------- | -------------------------------------- |
| **sharp**             | isolate, glow, 4× upscale, WebP | `npm i -D sharp` (в проекте)           |
| **pngquant**          | PNG fallback                    | `brew install pngquant`                |
| **cwebp**             | опционально ручной WebP         | `brew install webp`                    |
| **sips**              | macOS inspect                   | встроен                                |
| Real-ESRGAN / waifu2x | не в репо                       | sharp Lanczos3 достаточно для line-art |

Видео: `~/.cursor/shared-knowledge/scripts/compress-videos.sh` — **не** для статики.

---

## Выходные пути

| Путь                                             | Назначение                |
| ------------------------------------------------ | ------------------------- |
| `public/backgrounds/<slug>-ambient.webp`         | primary delivery (WebP)   |
| `public/backgrounds/<slug>-ambient.png`          | PNG fallback              |
| `public/backgrounds/manifest.json`               | размеры, байты, параметры |
| `public/backgrounds/intermediate/<slug>-4x.png`  | 4× upscale (не коммитить) |
| `public/backgrounds/originals/<slug>-source.jpg` | копия исходника           |

Добавьте в `.gitignore`: `public/backgrounds/intermediate/`

---

## Параметры обработки (на изображение)

| Параметр         | Назначение                        | Типичные значения |
| ---------------- | --------------------------------- | ----------------- |
| `luminanceFloor` | порог отделения чёрного фона      | 24–28             |
| `warmStrength`   | сила amber/peach на светлых тонах | 0.18–0.24         |
| `glowStrength`   | интенсивность подсветки силуэта   | 0.45–0.55         |
| `glowBlur`       | радиус blur glow (px)             | 44–48             |

Цвета канона: `--accent: #ffb020`, `--glow-orb-1-calc`, matte **прозрачный** (delivery WebP с alpha); solid fallback `#0a0a0b` (не `#0a0c10`).

---

## Интеграция в UI

`src/components/app/AppAmbientBackground.tsx` — стек из трёх `<picture>` (все slug из manifest), видимость по вкладке.

Конфиг: `src/config/ambient-wallpapers.ts` — `TAB_AMBIENT_WALLPAPERS`:

| Вкладка    | Wallpaper slug    |
| ---------- | ----------------- |
| calculator | discipline-statue |
| theory     | why-not-me        |
| training   | why-not-me-alt    |
| split      | why-not-me        |
| journal    | discipline-statue |

CSS: `src/styles/components/app/app-ambient-background.css`:

- `--ambient-photo-opacity`: **0.09** dark (0.10 mobile), **0.058** light (0.064 mobile);
- cross-fade между обоями **1.4s** при смене вкладки;
- `mask-image` с усиленным top-fade (`--ambient-hero-fade`) — hero не конкурирует с силуэтом;
- `.app-ambient-bg__tint` — wash от `--glow-orb-1/2` (per-tab через `html[data-active-tab]`);
- `aria-hidden`, пустой `alt`, lazy/eager по активности;
- `prefers-reduced-motion` — без cross-fade и drift-анимаций.

Смена маппинга: править `TAB_AMBIENT_WALLPAPERS`; новый slug — `npm run backgrounds:process` + добавить в `AMBIENT_WALLPAPER_SLUGS`.

---

## Чеклист перед merge

- [ ] `npm run backgrounds:process` — manifest обновлён
- [ ] WebP каждого asset < 500 KB
- [ ] Превью 390px — текст вкладок читаем
- [ ] `prefers-reduced-motion` — фото статично (без анимации)
- [ ] Отчёт в `audit/wallpaper-background-pipeline-report.md` при смене pipeline



# CURSOR RULES


## `.cursor/rules/backend.mdc`

---
description: Express API и SQLite сервер Журнала
globs: server/**/*,packages/shared/**/*
alwaysApply: false
---
- Стек: Express 5 + SQLite в `server/`; бизнес-логика расчётов в `packages/shared`.
- Новый эндпоинт: скопируй паттерн соседнего роута (auth, ошибки, схема). Валидация на входе, тонкий роутер.
- Не трогай `gym.db` руками в агент-сессии; схема через существующие миграции/schema.js.
- После изменений API или shared-расчётов: `npm run typecheck` и `npm test`; для calc/program/journal/split ещё `npm run quality`.


## `.cursor/rules/performance.mdc`

---
description: Производительность UI и API Журнала
globs: src/**/*,server/**/*,packages/shared/**/*
alwaysApply: false
---
- UI: iPhone-first 390–430px; тяжёлые графики/анимации — лениво; анимации только transform/opacity.
- Shared calc: чистые функции, без скрытого I/O; не пересчитывай весь план, если меняется одно поле.
- API: пагинация списков журнала; индексы под фильтры; не отдавай лишние поля.
- Перед «оптимизацией» измерь (React Profiler / timing / размер бандла). Одна правка — один bottleneck.


## `.cursor/rules/project.mdc`

---
description: Журнал Сплит — суть проекта
alwaysApply: true
---
# Журнал Сплит (Training Calculator / периодизация)
- Стек: Vite 7 + React 19 + TypeScript (`src/`), общая логика `packages/shared` (calc, program v3, journal, split), API Express 5 + SQLite `server/` (JWT). Старые native/Expo/Electron лежат в `_archive-non-web/`, не трогать.
- Оболочки: iOS WKWebView `~/Desktop/React/ios/JournalApp` (URL в `Info.plist` → `JournalURL`), Swift-эксперимент `~/Desktop/React/Swith` (Periodization).
- Команды: `npm run dev` (5173), `npm run server` (3001), `npm run typecheck`, `npm test`, `npm run build`, `npm run quality` для изменений расчётов в `packages/shared`. Туннель: `npm run public`.
- Перед «готово» прогоняй typecheck и test. При изменениях UI проверяй ширину iPhone 390–430px.
- Не трогать `gym.db`, `.env*`, `workspace-files/`. Контекст проекта: `memory-bank/ESSENTIALS.md`, остальной memory-bank читай только по необходимости.


## `.cursor/rules/ui-quiet.mdc`

---
description: Использовать при любой работе с UI, CSS, дизайном, графиками и анимацией
alwaysApply: false
---
- Quiet UI: 90% нейтральных тонов, максимум 2 акцента, без градиентов. Шрифт системный (`-apple-system, …, system-ui`).
- Цвета только через токены `--color-*`, без hex в компонентах. Тёмный фон `#0A0A0B` / `#111113`.
- Отступы кратны 4px. Радиусы 6/8/12/16/20/24, вложенный радиус = внешний − padding. Размеры шрифта 12/14/16/18/20/24/32/48.
- Анимации только через transform/opacity, 150–300ms, учитывать `prefers-reduced-motion`.
- Перед новым экраном смотри эталоны в `memory-bank/reference/` и `docs/design-standards/`.
- У графиков и метрик рядом короткое пояснение по-русски, формулы называть (Epley, тоннаж = кг×повторы).



# KEY CSS DESIGN FILES


## `src/styles/base/variables.css`

```css
:root {
  /* Base palette (dark default) */
  --bg: #0a0a0b;
  --surface: #141415;
  --surface-raised: #1d1d1d;
  --card: #1a1a1a;
  --border: #252525;
  --border-subtle: rgba(255, 255, 255, 0.04);
  --accent: #ffb020;
  --accent-hover: #e8a84a;
  --accent-fg: #0a0a0b;
  --accent-dim: rgba(255, 176, 32, 0.12);
  /* Muted peach — backgrounds & small accents only, not large hero text */
  --accent-soft: #c9a07a;
  --accent-peach: #d4a574;
  /* Legacy tokens — no longer drive page-level ambient orbs */
  --accent-glow: transparent;
  --accent-glow-soft: transparent;

  /* Tactical noir dual-tone (Ghost palette) — atmosphere only, not primary CTAs */
  --accent-cyan: #00d4ff;
  --accent-cyan-deep: #0ea5e9;
  --accent-crimson: #ff2d55;
  --accent-crimson-deep: #e11d48;
  --glow-cyan: rgba(0, 212, 255, 0.16);
  --glow-crimson: rgba(255, 45, 85, 0.14);
  --glow-cyan-soft: rgba(14, 165, 233, 0.1);
  --glow-crimson-soft: rgba(225, 29, 72, 0.09);

  /* Legacy gunmetal — auth accents only; logged-in light canvas uses --bg-grouped */
  --canvas-gray: #282c31;
  --bg-light-canvas: #2a2e34;
  /* Apple cool gray canvas (light theme) — pre-parchment */
  --bg-grouped: #f2f2f7;

  /* Global Theory/TA bg fallback to resolve circular ref */
  --ta-bg: #0a0c10;

  /* Semantic tokens from Memory Bank style guide */
  --color-bg-primary: var(--bg);
  --color-bg-secondary: var(--surface);
  --color-bg-elevated: var(--surface-raised);
  --color-text-primary: var(--text);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary: var(--muted);
  --color-border-subtle: var(--border-subtle);
  --color-border-default: var(--border);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-destructive: var(--red);
  --color-success: var(--green);
  --color-warning: var(--orange);
  /* Insight semantic tokens — wired to warm tint palette (--insight-*) */
  --color-insight-bg: var(--insight-bg);
  --color-insight-border: var(--insight-border);
  --color-insight-text: var(--insight-text);
  --color-insight-strong: var(--insight-strong);
  --color-insight-code-bg: var(--insight-code-bg);

  /* Text */
  --text: #e8e8e9;
  --text-secondary: #9a9a9c;
  --text-strong: #ffffff;

  /* Status colors (used by --color-success/warning/destructive) */
  --green: #22c55e;
  --orange: #f59e0b;
  --red: #ef4444;
  --text-soft: #cccccc;
  --text-placeholder: #555555;
  --muted: #666;
  --text-inverse: #ffffff;

  /* Insight / note box (warm tint) */
  --insight-bg: #1a100b;
  --insight-border: #3a2218;
  --insight-text: #c49070;
  --insight-muted: #b8907a;
  --insight-strong: #e8b080;
  --insight-code-bg: #2a1810;

  /* Deload / rest accent (green tint) */
  --deload-bg: #0d1a09;
  --deload-border: #1a3a1a;

  /* Overlays (neutral tints over dark surfaces) */
  --overlay-subtle: rgba(255, 255, 255, 0.02);
  --overlay-hover: rgba(255, 255, 255, 0.04);
  --overlay-soft: var(--overlay-hover);
  --overlay-medium: rgba(255, 255, 255, 0.05);

  /* Border widths — containers/cards/inputs use --border-width; row dividers use --border-width-hairline */
  --border-width: 2px;
  --border-width-hairline: 1px;

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 14px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-3xl: 28px;
  /* Capsule only for true toggles (theme switch track). Chips/badges use --glass-radius-badge. */
  --radius-pill: 999px;

  /* Frosted glass etalon (TabNav) — squarer 8–12px scale, not pill 20px */
  --glass-bg: color-mix(in srgb, var(--bg) 92%, transparent);
  --glass-bg-card: color-mix(in srgb, var(--card) 92%, transparent);
  /* Auth card — more see-through than panel etalon (92%); statue/wallpaper shows through */
  --glass-bg-auth-shell: color-mix(in srgb, var(--bg) 78%, transparent);
  --glass-bg-auth-card: color-mix(in srgb, var(--card) 78%, transparent);
  --glass-blur: 20px;
  --glass-blur-chrome: 12px;
  --glass-border: var(--border-subtle);
  --glass-radius-badge: 6px;
  --glass-radius-tab: 4px;
  --glass-radius-inner: var(--radius-sm);
  --glass-radius-panel: var(--radius-md);
  --section-inset-inline: var(--space-5);
  --glass-shadow: none;
  --glass-shadow-lift: 0 -8px 32px color-mix(in srgb, var(--bg) 48%, transparent);

  /* Spacing (4px scale) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 48px;
  --space-9: 64px;
  --space-10: 96px;
  --space-11: 128px;

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-micro: cubic-bezier(0.22, 1, 0.36, 1);

  --duration-micro: 150ms;
  --duration-short: 250ms;
  --duration-medium: 400ms;
  --duration-long: 600ms;

  /* iOS Safari safe-area insets. Requires viewport-fit=cover. */
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);

  /* Shadows (3-layer Apple-style) */
  --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.12);
  --shadow-2: 0 4px 12px rgba(0, 0, 0, 0.18);
  --shadow-3: 0 16px 32px rgba(0, 0, 0, 0.24);
  --shadow-layered: var(--shadow-1), var(--shadow-2), var(--shadow-3);

  /* Section container elevation — gold: Theory `.ta-chapter-panel` */
  --section-elevation: 0 8px 24px rgba(0, 0, 0, 0.2), 0 16px 48px rgba(0, 0, 0, 0.3);
  --section-radius: var(--glass-radius-inner);

  /* Theory palette — available globally so HeroSection works outside .theory-shell */
  --theory-bg: #0a0c10;
  --theory-surface: #151a22;
  --theory-card: #1c222c;
  --theory-border: #232934;
  --theory-border-strong: #343c49;
  --theory-text: #f3efe6;
  --theory-muted: #99a1ad;
  --theory-accent: #ffb020;
  --theory-accent-soft: rgba(255, 176, 32, 0.1);
  --theory-accent-border: rgba(255, 176, 32, 0.32);

  /* Password strength meter */
  --ta-meter-weak: #ef4444;
  --ta-meter-fair: #f59e0b;
  --ta-meter-good: #3b82f6;
  --ta-meter-strong: #22c55e;
  --ta-focus-glow: rgba(59, 130, 246, 0.2);
  --ta-error: #ef4444;
  --ta-text-muted: var(--theory-muted);
}

```

## `src/styles/base/ios-adaptation.css`

```css
/* iOS Safari / iPhone layout and typography baseline */

:root {
  --font-system:
    'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui,
    sans-serif;
  --type-12: 12px;
  --type-14: 14px;
  --type-16: 16px;
  --type-20: 20px;
  --type-24: 24px;
  --type-32: 32px;
  --type-48: 48px;
  /* Numeric typography — canon: td.w-kg in progression table */
  --training-weight-font: var(--font-system);
  --training-weight-size: var(--type-12);
  --training-weight-weight: 600;
  --training-weight-spacing: normal;
  --training-weight-numeric: tabular-nums;
  /* Aliases for .u-num utility */
  --type-num-family: var(--training-weight-font);
  --type-num-size: var(--training-weight-size);
  --type-num-weight: var(--training-weight-weight);
  --type-num-spacing: var(--training-weight-spacing);
  --type-num-variant: var(--training-weight-numeric);
  --app-min-height: 100vh;
  --keyboard-inset: 0px;
  --root-padding-block-start: max(56px, calc(var(--sat) + 24px));
  --root-padding-block-end: max(56px, var(--sab));
  --root-padding-block: calc(var(--root-padding-block-start) + var(--root-padding-block-end));
  --app-content-min-height: calc(var(--app-min-height) - var(--root-padding-block));
}

@supports (height: 100svh) {
  :root {
    --app-min-height: max(100vh, 100svh);
  }
}

@supports (height: 100dvh) {
  :root {
    --app-min-height: max(100vh, 100svh, 100dvh);
  }
}

html {
  scroll-behavior: smooth;
  overscroll-behavior-y: none; /* iOS-SAFARI: reduce rubber-band conflicts with sticky chrome */
  scroll-padding-top: calc(var(--sat, env(safe-area-inset-top, 0px)) + 72px);
}

body {
  min-height: var(--app-min-height);
}

/* Weight/rep/1RM numbers — system sans + tabular-nums, never monospace */
.u-num {
  font-family: var(--type-num-family);
  font-variant-numeric: var(--type-num-variant);
  font-weight: var(--type-num-weight);
  letter-spacing: var(--type-num-spacing);
}

@supports (padding: env(safe-area-inset-top)) {
  #root {
    padding-top: var(--root-padding-block-start);
    padding-right: max(24px, env(safe-area-inset-right));
    padding-bottom: var(--root-padding-block-end);
    padding-left: max(24px, env(safe-area-inset-left));
  }

  /* Fixed bottom TabNav owns safe-area — don't double-pad #root under the dock */
  #root:has(.app-shell) {
    padding-bottom: 0;
  }
}

.app-shell {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: calc(var(--app-min-height) - var(--keyboard-inset));
  min-width: 0;
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  max-width: none;
  overflow-x: clip;
  z-index: 1;
  isolation: isolate; /* ensure background layer stays behind content */
}

.app-shell > :not(.app-ambient-bg):not(.theme-toggle) {
  position: relative;
  z-index: 1;
}

/* Gradient orbs removed — AppAmbientBackground + auth-style statue carry atmosphere */

.app-shell__nav {
  position: sticky;
  top: max(var(--space-2), var(--sat));
  z-index: 30;
  flex-shrink: 0;
  transform: translateZ(0);
  overscroll-behavior: contain;
  width: 100%;
  background: color-mix(in srgb, var(--bg, #0a0a0b) 88%, transparent);
  backdrop-filter: blur(var(--glass-blur-chrome));
  -webkit-backdrop-filter: blur(var(--glass-blur-chrome));
}

.app-shell__main {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  /* Horizontal padding stays 0: full-bleed shell. Bare headers like
     .training-progress carry their own 16px gutter (app-layout.css). */
}

/* iPhone / narrow — fixed bottom tab bar (iOS-style). Etalon: memory-bank/reference/mobile-tab-nav-background-standard.md
 *
 * Why high specificity: app-layout `.tab-bar.ta-mode-nav { padding: 0; background: transparent }`
 * loads later and must NOT wipe safe-area padding or glass fill — otherwise the bar floats
 * above the home-indicator gap and content shows through below the chrome.
 *
 * Safe-area is padding INSIDE the bar (bottom: 0 flush to physical screen). Never offset with
 * bottom: var(--sab) — that doubles the inset on iOS / in-app WebViews.
 */
@media (max-width: 899px) {
  /*
   * Phone + tablet (≤899): full-bleed content shell.
   * Laptop/desktop (≥900) keeps framed #root gutters + section inset.
   * Why: side gutters look fine on laptop but steal usable width for steppers/forms.
   */
  :root {
    --section-inset-inline: 0px;
  }

  #root:has(.app-shell) {
    padding-left: max(0px, var(--sal));
    padding-right: max(0px, var(--sar));
    padding-bottom: 0;
  }

  .app-shell > nav.tab-bar.ta-mode-nav.app-shell__nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    z-index: 50;
    margin: 0;
    width: 100%;
    max-width: none;
    overflow: visible;
    transform: translateZ(0);
    /* Home indicator / notch — inside the frosted chrome, not as a bottom offset */
    padding-top: var(--space-2);
    padding-left: max(var(--space-1), var(--sal));
    padding-right: max(var(--space-1), var(--sar));
    padding-bottom: max(var(--space-2), var(--sab));
    border-radius: 0;
    background: var(--glass-bg);
    border: none;
    border-top: var(--border-width-hairline) solid var(--glass-border);
    box-shadow: var(--glass-shadow-lift, none);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
  }

  .app-shell__main {
    /* Tab row (~64px) + chrome pad + safe-area so last cards clear the dock */
    padding-bottom: calc(72px + max(var(--space-3), var(--sab)) + var(--space-2));
  }

  .app-toast {
    bottom: calc(72px + max(var(--space-2), var(--sab)));
  }
}

/* Desktop — tab nav between user bar and content */
@media (min-width: 900px) {
  .app-hero-container {
    order: 1;
  }

  .user-bar {
    order: 2;
  }

  .app-shell__nav {
    order: 3;
  }

  .app-shell__main {
    order: 4;
    padding-bottom: 0;
  }
}

.app-toast {
  position: sticky;
  bottom: max(16px, calc(var(--sab) + 8px));
  z-index: 40;
  align-self: flex-end;
  margin: 0;
  margin-top: auto;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  border: var(--border-width) solid var(--red);
  color: #ffdede;
  font-size: var(--type-14);
  font-weight: 500;
  line-height: 20px;
  box-shadow: var(--shadow-layered);
  max-width: min(100%, 360px);
}

@media (max-width: 600px) {
  :root {
    --root-padding-block-start: max(24px, calc(var(--sat) + 16px));
    --root-padding-block-end: max(24px, calc(var(--sab) + var(--keyboard-inset)));
    --root-padding-block: calc(var(--root-padding-block-start) + var(--root-padding-block-end));
    --app-content-min-height: calc(var(--app-min-height) - var(--root-padding-block));
  }

  #root {
    padding-top: var(--root-padding-block-start);
    padding-bottom: var(--root-padding-block-end);
  }

  /* Fixed TabNav owns the bottom dock — avoid double inset under the bar */
  #root:has(.app-shell) {
    padding-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

```

## `src/styles/layouts/app-layout.css`

```css
/* CONNECTION */
.connection-status {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  margin: 0;
  padding: 4px 16px;
  padding-top: calc(4px + env(safe-area-inset-top, 0px));
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  text-align: start;
}

@supports (padding: env(safe-area-inset-top)) {
  #root .connection-status {
    padding-top: 4px;
  }
}

.connection-status--online {
  color: var(--color-success, #3f9d62);
}

.connection-status--offline {
  color: var(--text-secondary);
}

.connection-status--pending,
.connection-status--syncing {
  color: var(--color-warning, #d97706);
}

/* SECTION */
.section {
  margin-bottom: 56px;
}
.section-header {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: var(--border-width-hairline) solid var(--border);
}
.section-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 12px;
  color: var(--accent);
  letter-spacing: 0.2em;
}
.section-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  letter-spacing: 0.05em;
  color: var(--text-strong);
}

/* USER BAR */
.user-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2);
  row-gap: var(--space-2);
  margin-block: 0;
  padding: var(--space-4) var(--space-5);
  background: var(--glass-bg-card);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: var(--border-width) solid var(--glass-border);
  border-radius: var(--glass-radius-inner);
  box-shadow: var(--glass-shadow);
}
.user-bar-identity {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  flex: 0 1 auto;
}
.user-bar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
  margin-left: auto;
}
.user-bar-label {
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.user-bar-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-strong);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-bar .btn-sm {
  letter-spacing: 0;
  min-height: 44px;
  min-width: 76px;
  padding: 0 16px;
  text-transform: none;
}
.user-bar__billing-badge {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-subtle);
}
/* «Безлимит» (статус) и «Выйти» — один квадрат, не капсула.
   44px мало для строки «Безлимит» (~57px): сторона 84px, радиус 8px. */
.user-bar .user-bar-actions > .user-bar__billing-badge,
.user-bar .user-bar-actions > .btn-sm:last-child {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 84px;
  height: 84px;
  min-width: 84px;
  min-height: 84px;
  aspect-ratio: 1;
  padding: 8px;
  border-radius: var(--radius-sm, 8px);
  text-align: center;
  line-height: 1.15;
  letter-spacing: 0;
  text-transform: none;
  white-space: nowrap;
}
.user-bar .btn-ghost {
  background: var(--overlay-subtle);
  border-color: var(--border-subtle);
  color: var(--text-soft);
}
@media (max-width: 480px) {
  /* Держим шапку в одну строку и разводим элементы по всей ширине:
     имя слева, действия — по центру и справа. Раньше margin-left: 0
     сбивал кнопки к имени. */
  .user-bar {
    flex-wrap: nowrap;
  }
  /* Обёртка не должна собирать кнопки в один блок: её дети становятся
     прямыми flex-элементами шапки и попадают в общий space-between. */
  .user-bar-actions {
    display: contents;
  }
  .user-bar .user-bar-actions > .user-bar__billing-badge,
  .user-bar .user-bar-actions > .btn-sm:last-child,
  .user-bar .user-bar-actions > .btn-sm:not(:last-child) {
    width: 56px;
    height: 56px;
    min-width: 56px;
    min-height: 56px;
    padding: 4px;
    font-size: var(--type-11, 11px);
  }

  /* Кнопка без фиксированной ширины забирает остаток строки и переносит текст.
     Иначе длинное «Открыть безлимитные расчёты» вылезает на соседнюю кнопку. */
  .user-bar-actions > .btn-sm:not(:last-child) {
    box-sizing: border-box;
    flex: 0 1 auto;
    min-width: 0;
    height: 84px;
    min-height: 84px;
    padding: 8px;
    line-height: 1.15;
    white-space: normal;
  }
}
@media (hover: hover) and (pointer: fine) {
  .user-bar .btn-ghost:hover {
    background: var(--overlay-soft);
    border-color: var(--border);
    color: var(--text-strong);
  }
}

/* INPUTS LAYOUT */
.input-grid {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) minmax(110px, 1fr) minmax(110px, 1fr) auto;
  gap: 12px;
  align-items: end;
}
@media (max-width: 600px) {
  .input-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .input-grid > :first-child,
  .input-grid > :last-child {
    grid-column: 1 / -1;
  }
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* TABLE SCROLL */
.table-scroll {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}

.scrollable-container {
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}

.horizontal-snap {
  overflow-x: auto;
  overscroll-behavior-x: none;
  scroll-snap-type: x mandatory;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

.tabs-scroll {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
}

.tabs-scroll::-webkit-scrollbar {
  display: none;
}

.tab-item {
  flex-shrink: 0;
  scroll-snap-align: start;
}

/* ===== TAB BAR ===== */
.tab-bar.ta-mode-nav {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: var(--border-width) solid var(--glass-border);
  border-radius: var(--glass-radius-panel);
  box-shadow: var(--glass-shadow);
  display: flex;
  flex-wrap: nowrap;
  gap: var(--space-1, 4px);
  isolation: isolate;
  margin: 0 0 24px;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  padding: var(--space-1, 4px);
  /* position from .app-shell__nav — sticky (desktop) / fixed (mobile); do not set relative here */
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}

.tab-bar.ta-mode-nav::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--ta-text-dim, var(--muted));
  cursor: pointer;
  display: flex;
  flex: 1 1 0;
  font-family: var(
    --ta-display-font,
    -apple-system,
    BlinkMacSystemFont,
    'SF Pro Display',
    'Inter Display',
    'Inter',
    system-ui,
    sans-serif
  );
  font-size: var(--type-12, 12px);
  font-weight: 600;
  justify-content: center;
  letter-spacing: 0;
  line-height: var(--type-line-12, 1.2);
  min-height: 44px;
  min-width: max(4.75rem, min-content);
  overflow: visible;
  padding: var(--space-2, 8px);
  position: relative;
  scroll-snap-align: center;
  text-align: center;
  touch-action: manipulation;
  transition:
    color var(--ta-duration-micro, var(--duration-micro)) var(--ta-ease-micro, var(--ease-micro)),
    opacity var(--ta-duration-micro, var(--duration-micro)) var(--ta-ease-micro, var(--ease-micro)),
    transform var(--ta-duration-micro, var(--duration-micro))
      var(--ta-ease-micro, var(--ease-micro));
}
.tab-btn::before {
  background: var(--ta-surface-2, var(--surface-raised));
  border: var(--border-width) solid var(--border-subtle, rgba(255, 255, 255, 0.1));
  border-radius: inherit;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--ta-text, var(--text)) 5%, transparent);
  content: '';
  inset: 0;
  opacity: 0;
  position: absolute;
  transform: scale(0.98);
  transition:
    opacity var(--ta-duration-micro, var(--duration-short)) var(--ta-ease, var(--ease-out)),
    transform var(--ta-duration-micro, var(--duration-short)) var(--ta-ease, var(--ease-out));
  z-index: -1;
}
.tab-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ta-calc-accent, var(--accent)) 24%, transparent);
}
.tab-btn-label,
.tab-btn-meta {
  position: relative;
  z-index: 1;
}
.tab-btn-stack {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  justify-content: center;
  max-width: 100%;
  min-width: 0;
  padding-block: var(--space-2, 8px);
}

.tab-btn-icon {
  align-items: center;
  color: inherit;
  display: inline-flex;
  flex-shrink: 0;
  justify-content: center;
  line-height: 0;
  transition: color var(--ta-duration-micro, var(--duration-micro))
    var(--ta-ease-micro, var(--ease-micro));
}

.tab-btn-icon__svg {
  display: block;
  height: 16px;
  width: 16px;
}

.tab-active .tab-btn-icon {
  color: var(--ta-calc-accent, var(--accent));
}
.tab-btn:has(.tab-btn-meta) {
  min-width: 5.5rem;
}
.tab-btn-label {
  display: block;
  max-width: 100%;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}
.tab-btn-meta {
  align-items: center;
  background: color-mix(in srgb, var(--ta-text-muted, var(--muted)) 10%, transparent);
  border: var(--border-width) solid var(--ta-border, var(--border));
  border-radius: var(--glass-radius-badge, 6px);
  color: var(--ta-text-dim, var(--muted));
  display: inline-flex;
  flex-shrink: 0;
  font-size: var(--type-12, 12px);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  line-height: var(--type-line-12, 1.2);
  padding: var(--space-1, 4px) var(--space-2, 8px);
}

@media (min-width: 900px) {
  .tab-bar.ta-mode-nav {
    display: grid;
    gap: 4px;
    grid-template-columns: repeat(2, minmax(5.5rem, 1fr));
    margin: 0 auto 40px;
    max-width: 720px;
    overflow-x: visible;
    scroll-snap-type: none;
  }

  .tab-btn {
    flex: initial;
    font-size: 16px;
    line-height: 1.2;
    min-height: 64px;
    min-width: 0;
    overflow: hidden;
    padding: 12px 18px;
  }

  .tab-btn-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (hover: hover) {
  .tab-btn:hover {
    color: var(--ta-text-muted, var(--text-soft));
  }
  .tab-btn:not(.tab-locked):hover {
    transform: translateY(-1px);
  }
}
.tab-btn:active {
  transform: scale(0.98);
}
.tab-active {
  color: var(--ta-text, var(--text));
}
.tab-active::before {
  border-color: color-mix(
    in srgb,
    var(--ta-calc-accent, var(--accent)) 32%,
    var(--border-subtle, rgba(255, 255, 255, 0.1))
  );
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--ta-text, var(--text)) 6%, transparent);
  opacity: 1;
  transform: scale(1);
}
.tab-locked {
  color: var(--ta-text-dim, var(--muted));
  cursor: not-allowed;
  opacity: 0.58;
}
.tab-locked .tab-btn-meta {
  color: var(--ta-text-dim, var(--muted));
}
.tab-locked:hover {
  color: var(--ta-text-dim, var(--muted));
}

@media (prefers-reduced-motion: reduce) {
  .tab-btn,
  .tab-btn::before {
    transition: none !important;
  }
  .tab-btn,
  .tab-btn:hover,
  .tab-btn:active {
    transform: none !important;
  }
}
.tab-locked .tab-btn-meta {
  color: var(--ta-text-dim, var(--muted));
}
.tab-locked:hover {
  color: var(--ta-text-dim, var(--muted));
}

@media (prefers-reduced-motion: reduce) {
  .tab-btn,
  .tab-btn::before {
    transition: none !important;
  }
  .tab-btn,
  .tab-btn:hover,
  .tab-btn:active {
    transform: none !important;
  }
}

/* ===== TRAINING PROGRESS BAR =====
 * ProgressHeader sits outside SectionBlock. At ≤899px the stack is full-bleed
 * (padding-inline: 0) so this block must carry the same 16px gutter as
 * .ta-calc-section__inner — otherwise both label spans and the bar hug the edges.
 */
.training-progress {
  box-sizing: border-box;
  margin-bottom: 32px;
  min-width: 0;
  padding-inline: max(var(--space-4), var(--sal)) max(var(--space-4), var(--sar));
  width: 100%;
}
@media (min-width: 900px) {
  /* Desktop stack already applies --ta-section-inset; don't double-pad. */
  .training-progress {
    padding-inline: 0;
  }
}
.training-progress-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-3);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
  min-width: 0;
}
.training-progress-label > span:first-child {
  min-width: 0;
}
.training-progress-label > span:last-child {
  flex-shrink: 0;
  text-align: right;
  white-space: nowrap;
}
.training-progress-bar {
  height: 6px;
  background: var(--surface);
  border: var(--border-width) solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
}
.training-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 8px;
  transition: width var(--duration-medium) var(--ease-out);
  min-width: 0;
}

/* Next day label */
.next-day-label {
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 10px;
}

/* ===== LOCKED VIEW ===== */
.locked-view {
  text-align: center;
  padding: 64px 20px;
}
.locked-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
.locked-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px;
  letter-spacing: 0.05em;
  color: var(--text-strong);
  margin-bottom: 8px;
}
.locked-desc {
  font-size: 12px;
  color: var(--muted);
  max-width: 420px;
  margin: 0 auto 24px;
  line-height: 1.6;
}
.locked-missing {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 320px;
  margin: 0 auto;
}
.locked-missing-item {
  font-size: 12px;
  color: var(--red);
  font-weight: 400;
}

/* ===== PROGRAM COMPLETE ===== */
.program-complete {
  text-align: center;
  padding: 48px 20px;
  background: var(--card);
  border: var(--border-width) solid var(--border);
  border-radius: 8px;
}
.program-complete-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.program-complete-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  letter-spacing: 0.05em;
  color: var(--accent);
  margin-bottom: 10px;
}
.program-complete-stat {
  font-family: var(--font-display);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  letter-spacing: var(--tracking-caps);
  color: var(--muted);
  margin-bottom: 16px;
}
.program-complete-desc {
  font-size: 12px;
  color: var(--muted);
  max-width: 440px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ===== Mobile bottom tab bar (iOS-style) ===== */
@media (max-width: 899px) {
  /*
   * Dock chrome (position, safe-area padding, glass fill) lives in ios-adaptation.css
   * on `.app-shell > nav.tab-bar.ta-mode-nav.app-shell__nav` — do NOT reset padding /
   * background here or the bar floats above a content gap on iPhone.
   * This block only tunes inner tab layout (gap, buttons).
   */
  .app-shell > nav.tab-bar.ta-mode-nav.app-shell__nav {
    gap: 0;
    border-radius: 0;
    overflow-x: visible;
    scroll-snap-type: none;
  }

  .tab-btn {
    border-radius: 4px;
    flex: 1 1 0;
    min-height: 64px;
    min-width: 0;
    padding: var(--space-2, 8px) var(--space-1, 4px);
  }

  .tab-btn::before {
    inset: var(--space-1, 4px);
    border-radius: 4px;
  }

  .tab-btn-icon__svg {
    height: 20px;
    width: 20px;
  }

  .tab-btn-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1.2;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab-btn-meta {
    font-size: 9px;
    padding: 1px 4px;
  }
}

/* ===== iPhone / mobile touch improvements ===== */
@media (max-width: 430px) {
  /* Layout — horizontal gutters owned by ≤899 full-bleed rule in ios-adaptation */
  #root {
    padding-top: max(32px, calc(var(--sat) + 16px));
    padding-bottom: max(32px, var(--sab));
  }

  #root:has(.app-shell) {
    padding-left: max(0px, var(--sal));
    padding-right: max(0px, var(--sar));
    padding-bottom: 0;
  }

  /* Hero — заголовок не обрезается */
  .hero {
    margin-bottom: 28px;
    padding-left: 16px;
  }
  .hero h1 {
    font-size: 32px;
    letter-spacing: 0;
    line-height: 1.1;
    text-wrap: balance;
  }
  .hero-label {
    font-size: 12px;
    letter-spacing: 0.25em;
    margin-bottom: 8px;
  }
  .hero p {
    font-size: 12px;
    line-height: 1.5;
    max-width: 100%;
  }

  /* Auth */
  .auth-card {
    padding: 24px 18px;
    max-width: 100%;
    border-radius: 8px;
  }
  .auth-tabs {
    margin-bottom: 22px;
  }
  .auth-tab {
    font-size: 16px;
    padding: 10px 16px;
  }

  /* Inputs — 16px prevents iOS zoom */
  .input-field {
    padding: 14px;
    font-size: 16px;
    border-radius: 8px;
  }
  .input-label {
    font-size: 12px;
    letter-spacing: 0.15em;
  }
  .input-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  /* Buttons */
  .btn {
    padding: 14px 24px;
    font-size: 12px;
    border-radius: 8px;
    min-height: 44px;
  }
  .btn-sm {
    padding: 8px 14px;
    font-size: 12px;
  }
  .btn-complete {
    padding: 0.75rem 1.5rem;
    font-size: 14px;
    border-radius: 0.75rem;
    min-height: 44px;
  }

  /* User bar */
  .user-bar {
    padding: 10px 12px;
    margin-block: 0;
    border-radius: 8px;
    gap: 8px;
  }
  .user-bar-label {
    font-size: 12px;
    letter-spacing: 0.16em;
  }
  .user-bar-name {
    font-size: 13px;
  }
  .user-bar .btn-sm {
    min-height: 36px;
    min-width: 60px;
    padding: 0 10px;
    font-size: 12px;
  }
  .user-bar .user-bar-actions > .user-bar__billing-badge,
  .user-bar .user-bar-actions > .btn-sm:last-child {
    width: 84px;
    height: 84px;
    min-width: 84px;
    min-height: 84px;
    padding: 8px;
    border-radius: var(--radius-sm, 8px);
  }

  /* Sections */
  .section {
    margin-bottom: 36px;
  }
  .section-header {
    gap: 10px;
    margin-bottom: 18px;
    padding-bottom: 10px;
  }
  .section-num {
    font-size: 12px;
  }
  .section-title {
    font-size: 20px;
  }
}

/* iPhone SE / 8 / mini. */
@media (max-width: 375px) {
  #root {
    padding-top: max(40px, calc(var(--sat) + 16px));
  }

  .hero h1 {
    font-size: 40px;
  }

  .section-title {
    font-size: 24px;
  }
}

/* Current standard-width iPhones. Keep a fixed size instead of viewport-scaled type. */
@media (min-width: 390px) and (max-width: 429px) {
  .hero h1 {
    font-size: 48px;
  }
}

/* iPad portrait. */
@media (min-width: 768px) and (max-width: 1024px) {
  .theory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (orientation: landscape) and (max-width: 932px) {
  /* Auth / guest may keep framed gutters; logged-in shell stays full-bleed */
  #root:not(:has(.app-shell)) {
    padding-left: max(24px, calc(var(--sal) + 16px));
    padding-right: max(24px, calc(var(--sar) + 16px));
  }
}

@media (min-width: 768px) and (pointer: coarse) {
  .btn {
    min-height: 48px;
    min-width: 48px;
  }
}

/* Tablet tabnav adjustments to prevent clipping */
@media (min-width: 768px) and (max-width: 900px) {
  .tab-btn {
    font-size: 11px;
    padding: 10px 6px;
  }
}


/* ACCOUNT BAR (in-flow, scrolls with content) */
.account-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  flex-wrap: wrap;
}

.account-menu {
  position: static;
  z-index: auto;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--glass-bg-card, color-mix(in srgb, var(--surface, #141415) 70%, transparent));
  backdrop-filter: blur(var(--glass-blur, 12px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 12px));
  border: 1px solid var(--glass-border, var(--border-subtle));
  border-radius: var(--radius-xl, 16px);
  box-shadow: var(--glass-shadow, 0 4px 20px rgba(0,0,0,0.2));
}

.account-menu__name {
  font-size: var(--type-12, 12px);
  font-weight: 600;
  color: var(--text-strong, #fff);
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu__badge {
  font-size: var(--type-11, 11px);
  font-weight: 600;
  color: var(--color-success, #22c55e);
  padding: 2px 6px;
  border: 1px solid var(--color-success, #22c55e);
  border-radius: var(--radius-sm, 8px);
}

.account-menu__exit {
  min-height: 32px;
  padding: 0 var(--space-2);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm, 8px);
  color: var(--text-secondary);
  font: inherit;
  font-size: var(--type-12, 12px);
  cursor: pointer;
}

.account-menu__exit:hover {
  color: var(--text-strong);
  border-color: var(--border);
}

.account-menu__exit:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.account-menu .btn-sm {
  min-height: 32px;
  min-width: 0;
  padding: 0 var(--space-2);
  font-size: var(--type-12, 12px);
}

@media (max-width: 430px) {
  .account-menu__name {
    display: none;
  }
}

```

## `src/styles/components/app/tab-shell.css`

```css
/* Shared tab page shell — Journal, Split, and future tabs */

.app-tab-shell {
  container-name: app-tab;
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: var(--space-4);
  font-family: var(--font-system);
  color: var(--text);
  background: transparent;
}

@container app-tab (min-width: 34rem) {
  .app-tab-shell {
    padding: var(--space-6);
  }
}

.app-tab-header {
  display: grid;
  gap: var(--space-3);
  align-items: stretch;
}

.app-tab-header__copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.app-tab-title {
  margin: 0;
  font-size: var(--type-20);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text);
}

.app-tab-header__hint {
  margin: 0;
  font-size: var(--type-14);
  line-height: 1.5;
  color: var(--text-secondary);
  max-width: 28rem;
}

.app-tab-header__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.app-tab-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  min-width: 0;
  border-radius: var(--section-radius, var(--glass-radius-panel));
  border: var(--border-width) solid var(--glass-border);
  background: var(--glass-bg-card);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  /* Match Theory chapter-panel lift */
  box-shadow: var(--section-elevation);
}

.app-tab-section__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-2) var(--space-3);
}

.app-tab-section__title {
  margin: 0;
  text-align: center;
  font-size: var(--type-12);
  font-weight: 600;
  line-height: 1.33;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.app-tab-section__meta {
  font-size: var(--type-14);
  line-height: 1.3;
  color: var(--text-secondary);
}

.app-tab-section__body {
  min-width: 0;
}

.app-tab-picker-label {
  font-size: var(--type-12);
  font-weight: 500;
  line-height: 1.33;
  color: var(--text-secondary);
}

@container app-tab (min-width: 34rem) {
  .app-tab-header {
    grid-template-columns: minmax(0, 1fr) minmax(12rem, 42%);
    align-items: end;
  }

  .app-tab-header--stacked {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-tab-shell * {
    transition: none !important;
    animation: none !important;
  }
}

.app-shell__main:has(.tab-panel-fallback) {
  display: flex;
  flex-direction: column;
}

.tab-panel:has(.tab-panel-fallback) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}

.tab-panel-fallback {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 8rem;
  padding: var(--space-4);
}

.tab-panel-fallback__status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.tab-panel-fallback__spinner {
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--accent) 28%, transparent);
  border-top-color: var(--accent);
  animation: tab-panel-spinner 0.7s linear infinite;
}

@keyframes tab-panel-spinner {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tab-panel-fallback__spinner {
    animation: none;
  }
}

.tab-panel--enter {
  animation: tab-panel-enter var(--duration-short, 200ms)
    var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1)) both;
}

@keyframes tab-panel-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tab-panel--enter {
    animation: none;
  }
}

```

## `src/styles/components/app/app-hero.css`

```css
/* Hallmark · component: hero · genre: editorial · theme: custom (amber/peach frosted glass)
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 * pre-emit critique: P4 H5 E5 S4 R5 V5
 */

/* App shell hero — editorial left-align + frosted bento micro-grid */
.theory-hero.app-hero {
  --app-hero-accent: var(--accent, #ffb020);
  --app-hero-accent-soft: var(--accent-peach, #d4a574);
  --app-hero-accent-tint: color-mix(in srgb, var(--app-hero-accent) 10%, transparent);
  --app-hero-glass-bg: var(--glass-bg);
  --app-hero-glass-border: color-mix(in srgb, var(--app-hero-accent) 18%, var(--glass-border));
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin-bottom: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  text-align: left;
  background: transparent;
  box-shadow: none;
}

/* Spacing between chrome rows comes from .app-shell gap — avoid stacking margin + gap */
.app-shell .theory-hero.app-hero {
  margin-bottom: 0;
}

/* Tab-specific accent hues — dark theme chromatic anchors */
html[data-active-tab='calculator'] .theory-hero.app-hero {
  --app-hero-accent: var(--ta-calc-accent, var(--ta-sec-01, #ffb020));
}

html[data-active-tab='theory'] .theory-hero.app-hero {
  --app-hero-accent: var(--ta-sec-02, #5ba4ff);
}

html[data-active-tab='training'] .theory-hero.app-hero {
  --app-hero-accent: var(--ta-sec-03, #3affb8);
}

html[data-active-tab='split'] .theory-hero.app-hero {
  --app-hero-accent: var(--ta-sec-04, #d946ef);
}

html[data-active-tab='journal'] .theory-hero.app-hero {
  --app-hero-accent: var(--ta-sec-06, #ff6b6b);
}

/*
 * Light theme — per-tab soft accents (muted pastels for white/Apple gray).
 * Distinct from dark neon anchors. Primary CTAs stay Peak #ffb020 globally.
 */
html[data-theme='light'] .theory-hero.app-hero {
  --app-hero-accent: #d97706;
  --app-hero-accent-soft: #fbbf24;
  --app-hero-glass-bg: var(--glass-bg);
  --app-hero-glass-border: color-mix(
    in srgb,
    var(--app-hero-accent) 28%,
    var(--border-strong, rgba(0, 0, 0, 0.12))
  );
}

/* Calculator — Peak amber family (readable on white) */
html[data-theme='light'][data-active-tab='calculator'] .theory-hero.app-hero {
  --app-hero-accent: #d97706;
  --app-hero-accent-soft: #fbbf24;
}

/* Theory — soft blue (quiet tint, no heavy redesign) */
html[data-theme='light'][data-active-tab='theory'] .theory-hero.app-hero {
  --app-hero-accent: #3b82f6;
  --app-hero-accent-soft: #93c5fd;
}

/* Training — muted teal (not dark neon mint) */
html[data-theme='light'][data-active-tab='training'] .theory-hero.app-hero {
  --app-hero-accent: #0d9488;
  --app-hero-accent-soft: #5eead4;
}

/* Split — soft violet (not dark neon magenta) */
html[data-theme='light'][data-active-tab='split'] .theory-hero.app-hero {
  --app-hero-accent: #9333ea;
  --app-hero-accent-soft: #d8b4fe;
}

/* Journal — soft rose/coral (not dark neon coral) */
html[data-theme='light'][data-active-tab='journal'] .theory-hero.app-hero {
  --app-hero-accent: #e11d48;
  --app-hero-accent-soft: #fda4af;
}

/* Edge wash muted — statue wallpaper carries depth behind frosted hero */
.app-hero__ambient {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--glass-radius-panel);
}

.app-hero__ambient-wash {
  display: none;
}

/* Frosted glass shell — Ghost dual-tone via glass-surface.css (.ghost-glass / .app-hero__glass) */
.app-hero__glass {
  z-index: 1;
  padding: clamp(1rem, 3.5vw, 1.5rem) clamp(1rem, 3.5vw, 1.75rem);
  border-radius: var(--glass-radius-panel);
}

/* Light hero glass — white panel + soft per-tab accent wash/border */
html[data-theme='light'] .theory-hero.app-hero .app-hero__glass {
  background: color-mix(in srgb, var(--app-hero-accent) 4%, var(--surface, #ffffff));
  border-color: var(--app-hero-glass-border);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 8px 24px rgba(0, 0, 0, 0.05);
}

html[data-theme='light'] .theory-hero.app-hero .app-hero__glass::before {
  opacity: 0.7;
  background: radial-gradient(
    ellipse 72% 88% at 6% 18%,
    color-mix(in srgb, var(--app-hero-accent) 14%, transparent) 0%,
    transparent 64%
  );
}

html[data-theme='light'] .theory-hero.app-hero .app-hero__glass::after {
  opacity: 0.5;
  background: radial-gradient(
    ellipse 58% 72% at 94% 82%,
    color-mix(in srgb, var(--app-hero-accent-soft, var(--app-hero-accent)) 12%, transparent) 0%,
    transparent 66%
  );
}

/* Dark: keep Ghost bisect, add a whisper of tab accent into the glass fill */
html[data-theme='dark'] .theory-hero.app-hero .app-hero__glass {
  background: color-mix(
    in srgb,
    var(--app-hero-accent) 7%,
    color-mix(in srgb, var(--surface, #141415) 76%, transparent)
  );
}

/* Editorial asymmetric grid */
.app-hero__editorial {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'label aside'
    'title aside'
    'bento bento'
    'line line';
  column-gap: clamp(12px, 3vw, 20px);
  row-gap: clamp(8px, 2vw, 12px);
  align-items: start;
}

.app-hero__label {
  grid-area: label;
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  line-height: 1.3;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--app-hero-accent) 72%, var(--text-secondary, #9a9a9c));
}

html[data-theme='light'] .app-hero__label {
  color: color-mix(in srgb, var(--app-hero-accent) 70%, var(--text-soft, #4a4a4a));
}

/* Aside accent tile — bento micro cell, not floating ring */
.app-hero__aside {
  grid-area: aside;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  width: max-content;
  max-width: min(12.5rem, 48vw);
  min-width: 4.5rem;
  padding: 10px 12px;
  border-radius: var(--glass-radius-inner);
  border: var(--border-width) solid
    color-mix(in srgb, var(--app-hero-accent) 24%, var(--border, #252525));
  background: color-mix(in srgb, var(--app-hero-accent) 6%, var(--card, #1a1a1a));
}

html[data-theme='light'] .app-hero__aside {
  background: color-mix(in srgb, var(--app-hero-accent) 8%, var(--card, #ffffff));
  border-color: color-mix(
    in srgb,
    var(--app-hero-accent) 22%,
    var(--border-strong, rgba(0, 0, 0, 0.12))
  );
}

.app-hero__aside-kicker {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.12em;
  line-height: 1.2;
  text-transform: uppercase;
  color: var(--text-tertiary, #6a7383);
  white-space: nowrap;
}

.app-hero__aside-value {
  font-size: clamp(0.75rem, 2.2vw, 0.9375rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  color: var(--app-hero-accent);
  white-space: nowrap;
}

/* Kinetic editorial title — stacked lines, left-aligned */
.app-hero__title.app-hero__title-block,
h1.app-hero__title-block {
  grid-area: title;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.12em;
  margin: 0;
  min-width: 0;
  max-width: none;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  text-shadow: none;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.app-hero__title-lead {
  display: block;
  font-size: clamp(1.25rem, 5.2vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.08;
  color: var(--text-strong, #fff);
}

html[data-theme='light'] .app-hero__title-lead {
  color: var(--text, #1a1a1a);
}

.app-hero__title-accent,
.app-hero__title-num {
  display: block;
  font-size: clamp(1.75rem, 7.5vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.95;
  color: var(--app-hero-accent);
  font-variant-numeric: tabular-nums;
}

html[data-theme='light'] .app-hero__title-accent,
html[data-theme='light'] .app-hero__title-num {
  color: color-mix(in srgb, var(--app-hero-accent) 88%, #000);
}

.app-hero__title-tail {
  display: block;
  font-size: clamp(0.875rem, 2.8vw, 1rem);
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.3;
  color: var(--text-secondary, #9a9a9c);
}

html[data-theme='light'] .app-hero__title-tail {
  color: var(--text-soft, #4a4a4a);
}

/* Plain single-line title (no parsed accent) */
h1.app-hero__title-block:not(.app-hero__title) {
  font-size: clamp(1.35rem, 5.5vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.08;
  color: var(--text-strong, #fff);
}

html[data-theme='light'] h1.app-hero__title-block:not(.app-hero__title) {
  color: var(--text, #1a1a1a);
}

.app-hero--live .app-hero__title-accent,
.app-hero--live .app-hero__title-num {
  animation: appHeroKineticShift 5.5s var(--ease-in-out, ease-in-out) infinite;
}

@keyframes appHeroKineticShift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  50% {
    transform: translate3d(6px, -2px, 0);
    opacity: 0.94;
  }
}

/* Bento micro-grid for subtitle chips */
.app-hero__bento {
  grid-area: bento;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr));
  grid-auto-flow: dense;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.app-hero__bento-cell {
  min-width: 0;
  padding: 10px 12px;
  border-radius: var(--glass-radius-inner);
  border: var(--border-width) solid color-mix(in srgb, #fff 6%, var(--border, #252525));
  background: color-mix(in srgb, #fff 3%, var(--card, #1a1a1a));
  color: var(--text-soft, #ccc);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  transition:
    border-color var(--duration-micro, 150ms) var(--ease-micro, ease),
    background var(--duration-micro, 150ms) var(--ease-micro, ease);
}

html[data-theme='light'] .app-hero__bento-cell {
  background: color-mix(in srgb, var(--app-hero-accent) 4%, var(--card, #fff));
  border-color: color-mix(
    in srgb,
    var(--app-hero-accent) 20%,
    var(--border-strong, rgba(0, 0, 0, 0.1))
  );
  color: var(--text, #1a1a1a);
}

.app-hero__bento-cell--accent {
  border-color: color-mix(in srgb, var(--app-hero-accent) 32%, var(--border, #252525));
  background: color-mix(in srgb, var(--app-hero-accent) 8%, var(--card, #1a1a1a));
  color: var(--text-strong, #fff);
  font-weight: 600;
}

html[data-theme='light'] .app-hero__bento-cell--accent {
  background: color-mix(in srgb, var(--app-hero-accent) 12%, var(--card, #fff));
  color: var(--text, #1a1a1a);
}

/* Rotating tip cells — centered readable hints (all three cells) */
.app-hero__bento-cell--rotating {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 4rem;
  padding: 12px 14px;
  overflow: hidden;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
}

.app-hero__bento-cell--rotating.app-hero__bento-cell--accent {
  font-weight: 500;
}

.app-hero__bento-cell--rotating .app-hero__bento-cell-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
}

.app-hero__bento-cell--rotating .app-hero__bento-tip {
  display: block;
  width: 100%;
  text-align: center;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.app-hero__bento-cell--wide {
  grid-column: 1 / -1;
}

.theory-hero.app-hero .theory-hero-subtitle.app-hero__subtitle {
  margin: 0;
  max-width: none;
  font-size: clamp(0.875rem, 2.8vw, 0.9375rem);
  line-height: 1.5;
  color: var(--text-secondary, #9a9a9c);
}

html[data-theme='light'] .theory-hero.app-hero .theory-hero-subtitle.app-hero__subtitle {
  color: var(--text-soft, #4a4a4a);
}

.theory-hero.app-hero .theory-hero-line.app-hero__line {
  grid-area: line;
  margin-top: 2px;
  width: min(120px, 36%);
  height: 2px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--app-hero-accent) 72%, transparent);
  opacity: 1;
}

/* Interactive title focus */
.theory-hero-title--interactive:focus-visible {
  outline: 2px solid var(--app-hero-accent);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}

@media (hover: hover) {
  .theory-hero-title--interactive:hover .app-hero__title-accent,
  .theory-hero-title--interactive:hover .app-hero__title-num {
    color: color-mix(in srgb, var(--app-hero-accent) 88%, #fff);
  }
}

@media (max-width: 430px) {
  .theory-hero.app-hero {
    margin-bottom: var(--space-4);
  }

  .app-hero__glass {
    padding: var(--space-4) var(--space-3);
    border-radius: var(--glass-radius-panel);
  }

  .app-hero__ambient {
    border-radius: var(--glass-radius-panel);
  }

  .app-hero__editorial {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: 8px;
  }

  .app-hero__aside {
    min-width: 4rem;
    max-width: min(11rem, 52vw);
    padding: 8px 10px;
  }

  .app-hero__title-lead {
    font-size: clamp(1.125rem, 4.8vw, 1.35rem);
  }

  .app-hero__title-accent,
  .app-hero__title-num {
    font-size: clamp(1.5rem, 7vw, 2rem);
  }

  .app-hero__bento {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .app-hero__bento-cell {
    padding: 8px 10px;
    font-size: 11px;
  }

  .app-hero__bento-cell--rotating {
    min-height: 3.25rem;
    padding: 10px;
    font-size: 0.875rem;
    line-height: 1.35;
  }

  .app-hero__bento-cell--wide {
    grid-column: 1 / -1;
  }
}

@media (min-width: 431px) and (max-width: 767px) {
  .app-hero__bento-cell--rotating {
    min-height: 3.5rem;
    padding: 10px 12px;
    font-size: 1rem;
    line-height: 1.38;
  }
}

@media (min-width: 640px) {
  .app-hero__bento {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-hero--live .app-hero__title-accent,
  .app-hero--live .app-hero__title-num {
    animation: none !important;
  }

  .app-hero__bento-tip {
    transition: none !important;
  }

  .app-hero--enter,
  .app-hero-swap--enter,
  .app-hero__editorial--enter > *,
  .app-hero__ambient-wash--enter,
  .app-hero__line--enter,
  .app-hero__title-accent--enter,
  .app-hero__bento-tip--swap {
    animation: none !important;
  }
}

.app-hero-swap {
  width: 100%;
  overflow: hidden;
}

.app-hero-swap--enter {
  animation: app-hero-swap-in 220ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

@keyframes app-hero-swap-in {
  from {
    opacity: 0;
    transform: translate3d(0, 6px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.app-hero--compact .app-hero__glass--compact {
  padding: 12px 16px;
}

.app-hero__editorial--compact {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'label'
    'title'
    'bento'
    'line';
  row-gap: 6px;
}

.app-hero__subtitle--compact {
  margin: 0;
  max-width: 36rem;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  font-size: var(--type-14, 14px);
  line-height: 1.45;
  color: var(--text-secondary, #9a9a9c);
}

.app-hero--enter {
  animation: app-hero-fade-in 450ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

@keyframes app-hero-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.app-hero__ambient-wash--enter {
  animation: app-hero-fade-in 800ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

.app-hero__editorial--enter .app-hero__stagger-1 {
  animation: app-hero-rise-in 560ms var(--ease-out, cubic-bezier(0.4, 0, 0.2, 1)) 60ms both;
}

.app-hero__editorial--enter .app-hero__stagger-2 {
  animation: app-hero-rise-in 560ms var(--ease-out, cubic-bezier(0.4, 0, 0.2, 1)) 140ms both;
}

.app-hero__editorial--enter .app-hero__stagger-3 {
  animation: app-hero-rise-in 560ms var(--ease-out, cubic-bezier(0.4, 0, 0.2, 1)) 280ms both;
}

.app-hero__editorial--enter .app-hero__stagger-4 {
  animation: app-hero-rise-in 560ms var(--ease-out, cubic-bezier(0.4, 0, 0.2, 1)) 220ms both;
}

.app-hero__title-accent--enter {
  animation: app-hero-accent-pop 560ms cubic-bezier(0.34, 1.56, 0.64, 1) 180ms both;
}

.app-hero__line--enter {
  transform-origin: left center;
  animation: app-hero-line-in 700ms var(--ease-out, cubic-bezier(0.4, 0, 0.2, 1)) 400ms both;
}

@keyframes app-hero-rise-in {
  from {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes app-hero-accent-pop {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0) scale(0.6);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes app-hero-line-in {
  from {
    opacity: 0;
    transform: scaleX(0);
  }

  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

.app-hero__bento-tip--swap {
  animation: app-hero-tip-in 400ms var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1)) both;
}

@keyframes app-hero-tip-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

```

## `src/styles/components/training/training-nav.css`

```css
/* App-like navigation for the Training tab: page header, page transitions,
   menu, base page, calculations page. Токены по memory-bank/style-guide. */

.training-page-header {
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  background: color-mix(in srgb, var(--color-bg-primary) 88%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-subtle);
}

.training-page-header__inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  max-width: 960px;
  margin-inline: auto;
  padding: var(--space-2) var(--space-4);
  padding-top: max(var(--space-2), var(--sat, 0px));
}

.training-page-header__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  min-height: 44px;
  padding: 0 var(--space-2) 0 0;
  background: none;
  border: 0;
  color: var(--color-accent);
  font: inherit;
  font-size: var(--type-14);
  font-weight: 600;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.training-page-header__back:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.training-page-header__chevron {
  flex: 0 0 auto;
}

.training-page-header__title {
  flex: 1 1 auto;
  margin: 0;
  font-size: var(--type-18);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.training-page-header__spacer {
  width: 44px;
  flex: 0 0 44px;
}

.training-page-header__trailing {
  flex: 0 0 auto;
  min-width: 44px;
  display: flex;
  justify-content: flex-end;
}

/* Page transition (only on view change, only transform/opacity). */
.training-page-view {
  width: 100%;
}

.training-page-view--forward {
  animation: training-page-in-forward var(--duration-short) var(--ease-out) both;
}

.training-page-view--back {
  animation: training-page-in-back var(--duration-short) var(--ease-out) both;
}

@keyframes training-page-in-forward {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes training-page-in-back {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .training-page-view--forward,
  .training-page-view--back {
    animation: none;
  }
}

/* ---- Menu ---- */
.training-menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: 720px;
  margin-inline: auto;
  padding: var(--space-4) var(--space-4) var(--space-6);
}

.training-menu__primary {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  min-height: 96px;
  padding: var(--space-5);
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-bg-secondary));
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, var(--color-border-subtle));
  border-radius: var(--radius-xl);
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: var(--color-text-primary);
  transition: transform var(--duration-micro) var(--ease-micro), background var(--duration-micro) var(--ease-micro);
}

.training-menu__primary:hover {
  transform: translateY(-1px);
}

.training-menu__primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.training-menu__primary-eyebrow {
  grid-column: 1 / -1;
  font-size: var(--type-12);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-accent);
}

.training-menu__primary-title {
  font-size: var(--type-20);
  font-weight: 600;
}

.training-menu__primary-meta {
  font-size: var(--type-14);
  color: var(--color-text-secondary);
}

.training-menu__chevron {
  font-size: var(--type-24);
  color: var(--color-text-tertiary);
  align-self: center;
}

.training-menu__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

.training-menu__grid--three {
  grid-template-columns: 1fr;
}

.training-menu__grid--four {
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 600px) {
  .training-menu__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .training-menu__grid--three {
    grid-template-columns: repeat(3, 1fr);
  }
  .training-menu__grid--four {
    grid-template-columns: repeat(2, 1fr);
  }
}

.training-menu__tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  min-height: 88px;
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: var(--color-text-primary);
  transition: transform var(--duration-micro) var(--ease-micro), border-color var(--duration-micro) var(--ease-micro);
}

.training-menu__tile:hover {
  transform: translateY(-1px);
  border-color: var(--color-border-default);
}

.training-menu__tile:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.training-menu__tile-title {
  font-size: var(--type-16);
  font-weight: 600;
}

.training-menu__tile-meta {
  font-size: var(--type-12);
  color: var(--color-text-secondary);
}

.training-menu__link {
  align-self: center;
  min-height: 44px;
  padding: 0 var(--space-3);
  background: none;
  border: 0;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: var(--type-14);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.training-menu__link:hover {
  color: var(--color-text-primary);
}

.training-menu__link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ---- Base page ---- */
.training-base {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: 720px;
  margin-inline: auto;
  padding: var(--space-4) var(--space-4) var(--space-6);
}

.training-base__intro {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.training-base__title {
  margin: 0;
  font-size: var(--type-20);
  font-weight: 600;
}

.training-base__hint {
  margin: 0;
  font-size: var(--type-14);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.training-base__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-bg-secondary);
}

.training-base__row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3) var(--space-4);
  min-height: 44px;
  border-top: 1px solid var(--color-border-subtle);
}

.training-base__row:first-child {
  border-top: 0;
}

.training-base__name {
  font-size: var(--type-14);
  color: var(--color-text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.training-base__meta {
  font-size: var(--type-12);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.training-base__one-rm {
  font-size: var(--type-14);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

.training-base__empty {
  margin: 0;
  padding: var(--space-4);
  font-size: var(--type-14);
  color: var(--color-text-secondary);
  text-align: center;
  border: 1px dashed var(--color-border-subtle);
  border-radius: var(--radius-xl);
}

@media (max-width: 430px) {
  .training-base__meta {
    display: none;
  }
}

/* ---- Calculations page ---- */
.training-calculations {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: 720px;
  margin-inline: auto;
  padding: var(--space-4) var(--space-4) var(--space-6);
}

.training-calculation-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-2);
  align-items: center;
  width: 100%;
  min-height: 80px;
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: var(--color-text-primary);
  transition: transform var(--duration-micro) var(--ease-micro), border-color var(--duration-micro) var(--ease-micro);
}

.training-calculation-card:hover {
  transform: translateY(-1px);
  border-color: var(--color-border-default);
}

.training-calculation-card:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.training-calculation-card.is-active {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-bg-secondary));
}

.training-calculation-card__eyebrow {
  grid-column: 1 / -1;
  font-size: var(--type-12);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
}

.training-calculation-card--standard .training-calculation-card__eyebrow {
  color: var(--color-accent);
}

.training-calculation-card__title {
  font-size: var(--type-16);
  font-weight: 600;
}

.training-calculation-card__meta {
  grid-column: 1 / -1;
  font-size: var(--type-12);
  color: var(--color-text-secondary);
}

.training-calculations__empty {
  margin: 0;
  padding: var(--space-4);
  font-size: var(--type-14);
  color: var(--color-text-secondary);
  text-align: center;
  border: 1px dashed var(--color-border-subtle);
  border-radius: var(--radius-xl);
}

.training-calculations__actions {
  display: flex;
  justify-content: center;
  padding: var(--space-2) 0;
}

/* ---- Constructor panels ---- */
.split-calculations-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.split-calculations-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.split-calculations-panel__hint {
  margin: 0;
  font-size: var(--type-14);
  color: var(--color-text-secondary);
  line-height: 1.5;
  flex: 1 1 auto;
  min-width: 0;
}

.split-days-inline {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.split-days-inline__label {
  font-size: var(--type-14);
  color: var(--color-text-secondary);
  font-weight: 500;
}
.split-days-toggle {
  min-height: 44px;
  padding: 0 var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--type-14);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: var(--space-3);
}

.split-days-toggle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}


/* ---- Week progress grid (8 weeks) ---- */
.week-progress-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.week-progress-grid__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: var(--radius-sm);
  font-size: var(--type-12);
  font-weight: 600;
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.week-progress-grid__cell--done {
  background: var(--color-success);
  color: var(--color-bg-primary);
  border-color: var(--color-success);
}

.week-progress-grid__cell--current {
  background: color-mix(in srgb, var(--color-accent) 18%, var(--color-bg-secondary));
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}

@media (max-width: 430px) {
  .week-progress-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 900px) {
  .training-menu__grid--four {
    grid-template-columns: repeat(4, 1fr);
  }
}


@media (max-width: 430px) {
  .training-page-header__inner {
    padding: var(--space-1) var(--space-3);
    padding-top: max(var(--space-1), var(--sat, 0px));
  }
  .training-page-header__title {
    font-size: var(--type-16);
  }
  .training-page-header__back span {
    display: none;
  }
}

```

## `src/styles/components/training/stack.css`

```css
/* Стеки выполнения (Фаза 3 плана training-minimal). Токены по memory-bank/style-guide. */
.training-stacks {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.stack {
  --stack-tint: 8%;
  border: 1px solid var(--color-border-default, var(--border));
  border-radius: var(--radius-md, 12px);
  padding: var(--space-2, 8px);
  position: relative;
  background: var(--color-bg-secondary, var(--surface));
}

.stack[data-tone='light'] {
  background: color-mix(in srgb, var(--color-success) var(--stack-tint), var(--color-bg-secondary, var(--surface)));
}

.stack[data-tone='medium'] {
  background: color-mix(in srgb, var(--color-warning) var(--stack-tint), var(--color-bg-secondary, var(--surface)));
}

.stack[data-tone='peak'] {
  background: color-mix(in srgb, var(--color-destructive) var(--stack-tint), var(--color-bg-secondary, var(--surface)));
}

.stack__rail {
  position: absolute;
  left: 14px;
  top: 20px;
  bottom: 20px;
  width: 2px;
  background: var(--color-border-default, var(--border));
  border-radius: var(--radius-sm, 4px);
}

.stack__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stack__exercise {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stack__ex {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: var(--space-2, 8px);
  padding-left: var(--space-7, 28px);
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-md, 12px) - var(--space-2, 8px));
  cursor: pointer;
  font: inherit;
  color: var(--text, var(--ta-text));
  text-align: left;
  transition: background 150ms;
}

.stack__ex:hover {
  background: color-mix(in srgb, var(--text, var(--ta-text)) 4%, transparent);
}

.stack__ex:focus-visible {
  outline: 2px solid var(--color-accent, var(--accent));
  outline-offset: 2px;
  border-radius: calc(var(--radius-md, 12px) - var(--space-2, 8px));
}

.stack__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent, var(--accent));
  flex: 0 0 auto;
}

.stack__name {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stack__kg {
  font-size: var(--type-16, 16px);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  flex: 0 0 auto;
}

.stack__scheme {
  font-size: var(--type-12, 12px);
  color: var(--color-text-secondary, var(--text-secondary));
  flex: 0 0 auto;
}

.stack__reps {
  font-size: var(--type-12, 12px);
  color: var(--color-text-tertiary, var(--muted));
  flex: 0 0 auto;
}

.stack__meta {
  margin-top: 4px;
  padding-left: 28px;
  font-size: var(--type-12, 12px);
  color: var(--color-text-secondary, var(--text-secondary));
}

@media (max-width: 600px) {
  .stack__reps {
    display: none;
  }
}
```

## `src/styles/components/theory/news-feed.css`

```css
/* Новости исследований (Фаза 7). Стиль по memory-bank/style-guide: spacing 4px, radius 6/8/12. */
.ta-news-feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
  margin: var(--space-5, 20px) 0 var(--space-6, 24px);
  padding-inline: var(--space-4, 16px);
}

.ta-news-feed__head {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}

.ta-news-feed__title {
  margin: 0;
  font-size: var(--type-20, 20px);
  font-weight: 600;
  color: var(--ta-text);
  line-height: 1.2;
}

.ta-news-feed__lede {
  margin: 0;
  font-size: var(--type-14, 14px);
  color: var(--ta-text-muted);
  line-height: 1.5;
}

.ta-news-feed__list {
  display: grid;
  gap: var(--space-3, 12px);
}

.ta-news-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
  padding: var(--space-4, 16px);
  border: 1px solid var(--ta-border);
  border-radius: var(--radius-md, 12px);
  background: var(--ta-surface);
}

.ta-news-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12px);
}

.ta-news-card__title {
  margin: 0;
  font-size: var(--type-16, 16px);
  font-weight: 600;
  color: var(--ta-text);
  line-height: 1.3;
}

.ta-news-card__grade {
  flex: 0 0 auto;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 6px;
  font-size: var(--type-11, 11px);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.ta-news-card__conclusion {
  margin: 0;
  font-size: var(--type-14, 14px);
  line-height: 1.55;
  color: var(--ta-text);
}

.ta-news-card__details {
  margin: 0;
  font-size: var(--type-14, 14px);
  line-height: 1.55;
  color: var(--ta-text-muted);
  padding: var(--space-2, 8px) 0 0;
  border-top: 1px solid var(--ta-border);
}

.ta-news-card__toggle {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: var(--ta-sec-01);
  font-size: var(--type-12, 12px);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.ta-news-card__source {
  margin: 0;
  font-size: var(--type-12, 12px);
  color: var(--ta-text-muted);
  font-style: italic;
  line-height: 1.4;
}

.ta-news-card__source a {
  color: var(--ta-sec-01);
  text-decoration: underline;
}

/* Mobile-first: compact on small screens */
@media (max-width: 430px) {
  .ta-news-card {
    padding: var(--space-3, 12px);
    gap: var(--space-1, 4px);
    margin-inline: var(--space-1, 4px);
  }
  .ta-news-card__title {
    font-size: var(--type-14, 14px);
  }
  .ta-news-card__conclusion,
  .ta-news-card__details {
    font-size: var(--type-13, 13px);
  }
}
```

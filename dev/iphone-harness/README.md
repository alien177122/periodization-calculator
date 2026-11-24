# iPhone Inspector (dev only)

Встроенная в OpenCode «айфонная» вкладка: приложение открывается в same-origin iframe
размером с iPhone, а рядом — инспектор элементов.

## Открыть

```bash
npm run dev
```

Затем в браузере OpenCode: `http://localhost:5173/__iphone`.

Плагин `dev/iphone-harness/plugin.ts` подключён в `vite.config.ts` с `apply: 'serve'`,
поэтому в `dist` и в production он не попадает.

## Что умеет

- Устройства: iPhone 15 (393×852), 15 Pro Max (430×932), 14 (390×844), SE (375×667).
- Подставляет `--sat/--sab/--sal/--sar`, чтобы проверить safe-area отступы.
- **Use** (по умолчанию): приложение внутри рамки работает как обычно — клики,
  скролл и ввод не перехватываются.
- **Inspect**: клик по элементу показывает селектор, тег, компонент, файл и строку.
- **Move**: выбранный элемент можно тащить мышью или двигать стрелками (1 px,
  `Shift` — 10 px). Панель показывает готовый CSS и `dx/dy`.
- **Copy JSON** — полный снимок выделения, **Copy CSS** — сниппет для вставки в стили.
- Источник берётся из React fiber (`_debugOwner`): в dev-сборке SWC оставляет в
  `jsxDEV` поля `fileName/lineNumber/columnNumber`. Поэтому клик → файл:строка
  работает без Babel-плагинов и без правок приложения.

## API для агента

В верхней вкладке доступен `window.__iphone`:

```js
window.__iphone.select('.auth-submit'); // выбрать по CSS-селектору
window.__iphone.selectAt(200, 400); // выбрать по координатам внутри iframe
window.__iphone.getSelection(); // JSON: selector, rect, styles, source, usage
window.__iphone.setDevice('iphone-15-pro-max');
window.__iphone.setMode('move'); // 'use' | 'inspect' | 'move'
window.__iphone.reset(); // сбросить move
window.__iphone.click('.auth-submit'); // программный клик по приложению
```

Через инструменты OpenCode:

```js
await tools.browser.evaluate({
  tabID,
  script: "window.__iphone.select('.auth-submit')",
});
const selection = await tools.browser.evaluate({
  tabID,
  script: 'window.__iphone.getSelection()',
});
```

`selection.source` содержит `relative`, `line`, `column`, `component` и `usage` —
место, где компонент используется. Этого достаточно, чтобы точечно поправить CSS/TSX.

## Границы

Это Chromium с iPhone-вьюпортом, а не iOS Safari. Он хорошо ловит:

- горизонтальный overflow и обрезание контента;
- размеры touch-target;
- сетку, переносы, safe-area;
- положение элемента и CSS-регрессии.

Он **не** воспроизводит:

- реальный Safari/WebKit и iOS-скролл с инерцией;
- системные жесты, клавиатуру, `visualViewport`;
- настоящий `env(safe-area-inset-*)` (значения подставляются через CSS-переменные);
- нативный SwiftUI. Для нативного приложения нужен Xcode Simulator + `xcrun simctl`
  / Maestro, либо Appetize.io, встроенный в вкладку.

Для честной проверки Safari используйте Playwright WebKit с `devices['iPhone 15']`
(проект `iphone` в `playwright.config.ts`) или реальный iPhone.

## Как закрепить результат

1. Поправить `selection.source.relative` в указанной строке.
2. Добавить/обновить e2e-проверку на iPhone-вьюпорте: нет горизонтального overflow,
   ключевые кнопки не меньше 44 px и не вылезают за экран.
3. Прогнать `npm run test:e2e -- --project=iphone`.
4. Зафиксировать правило в `AGENTS.md`: после UI-правки — скриншот/проверка в
   `/__iphone` и зелёный iPhone e2e.

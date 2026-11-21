/* Dev-only iPhone frame + element inspector. No production imports. */
const DEVICES = {
  'iphone-15': {
    label: 'iPhone 15',
    w: 393,
    h: 852,
    sat: 59,
    sab: 34,
    sal: 0,
    sar: 0,
    notch: true,
    home: true,
  },
  'iphone-15-pro-max': {
    label: 'iPhone 15 Pro Max',
    w: 430,
    h: 932,
    sat: 59,
    sab: 34,
    sal: 0,
    sar: 0,
    notch: true,
    home: true,
  },
  'iphone-14': {
    label: 'iPhone 14',
    w: 390,
    h: 844,
    sat: 47,
    sab: 34,
    sal: 0,
    sar: 0,
    notch: true,
    home: true,
  },
  'iphone-se': {
    label: 'iPhone SE',
    w: 375,
    h: 667,
    sat: 20,
    sab: 0,
    sal: 0,
    sar: 0,
    notch: false,
    home: false,
  },
};

const $ = selector => document.querySelector(selector);
const frame = $('#app');
const deviceSelect = $('#device');
const useButton = $('#use');
const modeButton = $('#mode');
const moveButton = $('#move');
const resetButton = $('#reset');
const reloadButton = $('#reload');
const copyButton = $('#copy');
const copyCssButton = $('#copy-css');
const statusEl = $('#status');
const panelTitle = $('#panel-title');
const panelBody = $('#panel-body');
const deviceScale = $('#device-scale');
const deviceShell = $('#device-shell');
const notch = $('#notch');
const homeIndicator = $('#home-indicator');

const state = {
  device: 'iphone-15',
  mode: 'use',
  doc: null,
  win: null,
  overlayHover: null,
  overlaySelect: null,
  selected: null,
  selection: null,
  baseTransform: '',
  delta: {x: 0, y: 0},
  drag: null,
  hovered: null,
  raf: 0,
};

function setStatus(text) {
  statusEl.textContent = text;
}

function device() {
  return DEVICES[state.device];
}

function setDevice(key) {
  if (!DEVICES[key]) return;
  state.device = key;
  deviceSelect.value = key;
  const d = device();
  document.documentElement.style.setProperty('--device-w', `${d.w}px`);
  document.documentElement.style.setProperty('--device-h', `${d.h}px`);
  notch.style.display = d.notch ? 'block' : 'none';
  homeIndicator.style.display = d.home ? 'block' : 'none';
  if (state.doc) applySafeArea(state.doc, d);
  fit();
  setStatus(`${d.label} · ${d.w}×${d.h}`);
}

function fit() {
  const d = device();
  const wrap = $('.device-wrap');
  if (!wrap) return;
  const bezel = 26;
  const totalW = d.w + bezel;
  const totalH = d.h + bezel;
  const availW = Math.max(240, wrap.clientWidth - 24);
  const availH = Math.max(320, wrap.clientHeight - 24);
  const scale = Math.min(1, availW / totalW, availH / totalH);
  deviceShell.style.setProperty('--scale', scale.toFixed(4));
  deviceScale.style.width = `${Math.round(totalW * scale)}px`;
  deviceScale.style.height = `${Math.round(totalH * scale)}px`;
}

function applySafeArea(doc, d) {
  const root = doc.documentElement;
  root.style.setProperty('--sat', `${d.sat}px`);
  root.style.setProperty('--sab', `${d.sab}px`);
  root.style.setProperty('--sal', `${d.sal}px`);
  root.style.setProperty('--sar', `${d.sar}px`);
  root.dataset.iphoneHarness = state.device;
}

const IFRAME_CSS = `
  .__iphone-hover,
  .__iphone-select {
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
    box-sizing: border-box;
    border-radius: 2px;
    transition: none;
  }
  .__iphone-hover {
    border: 1px dashed rgba(255, 176, 32, 0.9);
    background: rgba(255, 176, 32, 0.08);
  }
  .__iphone-select {
    border: 2px solid #ffb020;
    background: rgba(255, 176, 32, 0.12);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 176, 32, 0.18);
  }
  .__iphone-select::after {
    content: attr(data-label);
    position: absolute;
    left: -2px;
    bottom: 100%;
    max-width: 280px;
    margin-bottom: 4px;
    padding: 3px 7px;
    overflow: hidden;
    border-radius: 5px;
    background: #ffb020;
    color: #1b1300;
    font: 600 10px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  html.__iphone-move,
  html.__iphone-move * {
    cursor: grab !important;
  }
  html.__iphone-move *:active {
    cursor: grabbing !important;
  }
  html.__iphone-dragging,
  html.__iphone-dragging * {
    cursor: grabbing !important;
    user-select: none !important;
  }
`;

function install(doc, win) {
  state.doc = doc;
  state.win = win;
  state.selected = null;
  state.selection = null;
  state.drag = null;

  const style = doc.createElement('style');
  style.textContent = IFRAME_CSS;
  doc.head.appendChild(style);

  const hover = doc.createElement('div');
  hover.className = '__iphone-hover';
  hover.hidden = true;
  const select = doc.createElement('div');
  select.className = '__iphone-select';
  select.hidden = true;
  doc.body.append(hover, select);
  state.overlayHover = hover;
  state.overlaySelect = select;

  applySafeArea(doc, device());
  syncModeClass();

  doc.addEventListener('pointermove', onPointerMove, true);
  doc.addEventListener('pointerdown', onPointerDown, true);
  doc.addEventListener('click', onClick, true);
  doc.addEventListener('scroll', scheduleReposition, true);
  doc.addEventListener('keydown', onKeyDown, true);
  win.addEventListener('resize', scheduleReposition);

  renderPanel();
  setStatus(`${device().label} · ${device().w}×${device().h} · ${state.mode === 'use' ? 'ready' : state.mode}`);
  retryIfBlank(doc);
}

/* Первый кадр иногда приходит из Vite до готовности модулей: #root пустой,
   и инспектор выглядит как белый экран. Один cache-bust retry лечит это. */
let blankRetries = 0;
function retryIfBlank(doc) {
  window.setTimeout(() => {
    if (state.doc !== doc) return;
    const root = doc.querySelector('#root');
    if (root && root.childElementCount > 0) {
      blankRetries = 0;
      return;
    }
    if (blankRetries >= 1) return;
    blankRetries += 1;
    frame.src = `/?t=${Date.now()}`;
    setStatus('reloading…');
  }, 2000);
}

function uninstall() {
  state.doc = null;
  state.win = null;
  state.selected = null;
  state.selection = null;
  state.overlayHover = null;
  state.overlaySelect = null;
}

function syncModeClass() {
  if (!state.doc) return;
  state.doc.documentElement.classList.toggle('__iphone-move', state.mode === 'move');
}

function onPointerMove(event) {
  if (state.drag) {
    updateDrag(event);
    return;
  }
  if (state.mode !== 'inspect' || !state.doc) return;
  const el = state.doc.elementFromPoint(event.clientX, event.clientY);
  if (!el || el === state.overlayHover || el === state.overlaySelect) return;
  if (el === state.doc.documentElement || el === state.doc.body) {
    hideHover();
    return;
  }
  state.hovered = el;
  drawBox(state.overlayHover, el);
}

function onPointerDown(event) {
  if (state.mode !== 'move' || !state.selected) return;
  const target = event.target;
  if (target !== state.selected && !state.selected.contains(target)) return;
  event.preventDefault();
  event.stopPropagation();
  const el = state.selected;
  state.drag = {
    startX: event.clientX,
    startY: event.clientY,
    baseDelta: {...state.delta},
    pointerId: event.pointerId,
  };
  try {
    el.setPointerCapture(event.pointerId);
  } catch {
    /* pointer capture is best effort */
  }
  state.doc.documentElement.classList.add('__iphone-dragging');
  drawBox(state.overlaySelect, el);
}

function updateDrag(event) {
  if (!state.drag || !state.selected) return;
  state.delta.x = state.drag.baseDelta.x + (event.clientX - state.drag.startX);
  state.delta.y = state.drag.baseDelta.y + (event.clientY - state.drag.startY);
  applyTransform();
  drawBox(state.overlaySelect, state.selected);
  updateDeltaInputs();
  event.preventDefault();
  event.stopPropagation();
}

function endDrag() {
  if (!state.drag) return;
  state.drag = null;
  if (state.doc) state.doc.documentElement.classList.remove('__iphone-dragging');
  if (state.selected) drawBox(state.overlaySelect, state.selected);
  renderPanel();
}

function onClick(event) {
  if (state.mode !== 'inspect' || !state.doc) return;
  const el = event.target;
  if (!el || el === state.overlayHover || el === state.overlaySelect) return;
  if (el === state.doc.documentElement || el === state.doc.body) return;
  event.preventDefault();
  event.stopPropagation();
  selectElement(el);
}

function onKeyDown(event) {
  if (state.mode === 'use') return;
  if (event.target instanceof state.win.HTMLInputElement) return;
  if (event.target instanceof state.win.HTMLTextAreaElement) return;
  const tag = event.target?.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || event.target?.isContentEditable) return;

  if (event.key === 'u' || event.key === 'U') {
    setMode('use');
    event.preventDefault();
    return;
  }
  if (event.key === 'Escape') {
    clearSelection();
    return;
  }
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    if (!state.selected) return;
    const step = event.shiftKey ? 10 : 1;
    if (event.key === 'ArrowUp') state.delta.y -= step;
    if (event.key === 'ArrowDown') state.delta.y += step;
    if (event.key === 'ArrowLeft') state.delta.x -= step;
    if (event.key === 'ArrowRight') state.delta.x += step;
    applyTransform();
    drawBox(state.overlaySelect, state.selected);
    updateDeltaInputs();
    event.preventDefault();
  }
}

function scheduleReposition() {
  if (state.raf) return;
  state.raf = requestAnimationFrame(() => {
    state.raf = 0;
    if (state.overlayHover && !state.overlayHover.hidden && state.hovered) {
      drawBox(state.overlayHover, state.hovered);
    }
    if (state.overlaySelect && !state.overlaySelect.hidden && state.selected) {
      drawBox(state.overlaySelect, state.selected);
    }
  });
}

function drawBox(box, el) {
  if (!box || !el || !el.isConnected) {
    if (box) box.hidden = true;
    return;
  }
  const rect = el.getBoundingClientRect();
  if (!rect.width && !rect.height) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  box.style.left = `${rect.left}px`;
  box.style.top = `${rect.top}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;
  if (box === state.overlaySelect) {
    box.dataset.label = selectorFor(el, true);
  }
}

function hideHover() {
  state.hovered = null;
  if (state.overlayHover) state.overlayHover.hidden = true;
}

function clearSelection() {
  state.selected = null;
  state.selection = null;
  state.baseTransform = '';
  state.delta = {x: 0, y: 0};
  state.drag = null;
  if (state.overlaySelect) state.overlaySelect.hidden = true;
  hideHover();
  renderPanel();
  setStatus('selection cleared');
}

function selectElement(el) {
  state.selected = el;
  state.baseTransform = el.style.transform || '';
  state.delta = {x: 0, y: 0};
  state.selection = describe(el);
  hideHover();
  drawBox(state.overlaySelect, el);
  renderPanel();
  setStatus(`${el.tagName.toLowerCase()} · ${state.selection.selector}`);
}

function applyTransform() {
  if (!state.selected) return;
  const {x, y} = state.delta;
  const translate = x || y ? ` translate(${x}px, ${y}px)` : '';
  state.selected.style.transform = `${state.baseTransform}${translate}`.trim();
}

function resetMove() {
  if (!state.selected) return;
  state.selected.style.transform = state.baseTransform;
  state.delta = {x: 0, y: 0};
  drawBox(state.overlaySelect, state.selected);
  updateDeltaInputs();
  renderPanel();
  setStatus('move reset');
}

function setMode(mode) {
  state.mode = mode;
  useButton.classList.toggle('on', mode === 'use');
  modeButton.classList.toggle('on', mode === 'inspect');
  modeButton.textContent = 'Inspect';
  moveButton.classList.toggle('on', mode === 'move');
  moveButton.textContent = mode === 'move' ? 'Moving…' : 'Move selected';
  syncModeClass();

  if (mode === 'use') {
    state.drag = null;
    if (state.doc) state.doc.documentElement.classList.remove('__iphone-dragging');
    hideHover();
    if (state.overlaySelect) state.overlaySelect.hidden = true;
    setStatus('use mode · приложение работает как обычно');
    return;
  }
  if (mode === 'inspect') {
    hideHover();
    if (state.selected?.isConnected) drawBox(state.overlaySelect, state.selected);
    setStatus('inspect mode');
    return;
  }
  if (state.selected?.isConnected) drawBox(state.overlaySelect, state.selected);
  setStatus('move mode · drag the selected element');
}

function getFiber(el) {
  const key = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
  return key ? el[key] : null;
}

function componentName(fiber) {
  if (!fiber) return null;
  if (typeof fiber.type === 'string') return fiber.type;
  return (
    fiber.type?.displayName ||
    fiber.type?.name ||
    fiber.elementType?.displayName ||
    fiber.elementType?.name ||
    null
  );
}

function componentChain(fiber) {
  const names = [];
  let node = fiber;
  for (let i = 0; node && i < 40; i++) {
    const name = componentName(node);
    if (name && !name.startsWith('_') && names[names.length - 1] !== name) names.push(name);
    node = node.return;
  }
  return names.slice(0, 10);
}

function relativePath(file) {
  const match = file.match(/^(.*?)\/(?:src|packages|server|tests|e2e|scripts|dev)\//);
  return match ? file.slice(match[1].length + 1) : file;
}

function sourceOf(owner) {
  if (!owner) return null;
  const fn =
    typeof owner.type === 'function'
      ? owner.type
      : typeof owner.type?.render === 'function'
        ? owner.type.render
        : null;
  if (!fn) return null;
  try {
    return {fn, text: Function.prototype.toString.call(fn)};
  } catch {
    return null;
  }
}

function lineOf(source, token) {
  if (!source || !token) return null;
  const index = source.indexOf(token);
  if (index < 0) return null;
  const rest = source.slice(index, index + 5000);
  const match = rest.match(/lineNumber:\s*(\d+)(?:,\s*columnNumber:\s*(\d+))?/);
  if (!match) return null;
  return {
    line: Number(match[1]),
    column: match[2] ? Number(match[2]) : null,
  };
}

function findUsage(owner, text) {
  const parentOwner = owner?._debugOwner;
  const parent = sourceOf(parentOwner);
  if (!parent) return null;
  const fileMatch = parent.text.match(/fileName:\s*"([^"]+)"/);
  if (!fileMatch) return null;

  const name = owner.type?.displayName || owner.type?.name || null;
  const candidates = [...parent.text.matchAll(new RegExp(`jsxDEV\\(${name ? escapeRegExp(name) : ''}`, 'g'))];
  let best = null;
  for (const candidate of candidates) {
    const chunk = parent.text.slice(candidate.index, candidate.index + 2200);
    if (text && !chunk.includes(text)) continue;
    const hit = lineOf(parent.text.slice(candidate.index), 'jsxDEV');
    if (hit) {
      best = hit;
      break;
    }
  }
  if (!best && name) best = lineOf(parent.text, `jsxDEV(${name}`);
  if (!best) return null;
  return {
    file: fileMatch[1],
    relative: relativePath(fileMatch[1]),
    line: best.line,
    column: best.column,
    component: parentOwner.type?.displayName || parentOwner.type?.name || null,
    token: name,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findSource(el, fiber) {
  const props = fiber?.memoizedProps || {};
  const classTokens = String(props.className || el.className || '')
    .split(/\s+/)
    .filter(token => token && token.length > 2 && !token.startsWith('__iphone'));

  const groups = [
    ['data-testid', props['data-testid'] || el.getAttribute('data-testid')],
    ['id', props.id || el.id],
    ['aria-label', props['aria-label'] || el.getAttribute('aria-label')],
    ['class', classTokens[0]],
    ['class', classTokens[1]],
    ['class', classTokens[2]],
    ['text', (el.innerText || '').trim().slice(0, 40)],
  ].filter(([, value]) => value && String(value).trim().length > 1);

  let node = fiber;
  for (let depth = 0; node && depth < 40; depth++) {
    const owner = node._debugOwner;
    if (owner) {
      const source = sourceOf(owner);
      if (source) {
        const fileMatch = source.text.match(/fileName:\s*"([^"]+)"/);
        if (fileMatch) {
          let hit = null;
          for (const [kind, raw] of groups) {
            const token = String(raw).trim();
            if (!token) continue;
            const found = lineOf(source.text, token);
            if (found) {
              hit = {kind, token: token.slice(0, 80), ...found};
              break;
            }
          }
          return {
            file: fileMatch[1],
            relative: relativePath(fileMatch[1]),
            line: hit?.line ?? null,
            column: hit?.column ?? null,
            match: hit?.kind ?? null,
            token: hit?.token ?? null,
            component: owner.type.displayName || owner.type.name || null,
            usage: findUsage(owner, (el.innerText || '').trim().slice(0, 40)),
          };
        }
      }
    }
    node = node.return;
  }
  return null;
}

function selectorFor(el, short = false) {
  if (!el || el.nodeType !== 1) return '';
  if (el.id) return `#${CSS.escape(el.id)}`;
  const testId = el.getAttribute('data-testid');
  if (testId) return `[data-testid="${CSS.escape(testId)}"]`;

  const parts = [];
  let node = el;
  for (let depth = 0; node && node.nodeType === 1 && node !== el.ownerDocument.body && depth < 4; depth++) {
    let part = node.tagName.toLowerCase();
    const classes = [...node.classList]
      .filter(name => name && !name.startsWith('__iphone'))
      .slice(0, short ? 1 : 2);
    if (classes.length) {
      part += `.${classes.map(name => CSS.escape(name)).join('.')}`;
    } else if (node.parentElement) {
      const siblings = [...node.parentElement.children].filter(child => child.tagName === node.tagName);
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    }
    parts.unshift(part);
    if (node.id) {
      parts[0] = `#${CSS.escape(node.id)}`;
      break;
    }
    node = node.parentElement;
  }
  return parts.join(' > ');
}

function describe(el) {
  const rect = el.getBoundingClientRect();
  const styles = getComputedStyle(el);
  const fiber = getFiber(el);
  const source = findSource(el, fiber);
  const props = fiber?.memoizedProps || {};
  const parent = el.parentElement;

  return {
    selector: selectorFor(el),
    shortSelector: selectorFor(el, true),
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    className: typeof el.className === 'string' ? el.className : null,
    testId: el.getAttribute('data-testid'),
    role: el.getAttribute('role'),
    ariaLabel: el.getAttribute('aria-label'),
    text: (el.innerText || '').trim().slice(0, 180),
    href: el.getAttribute('href'),
    componentChain: componentChain(fiber),
    source,
    reactProps: Object.keys(props).filter(key => key.startsWith('on')).slice(0, 12),
    rect: {
      x: round(rect.x),
      y: round(rect.y),
      width: round(rect.width),
      height: round(rect.height),
      right: round(rect.right),
      bottom: round(rect.bottom),
    },
    viewport: {
      width: el.ownerDocument.defaultView.innerWidth,
      height: el.ownerDocument.defaultView.innerHeight,
      dpr: el.ownerDocument.defaultView.devicePixelRatio,
    },
    styles: {
      display: styles.display,
      position: styles.position,
      zIndex: styles.zIndex,
      margin: styles.margin,
      padding: styles.padding,
      font: `${styles.fontSize} / ${styles.lineHeight} ${styles.fontFamily.split(',')[0]}`,
      color: styles.color,
      background: styles.backgroundColor,
      transform: styles.transform,
      overflow: styles.overflow,
      width: styles.width,
      height: styles.height,
      minHeight: styles.minHeight,
      maxWidth: styles.maxWidth,
    },
    parent: parent
      ? {
          tag: parent.tagName.toLowerCase(),
          selector: selectorFor(parent, true),
          className: typeof parent.className === 'string' ? parent.className : null,
        }
      : null,
    move: {
      ...state.delta,
      baseTransform: state.baseTransform,
      css: cssSnippet(),
    },
    capturedAt: new Date().toISOString(),
  };
}

function cssSnippet() {
  if (!state.selected) return '';
  const source = state.selection?.source;
  const header = source ? `/* ${source.relative}${source.line ? `:${source.line}` : ''} */\n` : '';
  const selector = selectorFor(state.selected, true);
  const {x, y} = state.delta;
  const base = state.baseTransform ? `${state.baseTransform} ` : '';
  return `${header}${selector} {\n  transform: ${base}translate(${x}px, ${y}px);\n}`;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function row(label, value, className = '') {
  const wrapper = document.createElement('div');
  wrapper.className = 'row';
  const labelEl = document.createElement('div');
  labelEl.className = 'row-label';
  labelEl.textContent = label;
  const valueEl = document.createElement('div');
  valueEl.className = `row-value ${className}`.trim();
  valueEl.textContent = value ?? '—';
  wrapper.append(labelEl, valueEl);
  return wrapper;
}

function section(title) {
  const wrapper = document.createElement('div');
  wrapper.className = 'section';
  const heading = document.createElement('div');
  heading.className = 'section-title';
  heading.textContent = title;
  wrapper.append(heading);
  return wrapper;
}

function chip(text) {
  const element = document.createElement('span');
  element.className = 'chip';
  element.textContent = text;
  element.title = text;
  return element;
}

function updateDeltaInputs() {
  const x = panelBody.querySelector('#delta-x');
  const y = panelBody.querySelector('#delta-y');
  if (x) x.value = String(state.delta.x);
  if (y) y.value = String(state.delta.y);
  const css = panelBody.querySelector('.source-box');
  if (css && state.selection) css.textContent = cssSnippet();
}

function renderPanel() {
  panelBody.replaceChildren();
  copyButton.disabled = !state.selection;
  copyCssButton.disabled = !state.selection;
  moveButton.disabled = !state.selection;
  resetButton.disabled = !state.selection;

  if (!state.selection) {
    panelTitle.textContent = 'Nothing selected';
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.innerHTML =
      'По умолчанию включён <b>Use</b>: приложение работает как обычно — клики, скролл, ' +
      'ввод уходят внутрь iPhone. Нажми <b>Inspect</b>, чтобы выбрать элемент: панель покажет ' +
      'селектор, компонент, файл и строку. <b>Move</b> включает перетаскивание выбранного ' +
      'элемента, <b>U</b> возвращает обычный режим.';
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.innerHTML =
      'Горячие клавиши: <kbd>U</kbd> — use, <kbd>I</kbd> — inspect, <kbd>M</kbd> — move, <kbd>R</kbd> — reset, ' +
      '<kbd>↑↓←→</kbd> — сдвиг на 1px, <kbd>Shift</kbd> + стрелки — 10px.';
    panelBody.append(empty, hint);
    return;
  }

  const selection = state.selection;
  panelTitle.textContent = selection.text || `${selection.tag}${selection.className ? `.${selection.className.split(' ')[0]}` : ''}`;

  const element = section('Element');
  element.append(
    row('selector', selection.selector, 'accent'),
    row('tag', selection.tag),
    row('classes', selection.className || '—'),
    row('role', selection.role || '—'),
    row('test id', selection.testId || '—'),
    row('text', selection.text || '—'),
  );

  const source = section('Source');
  if (selection.source) {
    const box = document.createElement('div');
    box.className = 'source-box';
    box.textContent = `${selection.source.relative}${selection.source.line ? `:${selection.source.line}` : ''}${selection.source.column ? `:${selection.source.column}` : ''}`;
    source.append(
      row('component', selection.source.component || '—'),
      row('file', selection.source.relative),
      row('line', selection.source.line ?? '—', selection.source.line ? 'good' : ''),
      row('match', selection.source.match ? `${selection.source.match}: ${selection.source.token}` : '—'),
      box,
    );
    if (selection.source.usage) {
      const usage = selection.source.usage;
      source.append(
        row('usage', `${usage.relative}${usage.line ? `:${usage.line}` : ''}`, 'accent'),
        row('used in', usage.component || '—'),
      );
    }
  } else {
    source.append(row('component', selection.componentChain.slice(0, 3).join(' → ') || '—'));
    source.append(row('file', 'not found in fiber owner'));
  }

  const chain = section('Component chain');
  const chainWrap = document.createElement('div');
  chainWrap.className = 'chain';
  for (const name of selection.componentChain) chainWrap.append(chip(name));
  chain.append(chainWrap);

  const box = section('Box');
  box.append(
    row('x / y', `${selection.rect.x} / ${selection.rect.y}`),
    row('w / h', `${selection.rect.width} × ${selection.rect.height}`),
    row('right / bottom', `${selection.rect.right} / ${selection.rect.bottom}`),
    row('viewport', `${selection.viewport.width}×${selection.viewport.height} @${selection.viewport.dpr}x`),
    row('position', selection.styles.position),
    row('z-index', selection.styles.zIndex),
  );

  const spacing = section('Typography & spacing');
  spacing.append(
    row('font', selection.styles.font),
    row('margin', selection.styles.margin),
    row('padding', selection.styles.padding),
    row('size', `${selection.styles.width} × ${selection.styles.height}`),
    row('constraints', `${selection.styles.minHeight} / ${selection.styles.maxWidth}`),
    row('color', selection.styles.color),
    row('background', selection.styles.background),
  );

  const move = section('Move preview');
  const delta = document.createElement('div');
  delta.className = 'delta';
  const xInput = document.createElement('input');
  xInput.id = 'delta-x';
  xInput.type = 'number';
  xInput.value = String(state.delta.x);
  xInput.setAttribute('aria-label', 'X offset');
  const yInput = document.createElement('input');
  yInput.id = 'delta-y';
  yInput.type = 'number';
  yInput.value = String(state.delta.y);
  yInput.setAttribute('aria-label', 'Y offset');
  const applyDelta = () => {
    state.delta.x = Number(xInput.value) || 0;
    state.delta.y = Number(yInput.value) || 0;
    applyTransform();
    drawBox(state.overlaySelect, state.selected);
    if (state.selection) {
      state.selection.move = {...state.delta, baseTransform: state.baseTransform, css: cssSnippet()};
    }
    updateDeltaInputs();
  };
  xInput.addEventListener('input', applyDelta);
  yInput.addEventListener('input', applyDelta);
  delta.append(xInput, yInput);
  const cssBox = document.createElement('div');
  cssBox.className = 'source-box';
  cssBox.textContent = cssSnippet();
  move.append(delta, cssBox);

  panelBody.append(element, source, chain, box, spacing, move);

  if (selection.parent) {
    const parent = section('Parent');
    parent.append(row('tag', selection.parent.tag), row('selector', selection.parent.selector));
    panelBody.append(parent);
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus('copied');
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    setStatus('copied (fallback)');
  }
}

/* Controls */
deviceSelect.addEventListener('change', () => setDevice(deviceSelect.value));
useButton.addEventListener('click', () => setMode('use'));
modeButton.addEventListener('click', () => setMode('inspect'));
moveButton.addEventListener('click', () => setMode(state.mode === 'move' ? 'inspect' : 'move'));
resetButton.addEventListener('click', resetMove);
reloadButton.addEventListener('click', () => {
  frame.src = `/?t=${Date.now()}`;
  setStatus('reloading…');
});
copyButton.addEventListener('click', () => {
  if (state.selection) copyText(JSON.stringify(state.selection, null, 2));
});
copyCssButton.addEventListener('click', () => {
  if (state.selected) copyText(cssSnippet());
});

document.addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  if (event.target instanceof HTMLSelectElement) return;
  if (event.key === 'u' || event.key === 'U') setMode('use');
  if (event.key === 'i' || event.key === 'I') setMode('inspect');
  if ((event.key === 'm' || event.key === 'M') && state.selection) setMode('move');
  if (event.key === 'r' || event.key === 'R') resetMove();
});
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);

frame.addEventListener('load', () => {
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) return;
  uninstall();
  install(doc, win);
});

window.addEventListener('resize', fit);
setDevice('iphone-15');
setMode('use');
fit();

window.__iphone = {
  getSelection: () => state.selection,
  getState: () => ({
    device: state.device,
    mode: state.mode,
    selection: state.selection,
    delta: {...state.delta},
  }),
  select: selector => {
    if (!state.doc) return null;
    const el = state.doc.querySelector(selector);
    if (!el) return null;
    selectElement(el);
    return state.selection;
  },
  selectAt: (x, y) => {
    if (!state.doc) return null;
    const el = state.doc.elementFromPoint(x, y);
    if (!el) return null;
    selectElement(el);
    return state.selection;
  },
  setDevice,
  setMode,
  reset: resetMove,
  reload: () => {
    frame.src = `/?t=${Date.now()}`;
  },
  frame: () => ({...device()}),
  click: selector => {
    if (!state.doc) return false;
    const el = state.doc.querySelector(selector);
    if (!el) return false;
    el.click();
    return true;
  },
};

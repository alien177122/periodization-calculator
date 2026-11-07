import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import type {CustomSplit} from '../../types';
import {EwTriggerChevron} from '../ui/EwTriggerChevron';

export interface SplitPickerProps {
  value: string;
  splits: CustomSplit[];
  onChange: (id: string) => void;
  placeholder?: string;
  menuTitle?: string;
  searchPlaceholder?: string;
  triggerId?: string;
  ariaLabel?: string;
}

function daysMeta(daysPerWeek: 2 | 3 | 4): string {
  if (daysPerWeek === 2) return '2 дня в неделю';
  if (daysPerWeek === 4) return '4 дня в неделю';
  return '3 дня в неделю';
}

function normalizeQuery(value: string): string {
  return value.trim().toLocaleLowerCase('ru-RU');
}

export function SplitPicker({
  value,
  splits,
  onChange,
  placeholder = 'Выбрать…',
  menuTitle = 'Сохранённые сплиты',
  searchPlaceholder = 'Поиск по имени или фамилии',
  triggerId,
  ariaLabel = 'Сохранённые сплиты',
}: SplitPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState({index: 0, query: '', value: ''});
  const titleId = useId();
  const menuId = `${titleId}-menu`;
  const searchId = `${titleId}-search`;
  const shellRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeSplit = splits.find(split => split.id === value);

  const filteredSplits = useMemo(() => {
    const needle = normalizeQuery(query);
    if (!needle) return splits;
    return splits.filter(split => normalizeQuery(split.name).includes(needle));
  }, [query, splits]);

  const selectedIndex = filteredSplits.findIndex(split => split.id === value);
  const activeIndex =
    activeSelection.query === query && activeSelection.value === value
      ? Math.min(activeSelection.index, Math.max(filteredSplits.length - 1, 0))
      : selectedIndex >= 0
        ? selectedIndex
        : 0;

  const setActiveIndex = useCallback(
    (next: number | ((current: number) => number)) => {
      setActiveSelection(previous => {
        const current =
          previous.query === query && previous.value === value ? previous.index : activeIndex;
        return {
          index: typeof next === 'function' ? next(current) : next,
          query,
          value,
        };
      });
    },
    [activeIndex, query, value],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveSelection({index: 0, query: '', value: ''});
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) close();
    };
    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close();
      triggerRef.current?.focus({preventScroll: true});
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus({preventScroll: true});
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function pick(id: string) {
    onChange(id);
    close();
    triggerRef.current?.focus({preventScroll: true});
  }

  function moveActive(delta: number) {
    if (filteredSplits.length === 0) return;
    setActiveIndex(current => {
      const next = (current + delta + filteredSplits.length) % filteredSplits.length;
      optionRefs.current[next]?.scrollIntoView({block: 'nearest'});
      return next;
    });
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const target = filteredSplits[activeIndex];
      if (target) pick(target.id);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      optionRefs.current[0]?.scrollIntoView({block: 'nearest'});
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      const last = filteredSplits.length - 1;
      if (last < 0) return;
      setActiveIndex(last);
      optionRefs.current[last]?.scrollIntoView({block: 'nearest'});
    }
  }

  return (
    <div ref={shellRef} className="ew-select split-picker">
      <button
        ref={triggerRef}
        id={triggerId}
        className={`ew-trigger${activeSplit ? '' : ' ew-trigger--placeholder'}`}
        onClick={() => setOpen(current => !current)}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={ariaLabel}>
        <span className="ew-trigger-copy">
          <span className="ew-trigger-name">{activeSplit?.name ?? placeholder}</span>
          {activeSplit ? (
            <span className="ew-trigger-meta">{daysMeta(activeSplit.daysPerWeek)}</span>
          ) : null}
        </span>
        <span className={`ew-trigger-icon${open ? ' is-open' : ''}`} aria-hidden="true">
          <EwTriggerChevron />
        </span>
      </button>

      <div className={`ew-menu-panel${open ? ' is-open' : ''}`} inert={!open}>
        <div className="ew-menu-panel__clip">
          <div
            id={menuId}
            className="ew-menu"
            role="listbox"
            aria-labelledby={titleId}
            aria-activedescendant={
              filteredSplits[activeIndex]
                ? `${menuId}-opt-${filteredSplits[activeIndex].id}`
                : undefined
            }
            aria-hidden={!open}>
            <div id={titleId} className="ew-menu-title">
              {menuTitle}
            </div>

            <div className="ew-search">
              <input
                ref={searchRef}
                id={searchId}
                className="ew-search__input"
                type="search"
                value={query}
                placeholder={searchPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Поиск сплита"
                aria-autocomplete="list"
                aria-controls={menuId}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>

            <div className="ew-options">
              {filteredSplits.length === 0 ? (
                <p className="ew-empty" role="status">
                  Ничего не нашлось. Создай сплит или проверь поиск.
                </p>
              ) : (
                filteredSplits.map((split, index) => {
                  const selected = split.id === value;
                  const active = index === activeIndex;
                  return (
                    <button
                      key={split.id}
                      ref={node => {
                        optionRefs.current[index] = node;
                      }}
                      id={`${menuId}-opt-${split.id}`}
                      className={`ew-option${selected ? ' is-active' : ''}${active ? ' is-focused' : ''}`}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pick(split.id)}>
                      <span
                        className="ew-option-swatch"
                        style={{'--ew-option-color': 'var(--accent, #ffb020)'} as CSSProperties}
                        aria-hidden="true"
                      />
                      <span className="ew-option-copy">
                        <strong>{split.name}</strong>
                        <span>{daysMeta(split.daysPerWeek)}</span>
                      </span>
                      {selected ? (
                        <span className="ew-option-check" aria-hidden="true">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

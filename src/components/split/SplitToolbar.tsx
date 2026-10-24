import type {CustomSplit} from '../../types';
import {SplitPicker} from './SplitPicker.tsx';

interface SplitToolbarProps {
  draft: CustomSplit;
  savedSplits: CustomSplit[];
  onNameChange: (name: string) => void;
  onSelectSplit: (id: string) => void;
  onCreateNew: () => void;
  onDuplicateLast: () => void;
  onDaysPerWeek: (days: 2 | 3 | 4) => void;
  onSave: () => void;
}

export function SplitToolbar({
  draft,
  savedSplits,
  onNameChange,
  onSelectSplit,
  onCreateNew,
  onDuplicateLast,
  onDaysPerWeek,
  onSave,
}: SplitToolbarProps) {
  return (
    <header className="app-tab-section split-toolbar">
      <div className="split-toolbar__layout">
        <div className="split-toolbar__primary">
          <div className="split-toolbar__field split-toolbar__field--grow">
            <label className="split-toolbar__label" htmlFor="split-name">
              Название сплита
            </label>
            <p className="split-toolbar__help" id="split-name-help">
              Программа внутри активного профиля. Сплиты других профилей здесь не показываются.
            </p>
            <input
              id="split-name"
              className="split-toolbar__input"
              type="text"
              maxLength={40}
              aria-describedby="split-name-help"
              placeholder="Мой сплит"
              value={draft.name}
              onChange={event => onNameChange(event.target.value)}
            />
          </div>

          <div className="split-toolbar__field">
            <span className="split-toolbar__label">Дней в неделю</span>
            <div className="split-segment" role="radiogroup" aria-label="Дней в неделю">
              {([2, 3, 4] as const).map(days => (
                <button
                  key={days}
                  type="button"
                  role="radio"
                  className="split-segment__btn"
                  aria-checked={draft.daysPerWeek === days}
                  onClick={() => onDaysPerWeek(days)}>
                  {days} дня
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="split-toolbar__secondary">
          <div className="split-toolbar__saved">
            {savedSplits.length > 0 ? (
              <div className="split-toolbar__field">
                <label className="split-toolbar__label" htmlFor="split-picker">
                  Сплиты профиля
                </label>
                <SplitPicker
                  triggerId="split-picker"
                  value={draft.id}
                  splits={savedSplits}
                  onChange={onSelectSplit}
                  placeholder="Выбрать..."
                  menuTitle="Сплиты профиля"
                  searchPlaceholder="Поиск по названию"
                />
              </div>
            ) : null}
          </div>

          <div className="split-toolbar__actions">
            <button
              type="button"
              className="split-toolbar__action split-toolbar__action--ghost"
              onClick={onCreateNew}>
              <span className="split-toolbar__action-icon" aria-hidden="true">
                +
              </span>
              <span className="split-toolbar__action-text">Новый</span>
            </button>
            <button
              type="button"
              className="split-toolbar__action split-toolbar__action--muted"
              onClick={onDuplicateLast}
              disabled={savedSplits.length === 0}>
              <span className="split-toolbar__action-text">
                <span className="split-toolbar__action-text-full">Повторить</span>
                <span className="split-toolbar__action-text-short">Повт.</span>
              </span>
            </button>
            <button
              type="button"
              className="split-toolbar__action split-toolbar__action--save"
              onClick={onSave}>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

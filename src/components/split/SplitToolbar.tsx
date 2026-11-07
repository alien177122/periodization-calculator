import type {CustomSplit} from '../../types';
import {SplitPicker} from './SplitPicker.tsx';
import {DeleteIcon} from '../ui/DeleteIcon.tsx';

interface SplitToolbarProps {
  draft: CustomSplit;
  savedSplits: CustomSplit[];
  selectedSplitId: string | null;
  onNameChange: (name: string) => void;
  onSelectSplit: (id: string) => void;
  onEditSelected: () => void;
  onDeleteSelected: () => void;
  onDaysPerWeek: (days: 2 | 3 | 4) => void;
  onDuplicateLast: () => void;
  onSave: () => void;
  onCreateNew: () => void;
}

export function SplitToolbar({
  draft,
  savedSplits,
  selectedSplitId,
  onNameChange,
  onSelectSplit,
  onEditSelected,
  onDeleteSelected,
  onDaysPerWeek,
  onDuplicateLast,
  onSave,
  onCreateNew,
}: SplitToolbarProps) {
  return (
    <header className="app-tab-section split-toolbar">
      <div className="split-toolbar__layout">
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

        <div className="split-toolbar__days">
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

        <div className="split-toolbar__splits">
          <label
            className="split-toolbar__label split-toolbar__splits-title"
            htmlFor="split-picker">
            Сплиты профиля
          </label>
          <div className="split-toolbar__split-line">
            {/* Выбранный сплит — «карточкой» в строке, как профиль в блоке «ПРОФИЛИ»:
                триггер меню растворяется в плоскости ряда, ✎/«Удалить» — на его правом краю. */}
            <div className="split-toolbar__split-inline">
              <SplitPicker
                triggerId="split-picker"
                value={draft.id}
                splits={savedSplits}
                onChange={onSelectSplit}
                placeholder="Выбрать…"
                menuTitle="Сплиты профиля"
                searchPlaceholder="Поиск по названию"
              />
              <button
                type="button"
                className="split-hub__icon-btn"
                aria-label="Редактировать выбранный сплит"
                disabled={!selectedSplitId}
                onClick={onEditSelected}>
                Ред.
              </button>
              <button
                type="button"
                className="split-hub__icon-btn"
                aria-label="Удалить выбранный сплит"
                disabled={!selectedSplitId}
                onClick={() => {
                  const selected = savedSplits.find(split => split.id === selectedSplitId);
                  if (selected && window.confirm(`Удалить сплит «${selected.name}»?`)) {
                    onDeleteSelected();
                  }
                }}>
                <DeleteIcon />
              </button>
            </div>
            <button
              type="button"
              className="split-toolbar__action split-toolbar__action--primary"
              onClick={onCreateNew}>
              <span className="split-toolbar__action-icon" aria-hidden="true">
                +
              </span>
              <span className="split-toolbar__action-text">Новый сплит</span>
            </button>
          </div>

          {/* Повторить/Сохранить — отдельный ряд действий под строкой сплита. */}
          <div className="split-toolbar__actions">
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

import type {DraftSet} from '@training/shared/hooks/useJournal';
import {JournalSetForm} from './JournalSetForm.tsx';

interface JournalSessionEditorProps {
  draftSets: DraftSet[];
  sessionNote: string;
  saving: boolean;
  hasHistory: boolean;
  isEditing: boolean;
  editingDate?: string;
  onSessionNoteChange: (value: string) => void;
  onAddSet: () => void;
  onUpdateSet: (index: number, patch: Partial<DraftSet>) => void;
  onRemoveSet: (index: number) => void;
  onSave: () => void;
  onCopyLast: () => void;
  onCancelEdit: () => void;
}

export function JournalSessionEditor({
  draftSets,
  sessionNote,
  saving,
  hasHistory,
  isEditing,
  onSessionNoteChange,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onSave,
  onCopyLast,
  onCancelEdit,
}: JournalSessionEditorProps) {
  return (
    <div className="journal-form-section">
      {draftSets.length === 0 ? (
        <p className="journal-sets-empty">
          Сначала внизу в «Тренд 1ПМ» выбери упражнение — например, жим лёжа. Затем нажми
          «Добавить подход» и записывай каждый подход.
        </p>
      ) : (
        <div className="journal-sets">
          {draftSets.map((set, index) => (
            <JournalSetForm
              key={set.id}
              index={index}
              set={set}
              onChange={patch => onUpdateSet(index, patch)}
              onRemove={() => onRemoveSet(index)}
            />
          ))}
        </div>
      )}

      <div className="journal-field journal-field--session-note">
        <label htmlFor="journal-session-note">Заметка к тренировке</label>
        <input
          id="journal-session-note"
          className="journal-input journal-input--note"
          type="text"
          lang="en"
          autoCapitalize="sentences"
          autoCorrect="on"
          spellCheck={true}
          placeholder="Самочувствие, техника, сон…"
          value={sessionNote}
          onChange={event => onSessionNoteChange(event.target.value)}
        />
      </div>

      <div className="journal-actions">
        <button type="button" className="btn btn-ghost journal-actions__add" onClick={onAddSet}>
          + Добавить подход
        </button>
        <div className="journal-actions__row">
          <button
            type="button"
            className="btn calc-test__submit journal-actions__save"
            disabled={saving}
            aria-busy={saving}
            onClick={onSave}>
            {saving ? 'Сохраняем…' : 'Сохранить запись'}
          </button>
          {isEditing ? (
            <button
              type="button"
              className="btn btn-ghost journal-actions__secondary"
              onClick={onCancelEdit}>
              Отмена
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost journal-actions__secondary"
              onClick={onCopyLast}
              disabled={!hasHistory}>
              Как в прошлую сессию
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import {useState, useEffect, startTransition, useId, useRef} from 'react';
import '../styles/tabs/journal-tab.css';
import {SplitExercisePicker} from '../components/split/SplitExercisePicker.tsx';
import {JournalProgressChart} from '../components/journal/JournalProgressChart.tsx';
import {JournalSessionEditor} from '../components/journal/JournalSessionEditor.tsx';
import {JournalSessionList} from '../components/journal/JournalSessionList.tsx';
import {useJournal} from '../hooks/useJournal.ts';
import {useURLState} from '../hooks/useURLState.ts';
import {saveUser} from '../utils/api.ts';
import type {UserData} from '../types';
import {isCatalogExerciseKey, getCatalogExercise} from '../data/exercises.ts';
import {SectionBlock, NoteBox} from '../components/SectionBlock.tsx';

interface JournalTabProps {
  userData: UserData;
  setUserData: (value: UserData) => void;
  token: string;
  onSaveError?: (message: string) => void;
}

export function JournalTab({userData, setUserData, token, onSaveError}: JournalTabProps) {
  const exerciseState = useURLState('exercise');
  const exerciseKey =
    exerciseState.value && isCatalogExerciseKey(exerciseState.value)
      ? exerciseState.value
      : 'bench';
  const exercisePickerLabelId = useId();

  const [localError, setLocalError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const handleError = (message: string) => {
    setLocalError(message);
    if (onSaveError) onSaveError(message);
  };

  const journal = useJournal({
    userData,
    exerciseKey,
    setUserData,
    saveUser,
    token,
    onSaveError: handleError,
  });

  useEffect(() => {
    if (localError && errorRef.current) {
      errorRef.current.focus();
    }
  }, [localError]);

  const {cancelEdit, editingSessionId, saving} = journal;
  useEffect(() => {
    if (editingSessionId == null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelEdit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingSessionId, cancelEdit]);

  const handleExerciseChange = (key: string) => {
    setLocalError(null);
    startTransition(() => {
      exerciseState.setValue(key);
    });
  };

  const dismissError = () => {
    if (localError) setLocalError(null);
  };

  const hasHistory = journal.history.length > 0;
  const exerciseName = getCatalogExercise(exerciseKey)?.name ?? exerciseKey;
  const editorTitle =
    editingSessionId && journal.editingSession?.date
      ? `Редактирование · ${exerciseName} · ${journal.editingSession.date}`
      : journal.draftSets.length > 0
        ? `${exerciseName} · ${journal.draftSets.length} подх.`
        : exerciseName;

  return (
    <div className="ta-shell">
      <main
        className={`ta-stack ta-stack--calc journal-tab-layout ${saving ? 'is-saving' : ''}`}
        aria-label="Журнал тренировок">
        {localError && (
          <div ref={errorRef} tabIndex={-1} className="journal-inline-error" role="alert">
            {localError}
          </div>
        )}

        {/* 01 Запись + 02 История — row on desktop, stack on mobile */}
        <div className="journal-top-row">
          <SectionBlock
            num="01"
            title={editorTitle}
            variant="apple"
            className="journal-editor-section"
            titleId="journal-editor-heading">
            <JournalSessionEditor
              draftSets={journal.draftSets}
              sessionNote={journal.sessionNote}
              saving={saving}
              isEditing={editingSessionId != null}
              editingDate={journal.editingSession?.date}
              onSessionNoteChange={value => {
                dismissError();
                journal.setSessionNote(value);
              }}
              onAddSet={() => {
                dismissError();
                journal.addDraftRow();
              }}
              onUpdateSet={(index, patch) => {
                dismissError();
                journal.updateDraftSet(index, patch);
              }}
              onRemoveSet={index => {
                dismissError();
                journal.removeDraftSet(index);
              }}
              onSave={() => {
                dismissError();
                void journal.saveSession();
              }}
              onCopyLast={journal.copyLastSession}
              onCancelEdit={() => cancelEdit()}
              hasHistory={hasHistory}
            />
          </SectionBlock>

          <SectionBlock
            num="02"
            title={hasHistory ? `История · ${journal.history.length}` : 'История'}
            variant="apple"
            className="journal-history-section"
            titleId="journal-history-heading">
            {hasHistory ? (
              <JournalSessionList
                sessions={journal.history}
                onEdit={journal.loadSessionIntoDraft}
                onDelete={id => void journal.deleteSession(id)}
              />
            ) : (
              <div className="journal-history-empty">
                <p className="journal-history-empty__text">Записей пока нет.</p>
                <p className="journal-history-empty__sub">Сохрани первый подход.</p>
              </div>
            )}
          </SectionBlock>
        </div>

        {/* Section 03: Trend and Picker */}
        <SectionBlock
          num="03"
          title="Тренд 1ПМ"
          variant="apple"
          className="journal-trend-section"
          titleId="journal-trend-title">
          <div className="journal-picker-block">
            <span id={exercisePickerLabelId} className="journal-picker-label">
              Упражнение
            </span>
            <SplitExercisePicker
              value={exerciseKey}
              onChange={handleExerciseChange}
              labelledBy={exercisePickerLabelId}
              showOneRM={false}
            />
          </div>

          <JournalProgressChart sessions={journal.history} />

          <NoteBox variant="apple">
            <p className="journal-chart-note">
              <span className="calc-test__footnote-lead">Факт в зале.</span> Сохрани подходы с
              весом и повторениями — тренд строится по твоей реальной истории тренировок, а не по
              расчётному плану калькулятора.
            </p>
          </NoteBox>
        </SectionBlock>
      </main>
    </div>
  );
}

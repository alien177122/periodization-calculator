import {useState} from 'react';
import {GlobalExerciseAdder} from '../components/split/GlobalExerciseAdder.tsx';
import '../styles/tabs/split-tab.css';
import {SplitCalculationHistory} from '../components/split/SplitCalculationHistory.tsx';
import {SplitPreview} from '../components/split/SplitPreview.tsx';
import {MuscleDayGrid} from '../components/split/MuscleDayGrid.tsx';
import {SplitCreateDialog} from '../components/split/SplitCreateDialog.tsx';
import {SplitToolbar} from '../components/split/SplitToolbar.tsx';
import {useSplitConstructor} from '../hooks/useSplitConstructor.ts';
import {useURLState} from '../hooks/useURLState.ts';
import {saveUser} from '../utils/api.ts';
import type {UserData} from '../types';

interface SplitConstructorTabProps {
  userData: UserData;
  setUserData: (value: UserData) => void;
  token: string;
  onSaveError: (message: string) => void;
}

import {SectionBlock} from '../components/SectionBlock';

export function SplitConstructorTab({
  userData,
  setUserData,
  token,
  onSaveError,
}: SplitConstructorTabProps) {
  const splitState = useURLState('split');

  const constructor = useSplitConstructor({
    userData,
    setUserData,
    saveUser,
    token,
    initialSplitId: splitState.value,
    onSplitIdChange: id => splitState.setValue(id),
    onSaveError,
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogKey, setCreateDialogKey] = useState(0);

  function handleCreateNew() {
    setCreateDialogKey(key => key + 1);
    setCreateDialogOpen(true);
  }

  function handleCreateDialogSubmit(name: string, daysPerWeek: 2 | 3 | 4) {
    setCreateDialogOpen(false);
    const days = daysPerWeek === 2 ? 2 : 3;
    constructor.createSavedSplit({name, daysPerWeek: days});
  }

  return (
    <div className="ta-shell ta-shell--split">
      <main className="ta-stack" aria-label="Конструктор сплита">
        <SectionBlock num="01" title="Название и дни" variant="apple">
          <SplitToolbar
            draft={constructor.draft}
            savedSplits={constructor.savedSplits}
            onNameChange={name => constructor.updateDraft({name})}
            onSelectSplit={constructor.selectSplit}
            onCreateNew={handleCreateNew}
            onDuplicateLast={constructor.duplicateLast}
            onDaysPerWeek={constructor.setDaysPerWeek}
            onSave={() => void constructor.saveSplit()}
          />
          <SplitCreateDialog
            key={createDialogKey}
            open={createDialogOpen}
            profileCalculationCount={constructor.calculations.length}
            rows={constructor.savedSplits.map(split => ({
              id: split.id,
              name: split.name,
              daysPerWeek: split.daysPerWeek,
              calculationCount: constructor.calculations.filter(
                entry => entry.split.id === split.id,
              ).length,
                  isActive: userData.activeSplitId === split.id,
            }))}
            onClose={() => setCreateDialogOpen(false)}
            onSelectSplit={id => {
              setCreateDialogOpen(false);
              constructor.selectSplit(id);
            }}
            onCreate={handleCreateDialogSubmit}
          />
          {constructor.validationError ? (
            <p className="split-validation" role="alert">
              {constructor.validationError}
            </p>
          ) : null}
          <SplitCalculationHistory
            calculations={constructor.calculations}
            activeId={constructor.activeCalculation?.id}
            onSelect={constructor.selectCalculation}
            onDelete={id => void constructor.deleteCalculation(id)}
          />
        </SectionBlock>

        <SectionBlock
          num="02"
          title="База упражнений"
          variant="apple"
          className="calc-test-section">
          <GlobalExerciseAdder
            savedExercises={userData.exercises}
            daysPerWeek={constructor.draft.daysPerWeek}
            onAddExercise={constructor.addExerciseToDay}
            onOneRMChange={constructor.setExerciseOneRM}
          />
        </SectionBlock>

        <SectionBlock num="03" title="Распределение по дням" variant="apple">
          <MuscleDayGrid
            split={constructor.draft}
            savedExercises={userData.exercises}
            onDuplicateExercise={constructor.duplicateExerciseToDay}
            onRemoveExercise={constructor.removeExercise}
          />
          <div className="split-calculate-container">
            <button
              type="button"
              className="btn btn-primary split-calculate-btn"
              onClick={() => void constructor.calculateSplit()}>
              {constructor.isEditingCalculation
                ? 'Пересчитать и обновить'
                : constructor.calculations.length > 0
                  ? 'Сохранить новый расчёт'
                  : 'Сохранить и рассчитать план сплита'}
            </button>
          </div>
        </SectionBlock>

        <SectionBlock num="04" title="Прогноз объёма" variant="apple">
          {constructor.activeCalculation ? (
            <SplitPreview
              split={constructor.previewSplit}
              previewWeek={constructor.previewWeek}
              dayPreviews={constructor.dayPreviews}
              onWeekChange={constructor.setPreviewWeek}
              onToggleWeekDone={constructor.toggleCompletedWeek}
              onToggleDayDone={constructor.toggleCompletedDay}
              onFixedWeightChange={constructor.setFixedWeight}
            />
          ) : null}
        </SectionBlock>
      </main>
    </div>
  );
}

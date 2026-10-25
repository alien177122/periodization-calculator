import {useState} from 'react';
import {GlobalExerciseAdder} from '../components/split/GlobalExerciseAdder.tsx';
import '../styles/tabs/split-tab.css';
import {SplitCalculationHistory} from '../components/split/SplitCalculationHistory.tsx';
import {SplitPreview} from '../components/split/SplitPreview.tsx';
import {MuscleDayGrid} from '../components/split/MuscleDayGrid.tsx';
import {SplitProfilePanel} from '../components/split/SplitProfilePanel.tsx';
import {SplitCreateDialog} from '../components/split/SplitCreateDialog.tsx';
import {SplitToolbar} from '../components/split/SplitToolbar.tsx';
import {useSplitConstructor} from '../hooks/useSplitConstructor.ts';
import {useURLState} from '../hooks/useURLState.ts';
import {saveUser} from '../utils/api.ts';
import type {UserData} from '../types';
import {SectionBlock} from '../components/SectionBlock';

interface SplitConstructorTabProps {
  userData: UserData;
  setUserData: (value: UserData) => void;
  token: string;
  onSaveError: (message: string) => void;
}

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

  const calcAnchored = Boolean(
    constructor.activeCalculation &&
    constructor.activeCalculation.id === userData.activeSplitCalculationId,
  );
  const showFirstCalcSetup =
    Boolean(constructor.selectedSplitId) &&
    constructor.calculations.length === 0 &&
    !constructor.isDraftingNewCalculation;
  const showWorkSections =
    calcAnchored || constructor.isDraftingNewCalculation || showFirstCalcSetup;
  const needsCalcPick =
    constructor.calculations.length > 0 &&
    !calcAnchored &&
    !constructor.isDraftingNewCalculation &&
    !showFirstCalcSetup;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogKey, setCreateDialogKey] = useState(0);

  function handleCreateNew() {
    setCreateDialogKey(key => key + 1);
    setCreateDialogOpen(true);
  }

  function handleCreateDialogSubmit(name: string, daysPerWeek: 2 | 3 | 4) {
    setCreateDialogOpen(false);
    constructor.createSavedSplit({name, daysPerWeek});
  }

  const editorExercises = constructor.previewExercises;

  function handleOneRMChange(
    exerciseKey: string,
    oneRM: number,
    testWeight?: number,
    testReps?: number,
    bodyWeight?: number,
  ) {
    if (calcAnchored || constructor.isDraftingNewCalculation) {
      constructor.setCalculationExerciseOneRM(exerciseKey, oneRM, testWeight, testReps, bodyWeight);
      return;
    }
    constructor.setExerciseOneRM(exerciseKey, oneRM, testWeight, testReps, bodyWeight);
  }

  const calculateLabel = constructor.isEditingCalculation
    ? 'Пересчитать и обновить'
    : constructor.calculations.length > 0
      ? 'Сохранить новый расчёт'
      : 'Сохранить и рассчитать план сплита';

  return (
    <div className="ta-shell ta-shell--split">
      <main className="ta-stack" aria-label="Конструктор сплита">
        <SectionBlock num="01" title="Профиль и сплиты" variant="apple">
          <SplitProfilePanel
            profiles={constructor.profiles}
            activeProfileId={constructor.activeProfileId}
            profileName={constructor.profileName}
            profileExercises={constructor.profileExercises}
            weightBaseOpen={constructor.weightBaseOpen}
            setWeightBaseOpen={constructor.setWeightBaseOpen}
            renameProfile={constructor.renameProfile}
            commitProfileName={constructor.commitProfileName}
            selectProfile={constructor.selectProfile}
            createProfile={constructor.createProfile}
            deleteProfileById={constructor.deleteProfileById}
            setExerciseOneRM={constructor.setExerciseOneRM}
          />

          {constructor.activeProfileId ? (
            <>
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
                    entry => (entry.splitId ?? entry.split.id) === split.id,
                  ).length,
                  isActive: constructor.selectedSplitId === split.id,
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
                activeId={userData.activeSplitCalculationId ?? undefined}
                onSelect={constructor.selectCalculation}
                onDelete={id => void constructor.deleteCalculation(id)}
              />
              {needsCalcPick ? (
                <p className="split-hub__placeholder" role="status">
                  Выберите расчёт в истории — правка упражнений и весов привязана к выбранному
                  расчёту.
                </p>
              ) : null}
            </>
          ) : (
            <p className="split-hub__placeholder">Выберите или создайте профиль</p>
          )}
        </SectionBlock>

        {showWorkSections ? (
          <>
            <SectionBlock
              num="02"
              title="База упражнений"
              variant="apple"
              className="calc-test-section">
              <GlobalExerciseAdder
                savedExercises={editorExercises}
                daysPerWeek={constructor.draft.daysPerWeek}
                onAddExercise={constructor.addExerciseToDay}
                onOneRMChange={handleOneRMChange}
              />
            </SectionBlock>

            <SectionBlock num="03" title="Распределение по дням" variant="apple">
              <MuscleDayGrid
                split={constructor.draft}
                savedExercises={editorExercises}
                onDuplicateExercise={constructor.duplicateExerciseToDay}
                onRemoveExercise={constructor.removeExercise}
              />
              <div className="split-calculate-container">
                <button
                  type="button"
                  className="btn calc-test__submit"
                  onClick={() => void constructor.calculateSplit()}>
                  {calculateLabel}
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
          </>
        ) : null}
      </main>
    </div>
  );
}

import {useState} from 'react';
import {GlobalExerciseAdder} from '../components/split/GlobalExerciseAdder.tsx';
import '../styles/tabs/split-tab.css';
import {SplitCalculationHistory} from '../components/split/SplitCalculationHistory.tsx';
import {SplitPreview} from '../components/split/SplitPreview.tsx';
import {MuscleDayGrid} from '../components/split/MuscleDayGrid.tsx';
import {SplitCreateDialog} from '../components/split/SplitCreateDialog.tsx';
import {ProfileWeightBaseSheet} from '../components/split/ProfileWeightBaseSheet.tsx';
import {Button} from '../components/ui/Button.tsx';
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
    constructor.calculationsForSelectedSplit.length === 0 &&
    !constructor.isDraftingNewCalculation;
  const showWorkSections =
    calcAnchored ||
    constructor.isDraftingNewCalculation ||
    showFirstCalcSetup ||
    constructor.isDraftingNewSplit;
  const needsCalcPick =
    constructor.calculations.length > 0 &&
    !calcAnchored &&
    !constructor.isDraftingNewCalculation &&
    !showFirstCalcSetup &&
    !constructor.isDraftingNewSplit;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogKey, setCreateDialogKey] = useState(0);
  const [showDayGrid, setShowDayGrid] = useState(false);

  function handleCreateNew() {
    setCreateDialogKey(key => key + 1);
    setCreateDialogOpen(true);
  }

  const editorExercises = constructor.previewExercises;

  const handleOneRMChange = (
    exerciseKey: string,
    oneRM: number,
    testWeight?: number,
    testReps?: number,
    bodyWeight?: number,
  ) => {
    if (calcAnchored || constructor.isDraftingNewCalculation) {
      constructor.setCalculationExerciseOneRM(exerciseKey, oneRM, testWeight, testReps, bodyWeight);
      return;
    }
    constructor.setExerciseOneRM(exerciseKey, oneRM, testWeight, testReps, bodyWeight);
  };

  const calculateLabel = constructor.isEditingCalculation
    ? 'Пересчитать и обновить'
    : constructor.calculations.length > 0
      ? 'Сохранить новый расчёт'
      : 'Сохранить и рассчитать план';

  return (
    <div className="ta-shell ta-shell--split">
      <main className="ta-stack" aria-label="Конструктор расчёта">
        <SectionBlock num="01" title="База силовых" variant="apple">
          <div className="split-hub split-hub--profile-only">
            <div className="split-hub__cta">
              <Button
                type="button"
                className="calc-test__submit split-hub__add"
                onClick={() => constructor.setWeightBaseOpen(true)}>
                База силовых профиля
              </Button>
              <p className="split-hub__cta-hint">
                Дефолтные веса для новых расчётов.
              </p>
            </div>
            <ProfileWeightBaseSheet
              open={constructor.weightBaseOpen}
              profileLabel="профиля"
              savedExercises={constructor.profileExercises}
              onClose={() => constructor.setWeightBaseOpen(false)}
              onOneRMChange={constructor.setExerciseOneRM}
            />
          </div>
        </SectionBlock>

        <SectionBlock num="02" title="Расчёты" variant="apple">
          <div className="split-calculations-panel">
            <div className="split-calculations-panel__head">
              <p className="split-calculations-panel__hint">
                Расчёт — это сплит с посчитанными весами и прогнозом на 8 недель.
              </p>
              <Button type="button" onClick={handleCreateNew}>
                + Добавить расчёт
              </Button>
            </div>
            <SplitCalculationHistory
              calculations={constructor.calculations}
              activeId={userData.activeSplitCalculationId ?? undefined}
              onSelect={constructor.selectCalculation}
              onDelete={id => void constructor.deleteCalculation(id)}
            />
            {constructor.calculations.length === 0 ? (
              <p className="split-hub__placeholder">
                Пока нет расчётов. Нажми «Добавить расчёт» и заполни веса.
              </p>
            ) : null}
            {needsCalcPick ? (
              <p className="split-hub__placeholder" role="status">
                Выбери расчёт в списке — правка упражнений и весов привязана к нему.
              </p>
            ) : null}
          </div>
        </SectionBlock>

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
          onCreate={(name, daysPerWeek, presetId) =>
            constructor.createSavedSplit({name, daysPerWeek, presetId})}
        />

        {showWorkSections ? (
          <>
            <SectionBlock num="03" title="База упражнений" variant="apple" className="calc-test-section">
              <div className="split-days-inline">
                <span className="split-days-inline__label">Дней в неделю</span>
                <div className="split-segment" role="radiogroup" aria-label="Дней в неделю">
                  {([2, 3, 4] as const).map(days => (
                    <button
                      key={days}
                      type="button"
                      role="radio"
                      className="split-segment__btn"
                      aria-checked={constructor.draft.daysPerWeek === days}
                      onClick={() => constructor.setDaysPerWeek(days)}>
                      {days} дня
                    </button>
                  ))}
                </div>
              </div>
              <GlobalExerciseAdder
                savedExercises={editorExercises}
                daysPerWeek={constructor.draft.daysPerWeek}
                onAddExercise={constructor.addExerciseToDay}
                onPairExercise={(a, b, day) => constructor.setExercisePair(a, day, b)}
                onOneRMChange={handleOneRMChange}
              />
            </SectionBlock>

            <SectionBlock num="04" title="Распределение по дням" variant="apple">
              <button
                type="button"
                className="split-days-toggle"
                onClick={() => setShowDayGrid(v => !v)}
                aria-expanded={showDayGrid}>
                {showDayGrid ? 'Скрыть схему по дням' : 'Показать схему по дням'}
              </button>
              {showDayGrid ? (
                <MuscleDayGrid
                  split={constructor.draft}
                  savedExercises={editorExercises}
                  onDuplicateExercise={constructor.duplicateExerciseToDay}
                  onRemoveExercise={constructor.removeExercise}
                />
              ) : null}
              <div className="split-calculate-container">
                <button
                  type="button"
                  className="btn calc-test__submit"
                  onClick={() => void constructor.calculateSplit()}>
                  {calculateLabel}
                </button>
              </div>
            </SectionBlock>

            <SectionBlock num="05" title="Прогноз объёма" variant="apple">
              {constructor.activeCalculation ? (
                <SplitPreview
                  split={constructor.previewSplit}
                  previewWeek={constructor.previewWeek}
                  dayPreviews={constructor.dayPreviews}
                  onWeekChange={constructor.setPreviewWeek}
                  onToggleWeekDone={constructor.toggleCompletedWeek}
                  onToggleDayDone={constructor.toggleCompletedDay}
                  onFixedWeightChange={constructor.setFixedWeight}
                  onSetModeChange={(day, blockId, mode, cluster) =>
                    constructor.setBlockSetMode(day, blockId, mode, cluster)
                  }
                />
              ) : null}
            </SectionBlock>
          </>
        ) : null}
      </main>
    </div>
  );
}
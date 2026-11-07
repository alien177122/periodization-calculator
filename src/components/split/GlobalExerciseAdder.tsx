import {useState, useMemo} from 'react';
import {CATALOG_EXERCISES} from '@training/shared/data/exercises';
import {calc1RM} from '@training/shared/utils/calc';
import {PremiumInput} from '../ui/PremiumInput.tsx';
import {SplitExercisePicker} from './SplitExercisePicker.tsx';
import type {SavedExercise} from '../../types';

interface GlobalExerciseAdderProps {
  savedExercises: SavedExercise[];
  daysPerWeek: 2 | 3 | 4;
  onAddExercise: (exerciseKey: string, dayNumber: 1 | 2 | 3 | 4) => void;
  /** Profile strength base: hide day targets, only persist 1RM. */
  profileBaseOnly?: boolean;
  onOneRMChange: (
    exerciseKey: string,
    oneRM: number,
    testWeight: number,
    testReps: number,
    bodyWeight?: number,
  ) => void;
}

export function GlobalExerciseAdder({
  savedExercises,
  daysPerWeek,
  onAddExercise,
  onOneRMChange,
  profileBaseOnly = false,
}: GlobalExerciseAdderProps) {
  const [selectedKey, setSelectedKey] = useState<string>('');
  // bodyWeight exercises: body weight + extra weight
  const [bwValue, setBwValue] = useState<string>('');
  const [extraValue, setExtraValue] = useState<string>('');
  // regular exercises: test weight
  const [weightValue, setWeightValue] = useState<string>('');
  // shared: reps to failure
  const [repsValue, setRepsValue] = useState<string>('');

  // touched states for blur validation
  const [touchedBw, setTouchedBw] = useState<boolean>(false);
  const [touchedWeight, setTouchedWeight] = useState<boolean>(false);
  const [touchedReps, setTouchedReps] = useState<boolean>(false);

  // track user modifications to avoid recalculating 1RM on pure adds
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const handleBwChange = (val: string) => {
    setBwValue(val);
    setIsDirty(true);
  };
  const handleExtraChange = (val: string) => {
    setExtraValue(val);
    setIsDirty(true);
  };
  const handleWeightChange = (val: string) => {
    setWeightValue(val);
    setIsDirty(true);
  };
  const handleRepsChange = (val: string) => {
    setRepsValue(val);
    setIsDirty(true);
  };

  const savedByKey = useMemo(
    () => new Map(savedExercises.map(saved => [saved.exerciseKey, saved])),
    [savedExercises],
  );

  const selectedExercise = CATALOG_EXERCISES[selectedKey];
  const isBodyWeightLift = selectedExercise?.usesBodyWeight || selectedExercise?.isPullup;

  const [prevSelectedKey, setPrevSelectedKey] = useState<string>('');

  if (selectedKey !== prevSelectedKey) {
    setPrevSelectedKey(selectedKey);
    setTouchedBw(false);
    setTouchedWeight(false);
    setTouchedReps(false);
    setIsDirty(false);

    if (!selectedKey) {
      setBwValue('');
      setExtraValue('');
      setWeightValue('');
      setRepsValue('');
    } else {
      const saved = savedByKey.get(selectedKey);
      const isBw =
        CATALOG_EXERCISES[selectedKey]?.usesBodyWeight || CATALOG_EXERCISES[selectedKey]?.isPullup;
      if (isBw) {
        setBwValue(saved?.bodyWeight ? String(saved.bodyWeight) : '');
        if (saved?.bodyWeight && saved.testWeight && saved.testWeight > saved.bodyWeight) {
          setExtraValue(String(Math.round((saved.testWeight - saved.bodyWeight) * 10) / 10));
        } else {
          setExtraValue('');
        }
        setWeightValue('');
      } else {
        setWeightValue(saved?.testWeight ? String(saved.testWeight) : '');
        setBwValue('');
        setExtraValue('');
      }
      setRepsValue(saved?.testReps ? String(saved.testReps) : '');
    }
  }

  const bwError = useMemo(() => {
    if (!touchedBw) return undefined;
    const bw = parseFloat(bwValue.replace(',', '.'));
    if (bwValue === '' || !Number.isFinite(bw) || bw <= 0) {
      return 'Введи свой вес в кг';
    }
    return undefined;
  }, [bwValue, touchedBw]);

  const weightError = useMemo(() => {
    if (!touchedWeight) return undefined;
    const w = parseFloat(weightValue.replace(',', '.'));
    if (weightValue === '' || !Number.isFinite(w) || w <= 0) {
      return 'Введи вес в кг';
    }
    return undefined;
  }, [weightValue, touchedWeight]);

  const repsError = useMemo(() => {
    if (!touchedReps) return undefined;
    const reps = parseFloat(repsValue.replace(',', '.'));
    if (
      repsValue === '' ||
      !Number.isFinite(reps) ||
      reps < 1 ||
      reps > 30 ||
      !Number.isInteger(reps)
    ) {
      return 'Введи количество повторений';
    }
    return undefined;
  }, [repsValue, touchedReps]);

  const hasValidInput = useMemo(() => {
    if (!selectedKey) return false;
    const reps = parseFloat(repsValue.replace(',', '.'));
    if (!Number.isFinite(reps) || reps < 1 || reps > 30 || !Number.isInteger(reps)) return false;

    if (isBodyWeightLift) {
      const bw = parseFloat(bwValue.replace(',', '.'));
      return Number.isFinite(bw) && bw > 0;
    } else {
      const w = parseFloat(weightValue.replace(',', '.'));
      return Number.isFinite(w) && w > 0;
    }
  }, [selectedKey, isBodyWeightLift, bwValue, weightValue, repsValue]);

  const calculatedWeight = useMemo(() => {
    if (!hasValidInput) return {oneRM: 0};
    const reps = parseFloat(repsValue.replace(',', '.')) || 1;

    if (isBodyWeightLift) {
      const bw = parseFloat(bwValue.replace(',', '.')) || 0;
      const extra = parseFloat(extraValue.replace(',', '.')) || 0;
      const total = bw + extra;
      const oneRM = Math.round(calc1RM(total, reps) * 10) / 10;
      return {oneRM, bodyWeight: bw};
    } else {
      const w = parseFloat(weightValue.replace(',', '.')) || 0;
      const oneRM = Math.round(calc1RM(w, reps) * 10) / 10;
      return {oneRM};
    }
  }, [hasValidInput, isBodyWeightLift, bwValue, extraValue, weightValue, repsValue]);

  const hasOneRm = hasValidInput && calculatedWeight.oneRM > 0;

  function persistOneRm() {
    if (!hasValidInput || !selectedKey) return;
    const {oneRM, bodyWeight} = calculatedWeight;
    const reps = parseInt(repsValue.replace(',', '.'), 10) || 1;
    let testWeight = 0;
    if (isBodyWeightLift) {
      const bw = parseFloat(bwValue.replace(',', '.')) || 0;
      const extra = parseFloat(extraValue.replace(',', '.')) || 0;
      testWeight = bw + extra;
    } else {
      testWeight = parseFloat(weightValue.replace(',', '.')) || 0;
    }
    onOneRMChange(selectedKey, oneRM, testWeight, reps, bodyWeight);
    setIsDirty(false);
  }

  function handleAdd(dayNumber: 1 | 2 | 3 | 4) {
    if (!hasValidInput || !selectedKey) return;
    if (isDirty) persistOneRm();
    onAddExercise(selectedKey, dayNumber);
  }

  return (
    <section className="app-tab-section global-exercise-adder">
      <div className="app-tab-section__head">
        <h2 className="app-tab-section__title">Добавить упражнение</h2>
      </div>

      <div className="global-exercise-adder__layout">
        <div className="global-exercise-adder__picker">
          <div className="calc-test">
            <div className="calc-test__exercise">
              <span id="global-exercise-picker-label" className="calc-test__label">
                Упражнение
              </span>
              <SplitExercisePicker
                value={selectedKey}
                onChange={setSelectedKey}
                savedExercises={savedExercises}
                labelledBy="global-exercise-picker-label"
              />
            </div>
          </div>
        </div>

        {selectedKey && (
          <div className="global-exercise-adder__weight-and-actions">
            <div className="global-exercise-adder__weight">
              {isBodyWeightLift ? (
                <>
                  <PremiumInput
                    id="global-bw-input"
                    className="split-one-rm-input"
                    variant="stepper"
                    label="Вес тела"
                    type="number"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="80"
                    unit="кг"
                    step={selectedExercise.step}
                    value={bwValue}
                    onValueChange={handleBwChange}
                    error={bwError}
                    onBlur={() => setTouchedBw(true)}
                  />
                  <PremiumInput
                    id="global-extra-input"
                    className="split-one-rm-input"
                    variant="stepper"
                    label="Доп. вес"
                    type="number"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    unit="кг"
                    step={selectedExercise.step}
                    value={extraValue}
                    onValueChange={handleExtraChange}
                  />
                </>
              ) : (
                <PremiumInput
                  id="global-weight-input"
                  className="split-one-rm-input"
                  variant="stepper"
                  label="Вес"
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="—"
                  unit="кг"
                  step={selectedExercise.step}
                  min={selectedExercise.step}
                  value={weightValue}
                  onValueChange={handleWeightChange}
                  error={weightError}
                  onBlur={() => setTouchedWeight(true)}
                />
              )}
              {/* Reps to failure — same as Calculator */}
              <PremiumInput
                id="global-reps-input"
                className="split-one-rm-input"
                variant="stepper"
                label="Повторений"
                type="number"
                inputMode="numeric"
                autoComplete="off"
                placeholder="6"
                step={1}
                min={1}
                value={repsValue}
                onValueChange={handleRepsChange}
                error={repsError}
                onBlur={() => setTouchedReps(true)}
              />

              {/* OneRMDisplay — расчётный 1ПМ (read-only, matches PremiumInput stepper) */}
              <div className="pi-group one-rm-display">
                <span className="pi-label one-rm-display__label">Расчётный 1ПМ</span>
                <div
                  className={`pi-wrapper one-rm-display__card${hasOneRm ? '' : ' one-rm-display__card--empty'}`}
                  aria-live="polite"
                  aria-atomic="true">
                  <div className="one-rm-display__value-container">
                    <span
                      key={hasOneRm ? calculatedWeight.oneRM : 'empty'}
                      className={`one-rm-display__value${hasOneRm ? '' : ' one-rm-display__value--empty'}`}>
                      {hasOneRm ? calculatedWeight.oneRM : '—'}
                    </span>
                  </div>
                  <span className="pi-unit one-rm-display__unit" aria-hidden="true">
                    кг
                  </span>
                </div>
                <p className="pi-message pi-message--helper one-rm-display__formula">
                  {hasOneRm ? 'По формуле Эпли' : 'Введи вес и повторения'}
                </p>
              </div>
            </div>

            <div className="global-exercise-adder__actions">
              {profileBaseOnly ? (
                <button
                  type="button"
                  className="btn calc-test__submit split-hub__add"
                  disabled={!hasValidInput}
                  onClick={persistOneRm}>
                  Сохранить в базу профиля
                </button>
              ) : (
                <>
                  <span className="split-toolbar__label">Добавить в день:</span>
                  <div className="global-exercise-adder__buttons">
                    {([1, 2, 3, 4] as const).slice(0, daysPerWeek).map(dayNumber => (
                      <button
                        key={dayNumber}
                        type="button"
                        className="split-toolbar__action split-toolbar__action--ghost"
                        disabled={!hasValidInput}
                        onClick={() => handleAdd(dayNumber)}>
                        День {dayNumber}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

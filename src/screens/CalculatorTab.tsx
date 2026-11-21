import {useEffect, useMemo, useRef, useState} from 'react';
import type {ProgramSettings, SavedExercise, UserData} from '../types';
import type {
  BillingStatus,
  CalculationHistoryItem,
} from '@training/shared/types/billing';
import {EXERCISES, EX_COUNT, TYPE_LABELS} from '../data/exercises';
import {calcWorkingWeight} from '../utils/calc';
import {
  applyProgressionPresetToPercent,
  applyProgressionPresetToScheme,
} from '@training/shared/program/progressionPresets';
import PeriodizationChart from '../components/PeriodizationChart';
import VolumeDonut from '../components/VolumeDonutLazy';
import {ExerciseDossier} from '../components/calculator/ExerciseDossier';
import {TestApproachSection} from '../components/calculator/TestApproachSection';
import {LockedCalculationResult} from '../components/calculator/LockedCalculationResult';
import {BillingPanel} from '../components/billing/BillingPanel';
import {PlateDiagram} from '../components/PlateDiagram';
import {SectionBlock, NoteBox} from '../components/SectionBlock';

import {Button} from '../components/ui/Button';
import {ResultCard} from '../components/ui/ResultCard';
import {useKeyboardAvoid} from '../hooks/useKeyboardAvoid';
import {getCalculationHistory} from '../utils/api';

export interface CalculatorTabProps {
  userData: UserData;
  programSettings: ProgramSettings;
  token: string;
  billingStatus: BillingStatus | null;
  billingLoading: boolean;
  billingError?: string | null;
  billingPolling: boolean;
  checkoutDisabled?: boolean;
  onCheckout: () => void;
  onRefreshBilling: () => void;
  selectedExercise: string;
  selectExercise: (key: string) => void;
  testWeight: string;
  setTestWeight: (value: string) => void;
  testBodyWeight: string;
  setTestBodyWeight: (value: string) => void;
  testExtraWeight: string;
  setTestExtraWeight: (value: string) => void;
  testReps: string;
  setTestReps: (value: string) => void;
  activeResult: SavedExercise | null;
  isCalculating?: boolean;
  calculateError?: string | null;
  pendingLockedResult?: boolean;
  handleCalculate: () => void;
  handleDelete: (key: string) => void;
  handleSelectSaved: (saved: SavedExercise) => void;
}

export default function CalculatorTab({
  userData,
  programSettings,
  token,
  billingStatus,
  billingLoading,
  billingError = null,
  billingPolling,
  checkoutDisabled = false,
  onCheckout,
  onRefreshBilling,
  selectedExercise,
  selectExercise,
  testWeight,
  setTestWeight,
  testBodyWeight,
  setTestBodyWeight,
  testExtraWeight,
  setTestExtraWeight,
  testReps,
  setTestReps,
  activeResult,
  isCalculating = false,
  calculateError = null,
  pendingLockedResult = false,
  handleCalculate,
  handleDelete,
  handleSelectSaved,
}: CalculatorTabProps) {
  const config = EXERCISES[activeResult?.exerciseKey || selectedExercise];
  const {keyboardHeight} = useKeyboardAvoid();
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);

  useEffect(() => {
    if (!token) return;
    void getCalculationHistory(token)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [token, userData.exercises.length, pendingLockedResult, activeResult?.exerciseKey]);

  const showResult = activeResult && !pendingLockedResult;

  return (
    <div className="ta-shell">
      <div className="ta-stack ta-stack--calc">
        <BillingPanel
          status={billingStatus}
          loading={billingLoading}
          errorMessage={billingError}
          isPolling={billingPolling}
          checkoutDisabled={checkoutDisabled}
          onCheckout={onCheckout}
          onRefresh={onRefreshBilling}
        />

        <TestApproachSection
          userData={userData}
          selectedExercise={selectedExercise}
          selectExercise={selectExercise}
          testWeight={testWeight}
          setTestWeight={setTestWeight}
          testBodyWeight={testBodyWeight}
          setTestBodyWeight={setTestBodyWeight}
          testExtraWeight={testExtraWeight}
          setTestExtraWeight={setTestExtraWeight}
          testReps={testReps}
          setTestReps={setTestReps}
          keyboardInsetPx={keyboardHeight}
          onCalculate={handleCalculate}
          isCalculating={isCalculating}
          calculateError={calculateError}
          freeRemaining={billingStatus?.premium ? null : (billingStatus?.remaining ?? null)}
          billingPremium={billingStatus?.premium ?? false}
        />

        {pendingLockedResult ? (
          <LockedCalculationResult onCheckout={onCheckout} checkoutDisabled={checkoutDisabled} />
        ) : null}

        {showResult && config ? (
          <CalculatorResultSection
            config={config}
            activeResult={activeResult}
            programSettings={programSettings}
          />
        ) : null}

        {userData.exercises.some(saved => EXERCISES[saved.exerciseKey]) ? (
          <SectionBlock
            num="03"
            title={`Сохранённые (${userData.exercises.filter(saved => EXERCISES[saved.exerciseKey]).length}/${EX_COUNT})`}
            variant="apple">
            <div className="ta-calc-saved-list">
              {userData.exercises.map(saved => {
                const ex = EXERCISES[saved.exerciseKey];
                if (!ex) return null;
                const isActive = activeResult?.exerciseKey === saved.exerciseKey;
                return (
                  <div
                    key={saved.exerciseKey}
                    className={`ta-calc-saved-card${isActive ? ' is-active' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => handleSelectSaved(saved)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectSaved(saved);
                      }
                    }}>
                    <div>
                      <div className="ta-calc-saved-card__name">{ex.name}</div>
                      <div className="ta-calc-saved-card__meta">
                        {saved.testWeight} кг × {saved.testReps} повт · {saved.date}
                      </div>
                    </div>
                    <div className="ta-calc-saved-card__actions">
                      <span className="ta-calc-saved-card__one-rm">{saved.oneRM} кг</span>
                      <Button
                        size="sm"
                        variant="danger"
                        aria-label={`Удалить ${ex.name}`}
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(saved.exerciseKey);
                        }}>
                        <span aria-hidden="true">×</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionBlock>
        ) : null}

        {history.length > 0 ? (
          <SectionBlock num="05" title="История расчётов" variant="apple">
            <ul className="ta-calc-history-list">
              {history.map(item => {
                const ex = EXERCISES[item.exerciseKey];
                if (!ex) return null;
                return (
                  <li key={item.id} className="ta-calc-history-list__item">
                    <span className="ta-calc-history-list__name">{ex.name}</span>
                    <span className="ta-calc-history-list__meta">
                      {item.testWeight} кг × {item.testReps} → {item.oneRM} кг
                    </span>
                  </li>
                );
              })}
            </ul>
          </SectionBlock>
        ) : null}

        <SectionBlock num="04" title="Распределение объёма" variant="apple">
          <VolumeDonut />
        </SectionBlock>

        <SectionBlock num="05" title="Карта стимула по мышцам" variant="apple">
          <ExerciseDossier selectedExercise={selectedExercise} />
        </SectionBlock>
      </div>
    </div>
  );
}

function CalculatorResultSection({
  config,
  activeResult,
  programSettings,
}: {
  config: NonNullable<(typeof EXERCISES)[string]>;
  activeResult: SavedExercise;
  programSettings: ProgramSettings;
}) {
  const resultRef = useRef<HTMLDivElement>(null);
  const activeKey = activeResult.exerciseKey;
  const shouldReduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!activeKey || !resultRef.current) return;
    resultRef.current.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }, [activeKey, shouldReduceMotion]);

  const weekRows = useMemo(
    () =>
      config.percentages.map((pct, i) => {
        const schemeBase = config.weekSchemes[i];
        const pctAdj = applyProgressionPresetToPercent(pct, programSettings.progressionPreset);
        const scheme = applyProgressionPresetToScheme(
          schemeBase.sets,
          schemeBase.reps,
          programSettings.progressionPreset,
        );
        const weight = calcWorkingWeight(activeResult.oneRM, pctAdj, config);
        return {weight, scheme, totalReps: scheme.sets * scheme.reps};
      }),
    [activeResult.oneRM, config, programSettings.progressionPreset],
  );
  const w1 = weekRows[0];
  const w8 = weekRows[weekRows.length - 1];

  return (
    <div ref={resultRef}>
      <SectionBlock num="02" title={`Прогрессия — ${config.name}`} variant="apple">
        <div className="insight">
          <strong>Объём снижается по мере роста весов</strong> — линейная волна с откатом на неделе
          5.
          {w1 && w8 && (
            <>
              <br />
              <br />
              Нед 1:{' '}
              <code>
                {w1.weight} кг · {w1.scheme.sets}×{w1.scheme.reps} = {w1.totalReps} повт
              </code>
              {' → '}
              Нед 8:{' '}
              <code>
                {w8.weight} кг · {w8.scheme.sets}×{w8.scheme.reps} = {w8.totalReps} повт
              </code>
              {'. Вес +'}
              <strong>{Math.round((w8.weight / w1.weight - 1) * 100)}%</strong>
              {', объём '}
              {w1.totalReps > w8.totalReps ? (
                <>
                  упал в <strong>{(w1.totalReps / w8.totalReps).toFixed(1)}×</strong>
                </>
              ) : (
                <>стабилен</>
              )}
              .
            </>
          )}
        </div>

        <ResultCard
          oneRM={activeResult.oneRM}
          ariaLabel={`Расчётный максимум ${activeResult.oneRM} кг. Тест ${activeResult.testWeight} кг на ${activeResult.testReps} повторений. ${TYPE_LABELS[config.type]}. Шаг ${config.step} кг. ${activeResult.date}.`}
          chips={[
            `Тест: ${activeResult.testWeight} кг × ${activeResult.testReps} повт`,
            TYPE_LABELS[config.type],
            `Шаг: ${config.step} кг`,
            activeResult.date,
          ]}
        />

        {!config.usesBodyWeight &&
        !config.isPullup &&
        (config.type === 'A' || config.type === 'B') ? (
          <PlateDiagram
            weight={activeResult.testWeight}
            barWeight={config.type === 'B' ? 10 : 20}
          />
        ) : null}

        <PeriodizationChart config={config} result={activeResult} />

        <NoteBox variant="apple">
          <strong>↺ Нед 5 — волновой откат:</strong> вес снижается, объём восстанавливается.
          &nbsp;·&nbsp; <strong>Жирный</strong> в «Схема» = отклонение от 4 подходов.
          <br />
          <br />
          <strong>Цвет объёма:</strong> <span className="vol-legend--high">оранжевый ≥28</span>
          &nbsp;·&nbsp;
          <span className="vol-legend--mid">серый 17–27</span>&nbsp;·&nbsp;
          <span className="vol-legend--low">красный ≤16</span>
        </NoteBox>
      </SectionBlock>
    </div>
  );
}

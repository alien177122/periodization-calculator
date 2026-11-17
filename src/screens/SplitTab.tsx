import {lazy, Suspense} from 'react';
import {useURLState} from '../hooks/useURLState';
import {TabPanelFallback} from '../components/app/TabPanelFallback';
import '../styles/components/split/split-mode.css';
import type {ProgramSettings, UserData} from '../types';
import type {CalculatorTabProps} from './CalculatorTab';

const TrainingTabContainer = lazy(() => import('../components/app/TrainingTabContainer'));
const SplitConstructorTab = lazy(() =>
  import('./SplitConstructorTab').then(module => ({default: module.SplitConstructorTab})),
);
const CalculatorTab = lazy(() =>
  import('./CalculatorTab').then(module => ({default: module.default})),
);

type SplitView = 'program' | 'constructor' | 'breakdown';

interface SplitTabProps {
  userData: UserData;
  token: string;
  setUserData: (value: UserData) => void;
  setTrainingUserData: (value: UserData | null) => void;
  onSaveError: (message: string) => void;
  onGoCalculator: () => void;
  programSubtitle?: string;
  programSettings: ProgramSettings;
  calculator: Omit<CalculatorTabProps, 'userData' | 'programSettings'>;
}

export function SplitTab({
  userData,
  token,
  setUserData,
  setTrainingUserData,
  onSaveError,
  onGoCalculator,
  programSubtitle,
  programSettings,
  calculator,
}: SplitTabProps) {
  const viewState = useURLState<SplitView>('view');
  const view: SplitView =
    viewState.value === 'constructor' || viewState.value === 'breakdown'
      ? (viewState.value as SplitView)
      : 'program';

  const calcProps = {...calculator, userData, programSettings};

  // «Программа» упразднена как отдельная вкладка (2026-11-16): по умолчанию
  // показывается выполнение программы; «Разбор» и «Конструктор» — кнопки сверху.
  const isProgram = view === 'program';

  return (
    <div className="split-tab">
      {!isProgram ? (
        <div className="split-mode-switch split-mode-switch--compact">
          <button
            type="button"
            className="split-mode-switch__btn is-active"
            onClick={() => viewState.setValue('program')}>
            ← К программе
          </button>
        </div>
      ) : (
        <div className="split-mode-switch split-mode-switch--compact">
          <button
            type="button"
            className="split-mode-switch__btn"
            onClick={() => viewState.setValue('breakdown')}>
            Разбор
          </button>
          <button
            type="button"
            className="split-mode-switch__btn"
            onClick={() => viewState.setValue('constructor')}>
            Конструктор
          </button>
        </div>
      )}

      <div
        id="split-mode-panel"
        className="split-tab__body"
        role="tabpanel">
        <Suspense fallback={<TabPanelFallback tab="split" />}>
          {isProgram ? (
            <TrainingTabContainer
              userData={userData}
              token={token}
              setUserData={setTrainingUserData}
              onGoCalculator={onGoCalculator}
              programSubtitle={programSubtitle}
            />
          ) : view === 'breakdown' ? (
            <CalculatorTab {...calcProps} />
          ) : (
            <SplitConstructorTab
              userData={userData}
              setUserData={setUserData}
              token={token}
              onSaveError={onSaveError}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
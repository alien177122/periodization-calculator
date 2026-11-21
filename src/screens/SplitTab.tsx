import {lazy, Suspense, useEffect} from 'react';
import {useURLState, navigateSearch} from '../hooks/useURLState';
import {TabPanelFallback} from '../components/app/TabPanelFallback';
import '../styles/tabs/split-tab.css';
import '../styles/components/training/training-nav.css';
import type {ProgramSettings, UserData} from '../types';
import type {CalculatorTabProps} from './CalculatorTab';
import {TrainingPageHeader} from '../components/training/hub/TrainingPageHeader';

const TrainingTabContainer = lazy(() => import('../components/app/TrainingTabContainer'));
const SplitConstructorTab = lazy(() =>
  import('./SplitConstructorTab').then(module => ({default: module.SplitConstructorTab})),
);
const CalculatorTab = lazy(() =>
  import('./CalculatorTab').then(module => ({default: module.default})),
);
const TrainingMenu = lazy(() =>
  import('../components/training/hub/TrainingMenu').then(module => ({default: module.TrainingMenu})),
);
const StrengthBasePage = lazy(() =>
  import('../components/training/hub/StrengthBasePage').then(module => ({default: module.StrengthBasePage})),
);
const CalculationsPage = lazy(() =>
  import('../components/training/hub/CalculationsPage').then(module => ({default: module.CalculationsPage})),
);

type SplitView = 'program' | 'menu' | 'base' | 'calculations' | 'constructor' | 'breakdown';

function normalizeView(value: string | null): SplitView {
  if (value === 'menu' || value === 'base' || value === 'calculations' || value === 'constructor' || value === 'breakdown') {
    return value;
  }
  return 'program';
}

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
  const view = normalizeView(viewState.value);

  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'instant' as ScrollBehavior});
  }, [view]);

  const go = (next: SplitView) => {
    navigateSearch({view: next === 'program' ? null : next});
  };

  const activeCalculation = (userData.splitCalculations ?? []).find(
    c => c.id === userData.activeSplitCalculationId,
  );
  const activeSplit = (userData.splits ?? []).find(s => s.id === userData.activeSplitId);
  const workoutName = activeCalculation?.split.name ?? activeSplit?.name ?? 'Стандартный расчёт';

  const headerConfig: Record<SplitView, {title: string; backLabel: string; onBack: () => void}> = {
    program: {title: workoutName, backLabel: 'Меню', onBack: () => go('menu')},
    menu: {title: 'Тренировка', backLabel: 'Назад', onBack: () => go('program')},
    base: {title: 'База силовых', backLabel: 'Назад', onBack: () => go('menu')},
    calculations: {title: 'Расчёты', backLabel: 'Назад', onBack: () => go('menu')},
    constructor: {title: 'Конструктор расчёта', backLabel: 'Назад', onBack: () => go('calculations')},
    breakdown: {title: 'Разбор', backLabel: 'Назад', onBack: () => go('program')},
  };
  const cfg = headerConfig[view];

  const calcProps = {...calculator, userData, programSettings};

  return (
    <div className="split-tab">
      <TrainingPageHeader
        title={cfg.title}
        backLabel={cfg.backLabel}
        onBack={cfg.onBack}
      />

      <div
        key={view}
        className="training-page-view training-page-view--forward">
        <Suspense fallback={<TabPanelFallback tab="split" />}>
          {view === 'program' ? (
            <TrainingTabContainer
              userData={userData}
              token={token}
              setUserData={setTrainingUserData}
              onGoCalculator={onGoCalculator}
              programSubtitle={programSubtitle}
            />
          ) : view === 'menu' ? (
            <TrainingMenu
              workoutName={workoutName}
              calculationsCount={userData.splitCalculations?.length ?? 0}
              onOpenWorkout={() => go('program')}
              onOpenCalculations={() => go('calculations')}
              onOpenBase={() => go('base')}
              onOpenBreakdown={() => go('breakdown')}
            />
          ) : view === 'base' ? (
            <StrengthBasePage
              userData={userData}
              setUserData={setUserData}
              token={token}
              onSaveError={onSaveError}
            />
          ) : view === 'calculations' ? (
            <CalculationsPage
              userData={userData}
              setUserData={setUserData}
              token={token}
              onSaveError={onSaveError}
              onOpenWorkout={() => go('program')}
              onOpenConstructor={() => go('constructor')}
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
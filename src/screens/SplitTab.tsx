import {lazy, Suspense, useEffect} from 'react';
import {useURLState, navigateSearch} from '../hooks/useURLState';
import {TabPanelFallback} from '../components/app/TabPanelFallback';
import '../styles/tabs/split-tab.css';
import '../styles/components/training/training-nav.css';
import type {ProgramSettings, UserData} from '../types';
import type {CalculatorTabProps} from './CalculatorTab';
import {TrainingPageHeader} from '../components/training/hub/TrainingPageHeader';
import {TrainingCalculationsSection} from '../components/training/hub/TrainingCalculationsSection';
import {saveUser} from '../utils/api';

const TrainingTabContainer = lazy(() => import('../components/app/TrainingTabContainer'));
const SplitConstructorTab = lazy(() =>
  import('./SplitConstructorTab').then(module => ({default: module.SplitConstructorTab})),
);
const CalculatorTab = lazy(() =>
  import('./CalculatorTab').then(module => ({default: module.default})),
);
const StrengthBasePage = lazy(() =>
  import('../components/training/hub/StrengthBasePage').then(module => ({default: module.StrengthBasePage})),
);
const CalculationsPage = lazy(() =>
  import('../components/training/hub/CalculationsPage').then(module => ({default: module.CalculationsPage})),
);

type SplitView = 'program' | 'base' | 'calculations' | 'constructor' | 'breakdown';

function normalizeView(value: string | null): SplitView {
  if (value === 'base' || value === 'calculations' || value === 'constructor' || value === 'breakdown') {
    return value;
  }
  // Legacy ?view=menu больше не нужен: инструменты живут на главном экране.
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

  const headerConfig: Record<Exclude<SplitView, 'program'>, {title: string; backLabel: string; onBack: () => void}> = {
    base: {title: 'База силовых', backLabel: 'Назад', onBack: () => go('program')},
    calculations: {title: 'Расчёты', backLabel: 'Назад', onBack: () => go('program')},
    constructor: {title: 'Конструктор расчёта', backLabel: 'Назад', onBack: () => go('calculations')},
    breakdown: {title: 'Разбор', backLabel: 'Назад', onBack: () => go('program')},
  };
  const cfg = view === 'program' ? null : headerConfig[view];

  function handleSelectCalculation(id: string) {
    const calculation = (userData.splitCalculations ?? []).find(entry => entry.id === id);
    if (!calculation) return;

    const nextSplit = calculation.split;
    const hasSplit = (userData.splits ?? []).some(entry => entry.id === nextSplit.id);
    const splits = hasSplit
      ? (userData.splits ?? []).map(entry => (entry.id === nextSplit.id ? nextSplit : entry))
      : [...(userData.splits ?? []), nextSplit];

    const updated: UserData = {
      ...userData,
      splits,
      activeSplitId: nextSplit.id,
      activeSplitCalculationId: calculation.id,
    };
    setUserData(updated);
    void saveUser(updated, token);
  }

  function handleDeleteCalculation(id: string) {
    const updated: UserData = {
      ...userData,
      splitCalculations: (userData.splitCalculations ?? []).filter(entry => entry.id !== id),
      activeSplitCalculationId:
        userData.activeSplitCalculationId === id ? null : userData.activeSplitCalculationId,
    };
    setUserData(updated);
    void saveUser(updated, token);
  }

  const calcProps = {...calculator, userData, programSettings};

  return (
    <div className="split-tab">
      {cfg ? (
        <TrainingPageHeader title={cfg.title} backLabel={cfg.backLabel} onBack={cfg.onBack} />
      ) : null}

      <div key={view} className="training-page-view training-page-view--forward">
        <Suspense fallback={<TabPanelFallback tab="split" />}>
          {view === 'program' ? (
            <div className="training-page">
              <TrainingTabContainer
                userData={userData}
                token={token}
                setUserData={setTrainingUserData}
                onGoCalculator={onGoCalculator}
                programSubtitle={programSubtitle}
                extraSections={
                  <TrainingCalculationsSection
                    userData={userData}
                    onSelect={handleSelectCalculation}
                    onDelete={handleDeleteCalculation}
                    onCreate={() => go('constructor')}
                    onOpenBase={() => go('base')}
                    onOpenBreakdown={() => go('breakdown')}
                  />
                }
              />
            </div>
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

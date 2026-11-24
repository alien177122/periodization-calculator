import {lazy, Suspense} from 'react';
import type {ProgramSettings, SavedExercise, UserData} from '../../types';
import type {BillingStatus} from '@training/shared/types/billing';
import type {AppTab} from './tabs';
import {TabPanelFallback} from './TabPanelFallback';

const TheoryTab = lazy(() => import('../TheoryTab'));
const SplitTab = lazy(() =>
  import('../../screens/SplitTab').then(module => ({default: module.SplitTab})),
);

interface TabPanelProps {
  activeTab: AppTab;
  userData: UserData;
  programSettings: ProgramSettings;
  split: {
    setUserData: (value: UserData) => void;
    token: string;
    onSaveError: (message: string) => void;
  };
  theory: {
    setUserData: (value: UserData) => void;
    token: string;
    onSaveError: (message: string) => void;
  };
  calculator: {
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
  };
  training: {
    token: string;
    setUserData: (value: UserData | null) => void;
    onGoCalculator: () => void;
    programSubtitle?: string;
  };
}

function renderActiveTab(activeTab: AppTab, props: TabPanelProps) {
  const {userData, training, split, theory} = props;

  switch (activeTab) {
    case 'theory':
      return (
        <TheoryTab
          userData={userData}
          setUserData={theory.setUserData}
          token={theory.token}
          onSaveError={theory.onSaveError}
        />
      );
    case 'split':
      return (
        <SplitTab
          userData={userData}
          token={split.token}
          setUserData={split.setUserData}
          setTrainingUserData={training.setUserData}
          onSaveError={split.onSaveError}
          onGoCalculator={training.onGoCalculator}
          programSubtitle={training.programSubtitle}
          programSettings={props.programSettings}
          calculator={props.calculator}
        />
      );
    default:
      return null;
  }
}

export function TabPanel(props: TabPanelProps) {
  const {activeTab} = props;
  const isEagerTab = false;

  return (
    <div key={activeTab} className="tab-panel tab-panel--enter">
      {isEagerTab ? (
        renderActiveTab(activeTab, props)
      ) : (
        <Suspense fallback={<TabPanelFallback tab={activeTab} />}>
          {renderActiveTab(activeTab, props)}
        </Suspense>
      )}
    </div>
  );
}

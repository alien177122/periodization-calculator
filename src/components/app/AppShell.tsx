import {lazy, Suspense, useCallback, useMemo, useState, useEffect, type CSSProperties} from 'react';
import {connectionStatusLabel, type ConnectionPhase} from '@training/shared/utils/offlineOutbox';
import {resolveProgramSettings} from '@training/shared/program/resolveProgramSettings';
import {EXERCISES} from '@training/shared/data/exercises';
import {useKeyboardAvoid} from '../../hooks/useKeyboardAvoid';
import {HeroSection} from '../ui/HeroSection';
import {OpenGraph} from '../seo/OpenGraph';
import {useAuthSession} from '../../hooks/useAuthSession';
import {useServerConnection} from '../../hooks/useServerConnection';
import {useCalculatorState} from '../../hooks/useCalculatorState';
import {useBilling} from '../../hooks/useBilling';
import {useURLState} from '../../hooks/useURLState';
import {PROGRAM_DAYS_PER_WEEK} from '../../types';
import {LoadingView} from './LoadingView';
import {TabNav} from './TabNav';
import {TabPanel} from './TabPanel';
import {UserBar} from './UserBar';
import {isAppTab, type AppTab} from './tabs';
import {usePageMeta} from '../../hooks/usePageMeta';
import {ThemeToggle} from '../shared/ThemeToggle';
import {AppAmbientBackground} from './AppAmbientBackground';
import {AppWallpaperVideo} from './AppWallpaperVideo';
import '../../styles/animations.css';

const AuthScreen = lazy(() => import('../../screens/AuthScreen'));

function ConnectionStatus({phase, pending}: {phase: ConnectionPhase; pending: boolean}) {
  if (phase !== 'syncing' && phase !== 'offline') return null;

  const label = connectionStatusLabel(phase, pending);
  const tone = phase === 'syncing' ? 'syncing' : phase === 'offline' && pending ? 'pending' : phase;

  return (
    <p className={`connection-status connection-status--${tone}`} role="status" aria-live="polite">
      {label}
    </p>
  );
}

export function AppShell() {
  const pageMeta = usePageMeta();
  const auth = useAuthSession();
  const connection = useServerConnection(auth.userName ?? '');
  const [saveToast, setSaveToast] = useState('');
  const {keyboardHeight} = useKeyboardAvoid();
  const tabState = useURLState<AppTab>('tab');
  const {value: paymentValue, setValue: setPaymentValue} = useURLState<'success' | 'failed'>(
    'payment',
  );
  const activeTab = isAppTab(tabState.value) ? tabState.value : 'calculator';
  const shellStyle = {
    '--keyboard-inset': `${keyboardHeight}px`,
  } as CSSProperties;

  const billing = useBilling(auth.token ?? '');

  const calculator = useCalculatorState({
    token: auth.token ?? '',
    userName: auth.userName ?? '',
    userData: auth.userData,
    setUserData: auth.setUserData,
    onLimitReached: () => {
      void billing.refresh();
    },
    onCalculateSuccess: () => {
      void billing.refresh();
    },
  });

  const programSettings = resolveProgramSettings(auth.userData);

  useEffect(() => {
    document.documentElement.setAttribute('data-active-tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!auth.token || !paymentValue) return;
    billing.handleReturnFromPayment(paymentValue);
    setPaymentValue(null);
  }, [auth.token, billing, paymentValue, setPaymentValue]);

  const billingReady = billing.state.status === 'ready' ? billing.state.billing : null;
  const billingError = billing.state.status === 'error' ? billing.state.message : null;
  const {clearPaywallLock} = calculator;

  const handleCheckout = useCallback(() => {
    void billing.openCheckout();
  }, [billing]);

  const handleRefreshBilling = useCallback(() => {
    void billing.refresh();
  }, [billing]);

  useEffect(() => {
    if (billingReady?.premium) {
      clearPaywallLock();
    }
  }, [billingReady?.premium, clearPaywallLock]);

  const heroCopy = useMemo(() => {
    switch (activeTab) {
      case 'calculator':
        return {
          label: 'Калькулятор',
          title: 'ПЕРИОДИЗАЦИЯ RPE–RIR',
          subtitle: 'Тестовый вес → 1ПМ и рабочие веса на 8 недель',
        };
      case 'theory':
        return {
          label: 'Справочник',
          title: 'ТЕОРИЯ ТРЕНИНГА',
          subtitle: 'Прогрессия · mTOR · ориентиры и tier-лист добавок в одном месте',
        };
      case 'training':
        return {
          label: 'Программа',
          title: 'ТРЕНИРОВОЧНЫЙ ПРОЦЕСС',
          subtitle: `8 недель · ${PROGRAM_DAYS_PER_WEEK} дня · волновая прогрессия`,
        };
      case 'split':
        return {
          label: 'Конструктор',
          title: 'СОСТАВЛЕНИЕ СПЛИТА',
          subtitle: 'Неделя — единица прогрессии · рабочий вес фиксирован · без ограничений групп',
        };
      case 'journal':
        return {
          label: 'История',
          title: 'ЖУРНАЛ ТРЕНИРОВОК',
          subtitle: 'Фактические подходы · личный тренд 1ПМ · без плана калькулятора',
        };
      default:
        return {
          label: 'Тренировочный калькулятор',
          title: 'ПЕРИОДИЗАЦИЯ RPE–RIR',
          subtitle: `Оптимальная · ${PROGRAM_DAYS_PER_WEEK} дня · волновая прогрессия`,
        };
    }
  }, [activeTab]);

  const handleSaveError = useCallback((message: string) => {
    setSaveToast(message || 'Не удалось сохранить данные');
    window.setTimeout(() => setSaveToast(''), 4000);
  }, []);

  function changeTab(tab: AppTab) {
    tabState.setValue(tab);
  }

  function handleLogout() {
    void auth.handleLogout();
    calculator.resetCalculatorState();
    changeTab('calculator');
  }

  const connectionStatus = (
    <ConnectionStatus phase={connection.phase} pending={connection.pending} />
  );
  const wallpaperActive = !auth.token || !auth.userName;

  if (auth.sessionLoading) {
    return (
      <>
        <AppWallpaperVideo active={wallpaperActive} />
        {connectionStatus}
        <AppAmbientBackground activeTab={activeTab} />
        <ThemeToggle />
        <LoadingView message="Восстанавливаем сессию..." />
      </>
    );
  }

  if (!auth.userName || !auth.token) {
    return (
      <>
        <AppWallpaperVideo active={wallpaperActive} />
        {connectionStatus}
        <ThemeToggle />
        <OpenGraph {...pageMeta} />
        <Suspense fallback={<LoadingView message="Загрузка формы входа..." />}>
          <AuthScreen
            authMode={auth.authMode}
            setAuthMode={auth.setAuthMode}
            nameInput={auth.nameInput}
            setNameInput={auth.setNameInput}
            passInput={auth.passInput}
            setPassInput={auth.setPassInput}
            pass2Input={auth.pass2Input}
            setPass2Input={auth.setPass2Input}
            authError={auth.authError}
            setAuthError={auth.setAuthError}
            authLoading={auth.authLoading}
            handleAuth={auth.handleAuth}
          />
        </Suspense>
      </>
    );
  }

  if (!auth.userData) {
    return (
      <>
        <AppWallpaperVideo active={wallpaperActive} />
        {connectionStatus}
        <AppAmbientBackground activeTab={activeTab} />
        <ThemeToggle />
        <LoadingView message={auth.sessionError || 'Загрузка данных...'} />
      </>
    );
  }

  const userData = auth.userData;
  const trainingSavedCount = userData.exercises.filter(exercise =>
    Object.prototype.hasOwnProperty.call(EXERCISES, exercise.exerciseKey),
  ).length;
  const allTrainingExercisesSaved = Object.keys(EXERCISES).every(key =>
    userData.exercises.some(exercise => exercise.exerciseKey === key),
  );

  return (
    <div className="app-shell" style={shellStyle}>
      <AppWallpaperVideo active={wallpaperActive} />
      {connectionStatus}
      <AppAmbientBackground activeTab={activeTab} />
      <ThemeToggle />
      <OpenGraph {...pageMeta} />
      <div className="app-hero-container" style={{width: '100%', overflow: 'hidden'}}>
        <div key={activeTab} className="app-hero-swap app-hero-swap--enter">
          <HeroSection
            className="app-hero"
            label={heroCopy.label}
            title={heroCopy.title}
            subtitle={heroCopy.subtitle}
            tab={activeTab}
          />
        </div>
      </div>
      <UserBar
        userName={auth.userName}
        onLogout={handleLogout}
        billingState={billing.state}
        isPolling={billing.isPolling}
        checkoutDisabled={billing.state.status !== 'ready' || Boolean(billingReady?.premium)}
        onOpenCheckout={handleCheckout}
        onRefreshBilling={handleRefreshBilling}
      />
      <main className="app-shell__main">
        <TabPanel
          activeTab={activeTab}
          userData={userData}
          programSettings={programSettings}
          calculator={{
            ...calculator,
            token: auth.token,
            billingStatus: billingReady,
            billingLoading: billing.state.status === 'loading',
            billingError,
            billingPolling: billing.isPolling,
            checkoutDisabled: billing.state.status !== 'ready' || Boolean(billingReady?.premium),
            onCheckout: handleCheckout,
            onRefreshBilling: handleRefreshBilling,
          }}
          training={{
            token: auth.token,
            setUserData: value => auth.setUserData(value),
            onGoCalculator: () => changeTab('calculator'),
            programSubtitle: `8 недель · ${PROGRAM_DAYS_PER_WEEK} дня · волновая прогрессия`,
          }}
          journal={{
            setUserData: value => auth.setUserData(value),
            token: auth.token,
            onSaveError: handleSaveError,
          }}
          split={{
            setUserData: value => auth.setUserData(value),
            token: auth.token,
            onSaveError: handleSaveError,
          }}
        />
      </main>
      <TabNav
        activeTab={activeTab}
        allSaved={allTrainingExercisesSaved}
        savedCount={trainingSavedCount}
        onTabChange={changeTab}
      />
      {saveToast ? (
        <p className="app-toast" role="alert">
          {saveToast}
        </p>
      ) : null}
    </div>
  );
}

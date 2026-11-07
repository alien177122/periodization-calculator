import {useEffect, useState} from 'react';
import {PremiumInput} from '../components/ui/PremiumInput';
import {Button} from '../components/ui/Button';
import {PasswordInput} from '../components/auth/PasswordInput';
import {AuthHeroDecor} from '../components/auth/AuthHeroDecor';
import {useKeyboardAvoid} from '../hooks/useKeyboardAvoid';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {AUTH_CANVAS_COLOR, getStoredTheme, THEME_META_COLORS} from '../theme/theme';

const AUTH_PLAN_WEEKS = Array.from({length: 8}, (_, index) => index + 1);

export interface AuthScreenProps {
  authMode: 'login' | 'register';
  setAuthMode: (value: 'login' | 'register') => void;
  nameInput: string;
  setNameInput: (value: string) => void;
  passInput: string;
  setPassInput: (value: string) => void;
  pass2Input: string;
  setPass2Input: (value: string) => void;
  authError: string;
  setAuthError: (value: string) => void;
  authLoading: boolean;
  handleAuth: () => void;
}

export default function AuthScreen({
  authMode,
  setAuthMode,
  nameInput,
  setNameInput,
  passInput,
  setPassInput,
  pass2Input,
  setPass2Input,
  authError,
  setAuthError,
  authLoading,
  handleAuth,
}: AuthScreenProps) {
  const reduced = useReducedMotion();
  const {keyboardHeight} = useKeyboardAvoid();
  const [passHint, setPassHint] = useState<string | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('auth-open');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', AUTH_CANVAS_COLOR);
    return () => {
      html.classList.remove('auth-open');
      if (meta) meta.setAttribute('content', THEME_META_COLORS[getStoredTheme()]);
    };
  }, []);

  return (
    <main
      className="auth-screen"
      aria-label="Вход в тренировочный калькулятор"
      style={keyboardHeight > 0 ? {paddingBottom: keyboardHeight} : undefined}>
      <AuthHeroDecor reduced={reduced} />
      <div className="auth-stage">
        <div className={`auth-motion${reduced ? '' : ' auth-motion--enter'}`} aria-hidden="true">
          <div className="auth-motion__brand">Тренировочный калькулятор</div>
          <div className="auth-motion__timeline">
            {AUTH_PLAN_WEEKS.map(week => (
              <span className="auth-motion__week" key={week}>
                <span className="auth-motion__bar" />
                <span className="auth-motion__number">{week}</span>
              </span>
            ))}
          </div>
          <div className="auth-motion__caption">8 недель персонального плана</div>
        </div>

        <div className={`auth-card${reduced ? '' : ' auth-card--enter'}`}>
          <div className="auth-tabs">
            <button
              className={`auth-tab${authMode === 'login' ? ' auth-tab-active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
                setPassHint(null);
              }}>
              Войти
            </button>
            <button
              className={`auth-tab${authMode === 'register' ? ' auth-tab-active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
                setPassHint(null);
              }}>
              Регистрация
            </button>
          </div>

          <div className="auth-form">
            <PremiumInput
              id="auth-name"
              label="Имя пользователя"
              placeholder="Имя пользователя"
              lang="en"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
            />

            {authMode === 'register' ? (
              <PasswordInput
                id="auth-pass"
                label="Пароль"
                value={passInput}
                onChange={setPassInput}
                showStrength
                error={passHint ?? undefined}
                onBlurValidate={setPassHint}
                lang="en"
                autoComplete="new-password"
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
            ) : (
              <PremiumInput
                id="auth-pass"
                label="Пароль"
                type="password"
                placeholder="••••••"
                lang="en"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={passInput}
                onChange={e => setPassInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
            )}

            {authMode === 'register' && (
              <PasswordInput
                id="auth-pass2"
                label="Повтори пароль"
                value={pass2Input}
                onChange={setPass2Input}
                lang="en"
                autoComplete="new-password"
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
            )}

            {authError && (
              <div className="auth-error" role="alert">
                {authError}
              </div>
            )}

            <Button
              className="calc-test__submit auth-submit"
              onClick={handleAuth}
              disabled={authLoading}>
              {authLoading
                ? authMode === 'login'
                  ? 'Входим…'
                  : 'Создаём аккаунт…'
                : authMode === 'login'
                  ? 'Войти'
                  : 'Создать аккаунт'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

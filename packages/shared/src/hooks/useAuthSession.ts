import {useEffect, useMemo, useState} from 'react';
import type {UserData} from '../types/index.ts';
import type {TokenStorage} from '../types/auth.ts';
import {createApiClient} from '../utils/api.ts';
import {readDeviceSnapshot, readOutbox} from '../utils/offlineOutbox.ts';
import {passwordPolicyError, validatePassword} from '../utils/passwordValidation.ts';

export interface AuthSessionOptions {
  storage: TokenStorage;
  apiBaseUrl: string;
}

export function useAuthSession({storage, apiBaseUrl}: AuthSessionOptions) {
  // Stabilize the API client across renders so `loadUser` / `apiAuth`
  // are referentially equal until `apiBaseUrl` actually changes. This is
  // what lets us include them in the effect dependency array below
  // without re-fetching on every render.
  const {loadUser, apiAuth, apiLogout} = useMemo(() => createApiClient(apiBaseUrl), [apiBaseUrl]);

  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [nameInput, setNameInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [pass2Input, setPass2Input] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    storage
      .load()
      .then(session => {
        if (cancelled) return;
        setToken(session.token);
        setUserName(session.userName);
      })
      .catch(() => {
        if (cancelled) return;
        setToken('');
        setUserName('');
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [storage]);

  useEffect(() => {
    let cancelled = false;

    if (sessionLoading || !userName || !token) {
      if (!sessionLoading) {
        // Defer the reset out of the synchronous effect body to satisfy
        // the `set-state-in-effect` rule. Behaviour is identical: we
        // only land in this branch when the session is no longer loading
        // and there is no active auth, so a microtask is enough to push
        // the setState past the current commit.
        queueMicrotask(() => {
          if (!cancelled) setUserData(null);
        });
      }
      return () => {
        cancelled = true;
      };
    }

    loadUser(userName, token)
      .then(async data => {
        if (cancelled) return;

        if (typeof localStorage !== 'undefined') {
          const pendingEdit = readOutbox(localStorage, userName);
          if (pendingEdit) {
            setSessionError('');
            setUserData(pendingEdit.data);
            return;
          }
        }

        if (data) {
          setSessionError('');
          setUserData(data);
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem(`gym_user_data_${userName}`, JSON.stringify(data));
            } catch (e) {
              console.error('Failed to cache user data:', e);
            }
          }
          return;
        }

        await storage.clear();
        if (cancelled) return;

        setSessionError('');
        setToken('');
        setUserName('');
        setUserData(null);
      })
      .catch(error => {
        if (cancelled) return;

        if (typeof localStorage !== 'undefined') {
          try {
            const snapshot = readDeviceSnapshot(localStorage, userName);
            if (snapshot) {
              setSessionError('');
              setUserData(snapshot);
              console.info('Loaded user data from local snapshot (offline fallback)');
              return;
            }
          } catch (e) {
            console.error('Failed to read local user snapshot:', e);
          }
        }

        const isApiUnavailable = error instanceof Error && error.message === 'API_UNAVAILABLE';
        setSessionError(
          isApiUnavailable
            ? 'API недоступен. Запусти npm run dev — поднимет сервер на :3002 (порт 3001 часто занят).'
            : 'Не удалось загрузить данные. Проверь, что API-сервер запущен.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [loadUser, sessionLoading, storage, token, userName]);

  useEffect(() => {
    if (userData && userName && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`gym_user_data_${userName}`, JSON.stringify(userData));
      } catch (e) {
        console.error('Failed to save user data to localStorage:', e);
      }
    }
  }, [userData, userName]);

  async function handleAuth() {
    const name = nameInput.trim();
    const pass = passInput;

    if (!name || !pass) {
      setAuthError('Заполни все поля');
      return;
    }

    if (authMode === 'register' && pass !== pass2Input) {
      setAuthError('Пароли не совпадают');
      return;
    }

    if (authMode === 'register') {
      const policyError = passwordPolicyError(pass);
      if (policyError) {
        setAuthError(policyError);
        return;
      }
      if (!validatePassword(pass).isValid) {
        setAuthError('Пароль не соответствует требованиям');
        return;
      }
    }

    setAuthLoading(true);
    setAuthError('');

    const result = await apiAuth(authMode, {name, password: pass});
    setAuthLoading(false);

    if (result.error) {
      setAuthError(result.error);
      return;
    }

    const nextToken = result.token ?? '';
    const nextName = result.name ?? name;

    await storage.save(nextToken, nextName);

    setToken(nextToken);
    setUserName(nextName);
    setNameInput('');
    setPassInput('');
    setPass2Input('');
  }

  async function handleLogout() {
    const activeToken = token;
    if (activeToken) {
      try {
        await apiLogout(activeToken);
      } catch {
        // Local clear still proceeds — revoke is best-effort if API is down.
      }
    }
    await storage.clear();
    setToken('');
    setUserName('');
    setUserData(null);
  }

  return {
    token,
    userName,
    userData,
    setUserData,
    sessionLoading,
    sessionError,
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
    handleLogout,
  };
}

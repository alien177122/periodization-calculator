import {useState} from 'react';
import {applyTheme, getStoredTheme, type ThemeMode} from '../../src/theme/theme';

const NEXT: Record<ThemeMode, ThemeMode> = {light: 'dark', dark: 'light'};

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme());

  const toggle = () => {
    const next = NEXT[theme];
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="ss-theme-toggle"
      onClick={toggle}
      aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}>
      {theme === 'light' ? '☾' : '☀'}
    </button>
  );
}

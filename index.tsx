import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './src/styles/main.css';
import './src/styles/components/auth/auth-canvas-lock.css';
import {initTheme} from './src/theme/initTheme';
import App from './App.tsx';

const PRELOAD_RELOAD_KEY = 'vite-preload-reload';

window.addEventListener('vite:preloadError', event => {
  event.preventDefault();
  if (sessionStorage.getItem(PRELOAD_RELOAD_KEY)) return;
  sessionStorage.setItem(PRELOAD_RELOAD_KEY, '1');
  window.location.reload();
});

initTheme();
if (import.meta.env.DEV) {
  void import('./src/platform/initEruda').then(mod => mod.initEruda());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

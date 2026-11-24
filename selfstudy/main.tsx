import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '../src/styles/base/variables.css';
import '../src/styles/base/reset.css';
import '../src/styles/base/typography.css';
import '../src/styles/base/light-theme.css';
import '../src/styles/components/theory/diagrams.css';
import './styles.css';
import {initTheme} from '../src/theme/initTheme';
import SelfstudyApp from './App';

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SelfstudyApp />
  </StrictMode>,
);

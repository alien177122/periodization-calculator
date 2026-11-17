import {AnimatePresence} from 'framer-motion';
import {useCallback, useRef} from 'react';
import '../styles/tabs/theory-tab.css';
import {getTheoryChapter, type ChapterId} from '../data/theoryChapters';
import {useChapterURL} from '../hooks/useChapterURL';
import {useLearningProgress} from '../hooks/useLearningProgress';
import {useURLState, navigateSearch} from '../hooks/useURLState';
import {TheoryHero} from './TheoryHero';
import {TheoryOutro} from './TheoryOutro';
import {TheoryChapterHub} from './theory/TheoryChapterHub';
import {TheoryChapterPanel} from './theory/TheoryChapterPanel';
import {LearningArticlePanel} from './theory/learning/LearningArticlePanel';
import {LearningTrackView} from './theory/learning/LearningTrackView';
import {renderChapterContent} from './theory/chapterContent';
import {getLearningStep, type LearningTrackStep} from '@training/shared/data/learning-track';
import type {UserData} from '../types';

type TheoryView = 'track' | 'chapters';

interface TheoryTabProps {
  userData: UserData;
  setUserData: (value: UserData) => void;
  token: string;
  onSaveError?: (message: string) => void;
}

export default function TheoryTab({userData, setUserData, token, onSaveError}: TheoryTabProps) {
  const {chapterId, invalidChapter} = useChapterURL();
  const {value: learnId} = useURLState<string>('learn');
  const {value: viewParam} = useURLState<TheoryView>('theoryView');
  const buttonRefs = useRef<Partial<Record<ChapterId, HTMLButtonElement | null>>>({});
  const {progress, saving, markStep} = useLearningProgress({
    userData,
    setUserData,
    token,
    onSaveError,
  });

  const activeChapter = chapterId ? getTheoryChapter(chapterId) : null;
  const activeStep = learnId ? getLearningStep(learnId) : undefined;
  const view: TheoryView = chapterId
    ? 'chapters'
    : learnId
      ? 'track'
      : viewParam === 'chapters'
        ? 'chapters'
        : 'track';

  const setButtonRef = useCallback((id: ChapterId, node: HTMLButtonElement | null) => {
    buttonRefs.current[id] = node;
  }, []);

  const focusChapterCard = useCallback((id: ChapterId) => {
    window.requestAnimationFrame(() => {
      buttonRefs.current[id]?.focus();
    });
  }, []);

  const openChapter = useCallback((next: ChapterId) => {
    navigateSearch({theoryView: 'chapters', learn: null, chapter: next});
  }, []);

  const selectChapter = useCallback((next: ChapterId | null) => {
    navigateSearch({theoryView: 'chapters', learn: null, chapter: next});
  }, []);

  const switchView = useCallback((next: TheoryView) => {
    if (next === 'track') {
      navigateSearch({theoryView: 'track', chapter: null});
      window.requestAnimationFrame(() => {
        document.getElementById('ta-learning')?.scrollIntoView({
          block: 'start',
          behavior: 'smooth',
        });
      });
      return;
    }
    navigateSearch({theoryView: 'chapters', learn: null});
  }, []);

  const openStep = useCallback((step: LearningTrackStep) => {
    navigateSearch({theoryView: 'track', chapter: null, learn: step.id});
  }, []);

  const closeArticle = useCallback(() => {
    const stepToFocus = learnId;
    navigateSearch({learn: null});
    if (stepToFocus) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLButtonElement>(`[data-learning-step="${stepToFocus}"]`)
          ?.focus();
      });
    }
  }, [learnId]);

  const closePanel = useCallback(() => {
    const chapterToFocus = chapterId;
    navigateSearch({chapter: null});
    if (chapterToFocus) focusChapterCard(chapterToFocus);
  }, [chapterId, focusChapterCard]);

  return (
    <div className="ta-shell">
      <TheoryHero
        onCTAClick={target => {
          if (target === 'track') {
            switchView('track');
            return;
          }
          openChapter(target);
        }}
      />

      <div className="ta-view-switch-wrap">
        <div className="ta-view-switch" role="group" aria-label="Разделы теории">
          <button
            type="button"
            className={`ta-view-switch__btn${view === 'track' ? ' is-active' : ''}`}
            aria-pressed={view === 'track'}
            onClick={() => switchView('track')}>
            Маршрут
          </button>
          <button
            type="button"
            className={`ta-view-switch__btn${view === 'chapters' ? ' is-active' : ''}`}
            aria-pressed={view === 'chapters'}
            onClick={() => switchView('chapters')}>
            Все главы
          </button>
        </div>
      </div>

      {view === 'track' ? (
        <LearningTrackView
          progress={progress}
          activeStepId={activeStep?.id ?? null}
          onOpenStep={openStep}
        />
      ) : (
        <TheoryChapterHub activeId={chapterId} onButtonRef={setButtonRef} onSelect={selectChapter} />
      )}

      <AnimatePresence mode="wait">
        {view === 'track' && activeStep ? (
          <LearningArticlePanel
            key={`learn-${activeStep.id}`}
            step={activeStep}
            progressItem={progress[activeStep.id]}
            saving={saving}
            onClose={closeArticle}
            onMark={mark => void markStep(activeStep.id, mark)}
            onOpenChapter={openChapter}
          />
        ) : view === 'chapters' && (activeChapter || invalidChapter) ? (
          <TheoryChapterPanel
            key={activeChapter?.id ?? invalidChapter}
            chapter={activeChapter}
            invalidChapter={invalidChapter}
            onClose={closePanel}>
            {activeChapter ? renderChapterContent(activeChapter.id, selectChapter) : null}
          </TheoryChapterPanel>
        ) : null}
      </AnimatePresence>

      <TheoryOutro
        title="Что дальше?"
        links={[
          {
            id: 'basics',
            eyebrow: 'Старт',
            title: 'Начать с основ',
            color: 'var(--ta-sec-01)',
            onClick: () => openChapter('basics'),
          },
          {
            id: 'progression',
            eyebrow: 'Управление нагрузкой',
            title: 'Прогрессия 2.0',
            color: 'var(--ta-sec-10)',
            onClick: () => openChapter('progression'),
          },
          {
            id: 'strength',
            eyebrow: 'Силовой протокол',
            title: 'Формула силы',
            color: 'var(--ta-sec-09)',
            onClick: () => openChapter('strength'),
          },
        ]}
      />
    </div>
  );
}
import {motion} from 'framer-motion';
import {
  LEARNING_TRACK,
  getLearningStep,
  isLearningStepUnlocked,
  learningTrackStats,
  type LearningStepLevel,
  type LearningStepPhase,
  type LearningTrackStep,
} from '@training/shared/data/learning-track';
import type {LearningProgress} from '@training/shared/types/index';
import {useReducedMotion} from '../../../hooks/useReducedMotion';

const LEVEL_LABEL: Record<LearningStepLevel, string> = {
  base: 'База',
  mid: 'Средний',
  deep: 'Продвинутый',
};

const PHASE_META: Record<
  LearningStepPhase,
  {title: string; lede: string; accent: string}
> = {
  month1: {
    title: 'База',
    lede: 'Объём, отказ, горизонт года и восстановление — фундамент маршрута.',
    accent: '--ta-sec-01',
  },
  month2: {
    title: 'Дополнительно',
    lede: 'Периодизация, частота, авторегуляция и питание для массы.',
    accent: '--ta-sec-05',
  },
  health: {
    title: 'Здоровье',
    lede: 'Метаболизм, сосуды, циркадные ритмы и фармакология.',
    accent: '--ta-sec-07',
  },
};

const PHASE_ORDER: readonly LearningStepPhase[] = ['month1', 'month2', 'health'];

type StepStatus = 'done' | 'retry' | 'read' | 'locked' | 'new';

function statusOf(step: LearningTrackStep, progress: LearningProgress): StepStatus {
  const item = progress[step.id];
  if (item?.checked === 'ok') return 'done';
  if (item?.checked === 'retry') return 'retry';
  if (item?.read) return 'read';
  if (!isLearningStepUnlocked(step, progress)) return 'locked';
  return 'new';
}

const STATUS_LABEL: Record<StepStatus, string> = {
  done: 'Пройдено',
  retry: 'Вернуться',
  read: 'Читал',
  locked: 'Сначала предыдущее',
  new: 'Начать',
};

function missingPrerequisites(step: LearningTrackStep, progress: LearningProgress): string[] {
  return step.requires
    .filter(requiredId => progress[requiredId]?.checked !== 'ok')
    .map(requiredId => getLearningStep(requiredId)?.title ?? requiredId);
}

interface LearningTrackViewProps {
  progress: LearningProgress;
  activeStepId: string | null;
  onOpenStep: (step: LearningTrackStep) => void;
}

/**
 * Маршрут обучения внутри вкладки «Теория» (этап L3).
 *
 * Данные — только из shared LEARNING_TRACK; названия и минуты статьи берутся
 * из того же markdown-корпуса самоучителя, который открывается в панели.
 * «Прочитано» и «проверено» — разные состояния, как в UserData.learningProgress.
 */
export function LearningTrackView({progress, activeStepId, onOpenStep}: LearningTrackViewProps) {
  const reduced = useReducedMotion();
  const stats = learningTrackStats(progress);
  const nextUnfinished = LEARNING_TRACK.find(step => progress[step.id]?.checked !== 'ok');

  return (
    <section id="ta-learning" className="ta-chapter-hub ta-learning" aria-labelledby="ta-learning-title">
      <div className="ta-chapter-hub__inner">
        <header className="ta-learning__head">
          <div className="ta-learning__intro">
            <span className="ta-section-pill">Маршрут</span>
            <h2 id="ta-learning-title" className="ta-section-title">
              Самоучитель: от простого к сложному
            </h2>
            <p className="ta-section-lede">
              15 статей по порядку: сначала база, потом периодизация и здоровье. Маршрут
              открывает следующий шаг после самопроверки — но читать можно в любом порядке.
            </p>
          </div>
          <div className="ta-learning__summary" aria-label="Прогресс маршрута">
            <p className="ta-learning__counter">
              <strong>{stats.done}</strong> из {stats.total} пройдено
            </p>
            <div
              className="ta-learning__meter"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={stats.total}
              aria-valuenow={stats.done}
              aria-valuetext={`Пройдено ${stats.done} из ${stats.total}`}>
              <span
                className="ta-learning__meter-fill"
                style={{transform: `scaleX(${stats.total > 0 ? stats.done / stats.total : 0})`}}
              />
            </div>
            {stats.read > 0 ? (
              <p className="ta-learning__read-note">
                {stats.read} {stats.read === 1 ? 'статья прочитана' : 'статьи прочитаны'} без
                самопроверки
              </p>
            ) : null}
            {nextUnfinished ? (
              <button
                type="button"
                className="ta-learning__continue"
                onClick={() => onOpenStep(nextUnfinished)}>
                {stats.done === 0 ? 'Начать маршрут' : 'Продолжить'} · {nextUnfinished.title}
              </button>
            ) : (
              <p className="ta-learning__read-note">Маршрут пройден — можно возвращаться к темам.</p>
            )}
          </div>
        </header>

        {PHASE_ORDER.map((phase, phaseIndex) => {
          const steps = LEARNING_TRACK.filter(step => step.phase === phase);
          if (steps.length === 0) return null;
          const meta = PHASE_META[phase];
          return (
            <section
              key={phase}
              className="ta-learning__phase"
              aria-labelledby={`ta-learning-phase-${phase}`}
              style={{['--ta-learn-accent' as string]: `var(${meta.accent})`}}>
              <header className="ta-learning__phase-head">
                <span className="ta-learning__phase-num" aria-hidden="true">
                  {String(phaseIndex + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 id={`ta-learning-phase-${phase}`} className="ta-learning__phase-title">
                    {meta.title}
                  </h3>
                  <p className="ta-learning__phase-lede">{meta.lede}</p>
                </div>
              </header>
              <ol className="ta-learning__list">
                {steps.map(step => {
                  const status = statusOf(step, progress);
                  const missing = missingPrerequisites(step, progress);
                  const active = activeStepId === step.id;
                  return (
                    <li key={step.id}>
                      <motion.button
                        type="button"
                        className={`ta-learning__step is-${status}${active ? ' is-active' : ''}`}
                        data-learning-step={step.id}
                        onClick={() => onOpenStep(step)}
                        aria-current={active ? 'step' : undefined}
                        aria-label={`${step.order}. ${step.title}. ${STATUS_LABEL[status]}`}
                        initial={reduced ? false : {opacity: 0, y: 8}}
                        animate={reduced ? undefined : {opacity: 1, y: 0}}
                        transition={{duration: 0.22, delay: phaseIndex * 0.02}}>
                        <span className="ta-learning__step-num" aria-hidden="true">
                          {status === 'done' ? '✓' : step.order}
                        </span>
                        <span className="ta-learning__step-body">
                          <span className="ta-learning__step-title">{step.title}</span>
                          <span className="ta-learning__step-meta">
                            <span className={`ta-learning__chip is-${step.level}`}>
                              {LEVEL_LABEL[step.level]}
                            </span>
                            {step.articleId ? <span>статья {step.articleId}</span> : null}
                            {missing.length > 0 ? (
                              <span className="ta-learning__step-lock">
                                до: {missing.slice(0, 2).join(', ')}
                              </span>
                            ) : null}
                          </span>
                        </span>
                        <span className="ta-learning__state">{STATUS_LABEL[status]}</span>
                      </motion.button>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </section>
  );
}
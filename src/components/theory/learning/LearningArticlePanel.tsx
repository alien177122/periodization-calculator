import {motion} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {
  LEARNING_ARTICLES,
  type LearningTrackStep,
} from '@training/shared/data/learning-track';
import type {LearningItemProgress} from '@training/shared/types/index';
import {getTheoryChapter, type ChapterId} from '../../../data/theoryChapters';
import {loadLearningArticle} from '../../../data/learningArticles';
import {useReducedMotion} from '../../../hooks/useReducedMotion';
import {ArticleView} from '../../../../selfstudy/components/ArticleView';
import type {Article} from '../../../../selfstudy/lib/content';
import '../../../../selfstudy/styles.css';

const LEVEL_LABEL = {
  base: 'База',
  mid: 'Средний',
  deep: 'Продвинутый',
} as const;

interface LearningArticlePanelProps {
  step: LearningTrackStep;
  progressItem?: LearningItemProgress;
  saving: boolean;
  onClose: () => void;
  onMark: (mark: 'ok' | 'retry') => void;
  onOpenChapter: (chapterId: ChapterId) => void;
}

/**
 * Панель статьи маршрута. Текст — тот же markdown-корпус, что и в превью
 * самоучителя (`selfstudy/content`), поэтому статья не дублируется в коде.
 */
export function LearningArticlePanel({
  step,
  progressItem,
  saving,
  onClose,
  onMark,
  onOpenChapter,
}: LearningArticlePanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const [article, setArticle] = useState<Article>();
  const [articleError, setArticleError] = useState(false);
  const topic = step.topicRef ? getTheoryChapter(step.topicRef.chapterId) : null;
  const statusLabel =
    progressItem?.checked === 'ok'
      ? 'Пройдено'
      : progressItem?.checked === 'retry'
        ? 'Вернуться позже'
        : progressItem?.read
          ? 'Прочитано'
          : 'Не отмечено';

  useEffect(() => {
    let cancelled = false;
    if (!step.articleId) return;
    loadLearningArticle(LEARNING_ARTICLES[step.articleId])
      .then(loaded => {
        if (cancelled) return;
        if (loaded) setArticle(loaded);
        else setArticleError(true);
      })
      .catch(error => {
        console.error('learning article load error:', error);
        if (!cancelled) setArticleError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [step.articleId]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({block: 'start', behavior: reduced ? 'auto' : 'smooth'});
      headingRef.current?.focus({preventScroll: true});
    });
    return () => window.cancelAnimationFrame(frame);
  }, [reduced, step.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <motion.section
      ref={panelRef}
      id="learning-panel"
      className="ta-chapter-panel ta-learning-panel"
      data-kind="learning"
      aria-labelledby="learning-panel-title"
      initial={reduced ? false : {opacity: 0, y: 12}}
      animate={reduced ? undefined : {opacity: 1, y: 0}}
      exit={reduced ? undefined : {opacity: 0, y: 12}}
      transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}>
      <header className="ta-chapter-panel__head">
        <div className="ta-chapter-panel__title-wrap">
          <div className="ta-chapter-panel__title-stack">
            <h2 ref={headingRef} id="learning-panel-title" className="ta-section-title" tabIndex={-1}>
              {step.title}
            </h2>
            <p className="ta-section-lede">
              Шаг {step.order} из 15 · {LEVEL_LABEL[step.level]}
              {article?.meta.minutes ? ` · ~${article.meta.minutes} мин` : ''}
            </p>
            {topic && step.topicRef ? (
              <button
                type="button"
                className="ta-learning-panel__topic"
                onClick={() => onOpenChapter(step.topicRef!.chapterId)}>
                Тема в «Теории»: {topic.panelTitle} →
              </button>
            ) : null}
          </div>
          <span className="ta-section-pill">{statusLabel}</span>
        </div>
        <div className="ta-chapter-panel__actions">
          <button
            type="button"
            className="ta-chapter-panel__close"
            onClick={onClose}
            aria-label="Закрыть статью">
            Закрыть
          </button>
        </div>
      </header>

      <div className="ta-chapter-panel__body">
        <div className="ta-learning-article">
          {article ? (
            <ArticleView article={article} />
          ) : articleError ? (
            <p>Текст статьи не найден. Проверь файл в selfstudy/content.</p>
          ) : (
            <p className="ta-learning-article__loading" aria-live="polite">
              Загружаю статью…
            </p>
          )}
        </div>

        <footer className="ta-learning-article__foot">
          <div className="ta-learning-article__foot-copy">
            <p className="ta-learning-article__foot-title">Отметить прогресс</p>
            <p className="ta-learning-article__foot-note">
              «Разобрался» открывает следующий шаг маршрута. «Вернусь позже» оставляет статью
              на виду.
            </p>
          </div>
          <div className="ta-learning-article__actions">
            <button
              type="button"
              className="ta-learning-article__mark is-primary"
              onClick={() => onMark('ok')}
              disabled={saving}>
              {progressItem?.checked === 'ok' ? 'Пройдено ✓' : 'Разобрался'}
            </button>
            <button
              type="button"
              className="ta-learning-article__mark"
              onClick={() => onMark('retry')}
              disabled={saving}>
              Вернусь позже
            </button>
          </div>
        </footer>
      </div>
    </motion.section>
  );
}
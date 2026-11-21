import {motion} from 'framer-motion';
import type {CSSProperties} from 'react';
import {THEORY_CHAPTERS, THEORY_READING_ARTICLES, type ChapterId} from '../../data/theoryChapters';
import {useReducedMotion} from '../../hooks/useReducedMotion';

interface TheoryChapterHubProps {
  activeId: ChapterId | null;
  onButtonRef: (id: ChapterId, node: HTMLButtonElement | null) => void;
  onSelect: (next: ChapterId | null) => void;
}

export function TheoryChapterHub({activeId, onButtonRef, onSelect}: TheoryChapterHubProps) {
  const reduced = useReducedMotion();

  return (
    <section className="ta-chapter-hub" aria-labelledby="ta-chapter-hub-title">
      <div className="ta-chapter-hub__inner">
        <header className="ta-chapter-hub__head">
          <span className="ta-section-pill">Theory hub</span>
          <h2 id="ta-chapter-hub-title" className="ta-section-title">
            Выбери главу
          </h2>
          <p className="ta-section-lede">
            Тема откроется в отдельной панели, а ссылкой на неё можно поделиться.
          </p>
        </header>

        <div className="ta-chapter-grid">
          {THEORY_CHAPTERS.map((chapter, index) => (
            <TopicCard
              key={chapter.id}
              id={chapter.id}
              num={chapter.num}
              title={chapter.cardTitle}
              summary={chapter.summary}
              accentVar={chapter.accentVar}
              tintVar={chapter.tintVar}
              active={activeId === chapter.id}
              delay={index * 35}
              reduced={reduced}
              reading={false}
              onButtonRef={onButtonRef}
              onSelect={onSelect}
            />
          ))}
        </div>

        <div className="ta-reading-hub">
          <header className="ta-chapter-hub__head">
            <span className="ta-section-pill">Чтение</span>
            <h2 id="ta-reading-hub-title" className="ta-section-title">
              Интересные статьи для чтения
            </h2>
            <p className="ta-section-lede">
              Клинические разборы вне основных глав. Это конспекты видео, а не руководство к лечению.
            </p>
          </header>
          <div className="ta-chapter-grid ta-reading-grid">
            {THEORY_READING_ARTICLES.map((article, index) => (
              <TopicCard
                key={article.id}
                id={article.id}
                num={article.num}
                title={article.cardTitle}
                summary={article.summary}
                accentVar={article.accentVar}
                tintVar={article.tintVar}
                active={activeId === article.id}
                delay={(THEORY_CHAPTERS.length + index) * 35}
                reduced={reduced}
                reading
                onButtonRef={onButtonRef}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TopicCard({
  id,
  num,
  title,
  summary,
  accentVar,
  tintVar,
  active,
  delay,
  reduced,
  reading,
  onButtonRef,
  onSelect,
}: {
  id: ChapterId;
  num: string;
  title: string;
  summary: string;
  accentVar: string;
  tintVar: string;
  active: boolean;
  delay: number;
  reduced: boolean;
  reading: boolean;
  onButtonRef: (id: ChapterId, node: HTMLButtonElement | null) => void;
  onSelect: (next: ChapterId | null) => void;
}) {
  const style: CSSProperties = {
    ['--ta-card-accent' as string]: `var(${accentVar})`,
    ['--ta-card-tint' as string]: `var(${tintVar})`,
    transitionDelay: reduced ? undefined : `${delay}ms`,
  };

  return (
    <motion.button
      ref={node => onButtonRef(id, node)}
      type="button"
      className={`ta-chapter-card${reading ? ' ta-reading-card' : ''}${active ? ' is-active' : ''}`}
      style={style}
      aria-expanded={active}
      aria-controls={active ? 'chapter-panel' : undefined}
      onClick={() => onSelect(active ? null : id)}
      initial={reduced ? false : {opacity: 0, y: 16}}
      animate={reduced ? undefined : {opacity: 1, y: 0}}
      whileHover={reduced ? undefined : {y: -4}}
      whileTap={reduced ? undefined : {y: 0}}
      transition={{
        duration: 0.24,
        ease: [0.4, 0, 0.2, 1],
      }}>
      <span className="ta-chapter-card__num" aria-hidden="true">
        {num}
      </span>
      <span className="ta-chapter-card__body">
        <span className="ta-chapter-card__title">{title}</span>
        <span className="ta-chapter-card__summary">{summary}</span>
        <span className="ta-chapter-card__action">
          {active ? 'Закрыть тему' : 'Открыть тему'}
          <svg
            className="ta-chapter-card__chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true">
            <path d={active ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
          </svg>
        </span>
      </span>
    </motion.button>
  );
}

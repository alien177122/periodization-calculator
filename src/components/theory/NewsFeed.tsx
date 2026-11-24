import {useState} from 'react';
import {THEORY_NEWS, type TheoryNewsItem} from '../../data/theory-news';
import '../../styles/components/theory/news-feed.css';

const GRADE_COLOR: Record<TheoryNewsItem['grade'], string> = {
  'РКИ': 'var(--ta-sec-02)',
  'мета-анализ': 'var(--ta-sec-03)',
  'обзор': 'var(--ta-sec-04)',
  'механизм/практика': 'var(--ta-text-muted)',
};

export function NewsFeed() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="ta-news-feed" aria-label="Сводки исследований">
      <div className="ta-news-feed__head">
        <h3 className="ta-news-feed__title">Новости исследований</h3>
        <p className="ta-news-feed__lede">
          Свежие обзоры и РКИ → вывод для тренировки. Источник и грейд — у каждой сводки.
        </p>
      </div>
      <div className="ta-news-feed__list">
        {THEORY_NEWS.map(item => {
          const isOpen = openId === item.id;
          return (
            <article key={item.id} className="ta-news-card">
              <div className="ta-news-card__head">
                <h4 className="ta-news-card__title">{item.title}</h4>
                <span
                  className="ta-news-card__grade"
                  style={{color: GRADE_COLOR[item.grade], borderColor: GRADE_COLOR[item.grade]}}>
                  {item.grade}
                </span>
              </div>
              <p className="ta-news-card__conclusion">{item.conclusion}</p>
              {isOpen && <p className="ta-news-card__details">{item.details}</p>}
              <button
                type="button"
                className="ta-news-card__toggle"
                onClick={() => setOpenId(isOpen ? null : item.id)}>
                {isOpen ? 'Скрыть подробности' : 'Подробнее'}
              </button>
              <p className="ta-news-card__source">
                {item.source}
                {item.link ? (
                  <>
                    {' · '}
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      DOI
                    </a>
                  </>
                ) : null}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
import {TRACK, articleTitle, getArticle, type TrackItem} from '../lib/content';

const LEVEL_LABEL: Record<'basic' | 'detailed' | 'deep', string> = {
  basic: 'Просто',
  detailed: 'Подробно',
  deep: 'Вглубь',
};

function MetaHints({item}: {item: TrackItem}) {
  const meta = item.id ? getArticle(item.id)?.meta : undefined;
  return (
    <>
      {meta?.minutes ? <span>~{meta.minutes} мин</span> : null}
      {item.prereqIds.length > 0 ? (
        <span>до: {item.prereqIds.map(articleTitle).join(', ')}</span>
      ) : null}
    </>
  );
}

function ArticleCard({item}: {item: TrackItem}) {
  const chip = item.level ? (
    <span className={`ss-chip ss-chip--${item.level}`}>{LEVEL_LABEL[item.level]}</span>
  ) : null;
  const title = item.id ? articleTitle(item.id) : item.title;

  if (!item.id) {
    return (
      <div className="ss-card is-missing" aria-disabled="true">
        <div className="ss-card__title">{title}</div>
        <div className="ss-card__meta">
          {chip}
          <span>статья готовится</span>
        </div>
      </div>
    );
  }

  return (
    <a className="ss-card" href={`#/a/${item.id}`}>
      <div className="ss-card__title">{title}</div>
      <div className="ss-card__meta">
        {chip}
        <MetaHints item={item} />
      </div>
    </a>
  );
}

export function TrackView() {
  const total = TRACK.reduce((acc, stage) => acc + stage.items.filter(i => i.id).length, 0);
  const planned = TRACK.reduce((acc, stage) => acc + stage.items.filter(i => !i.id).length, 0);
  return (
    <div className="ss-track">
      <header className="ss-hero">
        <h1 className="ss-hero__title">Самоучитель</h1>
        <p className="ss-hero__lede">
          Теория тренировок: трек от простого к сложному.{' '}
          {total > 0 ? (
            <>
              Готово статей: {total}
              {planned > 0 ? `, готовится: ${planned}` : ''}.
            </>
          ) : (
            'статьи готовятся.'
          )}
        </p>
      </header>
      {TRACK.map((stage, index) => (
        <section className="ss-stage" key={stage.title}>
          <div className="ss-stage__head">
            <span className="ss-stage__num">{String(index + 1).padStart(2, '0')}</span>
            <h2 className="ss-stage__title">{stage.title}</h2>
          </div>
          {stage.items.map(item => (
            <ArticleCard key={item.id ?? item.title} item={item} />
          ))}
        </section>
      ))}
      {TRACK.length === 0 ? (
        <div className="ss-empty">Контент ещё не подключён: ждем статьи в selfstudy/content/.</div>
      ) : null}
      <footer className="ss-footer">Дев-превью · порт 5174 · не для продакшена</footer>
    </div>
  );
}

import {useEffect, useState} from 'react';
import {getArticle} from './lib/content';
import {ThemeToggle} from './components/ThemeToggle';
import {TrackView} from './components/TrackView';
import {ArticleView} from './components/ArticleView';

function readArticleId(): string | null {
  const match = window.location.hash.match(/^#\/a\/([\wа-яё-]+)/i);
  return match ? match[1] : null;
}

function SelfstudyApp() {
  const [articleId, setArticleId] = useState<string | null>(readArticleId);

  useEffect(() => {
    const onHash = () => {
      setArticleId(readArticleId());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const article = articleId ? getArticle(articleId) : undefined;

  return (
    <div className="selfstudy">
      <div className="ss-shell">
        <header className="ss-header">
          {article ? (
            <a className="ss-header__back" href="#/" aria-label="К оглавлению">
              ←
            </a>
          ) : (
            <span aria-hidden="true" style={{width: 32, flex: 'none'}} />
          )}
          <span className="ss-header__title">
            {article ? article.meta.title : 'Самоучитель · теория тренировок'}
          </span>
          <ThemeToggle />
        </header>
        {article ? (
          <>
            <nav className="ss-aside" aria-label="Оглавление">
              <TrackView />
            </nav>
            <ArticleView article={article} />
          </>
        ) : (
          <div className="ss-main ss-main--full">
            <TrackView />
          </div>
        )}{' '}
      </div>
    </div>
  );
}

export default SelfstudyApp;

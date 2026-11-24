import type {ChapterId} from '../../data/theoryChapters';
import {THEORY_READING_ARTICLES, getTheoryChapter} from '../../data/theoryChapters';
import {buildChapterOgMeta} from '../../utils/ogMeta';
import {AppTabLink} from './AppTabLink';
import {ChapterLink} from './ChapterLink';

type LessonSource = {
  kind: string;
  citation: string;
  title: string;
  url: string;
};

type SelectChapter = (chapterId: ChapterId) => void;

export function ReadingArticleLinks({
  source,
  articleId,
  onSelectChapter,
}: {
  source: LessonSource;
  articleId: ChapterId;
  onSelectChapter: SelectChapter;
}) {
  const permalink = buildChapterOgMeta(articleId).url;
  const others = THEORY_READING_ARTICLES.filter(article => article.id !== articleId);

  return (
    <>
      <footer className="ta-lesson-source">
        <span className="ta-lesson-source__kind">{source.kind}</span>
        <a
          className="ta-lesson-source__link"
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${source.citation}. Открыть видео на YouTube`}>
          {source.citation}
        </a>
        <span className="ta-lesson-source__title">
          На основе данных видео «{source.title}» — {source.url}
        </span>
      </footer>

      <aside className="ta-reading-app-links" aria-label="Ссылки в приложении">
        <p className="ta-reading-app-links__label">В приложении</p>
        <a className="ta-lesson-source__link" href={permalink}>
          Ссылка на эту статью
        </a>
        <AppTabLink tab="split" ariaLabel="Открыть вкладку Тренировка">
          Тренировка
        </AppTabLink>
        <AppTabLink tab="split" view="breakdown" ariaLabel="Открыть разбор упражнения">
          Разбор
        </AppTabLink>
      </aside>

      <aside className="ta-see-also" aria-label="Связанные статьи">
        <span className="ta-see-also-label">
          {others.length > 1 ? 'Ещё статьи:' : 'Ещё статья:'}
        </span>
        {others.map(article => {
          const meta = getTheoryChapter(article.id);
          return (
            <ChapterLink
              key={article.id}
              chapterId={article.id}
              onSelectChapter={onSelectChapter}
              ariaLabel={`Открыть статью: ${meta.panelTitle}`}>
              {meta.cardTitle}
            </ChapterLink>
          );
        })}
      </aside>
    </>
  );
}

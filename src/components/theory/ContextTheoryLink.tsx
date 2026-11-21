import {useCallback, type ReactNode} from 'react';
import type {ChapterId} from '../../data/theoryChapters';
import {navigateSearch} from '../../hooks/useURLState';
import '../../styles/components/theory/learning.css';

interface ContextTheoryLinkProps {
  chapterId: ChapterId;
  children: ReactNode;
  className?: string;
}

/**
 * Контекстный вход в «Теорию» из тренировки/журнала.
 * Атомарно выставляет tab=theory + chapter, сбрасывает открытую статью маршрута.
 */
export function ContextTheoryLink({chapterId, children, className}: ContextTheoryLinkProps) {
  const onClick = useCallback(() => {
    navigateSearch({tab: 'theory', chapter: chapterId, learn: null});
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, [chapterId]);

  return (
    <button
      type="button"
      className={`theory-context-link${className ? ` ${className}` : ''}`}
      onClick={onClick}>
      {children}
    </button>
  );
}
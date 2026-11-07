import type {ReactNode} from 'react';

export interface DiagramBlockProps {
  title: string;
  caption?: string;
  /** Полное текстовое описание схемы для скринридеров (figure role="img"). */
  ariaLabel: string;
  children: ReactNode;
}

/** Обёртка лекционной схемы: рамка, заголовок, подпись. Токены --ta-* работают в обеих темах. */
export function DiagramBlock({title, caption, ariaLabel, children}: DiagramBlockProps) {
  return (
    <figure className="ta-diagram" role="img" aria-label={ariaLabel}>
      <span className="ta-diagram__title">{title}</span>
      {children}
      {caption ? <figcaption className="ta-diagram__caption">{caption}</figcaption> : null}
    </figure>
  );
}
